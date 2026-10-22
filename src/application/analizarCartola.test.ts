import { describe, expect, it } from 'vitest';
import { analizarCartola } from './analizarCartola';
import { cargarEjemplo, type Entradas } from '../infrastructure/input';
import { evaluarAcceso, vigente } from '../domain/eligibility';
import { decimal, redondear } from '../domain/numeric';
import type { Serie } from '../domain/model';

const ejecutar = (datos: Entradas) => analizarCartola(datos.cartola, datos.catalogo, datos.acuerdos);
function acceso(datos: Entradas, posicion: number, serie: string) {
  return ejecutar(datos).posiciones[posicion].alternativas.find(a => a.serie.codigo === serie)!;
}
function congelar(objeto: object) {
  Object.freeze(objeto);
  Object.values(objeto).forEach(value => { if (value && typeof value === 'object') congelar(value); });
}

describe('diagnóstico de referencia R02 y comparación R05', () => {
  it('reproduce las cifras de aceptación con el denominador correcto', () => {
    const resultado = ejecutar(cargarEjemplo());
    expect(resultado.totales).toMatchObject({
      monto: '235000000', identificado: '230000000', computable: '230000000', sinIdentificar: '5000000',
      costo: '5180000', ahorro: '1650000', costoPosterior: '3530000', condicional: '615000',
      computables: 6, identificadas: 6, cambios: 4,
    });
    expect(redondear(resultado.totales.tac!, 4)).toBe('2.2522');
    expect(redondear(resultado.totales.tacPosterior!, 4)).toBe('1.5348');
    expect(redondear(resultado.totales.porcentajeSinIdentificar!, 2)).toBe('2.13');
    expect(resultado.posiciones.map(p => [p.costo, p.elegida, p.ahorro, p.bps, p.condicional?.adicional ?? '0'])).toEqual([
      ['1260000', 'B', '390000', '65', '300000'], ['1440000', 'B', '405000', '90', '315000'],
      ['1400000', 'M', '750000', '150', '0'], ['330000', 'B', '105000', '35', '0'],
      ['750000', 'CLASI', '0', '0', '0'], ['0', null, '0', '0', '0'], [null, null, '0', '0', '0'],
    ]);
    expect(resultado.posiciones[6].clasificacion).toBe('unidentified');
  });
  it('cambiar montos recalcula costos y no utiliza respuestas fijas', () => {
    const datos = cargarEjemplo();
    datos.cartola.posiciones[0].monto_clp = 30000000;
    const resultado = ejecutar(datos);
    expect(resultado.posiciones[0]).toMatchObject({ costo: '630000', ahorro: '195000', bps: '65' });
    expect(resultado.totales.computable).toBe('200000000');
    expect(resultado.totales.costo).toBe('4550000');
  });
  it('no suma tickets ni elimina posiciones repetidas', () => {
    const datos = cargarEjemplo();
    const posicion = { ...datos.cartola.posiciones[0], monto_clp: 3000000 };
    datos.cartola.posiciones = [{ ...posicion }, { ...posicion }];
    const resultado = ejecutar(datos);
    expect(resultado.posiciones).toHaveLength(2);
    expect(resultado.totales.monto).toBe('6000000');
    for (const fila of resultado.posiciones) {
      expect(fila.alternativas.find(a => a.serie.codigo === 'B')).toMatchObject({ estado: 'conditional', regla: 4 });
      expect(fila.ahorro).toBe('0');
    }
  });
  it('incluye depósitos y efectivo con costo cero; excluye seguros y otros', () => {
    const datos = cargarEjemplo();
    const posicion = { serie: null, cuotas: null, valor_cuota: null, monto_clp: 1000000 };
    datos.catalogo.productos.push({ id: 'otro', nombre: 'Otro producto', emisor: 'banco-ejemplo', tipo: 'other', categoria: 'otra', liquidez_dias: 0, series: [] });
    datos.cartola.posiciones = ['deposito-uf-90d', 'efectivo-clp', 'seguro-epsilon-ahorro', 'otro'].map(producto => ({ ...posicion, producto }));
    const resultado = ejecutar(datos);
    expect(resultado.totales).toMatchObject({ monto: '4000000', identificado: '4000000', computable: '2000000', excluido: '2000000', costo: '0', tac: '0' });
    expect(resultado.posiciones.map(p => p.clasificacion)).toEqual(['computable', 'computable', 'excluded', 'excluded']);
  });
  it('ETF solo computa con costo declarado y fondos de inversión usan serie', () => {
    const datos = cargarEjemplo();
    datos.catalogo.productos.push({ id: 'etf', nombre: 'ETF ficticio', emisor: 'banco-ejemplo', tipo: 'equity_etf', categoria: 'rv_global', liquidez_dias: 2, series: [] });
    datos.cartola.posiciones = [{ producto: 'etf', serie: null, monto_clp: 1000000, cuotas: null, valor_cuota: null }];
    expect(ejecutar(datos).totales.computable).toBe('0');
    datos.catalogo.productos.at(-1)!.tac_pct = 0.25;
    expect(ejecutar(datos).totales).toMatchObject({ computable: '1000000', costo: '2500', tac: '0.25' });
    datos.catalogo.productos[0].tipo = 'investment_fund';
    datos.cartola.posiciones[0] = { ...datos.cartola.posiciones[0], producto: 'alfa-deuda-uf', serie: 'CLASI' };
    expect(ejecutar(datos).posiciones[0].costo).toBe('21000');
  });
  it.each(['producto', 'serie'] as const)('conserva monto sin identificar cuando %s es desconocido', campo => {
    const datos = cargarEjemplo(); datos.cartola.posiciones = [datos.cartola.posiciones[0]];
    datos.cartola.posiciones[0][campo] = 'desconocido';
    expect(ejecutar(datos).posiciones[0]).toMatchObject({ clasificacion: 'unidentified', monto: '60000000', costo: null, ahorro: '0' });
    expect(ejecutar(datos).totales.computable).toBe('0');
  });
  it.each([0, 0.5, 1, 1.01])('advierte valorización solo por diferencia mayor de 1 CLP: %s', diferencia => {
    const datos = cargarEjemplo(); datos.cartola.posiciones[0].monto_clp += diferencia;
    const fila = ejecutar(datos).posiciones[0];
    expect(fila.advertencias.some(a => a.codigo === 'VALORIZACION')).toBe(diferencia > 1);
    expect(fila.monto).toBe(decimal(60000000).plus(diferencia).toString());
    if (diferencia > 1) expect(fila.advertencias[0]).toMatchObject({ calculado: '60000000', declarado: '60000001.01', diferencia: '1.01' });
  });
  it('advierte falta de valorización sin inventarla ni cambiar el monto', () => {
    const datos = cargarEjemplo(); datos.cartola.posiciones[0].cuotas = null;
    expect(ejecutar(datos).posiciones[0]).toMatchObject({ costo: '1260000', advertencias: [{ codigo: 'SIN_VALORIZACION' }] });
  });
  it.each(['vacia', 'cero', 'desconocida'] as const)('maneja cartola %s sin divisiones por cero ni oportunidades monetarias ficticias', caso => {
    const datos = cargarEjemplo();
    datos.cartola.posiciones = caso === 'vacia' ? [] : [{ ...datos.cartola.posiciones[0], monto_clp: caso === 'cero' ? 0 : 100, producto: caso === 'desconocida' ? 'desconocido' : 'alfa-deuda-uf' }];
    const resultado = ejecutar(datos);
    expect(resultado.totales).toMatchObject({ computable: '0', costo: '0', tac: null, tacPosterior: null, ahorro: '0', condicional: '0', cambios: 0 });
    for (const fila of resultado.posiciones) expect(fila).toMatchObject({ peso: null, ahorro: '0', condicional: null });
    if (caso === 'cero') expect(resultado.posiciones[0].alternativas).toHaveLength(5);
  });
  it('mantiene la serie actual cuando empata o no hay reducción estricta', () => {
    const datos = cargarEjemplo(); datos.catalogo.productos[0].series[0].tac_pct = 1.45;
    expect(ejecutar(datos).posiciones[0]).toMatchObject({ elegida: 'CLASI', ahorro: '0', bps: '0' });
  });
  it('resuelve empates más baratos por código y muestra todas las alternativas empatadas', () => {
    const datos = cargarEjemplo();
    const serie: Serie = { ...datos.catalogo.productos[0].series[1], codigo: 'AA' };
    datos.catalogo.productos[0].series.push(serie);
    datos.acuerdos.acuerdos[0].series['alfa-deuda-uf'].AA = 99;
    expect(ejecutar(datos).posiciones[0]).toMatchObject({ elegida: 'AA', empates: ['AA', 'B'], ahorro: '390000' });
    datos.catalogo.productos[0].series.reverse();
    expect(ejecutar(datos).posiciones[0].elegida).toBe('AA');
  });
});

