import type { PropuestaMeta } from '../domain/proposalModel';
import { categorias, escenarios, fecha, numero, pct, uf } from './format';
import { Asignaciones, Avisos, ContextoPropuesta, Evidencia, Fuentes, Mensajes, Resumen, Tabla, Trayectorias } from './ProposalView';
import Amount from './Amount';

export default function GoalView({ propuesta: p }: Readonly<{ propuesta: PropuestaMeta }>) {
  const base = p.escenarios.find(e => e.id === 'base');
  return <article className="ts-proposal" aria-labelledby="propuesta-meta-title">
    <section className="ts-proposal-hero"><div><p>{p.nombre ?? 'Propuesta por plazo'}</p><h2 id="propuesta-meta-title">Meta y cobertura</h2><span>{p.conclusionBase === 'alcanza' ? 'Alcanza en el escenario base' : 'No alcanza en el escenario base'}</span></div><strong>{pct(base?.coberturaPct ?? null)}<small> cobertura base neta de TAC (supuesto)</small></strong></section>
    <dl className="ts-review-meta ts-capital-summary"><div><dt>Capital asignado</dt><dd><Amount valorUf={p.capitalUf} valorClp={p.capitalClp ?? null} /></dd></div></dl>
    <ResumenMeta propuesta={p} />
    <Tabla titulo="Escenarios (supuesto)" columnas={['Escenario', 'Ajuste bruto', 'Cobertura por monto UF', 'Pendiente UF', 'Saldo final UF', 'Costo acumulado UF', 'Primer pago pendiente', 'Agotamiento total']} filas={p.escenarios.map(e => ({ id: e.id, celdas: [escenarios[e.id], `${numero(e.ajustePp, 1)} pp`, pct(e.coberturaPct), uf(e.pendienteUf), uf(e.saldoFinalUf), uf(e.costoAcumuladoUf), e.primeraFechaPendiente ? fecha(e.primeraFechaPendiente) : 'Ninguno', e.fechaAgotamiento ? fecha(e.fechaAgotamiento) : 'No se agota'] }))} />
    <Tabla titulo="Asignación por plazos" columnas={['Tramo', 'Categorías', 'Capital UF', 'Peso sobre capital asignado']} filas={p.reservas.map(r => ({ id: r.tramoId, celdas: [r.tramoId, r.categorias.map(c => categorias[c]).join(', '), uf(r.capitalUf), pct(r.pesoEfectivoPct ?? null)] }))} />
    <Asignaciones titulo="Instrumentos por tramo" asignaciones={p.reservas.flatMap(r => r.asignaciones)} moneda="uf" />
    <Tabla titulo="Pagos y cobertura base (supuesto)" columnas={['Fecha', 'Desembolso UF', 'Tramo', 'Pendiente base UF']} filas={p.pagos.map(d => ({ id: String(d.indice), celdas: [fecha(d.fecha), uf(d.uf), d.tramoId, uf(d.pendienteBaseUf)] }))} />
    <Mensajes titulo="Restricciones y causas de no asignación" mensajes={p.restricciones} /><Avisos mensajes={p.advertencias} avisoOrigen={p.fuentes?.aviso} /><Mensajes titulo="Incumplimientos / motivos de no admisión" mensajes={p.motivosNoAdmisible ?? []} />
    <ValorPresente propuesta={p} />
    {p.resumen && <details><summary>Costos, riesgo y concentración de la cartera para la meta</summary><Resumen titulo="Cartera invertida para la meta" resumen={p.resumen} asignaciones={p.reservas.flatMap(r => r.asignaciones)} emisores={p.fuentes?.emisores} /><p>Pesos sobre capital asignado. El capital no asignable queda fuera de la proyección.</p></details>}
    <ReferenciaActual propuesta={p} />
    <ContextoPropuesta fuentes={p.fuentes} />
    <Fuentes fuentes={p.fuentes} busqueda={p.busqueda} />
    <details><summary>Criterios de asignación</summary><p>VP = Σ flujo / (1 + retorno real bruto supuesto)^años, con días reales / 365,25. La tasa es el promedio simple de las categorías efectivas del tramo.</p><p>Máximo efectivo = máximo general × min(1, meses / 24). Crecimiento = Σ peso × factor: RV 1; balanceados 0,5; resto 0.</p></details>
    <Evidencia accesos={p.evidencias ?? []} /><Trayectorias escenarios={p.escenarios} />
  </article>;
}
function ResumenMeta({ propuesta: p }: Readonly<{ propuesta: PropuestaMeta }>) {
  const base = p.escenarios.find(e => e.id === 'base');
  return <div className="ts-proposal-grid"><section className="ts-proposal-card"><h3>Resultado del escenario base (supuesto)</h3><dl>
    <div><dt>Pagos pendientes</dt><dd><Amount valorUf={base?.pendienteUf ?? null} valorClp={p.pendienteBaseClp} /></dd></div>
    <div><dt>Primer pago con faltante</dt><dd>{base?.primeraFechaPendiente ? fecha(base.primeraFechaPendiente) : 'Ninguno'}</dd></div>
    <div><dt>Saldo final</dt><dd>{uf(base?.saldoFinalUf ?? null)}</dd></div>
    {p.capitalNoAsignableUf !== '0' && <div><dt>Capital no asignable</dt><dd><Amount valorUf={p.capitalNoAsignableUf} valorClp={p.noAsignableClp ?? null} /></dd></div>}
  </dl><p className="ts-footnote">Los pagos pendientes son importes futuros sin cubrir; no equivalen al capital adicional necesario hoy.</p></section>
    <section className="ts-proposal-card"><h3>Perfil y crecimiento</h3><dl>
      <div><dt>Tope de crecimiento del perfil</dt><dd>{pct(p.crecimientoGeneralPct ?? null)}</dd></div>
      <div><dt>Meses hasta primer pago</dt><dd>{numero(p.mesesPrimerPago ?? null, 2)}</dd></div>
      {p.crecimientoMaximoPct !== null && p.crecimientoMaximoPct !== p.crecimientoGeneralPct && <div><dt>Tope reducido por proximidad del pago</dt><dd>{pct(p.crecimientoMaximoPct)}</dd></div>}
      <div><dt>Crecimiento efectivo</dt><dd>{pct(p.crecimientoEfectivoPct)}</dd></div>
    </dl></section></div>;
}
function ValorPresente({ propuesta: p }: Readonly<{ propuesta: PropuestaMeta }>) {
  return <section className="ts-proposal-card"><h3>Valor presente (supuesto bruto)</h3><dl>
      <div><dt>VP total (supuesto)</dt><dd><Amount valorUf={p.vpTotalUf} valorClp={p.vpTotalClp ?? null} /></dd></div>
      {p.deficitVpUf !== null && p.deficitVpUf !== '0' ? <div><dt>Déficit de VP (supuesto)</dt><dd><Amount valorUf={p.deficitVpUf} valorClp={p.deficitVpClp ?? null} /></dd></div> : p.excedenteVpUf !== null && <div><dt>Excedente de VP (supuesto)</dt><dd><Amount valorUf={p.excedenteVpUf} valorClp={p.excedenteVpClp ?? null} /></dd></div>}
    </dl>
      <p className="ts-footnote">El VP usa retorno bruto supuesto. La cobertura descuenta la TAC y respeta las reservas y fechas de pago; un excedente de VP puede coexistir con pagos pendientes.</p>
      <DisponibilidadVp propuesta={p} />
      <details><summary>Cálculo de VP y reservas (supuesto)</summary>
        <Tabla titulo="VP por tramo (supuesto)" columnas={['Tramo', 'Bruto promedio (supuesto)', 'VP UF', 'Peso requerido', 'Peso efectivo']} filas={p.reservas.map(r => ({ id: r.tramoId, celdas: [r.tramoId, pct(r.retornoBrutoPct, 4), uf(r.vpUf), pct(r.pesoRequeridoPct ?? null), pct(r.pesoEfectivoPct ?? null)] }))} />
        <Tabla titulo="VP por pago (supuesto)" columnas={['Fecha', 'Tramo', 'Meses', 'VP UF', 'Reservado VP UF', 'VP no financiado UF']} filas={p.pagos.map(d => ({ id: String(d.indice), celdas: [fecha(d.fecha), d.tramoId, numero(d.meses, 2), uf(d.vpUf), uf(d.reservadoVpUf ?? null), uf(d.noFinanciadoInicialUf ?? null)] }))} />
      </details>
    </section>;
}
function ReferenciaActual({ propuesta: p }: Readonly<{ propuesta: PropuestaMeta }>) {
  if (!p.actual) return null;
  return <details><summary>Cartera actual de referencia</summary><Resumen titulo="Cartera actual de referencia" resumen={p.actual} asignaciones={p.actuales} emisores={p.fuentes?.emisores} /><Asignaciones titulo="Posiciones actuales" asignaciones={p.actuales ?? []} /></details>;
}
function DisponibilidadVp({ propuesta: p }: Readonly<{ propuesta: PropuestaMeta }>) {
  return p.vpTotalUf === null ? <p className="ts-notice">VP no disponible: hay tramos sin inversión asignada.</p> : null;
}
