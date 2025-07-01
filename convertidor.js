// --- BIBLIOTECAS NECESARIAS (DEPENDENCIAS) ---
// 'node-fetch': Nos permite hacer peticiones a internet (a la API) desde Node.js.
// 'readline': Módulo nativo de Node.js para leer línea por línea lo que el usuario escribe en la consola.
const fetch = require('node-fetch');
const readline = require('readline');

// --- CONFIGURACIÓN GLOBAL ---
// URL base de la API a la que nos conectaremos.
const API_BASE_URL = 'https://api.freecurrencyapi.com/v1/';

// Se crea una "interfaz" para conectar la entrada (teclado) y salida (pantalla) de la consola.
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// --- FUNCIONES DE UTILIDAD ---

/**
 * Convierte la función `rl.question` (que usa callbacks) en una función que usa Promesas.
 * Esto nos permite usar `await` para esperar la respuesta del usuario, haciendo el código más limpio.
 * @param {string} query - La pregunta que se le mostrará al usuario en la consola.
 * @returns {Promise<string>} Una promesa que se resuelve con el texto que el usuario ingresó.
 */
const question = (query) => new Promise(resolve => rl.question(query, resolve));

/**
 * Limpia la pantalla de la consola. Es útil para que el menú siempre se vea ordenado.
 */
const clearScreen = () => {
    // El comando `console.clear()` es el estándar para limpiar la consola en la mayoría de entornos.
    console.clear();
};


// --- FUNCIONES PRINCIPALES DE LA APLICACIÓN ---

/**
 * Se conecta a la API para obtener las últimas tasas de cambio.
 * @param {string} apiKey - La clave API necesaria para autenticarse con el servicio.
 * @returns {Promise<object|null>} Un objeto con las tasas de cambio (ej: { 'USD': 1, 'EUR': 0.92 }) o `null` si ocurre un error.
 */
const fetchExchangeRates = async (apiKey) => {
    console.log('Obteniendo tasas de cambio actualizadas desde freecurrencyapi.com...');
    try {
        // Construimos la URL completa para la petición, incluyendo la clave API.
        const url = `${API_BASE_URL}latest?apikey=${apiKey}`;

        // Usamos 'await' para esperar a que la petición a internet se complete.
        const response = await fetch(url);
        // Usamos 'await' para esperar a que el cuerpo de la respuesta se convierta a formato JSON.
        const data = await response.json();

        // Si la respuesta de la API no fue exitosa (ej. error 401, 404), lanzamos un error.
        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición a la API.');
        }

        // Si la respuesta JSON contiene la propiedad 'data', significa que todo salió bien.
        if (data.data) {
            console.log('¡Tasas de cambio obtenidas con éxito!');
            return data.data; // Devolvemos solo el objeto con las tasas.
        } else {
            // Si la respuesta fue exitosa pero no tiene el formato esperado, lanzamos un error.
            throw new Error('La respuesta de la API no contiene los datos esperados.');
        }

    } catch (error) {
        // Si cualquier parte del bloque 'try' falla, se ejecuta este 'catch'.
        console.error(`\nOcurrió un error al obtener las tasas: ${error.message}`);
        console.error('Verifica tu conexión a internet o la validez de la clave API. Si el error persiste, la clave podría estar inactiva o haber alcanzado su límite.');
        return null; // Devolvemos null para indicar que la operación falló.
    }
};

/**
 * Muestra el menú de opciones principal en la consola.
 * También muestra el estado actual de las variables de la conversión.
 * @param {string|null} fromCurrency - El código de la moneda de origen (ej. 'USD').
 * @param {string|null} toCurrency - El código de la moneda de destino (ej. 'EUR').
 * @param {number|null} amount - La cantidad que se desea convertir.
 */
const displayMenu = (fromCurrency, toCurrency, amount) => {
    clearScreen();
    console.log('--- Convertidor de Divisas (App de Consola) ---');
    console.log('\n--- Estado Actual ---');
    console.log(`Moneda Origen : ${fromCurrency || 'No establecida'}`);
    console.log(`Moneda Destino: ${toCurrency || 'No establecida'}`);
    console.log(`Cantidad      : ${amount || 'No establecida'}`);
    console.log('--------------------------------------------------');
    console.log('\n           MENÚ DE OPCIONES');
    console.log('--------------------------------------------------');
    console.log('1. Mostrar lista de monedas disponibles');
    console.log('2. Mostrar todas las tasas de cambio (vs USD)');
    console.log('3. Establecer Moneda de Origen');
    console.log('4. Establecer Moneda de Destino');
    console.log('5. Establecer cantidad y Convertir');
    console.log('6. Ver historial de conversiones de la sesión');
    console.log('7. Salir del programa');
    console.log('--------------------------------------------------');
};

