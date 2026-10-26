import type { PropuestaMeta } from '../domain/proposalModel';
import { categorias, clp, escenarios, fecha, numero, pct, uf } from './format';
import { Avisos, ContextoPropuesta, Evidencia, LimiteBusqueda, Mensajes, Resumen, Tabla } from './ProposalView';
import Amount from './Amount';
import GoalTimeline from './GoalTimeline';

export default function GoalView({ propuesta: p }: Readonly<{ propuesta: PropuestaMeta }>) {
  const base = p.escenarios.find(e => e.id === 'base');
  return <article className="ts-proposal ts-proposal--goal" aria-labelledby="propuesta-meta-title">
    <h2 id="propuesta-meta-title" className="ts-cost-result-title">{p.nombre ?? 'Planificación de la meta'}</h2>
    <dl className="ts-review-meta ts-capital-summary"><div><dt>Capital asignado</dt><dd><Amount valorUf={p.capitalUf} valorClp={p.capitalClp ?? null} /></dd></div></dl>
    <ResumenMeta propuesta={p} />
    <EscenariosMeta propuesta={p} />
    <Tabla titulo="Distribución por plazos" columnas={['Pagos del tramo', 'Categorías', 'Capital reservado UF', 'VP requerido UF (supuesto)', 'Peso requerido', 'Peso asignado']} filas={p.reservas.map(r => {
      const pagos = p.pagos.filter(d => d.tramoId === r.tramoId);
      const periodo = pagos.length ? `${fecha(pagos[0].fecha)}${pagos.length > 1 ? ` a ${fecha(pagos[pagos.length - 1].fecha)}` : ''}` : 'Sin pagos';
      return { id: r.tramoId, celdas: [`${r.tramoId}: ${periodo}`, r.categorias.map(c => categorias[c]).join(', '), uf(r.capitalUf), uf(r.vpUf), pct(r.pesoRequeridoPct ?? null), pct(r.pesoEfectivoPct ?? null)] };
    })} />
    <Tabla titulo="Inversiones para la meta" columnas={['Tramo', 'Fondo y serie', 'Capital UF', 'Peso asignado', 'TAC', 'Liquidez']} filas={p.reservas.flatMap(r => r.asignaciones).map((a, i) => ({ id: String(i), celdas: [a.tramoId ?? 'Sin tramo', `${a.nombre}\n${a.serie ? `Serie: ${a.serie}` : 'Sin serie'}`, uf(a.montoUf), pct(a.pesoPct ?? null), pct(a.tacPct, 4), `${a.liquidezDias} días`] }))} />
    <Mensajes titulo="Restricciones y causas de no asignación" mensajes={p.restricciones} /><Avisos mensajes={p.advertencias} avisoOrigen={p.fuentes?.aviso} /><Mensajes titulo="Incumplimientos / motivos de no admisión" mensajes={p.motivosNoAdmisible ?? []} />
    <ValorPresente propuesta={p} />
    {p.resumen && <section><Resumen titulo="Costos y riesgo de la cartera para la meta" resumen={p.resumen} asignaciones={p.reservas.flatMap(r => r.asignaciones)} emisores={p.fuentes?.emisores} /><p className="ts-footnote">Pesos sobre capital asignado. El capital no asignable queda fuera de la proyección.</p></section>}
    <section className="ts-result-summary" aria-label="Conclusión de la meta">
      <h2>Conclusión del análisis</h2>
      <div className="ts-conclusion-metric"><strong>{pct(base?.coberturaPct ?? null)}</strong><span>cobertura base neta de TAC (supuesto)</span></div>
      <p><strong>{p.conclusionBase === 'alcanza' ? 'Alcanza en el escenario base' : 'No alcanza en el escenario base'}.</strong>{p.conclusionBase === 'alcanza' ? ' La cartera permite cubrir todos los pagos en sus fechas.' : p.admisible ? <> Quedan <strong>{uf(base?.pendienteUf ?? null)}</strong> de pagos sin cubrir, equivalentes a <strong>{clp(p.pendienteBaseClp)}</strong> con la UF de referencia.</> : ' No se encontró una cartera admisible para financiar los pagos.'}</p>
      {base?.primeraFechaPendiente && <p>Primer pago con faltante: <strong>{fecha(base.primeraFechaPendiente)}</strong>. Los pagos pendientes son importes futuros; no equivalen al capital adicional necesario hoy.</p>}
      {p.capitalNoAsignableUf !== '0' && <p>Capital no asignable: <strong>{uf(p.capitalNoAsignableUf)}</strong>. Queda fuera de la proyección.</p>}
    </section>
    <ContextoPropuesta fuentes={p.fuentes} />
    <LimiteBusqueda busqueda={p.busqueda} />
    <Evidencia accesos={p.evidencias ?? []} />
  </article>;
}
function ResumenMeta({ propuesta: p }: Readonly<{ propuesta: PropuestaMeta }>) {
  return <section className="ts-proposal-card ts-goal-profile"><h3>Perfil y crecimiento</h3><dl>
      <div><dt>Tope de crecimiento del perfil</dt><dd>{pct(p.crecimientoGeneralPct ?? null)}</dd></div>
      {p.crecimientoMaximoPct !== null && p.crecimientoMaximoPct !== p.crecimientoGeneralPct && <div><dt>Tope reducido por proximidad del pago</dt><dd>{pct(p.crecimientoMaximoPct)}</dd></div>}
      <div><dt>Crecimiento efectivo</dt><dd>{pct(p.crecimientoEfectivoPct)}</dd></div>
    </dl></section>;
}
function ValorPresente({ propuesta: p }: Readonly<{ propuesta: PropuestaMeta }>) {
  return <section className="ts-proposal-card"><h3>Capital necesario hoy según VP (supuesto bruto)</h3><dl>
      <div><dt>Reserva inicial estimada (VP)</dt><dd><Amount valorUf={p.vpTotalUf} valorClp={p.vpTotalClp ?? null} /></dd></div>
      {p.deficitVpUf !== null && p.deficitVpUf !== '0' ? <div><dt>Capital por debajo de la reserva estimada</dt><dd><Amount valorUf={p.deficitVpUf} valorClp={p.deficitVpClp ?? null} /></dd></div> : p.excedenteVpUf !== null && <div><dt>Capital por encima de la reserva estimada</dt><dd><Amount valorUf={p.excedenteVpUf} valorClp={p.excedenteVpClp ?? null} /></dd></div>}
    </dl>
      <p className="ts-footnote">Estimación antes de costos. Tener capital por encima del VP no garantiza cubrir los pagos: la cobertura de cada escenario incluye la TAC y las fechas de pago.</p>
      <DisponibilidadVp propuesta={p} />
    </section>;
}
function EscenariosMeta({ propuesta: p }: Readonly<{ propuesta: PropuestaMeta }>) {
  return <section className="ts-goal-scenarios" aria-labelledby="escenarios-meta-title"><h3 id="escenarios-meta-title">Escenarios (supuesto)</h3>{p.escenarios.map(e => {
    const porIndice = new Map(e.pagos.map(pago => [pago.indice, pago]));
    const pagos = p.pagos.flatMap(pago => {
      const proyectado = porIndice.get(pago.indice);
      return proyectado ? [{ ...pago, pendienteBaseUf: proyectado.pendienteUf }] : [];
    });
    return <details className="ts-scenario" key={e.id} open={e.id === 'base'}><summary><span>{escenarios[e.id]}</span><span>{pct(e.coberturaPct)} de cobertura</span></summary>
      <dl className="ts-scenario-metrics"><div><dt>Ajuste al retorno bruto</dt><dd>{numero(e.ajustePp, 1)} pp</dd></div><div><dt>Pagos pendientes</dt><dd>{uf(e.pendienteUf)}</dd></div><div><dt>Saldo final</dt><dd>{uf(e.saldoFinalUf)}</dd></div><div><dt>Costo acumulado</dt><dd>{uf(e.costoAcumuladoUf)}</dd></div><div><dt>Primer pago con faltante</dt><dd>{e.primeraFechaPendiente ? fecha(e.primeraFechaPendiente) : 'Ninguno'}</dd></div><div><dt>Agotamiento del capital</dt><dd>{e.fechaAgotamiento ? fecha(e.fechaAgotamiento) : 'No se agota'}</dd></div></dl>
      {pagos.length === p.pagos.length ? <GoalTimeline pagos={pagos} escenario={escenarios[e.id]} /> : <p className="ts-footnote">Calendario sin detalle disponible para este escenario.</p>}
    </details>;
  })}</section>;
}
function DisponibilidadVp({ propuesta: p }: Readonly<{ propuesta: PropuestaMeta }>) {
  return p.vpTotalUf === null ? <p className="ts-notice">VP no disponible: hay tramos sin inversión asignada.</p> : null;
}
