import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { cargarEjemplo } from '../infrastructure/input';
import { proponerCostos } from '../application/proponerCostos';
import { proponerMeta } from '../application/proponerMeta';
import ProposalView, { Evidencia } from './ProposalView';
import GoalView from './GoalView';
import GoalTimeline from './GoalTimeline';
import { MetaReview, SupuestosReview } from './InputReview';
import { EstadoPropuestas } from './App';
import { analizarCartola } from '../application/analizarCartola';

describe('requisitos del análisis automático', () => {
  const datos = cargarEjemplo();
  const resultado = analizarCartola(datos.cartola, datos.catalogo, datos.acuerdos);
  it('indica los archivos pendientes de cada modalidad sin botones de generación', () => {
    const entradas = { supuestos: datos.supuestos };
    const costo = renderToStaticMarkup(<EstadoPropuestas workflow={{ resultado, entradas }} modalidad="costo" />);
    expect(costo).toBe('');
    const meta = renderToStaticMarkup(<EstadoPropuestas workflow={{ resultado, entradas }} modalidad="meta" />);
    expect(meta).toContain('Agrega la meta');
    expect(meta).not.toContain('<button');
  });
  it('dirige al análisis único y solicita supuestos cuando faltan', () => {
    expect(renderToStaticMarkup(<EstadoPropuestas workflow={{ resultado: null, entradas: {} }} modalidad="costo" />)).toContain('pulsa Analizar cartola');
    expect(renderToStaticMarkup(<EstadoPropuestas workflow={{ resultado, entradas: {} }} modalidad="costo" />)).toContain('Agrega los supuestos');
  });
});

