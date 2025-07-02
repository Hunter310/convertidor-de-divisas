# Convertidor de Divisas (Aplicación de Consola)

Este proyecto es una aplicación de consola desarrollada en Node.js que permite a los usuarios convertir cantidades entre diferentes divisas. La aplicación obtiene las tasas de cambio en tiempo real desde una API externa y ofrece un menú interactivo para una fácil utilización.

Este proyecto fue desarrollado como parte de una prueba técnica, cumpliendo con todos los requisitos especificados.

## Características

- **Tasas de Cambio en Tiempo Real**: Se conecta a la API de [FreeCurrencyAPI](https://freecurrencyapi.com/) para obtener las tasas de cambio más recientes.
- **Menú Interactivo**: Una interfaz de línea de comandos clara y fácil de usar que guía al usuario a través de las diferentes opciones.
- **Funcionalidades Clave**:
    - Listar todas las monedas disponibles.
    - Mostrar las tasas de cambio actuales con respecto al USD.
    - Establecer una moneda de origen y una de destino.
    - Ingresar una cantidad y realizar la conversión.
    - Ver un historial de las conversiones realizadas durante la sesión.
- **Validación de Entradas**: El programa valida las entradas del usuario para asegurar que sean correctas como las opciones del menú, los códigos de moneda y las cantidades a convertir.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 14 o superior recomendada)
- npm (generalmente se instala con Node.js)
- Una clave API gratuita del servicio [FreeCurrencyAPI](https://freecurrencyapi.com/).

## Instalación

1.  **Clona el repositorio y accede:**
    ```bash
    git clone https://github.com/Hunter310/convertidor-de-divisas.git
    cd convertidor-de-divisas
    ```

2.  **Instala las dependencias del proyecto:**
    Este comando leerá el archivo `package.json` e instalará las librerías necesarias (como `node-fetch`).
    ```bash
    npm install
    ```

## Configuración

El programa requiere una clave API para funcionar. La clave ya está integrada en el archivo `convertidor.js`:

```javascript
// La clave API que se usará para el servicio.
const apiKey = "fca_live_2v0ZnRqQM4mCYQPYlNzEu4fKsnEpC4okcOer0Pye";
```
## Uso
- Para iniciar la aplicación, ejecuta el siguiente comando en la terminal desde la raíz del proyecto:
```bash
node convertidor.js
```
**Una vez iniciado, el programa te mostrará un menú interactivo. Simplemente sigue las instrucciones en pantalla para realizar las conversiones.**
