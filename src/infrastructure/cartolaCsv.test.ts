import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cargarEjemplo, ErrorArchivo, leerArchivo, leerArchivos } from './input';
import { analizarCartola } from '../application/analizarCartola';
import { proponerCostos } from '../application/proponerCostos';
import { proponerMeta } from '../application/proponerMeta';

const csv = readFileSync(new URL('../../data/cartola.csv', import.meta.url), 'utf8');
const archivo = (texto = csv, nombre = 'cartola.csv', type = 'text/csv') => new File([texto], nombre, { type });
const cabecera = 'referencia,perfil_riesgo,perfil_evaluado_el,plan_apv,corte,moneda,producto,serie,descripcion_original,cuotas,valor_cuota,monto_clp';
const fila = 'ACC-4471,moderado,2025-08-14,false,2026-09-30,CLP,alfa-deuda-uf,CLASI,,40000,1500,60000000';

describe('importación de cartola CSV', () => {
  it('produce los mismos datos y diagnóstico que una cartola JSON', async () => {
    const datos = cargarEjemplo();
    const { cliente, corte, moneda, posiciones } = datos.cartola;
    const esperado = { cliente, corte, moneda, posiciones };
    const actual = await leerArchivo('cartola', archivo());
    expect(actual).toEqual(esperado);
    expect(analizarCartola(actual, datos.catalogo, datos.acuerdos)).toEqual(analizarCartola(esperado, datos.catalogo, datos.acuerdos));
  });

  it('mantiene idénticos los resultados de costo y meta', async () => {
    const datos = cargarEjemplo();
    const cartola = await leerArchivo('cartola', archivo());
    const entrada = { cartola, catalogo: datos.catalogo, acuerdos: datos.acuerdos, supuestos: datos.supuestos, meta: datos.meta };
    expect(proponerCostos(entrada)).toEqual(proponerCostos(datos));
    expect(proponerMeta(entrada)).toEqual(proponerMeta(datos));
  }, 10_000);

  it('acepta BOM, CRLF, extensión mayúscula, columnas reordenadas y descripción opcional', async () => {
    const columnas = cabecera.split(',').filter(c => c !== 'descripcion_original').reverse();
    const valores = Object.fromEntries(cabecera.split(',').map((c, i) => [c, fila.split(',')[i]]));
    const texto = '\uFEFF' + columnas.join(',') + '\r\n' + columnas.map(c => valores[c]).join(',') + '\r\n';
    expect((await leerArchivo('cartola', archivo(texto, 'CARTOLA.CSV', ''))).posiciones[0].monto_clp).toBe(60000000);
  });

  it('interpreta comillas escapadas, saltos de línea y separadores dentro de una descripción', async () => {
    const texto = `${cabecera}\n${fila.replace('CLASI,,', 'CLASI,"Fondo, ";')}`;
    await expect(leerArchivo('cartola', archivo(texto))).rejects.toThrow('comillas');
    const valido = `${cabecera}\n${fila.replace('CLASI,,', 'CLASI,"Fondo, ""Especial""\nsegunda línea",')}`;
    expect((await leerArchivo('cartola', archivo(valido))).posiciones[0].descripcion_original).toBe('Fondo, "Especial"\nsegunda línea');
  });

  it('acepta punto y coma, decimal con coma y nulos explícitos sin convertirlos en cero', async () => {
    const texto = `${cabecera.replaceAll(',', ';')}\n${fila.replaceAll(',', ';').replace(';40000;1500;', ';null;1500,5;')}`;
    const posicion = (await leerArchivo('cartola', archivo(texto))).posiciones[0];
    expect(posicion.cuotas).toBeNull();
    expect(posicion.valor_cuota).toBe(1500.5);
    expect((await leerArchivo('cartola', archivo())).posiciones[6].producto).toBeNull();
  });

  it.each(['referencia', 'perfil_riesgo', 'perfil_evaluado_el', 'plan_apv', 'corte', 'moneda'])('rechaza diferencias de %s entre registros', async campo => {
    const valores = fila.split(',');
    valores[cabecera.split(',').indexOf(campo)] = 'otro';
    await expect(leerArchivo('cartola', archivo(`${cabecera}\n${fila}\n${valores.join(',')}`))).rejects.toThrow(`registro 3, ${campo}`);
  });

  it.each([
    ['', 'cabecera'],
    [cabecera, 'al menos una posición'],
    [`${cabecera},serie\n${fila},CLASI`, 'repetidas'],
    [`${cabecera.replace('monto_clp', 'importe')}\n${fila}`, 'monto_clp'],
    [`${cabecera},otro\n${fila},x`, 'no admitidas'],
    [`${cabecera}\n${fila},extra`, 'cantidad de campos'],
    [`${cabecera}\n${fila.replace('60000000', '')}`, 'número'],
    [`${cabecera}\n${fila.replace('60000000', '60.000.000')}`, 'número'],
    [`${cabecera}\n${fila.replace('60000000', '1.12345678901234567')}`, 'precisión'],
    [`${cabecera}\n${fila.replace('60000000', '-1')}`, 'número entre'],
    [`${cabecera}\n${fila.replace('60000000', '1e309')}`, 'precisión'],
    [`${cabecera}\n${fila.replace('false', 'no')}`, 'true o false'],
    [`${cabecera}\n${fila.replace('2026-09-30', '2026-02-30')}`, 'Fecha de corte'],
    [`${cabecera}\n${fila.replace('60000000', '"60000000')}`, 'sin cerrar'],
  ])('rechaza archivos inválidos y conserva el tipo de error de carga', async (texto, mensaje) => {
    await expect(leerArchivo('cartola', archivo(texto))).rejects.toThrow(mensaje);
    await expect(leerArchivo('cartola', archivo(texto))).rejects.toBeInstanceOf(ErrorArchivo);
  });

  it('rechaza más de 10.000 posiciones y archivos mayores de 5 MB', async () => {
    await expect(leerArchivo('cartola', archivo(`${cabecera}\n${(fila + '\n').repeat(10001)}`))).rejects.toThrow('10.000');
    await expect(leerArchivo('cartola', archivo(' '.repeat(5 * 1024 * 1024 + 1)))).rejects.toThrow('5 MB');
  });

  it('rechaza el formato tabular de cartola en catálogo y permite mezclar CSV y JSON', async () => {
    await expect(leerArchivo('catalogo', archivo())).rejects.toThrow('ruta, tipo y valor');
    const datos = cargarEjemplo();
    const catalogo = new File([JSON.stringify(datos.catalogo)], 'catalogo.json');
    const resultado = await leerArchivos({ cartola: archivo(), catalogo });
    expect(resultado.errores).toEqual({});
    expect(resultado.cambios.map(c => c.tipo)).toEqual(['cartola', 'catalogo']);
  });
});