describe('evidencia visible de nivel 2', () => {
  it('presenta resultados sin avisos de demostración ni contadores internos', () => {
    const d = cargarEjemplo();
    const costo = proponerCostos(d); const meta = proponerMeta(d);
    const aviso = 'Conjunto ficticio para pruebas de demostración';
    for (const propuesta of [costo, meta]) {
      propuesta.fuentes!.aviso = aviso;
      propuesta.advertencias.push(aviso, 'Revisar liquidez antes del próximo desembolso.');
    }
    const html = renderToStaticMarkup(<><ProposalView propuesta={costo} /><GoalView propuesta={meta} /></>);
    expect(html).not.toContain(aviso);
    expect(html).not.toContain('nodos');
    expect(html).not.toContain('Optimalidad');
    expect(html).not.toContain('no son historia ni promesa');
    expect(html).toContain('Revisar liquidez antes del próximo desembolso.');
    expect(html).toContain('Retorno bruto (supuesto)');
    expect(html).toContain('Costo acumulado');
  }, 10_000);
  it('revisa los supuestos sin convertir anotaciones del archivo en avisos del análisis', () => {
    const s = cargarEjemplo().supuestos;
    s._aviso = 'Aviso de datos ficticios de prueba';
    const html = renderToStaticMarkup(<SupuestosReview supuestos={s} />);
    expect(html).not.toContain(s._aviso);
    expect(html).toContain('Retorno real bruto (supuesto)');
  });
  it('presenta supuestos y meta con campos legibles y retornos rotulados', () => {
    const d = cargarEjemplo();
    const html = renderToStaticMarkup(<><SupuestosReview supuestos={d.supuestos} /><MetaReview meta={d.meta} /></>);
    for (const texto of ['Retorno real bruto (supuesto)', 'Volatilidad (supuesto)', 'Capital asignado', 'Fecha de referencia', 'Desembolsos', 'Tramos']) expect(html).toContain(texto);
  });
  it('expone universo, acceso y comparativo completo de costo', () => {
    const html = renderToStaticMarkup(<ProposalView propuesta={proponerCostos(cargarEjemplo())} />);
    for (const texto of ['Universo de propuesta', 'Retorno bruto (supuesto)', 'Crecimiento', 'Concentración', 'Ticket', 'Comparación por posición', 'TAC', 'UF de referencia', '2,13 %', 'Se conserva', 'Costo actual', 'Costo propuesto', 'Riesgo y retornos de la cartera']) expect(html).toContain(texto);
    expect(html).not.toContain('Fuentes y metodología');
    expect(html).not.toContain('Criterio de los cambios');
    expect(html).not.toContain('<summary>Origen: cartera actual</summary>');
    expect(html).not.toContain('Trayectoria mensual');
    expect(html).not.toContain('Detalle de instrumentos: tickets');
    expect(html).not.toContain('deuda_uf_mediano');
    expect(html).not.toContain('retencion');
    expect(html).not.toContain('Destinos por lote original');
    expect(html).toContain('<tfoot>');
    expect(html).toContain('Total cartera');
    expect(html).toContain('Total propuesta');
  });
  it('no titula un resultado sin ahorro como mejora', () => {
    const r = proponerCostos(cargarEjemplo()); r.estado = 'sin_mejora'; r.ahorroAnualClp = '0';
    const html = renderToStaticMarkup(<ProposalView propuesta={r} />);
    expect(html).toContain('Sin mejora de costo encontrada');
    expect(html).not.toContain('Mejora de costos sin aumentar riesgo');
  });
  it('expone condiciones pendientes con el importe y contexto correctos', () => {
    const html = renderToStaticMarkup(<Evidencia accesos={[{ producto: 'alfa', nombre: 'Alfa', serie: 'F', serieAsignada: 'B', uso: 'alternativa', loteOrigen: 0, tramos: [], ticketClp: '60000000', estado: 'conditional', motivo: 'Requiere agregación.', tareas: ['Obtener confirmación escrita.'] }]} />);
    for (const texto of ['Lote 1', '$60.000.000', 'Condicional', 'confirmación escrita', 'Otras series']) expect(html).toContain(texto);
  });
  it('muestra instrumentos, costo por escenario y tope de perfil de meta', () => {
    const html = renderToStaticMarkup(<GoalView propuesta={proponerMeta(cargarEjemplo())} />);
    for (const texto of ['Ticket CLP', 'Liquidez', 'Tope de crecimiento del perfil', 'Costo acumulado', 'Pesos sobre capital asignado', 'TAC', 'base neta', 'referencia', 'supuesto', 'Costos y riesgo de la cartera para la meta', 'Conclusión del análisis', 'Calendario de pagos', 'Distribución por plazos']) expect(html).toContain(texto);
    expect(html).not.toContain('Trayectoria mensual');
    expect(html).not.toContain('Detalle de instrumentos: tickets');
    expect(html).not.toContain('Cartera actual de referencia');
    expect(html).not.toContain('<summary>Criterios de asignación</summary>');
    expect(html).not.toContain('<summary>Fuentes y metodología</summary>');
    expect(html).not.toContain('Restricciones respetadas');
    expect(html).not.toContain('Máximo reducido');
    expect(html.indexOf('Conclusión del análisis')).toBeGreaterThan(html.indexOf('Inversiones para la meta'));
    expect(html.indexOf('Escenarios (supuesto)')).toBeLessThan(html.indexOf('Inversiones para la meta'));
    expect(html).not.toContain('meses / 24');
    expect(html).not.toContain('VP por pago');
    expect(html).toContain('126,2110 UF');
    expect(html).toContain('Primer pago con faltante');
    expect(html.match(/class="ts-scenario"/g)).toHaveLength(3);
    expect(html.match(/class="ts-scenario"[^>]*open=""/g)).toHaveLength(1);
    const favorableInicio = html.indexOf('<span>Favorable</span>');
    const favorable = html.slice(favorableInicio, html.indexOf('</details>', favorableInicio));
    expect(favorable).toContain('Pago cubierto');
    expect(favorable).not.toContain('Falta 10,7729 UF');
    expect(html).not.toContain('Base de pesos y concentración');
  });
  it('representa las fechas de pago con distancias proporcionales y faltantes explícitos', () => {
    const pagos = ['2031-01-01', '2031-01-11', '2031-01-31'].map((fecha, indice) => ({ fecha, indice, uf: '100', meses: '12', tramoId: 'T1', vpUf: '99', pendienteBaseUf: indice === 1 ? '5' : '0' }));
    const html = renderToStaticMarkup(<GoalTimeline pagos={pagos} />);
    const xs = [...html.matchAll(/<circle cx="([\d.]+)"/g)].map(m => Number(m[1]));
    expect(xs).toHaveLength(3);
    expect((xs[1] - xs[0]) / (xs[2] - xs[1])).toBeCloseTo(0.5);
    expect(html).toContain('Falta 5,0000 UF');
    expect(html).toContain('Pago cubierto');
    expect(html).toContain('role="img"');
  });
  it('muestra el tope reducido solo cuando la proximidad del pago lo cambia', () => {
    const d = cargarEjemplo(); d.meta.desembolsos = [{ fecha: '2027-03-01', uf: 100 }];
    const html = renderToStaticMarkup(<GoalView propuesta={proponerMeta(d)} />);
    expect(html).toContain('Tope reducido por proximidad del pago');
  });
  it('mantiene visible el capital no asignable y evita confundirlo con inversión', () => {
    const d = cargarEjemplo(); d.meta.capital_asignado_clp = 1;
    const html = renderToStaticMarkup(<GoalView propuesta={proponerMeta(d)} />);
    expect(html).toContain('Capital no asignable');
    expect(html).toContain('No alcanza en el escenario base');
    expect(html).toContain('VP no disponible');
  });
});