/**
 * Imprime en la consola la lista de códigos de moneda disponibles.
 * @param {object} rates - El objeto que contiene todas las tasas de cambio.
 */
const listAvailableCurrencies = (rates) => {
    console.log('\n--- Monedas Disponibles ---');
    const currencyCodes = Object.keys(rates); // Obtenemos un array con todos los códigos (ej. ['USD', 'EUR', ...])
    let line = '';
    // Hacemos un bucle para imprimir las monedas en columnas y que no ocupen toda la pantalla.
    for (let i = 0; i < currencyCodes.length; i++) {
        line += currencyCodes[i] + '\t'; // Añadimos la moneda y un tabulador.
        if ((i + 1) % 6 === 0 || i === currencyCodes.length - 1) {
            console.log(line); // Imprimimos la línea cada 6 monedas o al final.
            line = ''; // Reiniciamos la línea.
        }
    }
};

/**
 * Imprime en la consola todas las tasas de cambio con respecto al dólar (USD).
 * @param {object} rates - El objeto que contiene todas las tasas de cambio.
 */
const listAllRates = (rates) => {
    console.log('\n--- Tasas de Cambio (Base: USD) ---');
    // Recorremos cada par [moneda, tasa] del objeto y lo imprimimos.
    for (const [currency, rate] of Object.entries(rates)) {
        console.log(`1 USD = ${rate} ${currency}`);
    }
};

/**
 * Pide al usuario que ingrese un código de moneda y valida que exista en la lista de tasas.
 * @param {object} rates - El objeto con las tasas de cambio para validar.
 * @param {string} promptMessage - El mensaje que se le mostrará al usuario.
 * @returns {Promise<string>} El código de la moneda validado, en mayúsculas.
 */
const setCurrency = async (rates, promptMessage) => {
    // Bucle infinito que solo se romperá cuando el usuario ingrese una moneda válida.
    while (true) {
        const code = (await question(`${promptMessage} (ej. USD, EUR, AUD): `)).toUpperCase().trim();
        // Validamos si la moneda ingresada existe como una clave en nuestro objeto de tasas.
        if (rates.hasOwnProperty(code)) {
            return code; // Si es válida, la devolvemos y salimos del bucle.
        } else {
            console.log('Error: Código de moneda no válido. Intente de nuevo.');
        }
    }
};

/**
 * Pide al usuario que ingrese una cantidad y valida que sea un número positivo.
 * @returns {Promise<number>} La cantidad validada.
 */
const setAmount = async () => {
    while (true) {
        const amountStr = await question('Ingrese la cantidad a convertir (ej. 150.75): ');
        const amount = parseFloat(amountStr); // Intentamos convertir el texto a un número.
        // Validamos que sea un número (`!isNaN`) y que sea mayor que cero.
        if (!isNaN(amount) && amount > 0) {
            return amount; // Si es válido, lo devolvemos.
        } else {
            console.log('Error: Ingrese un valor numérico positivo.');
        }
    }
};

/**
 * Realiza el cálculo de la conversión de divisas.
 * @returns {[string, string|null]} Un array con dos valores: el mensaje del resultado y la entrada para el historial.
 */
const performConversion = (rates, fromCurrency, toCurrency, amount) => {
    // Primero, nos aseguramos de tener todos los datos necesarios.
    if (!fromCurrency || !toCurrency || !amount) {
        return ['Error: Faltan datos. Establezca moneda de origen, destino y cantidad.', null];
    }
    // La fórmula se basa en que todas las tasas están referenciadas al USD.
    // 1. Convertimos la cantidad de la moneda origen a USD: `amount / rateFrom`
    // 2. Convertimos el resultado de USD a la moneda destino: `* rateTo`
    const rateFrom = rates[fromCurrency];
    const rateTo = rates[toCurrency];
    const convertedAmount = (amount / rateFrom) * rateTo;

    // Creamos un mensaje amigable para el usuario.
    const resultMessage = `${amount.toFixed(2)} ${fromCurrency} equivale a ${convertedAmount.toFixed(2)} ${toCurrency}`;
    // Creamos una entrada más concisa para el historial.
    const historyEntry = `[${fromCurrency} -> ${toCurrency}] ${amount.toFixed(2)} -> ${convertedAmount.toFixed(2)}`;

    return [resultMessage, historyEntry];
};

/**
 * Muestra el historial de todas las conversiones hechas en la sesión actual.
 * @param {string[]} history - El array que almacena las entradas del historial.
 */
