import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { interpretarDocumentoCsv } from './documentoCsv';
import { cargarEjemplo, ErrorArchivo, leerArchivo, leerArchivos, type TipoEntrada } from './input';
import { analizarCartola } from '../application/analizarCartola';
import { proponerCostos } from '../application/proponerCostos';
import { proponerMeta } from '../application/proponerMeta';

const archivo = (texto: string, nombre = 'entrada.csv') => new File([texto], nombre, { type: 'text/csv' });
const referencia = (tipo: TipoEntrada) => archivo(readFileSync(new URL(`../../data/${tipo}.csv`, import.meta.url), 'utf8'), `${tipo}.csv`);

describe('CSV de documentos anidados', () => {
  it.each(['catalogo', 'acuerdos', 'supuestos', 'meta'] as const)('conserva todos los datos y validaciones de %s JSON', async tipo => {
    const resultado = await leerArchivo(tipo, referencia(tipo));
    expect(resultado).toEqual(cargarEjemplo()[tipo]);
  });

  it('carga los cinco CSV y produce las mismas propuestas que los cinco JSON', async () => {
    const entradas = await leerArchivos(Object.fromEntries((['cartola', 'catalogo', 'acuerdos', 'supuestos', 'meta'] as const).map(tipo => [tipo, referencia(tipo)])));
    expect(entradas.errores).toEqual({});
    expect(entradas.cambios).toHaveLength(5);
    const cartola = await leerArchivo('cartola', referencia('cartola'));
    const catalogo = await leerArchivo('catalogo', referencia('catalogo'));
    const acuerdos = await leerArchivo('acuerdos', referencia('acuerdos'));
    const supuestos = await leerArchivo('supuestos', referencia('supuestos'));
    const meta = await leerArchivo('meta', referencia('meta'));
    const original = cargarEjemplo();
    const datos = { cartola, catalogo, acuerdos, supuestos, meta };
    expect(analizarCartola(cartola, catalogo, acuerdos).totales).toEqual(analizarCartola(original.cartola, original.catalogo, original.acuerdos).totales);
    expect(proponerCostos(datos)).toEqual(proponerCostos(original));
    expect(proponerMeta(datos)).toEqual(proponerMeta(original));
  }, 10_000);

  it('acepta columnas y registros reordenados, BOM y separador punto y coma', () => {
    const texto = '\uFEFFvalor;tipo;ruta\r\n-1,5;numero;/escenario\r\n;objeto;\r\nfalse;booleano;/activo\r\n;nulo;/fin';
    expect(interpretarDocumentoCsv(texto)).toEqual({ escenario: -1.5, activo: false, fin: null });
  });

  it('preserva listas y objetos vacíos, claves numéricas, barras, tildes y __proto__ como datos', () => {
    const texto = 'ruta,tipo,valor\n,objeto,\n/1,texto,clave numérica\n/a~1b~0c,lista,\n/vacio,objeto,\n/__proto__,objeto,\n/__proto__/contaminado,booleano,true';
    const resultado = interpretarDocumentoCsv(texto) as Record<string, unknown>;
    expect(resultado['1']).toBe('clave numérica');
    expect(resultado['a/b~c']).toEqual([]);
    expect(resultado.vacio).toEqual({});
    expect(Object.hasOwn(resultado, '__proto__')).toBe(true);
    expect(Object.hasOwn(Object.prototype, 'contaminado')).toBe(false);
  });

  it.each([
    ['ruta,tipo,tipo\n,objeto,', 'columnas'],
    ['ruta,tipo,valor\n/x,texto,a', 'raíz'],
    ['ruta,tipo,valor\n,objeto,\n/x,texto,a\n/x,texto,b', 'repetida'],
    ['ruta,tipo,valor\n,objeto,\n/x/y,texto,a', 'padre'],
    ['ruta,tipo,valor\n,objeto,\n/x,texto,a\n/x/y,texto,b', 'padre'],
    ['ruta,tipo,valor\n,objeto,\n/x,lista,\n/x/1,texto,a', 'consecutivos'],
    ['ruta,tipo,valor\n,objeto,\n/x,lista,\n/x/00,texto,a', 'índice'],
    ['ruta,tipo,valor\n,objeto,\n/x,lista,\n/x/999999999,texto,a', 'índice'],
    ['ruta,tipo,valor\n,objeto,\nx,texto,a', 'ruta inválida'],
    ['ruta,tipo,valor\n,objeto,\n/x~2,texto,a', 'ruta inválida'],
    ['ruta,tipo,valor\n,objeto,\n/x,fecha,a', 'tipo no admitido'],
    ['ruta,tipo,valor\n,objeto,\n/x,booleano,no', 'true o false'],
    ['ruta,tipo,valor\n,objeto,\n/x,numero,', 'número inválido'],
    ['ruta,tipo,valor\n,objeto,\n/x,numero,Infinity', 'número inválido'],
    ['ruta,tipo,valor\n,objeto,\n/x,numero,1e309', 'precisión'],
    ['ruta,tipo,valor\n,objeto,\n/x,numero,1.12345678901234567', 'precisión'],
    ['ruta,tipo,valor\n,objeto,\n/x,nulo,null', 'vacía'],
    ['ruta,tipo,valor\n,objeto,\n/x,texto,a,extra', 'tres campos'],
  ])('rechaza estructura ambigua o valores mal formados', (texto, error) => {
    expect(() => interpretarDocumentoCsv(texto)).toThrow(error);
  });

  it('conserva errores por archivo, detecta documentos intercambiados y valida reglas de supuestos', async () => {
    await expect(leerArchivo('catalogo', referencia('meta'))).rejects.toThrow('contiene la meta');
    const supuestos = readFileSync(new URL('../../data/supuestos.csv', import.meta.url), 'utf8').replace('/escenarios/0/ajuste_retorno_pp,numero,-1.5', '/escenarios/0/ajuste_retorno_pp,numero,-2');
    await expect(leerArchivo('supuestos', archivo(supuestos))).rejects.toBeInstanceOf(ErrorArchivo);
    const resultado = await leerArchivos({ meta: referencia('meta'), supuestos: archivo(supuestos) });
    expect(resultado.cambios.map(c => c.tipo)).toEqual(['meta']);
    expect(resultado.errores.supuestos).toContain('−1,5');
  });
});
