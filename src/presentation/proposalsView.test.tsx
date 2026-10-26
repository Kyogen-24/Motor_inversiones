import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { cargarEjemplo } from '../infrastructure/input';
import { proponerCostos } from '../application/proponerCostos';
import { proponerMeta } from '../application/proponerMeta';
import ProposalView, { Evidencia } from './ProposalView';
import GoalView from './GoalView';
import { MetaReview, SupuestosReview } from './InputReview';
import { AccionesPropuestas } from './App';
import { analizarCartola } from '../application/analizarCartola';

describe('acciones para generar propuestas', () => {
  const datos = cargarEjemplo();
  const resultado = analizarCartola(datos.cartola, datos.catalogo, datos.acuerdos);
  const acciones = { generarCosto() {}, generarMeta() {} };
  it('separa los controles y requisitos de cada vista de nivel 2', () => {
    const sinMeta = { cartola: datos.cartola, catalogo: datos.catalogo, acuerdos: datos.acuerdos, supuestos: datos.supuestos };
    const workflow = { ...acciones, resultado, entradas: sinMeta, calculando: false };
    const costo = renderToStaticMarkup(<AccionesPropuestas workflow={workflow} modalidad="costo" />);
    expect(costo).toContain('Generar mejora de costo');
    expect(costo).not.toContain('Armar propuesta para la meta');
    expect(costo).not.toContain('Agrega la meta');
    expect(costo).not.toContain('disabled=""');
    const meta = renderToStaticMarkup(<AccionesPropuestas workflow={workflow} modalidad="meta" />);
    expect(meta).not.toContain('Generar mejora de costo');
    expect(meta).toContain('Armar propuesta para la meta');
    expect(meta).toContain('Agrega la meta');
    expect(meta).toContain('disabled=""');
  });
  it('mantiene ambos botones visibles y deshabilitados sin un análisis', () => {
    const html = renderToStaticMarkup(<AccionesPropuestas workflow={{ ...acciones, resultado: null, entradas: {}, calculando: false }} />);
    expect(html).toContain('Generar mejora de costo');
    expect(html).toContain('Armar propuesta para la meta');
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });
  it('habilita costo con supuestos y meta solo cuando está cargada', () => {
    const sinMeta = { cartola: datos.cartola, catalogo: datos.catalogo, acuerdos: datos.acuerdos, supuestos: datos.supuestos };
    const html = renderToStaticMarkup(<AccionesPropuestas workflow={{ ...acciones, resultado, entradas: sinMeta, calculando: false }} />);
    expect(html.match(/disabled=""/g)).toHaveLength(1);
    const completo = renderToStaticMarkup(<AccionesPropuestas workflow={{ ...acciones, resultado, entradas: datos, calculando: false }} />);
    expect(completo).not.toContain('disabled=""');
  });
  it('bloquea ambos botones mientras se calcula o faltan supuestos', () => {
    for (const estado of [{ entradas: datos, calculando: true }, { entradas: {}, calculando: false }]) {
      const html = renderToStaticMarkup(<AccionesPropuestas workflow={{ ...acciones, resultado, ...estado }} />);
      expect(html.match(/disabled=""/g)).toHaveLength(2);
    }
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
    for (const texto of ['Distribuidor de ejemplo', 'alternativas de menor costo fuera de ese universo', 'Una persona revisa', 'Retorno bruto (supuesto)', 'Crecimiento', 'Concentración', 'Ticket', 'Origen', 'TAC', 'Fuentes y metodología', '2,13 %', 'Tenencias conservadas']) expect(html).toContain(texto);
    expect(html).not.toContain('deuda_uf_mediano');
    expect(html).not.toContain('retencion');
    expect(html).not.toContain('Destinos por lote original');
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
    for (const texto of ['Ticket CLP', 'Liquidez', 'Tope de crecimiento del perfil', 'meses / 24', 'Costo acumulado', 'Pesos sobre capital asignado', 'TAC', 'base neta', 'Distribuidor de ejemplo', 'Trayectoria', 'referencia', 'supuesto', 'Cartera actual de referencia', '$230.000.000']) expect(html).toContain(texto);
    expect(html).not.toContain('Restricciones respetadas');
    expect(html).not.toContain('Máximo reducido');
    expect(html.indexOf('Pagos pendientes')).toBeLessThan(html.indexOf('Perfil y crecimiento'));
    expect(html.indexOf('Escenarios (supuesto)')).toBeLessThan(html.indexOf('Instrumentos por tramo'));
    expect(html).toContain('un excedente de VP puede coexistir con pagos pendientes');
    expect(html).toContain('126,2110 UF');
    expect(html).toContain('Primer pago con faltante');
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