describe('R01 y R04: primera coincidencia y límites', () => {
  it.each([
    [0, 'B', 'eligible', 6], [0, 'F', 'conditional', 4], [0, 'M', 'conditional', 3], [0, 'APV', 'blocked', 2],
    [1, 'A', 'blocked', 1], [1, 'B', 'eligible', 6], [1, 'F', 'conditional', 4], [1, 'APV', 'blocked', 2],
    [2, 'B', 'eligible', 6], [2, 'M', 'eligible', 6], [2, 'APV', 'blocked', 2], [3, 'B', 'eligible', 6], [4, 'B', 'out_of_scope', 0],
  ] as const)('posición %s serie %s: %s regla %s', (posicion, serie, estado, regla) => {
    expect(acceso(cargarEjemplo(), posicion, serie)).toMatchObject({ estado, regla });
  });
  it('marca actuales sin conceder elegibilidad a Gamma', () => {
    const resultado = ejecutar(cargarEjemplo());
    expect(resultado.posiciones.flatMap(p => p.alternativas).filter(a => a.actual)).toHaveLength(5);
    expect(resultado.posiciones[4].alternativas.find(a => a.actual)).toMatchObject({ estado: 'out_of_scope', regla: 0 });
  });
  it.each([
    ['inicio igual al corte', { vigente_desde: '2026-09-30' }, false],
    ['inicio anterior', { vigente_desde: '2026-09-29' }, true],
    ['inicio futuro', { vigente_desde: '2026-10-01' }, false],
    ['fin igual al corte', { vigente_hasta: '2026-09-30' }, true],
    ['fin anterior', { vigente_hasta: '2026-09-29' }, false],
    ['fin posterior', { vigente_hasta: '2026-10-01' }, true],
    ['inactivo', { estado: 'inactive' }, false],
  ] as const)('vigencia: %s', (_, cambio, esperado) => {
    const datos = cargarEjemplo(); const acuerdo = { ...datos.acuerdos.acuerdos[0], ...cambio };
    expect(vigente(acuerdo, datos.cartola.corte)).toBe(esperado);
  });
  it('habilitación ausente prevalece sobre serie cerrada y comisión cero habilita', () => {
    const datos = cargarEjemplo();
    datos.catalogo.productos[0].series[1].abierta = false;
    delete datos.acuerdos.acuerdos[0].series['alfa-deuda-uf'].B;
    expect(acceso(datos, 0, 'B')).toMatchObject({ estado: 'out_of_scope', regla: 0 });
    datos.catalogo.productos[0].series[1].abierta = true;
    datos.acuerdos.acuerdos[0].series['alfa-deuda-uf'].B = 0;
    expect(acceso(datos, 0, 'B')).toMatchObject({ estado: 'eligible', regla: 6 });
  });
  it('cierre prevalece sobre APV; APV precede al mandato; mandato precede al mínimo', () => {
    const datos = cargarEjemplo(); const serie = datos.catalogo.productos[0].series[1];
    Object.assign(serie, { abierta: false, solo_apv: true, requiere_mandato: true, minimo_clp: 900000000 });
    expect(acceso(datos, 0, 'B').regla).toBe(1);
    serie.abierta = true; expect(acceso(datos, 0, 'B').regla).toBe(2);
    datos.cartola.cliente.plan_apv = true; expect(acceso(datos, 0, 'B').regla).toBe(3);
    datos.acuerdos.acuerdos[0].mandato = true; expect(acceso(datos, 0, 'B').regla).toBe(5);
  });
  it.each([[60000000, 180000000, 6], [60000001, 60000001, 4], [60000001, 60000000, 5]] as const)(
    'mínimo %s, agregado %s: regla %s', (minimo, agregado, regla) => {
      const datos = cargarEjemplo(); datos.catalogo.productos[0].series[1].minimo_clp = minimo;
      datos.acuerdos.acuerdos[0].patrimonio_agregado_clp = agregado;
      expect(acceso(datos, 0, 'B').regla).toBe(regla);
    });
  it('cambios APV, mandato, cierre y mínimo alteran los resultados conforme a reglas', () => {
    const datos = cargarEjemplo();
    datos.cartola.cliente.plan_apv = true;
    expect(ejecutar(datos).posiciones[0]).toMatchObject({ elegida: 'APV', ahorro: '780000' });
    datos.cartola.cliente.plan_apv = false; datos.acuerdos.acuerdos[0].mandato = true;
    expect(ejecutar(datos).posiciones[0].elegida).toBe('M');
    datos.acuerdos.acuerdos[0].mandato = false; datos.catalogo.productos[0].series[1].abierta = false;
    expect(ejecutar(datos).posiciones[0].ahorro).toBe('0');
    datos.catalogo.productos[0].series[1].abierta = true; datos.catalogo.productos[0].series[1].minimo_clp = 200000000;
    expect(acceso(datos, 0, 'B').regla).toBe(5);
    expect(ejecutar(datos).posiciones[0].ahorro).toBe('0');
  });
  it('tareas de mandato incluyen restricciones pendientes de mínimo', () => {
    const datos = cargarEjemplo(); const producto = datos.catalogo.productos[0];
    const serie = { ...producto.series[3], minimo_clp: 900000000 };
    const resultado = evaluarAcceso(serie, producto, 60000000, 'CLASI', datos.cartola, datos.acuerdos.acuerdos[0]);
    expect(resultado.regla).toBe(3);
    datos.catalogo.productos[0].series = [producto.series[0], serie];
    datos.acuerdos.acuerdos[0].series['alfa-deuda-uf'] = { CLASI: 0, M: 0 };
    expect(ejecutar(datos).posiciones[0].condicional!.tareas.join(' ')).toContain('Alcanzar el mínimo');
    expect(ejecutar(datos).posiciones[0].condicional!.tareas.join(' ')).toContain('volver a evaluar');
  });
});