const viewHistory = (history) => {
    console.log('\n--- Historial de Conversiones (Sesión Actual) ---');
    if (history.length === 0) {
        console.log('Aún no se han realizado conversiones en esta sesión.');
    } else {
        history.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry}`);
        });
    }
};


// --- FUNCIÓN PRINCIPAL DE EJECUCIÓN ---

/**
 * Orquesta toda la aplicación. Es el punto de entrada que llama a las demás funciones.
 */
const main = async () => {
    // La clave API que se usará para el servicio.
    const apiKey = 'fca_live_2v0ZnRqQM4mCYQPYlNzEu4fKsnEpC4okcOer0Pye';

    // 1. Obtenemos las tasas de cambio al iniciar.
    const exchangeRates = await fetchExchangeRates(apiKey);

    // Si la obtención de tasas falla, no podemos continuar. Terminamos el programa.
    if (!exchangeRates) {
        console.log('\nEl programa no pudo iniciar. Verifique el mensaje de error anterior.');
        rl.close(); // Cerramos la interfaz de lectura.
        return; // Salimos de la función main.
    }

    // 2. Declaramos las 'variables de estado' que guardarán la información del usuario.
    let fromCurrency = null;
    let toCurrency = null;
    let amount = null;
    const conversionHistory = []; // Un array para guardar el historial.

    // 3. Bucle principal del programa. Se ejecutará indefinidamente hasta que el usuario elija salir.
    while (true) {
        // Mostramos el menú en cada iteración.
        displayMenu(fromCurrency, toCurrency, amount);
        const choice = await question('Seleccione una opción y presione Enter: ');

        // El 'switch' es como una serie de 'if/else if' para manejar la opción del usuario.
        // Revisa qué número eligió el usuario y ejecuta el bloque de código correspondiente.
        switch (choice.trim()) {
            // Caso 1: Si el usuario teclea '1'
            case '1':
                // Llama a la función para mostrar la lista de todas las monedas disponibles.
                listAvailableCurrencies(exchangeRates);
                break; // 'break' termina este caso y evita que se ejecuten los siguientes.

            // Caso 2: Si el usuario teclea '2'
            case '2':
                // Llama a la función para mostrar todas las tasas de cambio contra el USD.
                listAllRates(exchangeRates);
                break;

            // Caso 3: Si el usuario teclea '3'
            case '3':
                // Llama a la función que pide al usuario la moneda de origen y la guarda.
                // El resultado de `setCurrency` se almacena en la variable `fromCurrency`.
                fromCurrency = await setCurrency(exchangeRates, 'Establecer moneda de Origen');
                break;

            // Caso 4: Si el usuario teclea '4'
            case '4':
                // Llama a la función que pide al usuario la moneda de destino y la guarda.
                toCurrency = await setCurrency(exchangeRates, 'Establecer moneda de Destino');
                break;
            
            // Caso 5: Si el usuario teclea '5'
            case '5':
                // Primero, pide al usuario que ingrese la cantidad.
                const tempAmount = await setAmount();
                // Si el usuario ingresó una cantidad válida...
                if (tempAmount) {
                    amount = tempAmount; // ...la guardamos en nuestra variable de estado.
                    // Luego, llamamos a la función que hace la conversión.
                    const [result, historyItem] = performConversion(exchangeRates, fromCurrency, toCurrency, amount);
                    // Mostramos el resultado en la pantalla.
                    console.log('\n--- Resultado de la Conversión ---');
                    console.log(result);
                    // Si la conversión fue exitosa, añadimos la operación al historial.
                    if (historyItem) {
                        conversionHistory.push(historyItem);
                    }
                }
                break;

            // Caso 6: Si el usuario teclea '6'
            case '6':
                // Llama a la función que muestra en pantalla todo el historial de la sesión.
                viewHistory(conversionHistory);
                break;

            // Caso 7: Si el usuario teclea '7'
            case '7':
                // Muestra un mensaje de despedida.
                console.log('\nGracias por usar el Convertidor de Divisas. ¡Adiós!');
                rl.close(); // Cerramos la interfaz. Esto permite que el programa termine.
                return; // Salimos del bucle 'while' y de la función 'main' para finalizar el programa.

            // Si el usuario no teclea ninguno de los números anteriores...
            default:
                // Le mostramos un mensaje indicando que la opción es incorrecta.
                console.log('\nOpción no válida. Por favor, intente de nuevo.');
                break;
        }
        // Hacemos una pausa para que el usuario pueda ver el resultado de su acción antes de limpiar la pantalla.
        await question('\nPresione Enter para volver al menú...');
    }
};

// --- INICIO DE LA APLICACIÓN ---
// Esta es la primera línea que se ejecuta. Llama a la función 'main' para empezar todo el proceso.
main();

// Se exportan las funciones que se van a probar con Jest.
module.exports = { performConversion, fetchExchangeRates };
