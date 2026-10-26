import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { cargarEjemplo, interpretar } from '../infrastructure/input';
import { analizarCartola } from '../application/analizarCartola';
import InputReview, { AcuerdosReview, CartolaReview, CatalogoReview } from './InputReview';
import AnalysisView, { TablaDiagnostico, TablaSeries } from './AnalysisView';
import PositionDetail from './PositionDetail';

describe('previsualización completa de archivos', () => {
  it('muestra descripción e identificación juntas, decimales y campos adicionales sin perder falsos o nulos', () => {
    const datos = cargarEjemplo();
    const cartola = interpretar('cartola', {
      ...datos.cartola, origen: { confirmado: false, observacion: null },
      cliente: { ...datos.cartola.cliente, oficina: 'Sucursal de prueba' },
      posiciones: [{ ...datos.cartola.posiciones[0], descripcion_original: 'Descripción recibida',
        cuotas: 0.123456789123, valor_cuota: 12.123456789, monto_clp: 100.25, referencia_externa: 'REF-123' }],
    });
    const html = renderToStaticMarkup(<InputReview datos={{ ...datos, cartola }} nombres={{ cartola: 'cartola.json', catalogo: '', acuerdos: '' }} errores={{}} />);
    for (const texto of ['alfa-deuda-uf', 'Descripción recibida', '0,123456789123', '12,123456789', '$100,25', 'REF-123', 'Sucursal de prueba', 'origen.confirmado', 'origen.observacion', 'Sin dato']) expect(html).toContain(texto);
    expect(html).toContain('<td>No</td>');
  });

  it('conserva todas las posiciones, incluidas desconocidas y sin serie', () => {
    const datos = cargarEjemplo();
    const html = renderToStaticMarkup(<CartolaReview cartola={datos.cartola} catalogo={datos.catalogo} />);
    expect(html.match(/<tr>/g)).toHaveLength(8);
    expect(html).toContain('FM Zeta Acciones Asia, serie A');
    expect(html).toContain('Sin serie');
  });

  it('expone emisores, todas las series, seguros y otros datos adicionales del catálogo', () => {
    const datos = cargarEjemplo();
    const catalogo = interpretar('catalogo', { ...datos.catalogo, productos: datos.catalogo.productos.map((p, i) => i ? p : {
      ...p, series: p.series.map((s, j) => j ? s : { ...s, tac_pct: 2.123456, minimo_clp: 0.25, nota_serie: 'Nota recibida' }),
    }) });
    const html = renderToStaticMarkup(<CatalogoReview catalogo={catalogo} />);
    for (const producto of catalogo.productos) expect(html).toContain(producto.nombre);
    for (const emisor of catalogo.emisores) expect(html).toContain(emisor.nombre);
    for (const texto of ['2,123456 %', '$0,25', 'Nota recibida', 'prima_riesgo_pct_del_aporte', 'curva_costo_permanencia[3].horizonte_anios', 'curva_costo_permanencia[3].multa_rescate_pct', 'Producto sin series.']) expect(html).toContain(texto);
  });

  it('muestra vigencias, patrimonio, todas las habilitaciones y campos adicionales de acuerdos', () => {
    const datos = cargarEjemplo();
    const acuerdos = interpretar('acuerdos', { ...datos.acuerdos,
      acuerdos: datos.acuerdos.acuerdos.map((a, i) => i ? a : { ...a, firma: 'Firma recibida', series: { ...a.series, 'producto-vacio': {} } }),
      productos_sin_serie: { 'efectivo-clp': { comision_distribucion_pct: 0.123456, detalle: 'Detalle recibido' } },
    });
    const html = renderToStaticMarkup(<AcuerdosReview acuerdos={acuerdos} catalogo={datos.catalogo} />);
    for (const texto of ['Distribuidor de ejemplo', 'Estado declarado', 'Inicio', 'Fin', 'Mandato', '$180.000.000', 'Patrimonio al', 'CLASI', 'APV', 'Firma recibida', 'Detalle recibido', '0,123456 %', 'producto-vacio', 'Sin series habilitadas']) expect(html).toContain(texto);
  });
});