describe('determinismo, precisión, invariantes y comisiones', () => {
  it('produce el mismo resultado tres veces y no muta las entradas congeladas', () => {
    const datos = cargarEjemplo(); const antes = JSON.stringify(datos); congelar(datos);
    const a = ejecutar(datos), b = ejecutar(datos), c = ejecutar(datos);
    expect(a).toEqual(b); expect(b).toEqual(c); expect(JSON.stringify(datos)).toBe(antes);
    a.contexto.cartola.cliente.referencia = 'otro';
    expect(datos.cartola.cliente.referencia).toBe('ACC-4471');
    expect(b.contexto.cartola.cliente.referencia).toBe('ACC-4471');
  });
  it.each(['minimo', 'cierre', 'apv', 'mandato', 'acuerdo', 'sin-identificar', 'vacia', 'cero', 'valorizacion', 'duplicadas'])(
    'repite tres veces la variante %s sin cambiar el resultado', caso => {
      const datos = cargarEjemplo();
      if (caso === 'minimo') datos.catalogo.productos[0].series[1].minimo_clp = 300000000;
      if (caso === 'cierre') datos.catalogo.productos[0].series[1].abierta = false;
      if (caso === 'apv') datos.cartola.cliente.plan_apv = true;
      if (caso === 'mandato') datos.acuerdos.acuerdos[0].mandato = true;
      if (caso === 'acuerdo') datos.acuerdos.acuerdos[0].estado = 'inactive';
      if (caso === 'sin-identificar') datos.cartola.posiciones[0].serie = 'desconocida';
      if (caso === 'vacia') datos.cartola.posiciones = [];
      if (caso === 'cero') datos.cartola.posiciones.forEach(p => { p.monto_clp = 0; });
      if (caso === 'valorizacion') datos.cartola.posiciones[0].monto_clp += 2;
      if (caso === 'duplicadas') datos.cartola.posiciones.push({ ...datos.cartola.posiciones[0] });
      const esperado = ejecutar(datos);
      expect(ejecutar(datos)).toEqual(esperado);
      expect(ejecutar(datos)).toEqual(esperado);
    });
  it('modificar comisiones conserva decisiones y todas las cifras financieras', () => {
    const datos = cargarEjemplo(); const antes = ejecutar(datos);
    for (const acuerdo of datos.acuerdos.acuerdos) for (const series of Object.values(acuerdo.series)) {
      for (const codigo of Object.keys(series)) series[codigo] = codigo === 'CLASI' ? 0 : 99;
    }
    for (const p of Object.values(datos.acuerdos.productos_sin_serie)) p.comision_distribucion_pct = 99;
    const despues = ejecutar(datos);
    expect(despues.totales).toEqual(antes.totales); expect(despues.posiciones).toEqual(antes.posiciones);
    expect(despues.contexto.acuerdos).not.toEqual(antes.contexto.acuerdos);
  });
  it('redondea mitades hacia arriba sin convertir decimales a number', () => {
    expect(redondear('1.5', 0)).toBe('2'); expect(redondear('1.23445', 4)).toBe('1.2345');
    expect(redondear('9999999999999999.5', 0)).toBe('10000000000000000');
    expect(decimal('0.1').plus('0.2').toString()).toBe('0.3');
  });
  it.each([
    ['producto duplicado', (d: Entradas) => d.catalogo.productos.push(d.catalogo.productos[0]), /duplicados/],
    ['emisor duplicado', (d: Entradas) => d.catalogo.emisores.push(d.catalogo.emisores[0]), /duplicados/],
    ['serie duplicada', (d: Entradas) => d.catalogo.productos[0].series.push(d.catalogo.productos[0].series[0]), /duplicados/],
    ['acuerdo ambiguo', (d: Entradas) => d.acuerdos.acuerdos.push(d.acuerdos.acuerdos[0]), /duplicados/],
    ['emisor inexistente', (d: Entradas) => { d.catalogo.productos[0].emisor = 'inexistente'; }, /emisor/],
    ['serie habilitada inexistente', (d: Entradas) => { d.acuerdos.acuerdos[0].series['alfa-deuda-uf'].ZZ = 0; }, /serie inexistente/],
    ['producto de otro emisor', (d: Entradas) => { d.acuerdos.acuerdos[0].series['beta-balanceado'] = { M: 0 }; }, /otro emisor/],
    ['fecha imposible', (d: Entradas) => { d.cartola.corte = '2026-02-30'; }, /fecha inválida/],
    ['fin anterior al inicio', (d: Entradas) => { d.acuerdos.acuerdos[0].vigente_hasta = '2020-01-01'; }, /fin precede/],
    ['negativo', (d: Entradas) => { d.cartola.posiciones[0].monto_clp = -1; }, /monto_clp/],
    ['no finito', (d: Entradas) => { d.cartola.posiciones[0].monto_clp = Infinity; }, /monto_clp/],
    ['rango excesivo', (d: Entradas) => { d.cartola.posiciones[0].monto_clp = 1e16; }, /monto_clp/],
  ] as const)('rechaza %s en el dominio aunque se omita infraestructura', (_, cambiar, error) => {
    const datos = cargarEjemplo(); cambiar(datos); expect(() => ejecutar(datos)).toThrow(error);
  });
  it('acuerdo ausente es dato válido y restringe solo propuestas', () => {
    const datos = cargarEjemplo(); datos.acuerdos.acuerdos = [];
    expect(ejecutar(datos).totales).toMatchObject({ costo: '5180000', ahorro: '0' });
    expect(ejecutar(datos).posiciones.flatMap(p => p.alternativas).every(a => a.regla === 0)).toBe(true);
  });
  it('ningún cambio sale del fondo original y el resultado conserva contexto completo', () => {
    const datos = cargarEjemplo(); const resultado = ejecutar(datos);
    resultado.posiciones.forEach(p => {
      expect(p.entrada).toEqual(datos.cartola.posiciones[p.indice]);
      if (p.elegida !== p.entrada.serie) expect(p.alternativas.some(a => a.serie.codigo === p.elegida && a.estado === 'eligible')).toBe(true);
    });
    expect(resultado.contexto).toEqual(datos);
  });
});
