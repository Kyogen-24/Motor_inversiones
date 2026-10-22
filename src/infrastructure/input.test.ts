import { describe, expect, it } from 'vitest';
import { cargarEjemplo, interpretar, leerArchivo } from './input';
import cartola from '../../data/cartola.json';
import catalogo from '../../data/catalogo.json';
import acuerdos from '../../data/acuerdos.json';
import { analizarCartola } from '../application/analizarCartola';

const archivo = (value: string) => new File([value], 'ejemplo.json', { type: 'application/json' });

describe('importación JSON y normalización', () => {
  it('aplica solo los valores predeterminados documentados', () => {
    const resultado = interpretar('catalogo', catalogo);
    expect(resultado.productos[0].series[0]).toMatchObject({ abierta: true, solo_apv: false, requiere_mandato: false });
    expect(resultado.productos[1].series[1].abierta).toBe(false);
    expect(resultado.productos[0].series[4].solo_apv).toBe(true);
    expect(resultado.productos[0].series[3].requiere_mandato).toBe(true);
  });
  it('no altera identificadores ni convierte coincidencias aproximadas en exactas', () => {
    const copia = structuredClone(cartola); copia.posiciones[0].producto = ' alfa-deuda-uf';
    const datos = cargarEjemplo(); const normalizada = interpretar('cartola', copia);
    expect(normalizada.posiciones[0].producto).toBe(' alfa-deuda-uf');
    expect(analizarCartola(normalizada, datos.catalogo, datos.acuerdos).posiciones[0].clasificacion).toBe('unidentified');
  });
  it('conserva datos adicionales y comisiones para trazabilidad', () => {
    const normalizado = interpretar('catalogo', catalogo);
    expect(normalizado.productos.find(p => p.tipo === 'insurance_savings')).toHaveProperty('curva_costo_permanencia');
    expect(interpretar('acuerdos', acuerdos).acuerdos[0].series['alfa-deuda-uf'].B).toBe(0.55);
  });
  it.each(['tac_pct', 'minimo_clp'])('no inventa %s ausente', campo => {
    const copia = structuredClone(catalogo) as unknown as { productos: { series: Record<string, unknown>[] }[] };
    delete copia.productos[0].series[0][campo];
    expect(() => interpretar('catalogo', copia)).toThrow(`catalogo.productos.0.series.0.${campo}`);
  });
  it.each(['2026-02-30', '2025-02-29', '2026-13-01', '2026-09-31', '30/09/2026', '1800-01-01', '2300-01-01'])('rechaza fecha %s con ruta del campo', corte => {
    expect(() => interpretar('cartola', { ...cartola, corte })).toThrow('cartola.corte: Fecha inválida');
  });
  it('acepta fecha bisiesta real', () => {
    expect(interpretar('cartola', { ...cartola, corte: '2028-02-29' }).corte).toBe('2028-02-29');
  });
  it('acepta moneda CLP y rechaza moneda ajena', () => {
    expect(() => interpretar('cartola', { ...cartola, moneda: 'UF' })).toThrow('cartola.moneda');
  });
  it.each([-1, Infinity, NaN, '60000000', null, undefined])('rechaza monto inválido %s', monto_clp => {
    expect(() => interpretar('cartola', { ...cartola, posiciones: [{ ...cartola.posiciones[0], monto_clp }] })).toThrow('cartola.posiciones.0.monto_clp');
  });
  it('permite cero, cuotas nulas y producto desconocido sin inventar costo', () => {
    const valor = { ...cartola, posiciones: [{ producto: null, serie: null, cuotas: null, valor_cuota: null, monto_clp: 0 }] };
    expect(interpretar('cartola', valor).posiciones[0]).toMatchObject({ monto_clp: 0, producto: null });
  });
  it('rechaza cartolas con demasiadas posiciones', () => {
    expect(() => interpretar('cartola', { ...cartola, posiciones: Array(10001).fill(cartola.posiciones[0]) })).toThrow('cartola.posiciones');
  });
  it('lee JSON UTF-8 con BOM', async () => {
    expect(await leerArchivo('cartola', archivo('\uFEFF' + JSON.stringify(cartola)))).toEqual(interpretar('cartola', cartola));
  });
  it('explica sintaxis inválida con recuperación', async () => {
    await expect(leerArchivo('cartola', archivo('{"corte": }'))).rejects.toThrow('JSON inválido');
  });
  it('explica error de lectura sin presentar un resultado', async () => {
    const fallido = Object.assign(archivo('{}'), { text: async () => { throw new Error('falló'); } });
    await expect(leerArchivo('cartola', fallido)).rejects.toThrow('no se pudo leer el archivo');
  });
  it('rechaza archivos mayores de 5 MB antes de leerlos', async () => {
    await expect(leerArchivo('cartola', archivo(' '.repeat(5 * 1024 * 1024 + 1)))).rejects.toThrow('límite es 5 MB');
  });
  it('cargar ejemplo crea conjuntos independientes', () => {
    const a = cargarEjemplo(), b = cargarEjemplo();
    a.cartola.cliente.referencia = 'otro'; a.catalogo.productos[0].series[0].tac_pct = 99;
    expect(b.cartola.cliente.referencia).toBe('ACC-4471');
    expect(b.catalogo.productos[0].series[0].tac_pct).toBe(2.1);
  });
});