describe('tablas del análisis de nivel 1', () => {
  it('presenta diagnóstico por posición y total computable con su TAC, costo y exclusiones', () => {
    const datos = cargarEjemplo();
    const resultado = analizarCartola(datos.cartola, datos.catalogo, datos.acuerdos);
    const html = renderToStaticMarkup(<TablaDiagnostico posiciones={resultado.posiciones} totales={resultado.totales} />);
    for (const texto of ['Peso computable', 'Costo anual CLP', '$230.000.000', '2,2522 %', '$5.180.000', '$750.000', 'Sin identificar', 'FM Zeta Acciones Asia, serie A']) expect(html).toContain(texto);
    expect(html.match(/<tr>/g)).toHaveLength(9);
    const filtrada = renderToStaticMarkup(<TablaDiagnostico posiciones={[resultado.posiciones[4]]} />);
    expect(filtrada).not.toContain('<tfoot>');
  });

  it('muestra el ahorro elegible y el adicional condicionado con bases coherentes', () => {
    const datos = cargarEjemplo();
    const html = renderToStaticMarkup(<AnalysisView resultado={analizarCartola(datos.cartola, datos.catalogo, datos.acuerdos)} />);
    for (const texto of ['Costo actual', 'Ahorro elegible', 'Ahorro condicional adicional', 'Costo elegible', 'Costo con condiciones cumplidas', 'Ahorro total posible', 'Serie actual', 'Serie elegible', 'Serie condicional', 'Condición', 'Ahorro adicional CLP', '$1.650.000', '$615.000', '$300.000', '$315.000', '$3.530.000', '$2.915.000', '$2.265.000', '1,8143 %', '1,2674 %', '1,5348 %', '$230.000.000']) expect(html).toContain(texto);
    expect(html).toContain('El mínimo supera el ticket, pero el patrimonio agregado al corte lo alcanza. Requiere confirmación escrita de la AGF.');
    const tablaElegible = html.slice(html.indexOf('ts-comparison-table'), html.indexOf('</table>', html.indexOf('ts-comparison-table')));
    expect(tablaElegible).not.toContain('Condicional adicional');
    expect(tablaElegible).toContain('Gamma Renta Variable Chile');
    expect(tablaElegible).toContain('La AGF no tiene acuerdo vigente al corte.');
    expect(tablaElegible).not.toContain('Depósito a plazo en UF a 90 días');
    expect(tablaElegible).not.toContain('FM Zeta Acciones Asia, serie A');
    expect(html.indexOf('Ahorro condicional', html.indexOf('</table>', html.indexOf('ts-comparison-table')))).toBeGreaterThan(html.indexOf('</table>', html.indexOf('ts-comparison-table')));
    expect(html).toContain('ts-conditional-table');
    const tablaCondicional = html.slice(html.indexOf('ts-conditional-table'), html.indexOf('</table>', html.indexOf('ts-conditional-table')));
    expect(tablaCondicional).not.toContain('R04.4');
    expect(tablaCondicional).not.toContain(' · Costo');
    expect(tablaCondicional).not.toContain('<th scope="col">Serie actual</th>');
    expect(tablaCondicional).not.toContain('$1.260.000');
    expect(tablaCondicional).not.toContain('$1.440.000');
    expect(tablaCondicional).toContain('<td>B<small>TAC 1,45 %</small></td>');
    expect(html).not.toContain('$4.565.000');
    expect(html).not.toContain('Los ahorros condicionales no se suman');
    expect(html).toContain('TAC de estas posiciones. Base computable: $210.000.000.');
    expect(html).toContain('TAC de estas posiciones. Base computable: $105.000.000.');
    const resumen = html.slice(html.indexOf('ts-result-summary'), html.indexOf('</section>', html.indexOf('ts-result-summary')));
    expect(resumen).toContain('$300.000 + $315.000');
    expect(resumen).toContain('$2.265.000');
    expect(resumen).toContain('Gamma Renta Variable Chile');
    expect(resumen).toContain('su AGF no tiene acuerdo vigente');
    expect(resumen).toContain('Cambiar de AGF requiere una propuesta de cartera.');
    expect(html).not.toContain('Con confirmaciones');
    expect(html).not.toContain('Con cambios elegibles');
    expect(html).not.toContain('id="ahorro-title"');
    expect(html).not.toContain('Comisión');
  });

  it('muestra el por qué en la tabla y deja la evidencia completa fuera de ella', () => {
    const datos = cargarEjemplo();
    const resultado = analizarCartola(datos.cartola, datos.catalogo, datos.acuerdos);
    const html = renderToStaticMarkup(<PositionDetail posicion={resultado.posiciones[0]} />);
    for (const texto of ['Estado', 'Por qué', 'Actual', 'eligible', 'conditional', 'blocked', 'Ver evidencia completa de acceso', 'Fecha del patrimonio', 'Oportunidad condicional', '$300.000', 'confirmación escrita', 'ts-status--eligible', 'ts-status--conditional', 'ts-status--blocked']) expect(html).toContain(texto);
    const tablaSeries = html.slice(html.indexOf('ts-series-table'), html.indexOf('</table>', html.indexOf('ts-series-table')));
    expect(tablaSeries).not.toContain('Ver evidencia completa de acceso');
    expect(html.match(/<tr>/g)).toHaveLength(6);
  });

  it('muestra todas las series en una sola tabla, sin controles desplegables', () => {
    const datos = cargarEjemplo();
    const html = renderToStaticMarkup(<TablaSeries posiciones={analizarCartola(datos.cartola, datos.catalogo, datos.acuerdos).posiciones} />);
    for (const texto of ['Posición', 'Serie', 'TAC %', 'Estado', 'Regla', 'Motivo', 'Alfa Deuda UF Mediano Plazo', 'CLASI', 'eligible', 'conditional', 'blocked', 'Serie que tiene hoy el cliente.']) expect(html).toContain(texto);
    expect(html).not.toContain('<details');
    expect(html).not.toContain('<select');
  });

  it('muestra corte y motivo temporal de una serie bloqueada sin bloquear B', () => {
    const datos = cargarEjemplo();
    datos.acuerdos.acuerdos[0].patrimonio_al = '2026-10-01';
    const posicion = analizarCartola(datos.cartola, datos.catalogo, datos.acuerdos).posiciones[0];
    const html = renderToStaticMarkup(<PositionDetail posicion={posicion} />);
    for (const texto of ['Fecha de corte', '30 sept 2026', '1 oct 2026', 'posterior al corte', 'eligible', 'blocked']) expect(html).toContain(texto);
  });
});
