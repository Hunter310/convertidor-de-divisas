// CORRECCIÓN: Importamos 'rl' además de la función a probar.
const { performConversion, rl } = require('./convertidor.js');

// CORRECCIÓN: Esta función especial de Jest se ejecutará una vez
// después de que todas las pruebas hayan terminado.
// Su trabajo es cerrar la "puerta abierta" de readline para que Jest pueda salir.
afterAll(() => {
    rl.close();
});

describe('Pruebas para la función performConversion', () => {
    const mockRates = {
        USD: 1,
        EUR: 0.9,
        JPY: 150,
        COP: 4000
    };

    test('debería convertir correctamente de USD a EUR', () => {
        const [resultMessage] = performConversion(mockRates, 'USD', 'EUR', 100);
        expect(resultMessage).toContain('90.00 EUR');
    });

    test('debería convertir correctamente de EUR a COP', () => {
        const [resultMessage] = performConversion(mockRates, 'EUR', 'COP', 10);
        expect(resultMessage).toContain('44444.44 COP');
    });

    test('debería devolver un error si faltan datos', () => {
        const [resultMessage, historyEntry] = performConversion(mockRates, 'USD', null, 100);
        expect(resultMessage).toContain('Error: Faltan datos');
        expect(historyEntry).toBeNull();
    });
});