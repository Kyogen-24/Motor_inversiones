import type { Asignacion, Busqueda, EscenarioResultado, EvidenciaDecision, FuentesPropuesta, PropuestaCosto, ResumenFinanciero } from '../domain/proposalModel';
import { categorias, clp, escenarios, fecha, numero, pct, uf } from './format';

export default function ProposalView({ propuesta: p }: Readonly<{ propuesta: PropuestaCosto }>) {
  const titulo = !p.admisible ? 'Sin propuesta admisible encontrada' : p.estado === 'propuesta' ? 'Mejora de costos sin aumentar riesgo' : 'Sin mejora de costo encontrada';
  return <article className="ts-proposal" aria-labelledby="propuesta-costo-title">
    <section className="ts-proposal-hero"><div><p>Comparación de costos</p><h2 id="propuesta-costo-title">{titulo}</h2></div><strong>{clp(p.ahorroAnualClp)}<small> ahorro anual</small></strong></section>
    <div className="ts-proposal-grid"><Resumen titulo="Actual" resumen={p.actual} asignaciones={p.actuales} emisores={p.fuentes?.emisores} /><Resumen titulo={p.admisible ? 'Propuesta' : 'Tenencias actuales (diagnóstico)'} resumen={p.propuesta} asignaciones={p.asignaciones} emisores={p.fuentes?.emisores} /></div>
    <p className="ts-footnote">Riesgo: volatilidad ponderada simple, sin correlaciones; mismo método y supuestos en ambas carteras.</p>
    {p.admisible && <>
      <Asignaciones titulo="Cambios propuestos" asignaciones={p.asignaciones.filter(a => a.fase !== 'retencion')} mostrarCambio />
      <Mensajes titulo="Criterio de los cambios" mensajes={[
        ...(p.asignaciones.some(a => a.fase === 'equivalente') ? ['Se eligen fondos de la misma categoría con menor costo, respetando riesgo, acceso y concentración.'] : []),
        ...(p.asignaciones.some(a => a.fase === 'perfil') ? ['La reasignación entre categorías es necesaria para cumplir el perfil o la concentración, sin aumentar la volatilidad.'] : []),
      ]} />
      <Asignaciones titulo="Tenencias conservadas" asignaciones={p.asignaciones.filter(a => a.fase === 'retencion')} />
      {p.asignaciones.some(a => a.fase === 'retencion') && <p className="ts-footnote">Las tenencias conservadas no reciben una nueva inversión; pueden incluir productos fuera de los acuerdos vigentes.</p>}
    </>}
    {p.escenarios.length > 0 && <Tabla titulo="Escenarios a cinco años · supuesto" columnas={['Escenario', 'Ajuste al retorno', 'Saldo final · UF', 'Costo acumulado · UF']} filas={p.escenarios.map(e => ({ id: e.id, celdas: [escenarios[e.id], `${numero(e.ajustePp, 1)} pp`, uf(e.saldoFinalUf), uf(e.costoAcumuladoUf)] }))} />}
    <Avisos mensajes={p.advertencias} avisoOrigen={p.fuentes?.aviso} />
    <Mensajes titulo="Incumplimientos / motivos de no admisión" mensajes={p.motivosNoAdmisible ?? []} />
    <details><summary>Origen: cartera actual</summary><Asignaciones titulo="Posiciones actuales" asignaciones={p.actuales ?? []} /></details>
    <ContextoPropuesta fuentes={p.fuentes} />
    <Fuentes fuentes={p.fuentes} busqueda={p.busqueda} />
    <Evidencia accesos={p.evidencias ?? []} />
    <Trayectorias escenarios={p.escenarios} />
  </article>;
}
export function ContextoPropuesta({ fuentes: f }: Readonly<{ fuentes?: FuentesPropuesta }>) {
  return <>
    {f && <p className="ts-footnote">Cliente {f.cliente} · Corte {fecha(f.corte)}.</p>}
    <p className="ts-footnote">Esta propuesta considera productos de las administradoras con las que {f?.distribuidor ?? 'el distribuidor'} mantiene acuerdos de distribución vigentes. Puede haber en el mercado alternativas de menor costo fuera de ese universo. Una persona revisa y decide antes de ejecutar.</p>
    {f && f.sinIdentificarClp !== '0' && <p className="ts-notice">Sin identificar: {clp(f.sinIdentificarClp)} ({pct(f.porcentajeSinIdentificar)} de la cartola). Este importe queda fuera del diagnóstico de costo y riesgo de la cartera actual.</p>}
    {f && f.excluidoClp !== '0' && <p className="ts-notice">Productos identificados excluidos de la base de costo y riesgo: {clp(f.excluidoClp)}.</p>}
    {f && f.exclusiones.length > 0 && <details><summary>Posiciones excluidas del diagnóstico</summary><Tabla titulo="Detalle de exclusiones" columnas={['Posición', 'Monto CLP', 'Motivo']} filas={f.exclusiones.map((p, i) => ({ id: String(i), celdas: [p.nombre, clp(p.montoClp), p.motivo] }))} /></details>}
  </>;
}
export function Fuentes({ fuentes: f, busqueda }: Readonly<{ fuentes?: FuentesPropuesta; busqueda: Busqueda | null }>) {
  return <section>{busqueda?.estado === 'limite_alcanzado' && <p className="ts-notice" role="status">La búsqueda alcanzó su límite. Puede haber otras alternativas que no se evaluaron.</p>}
    <details className="ts-analysis-context"><summary>Fuentes y metodología</summary>
      <dl className="ts-review-meta"><div><dt>Catálogo</dt><dd>{f?.catalogoVersion ?? 'No informado'}</dd></div><div><dt>Fecha de costos</dt><dd>{f?.catalogoFecha ?? 'No informada'}</dd></div><div><dt>Fuente de costos</dt><dd>{f?.catalogoFuente ?? 'No informada'}</dd></div><div><dt>Versión de supuestos</dt><dd>{f?.supuestosVersion ?? 'No informada'}</dd></div><div><dt>Fecha de supuestos</dt><dd>{f?.supuestosFecha ?? 'No informada'}</dd></div><div><dt>UF de referencia</dt><dd>{clp(f?.valorUfClp ?? null)} · {f?.fechaUf}</dd></div></dl>
      <p>Retornos y volatilidad: supuestos declarados. Riesgo: volatilidad ponderada simple, sin correlaciones. Retorno neto = retorno bruto ponderado − TAC ponderada.</p>
      <p>Los importes CLP equivalentes usan la UF de referencia. La búsqueda de candidatos no certifica un óptimo global.</p>
    </details>
  </section>;
}
export function Resumen({ titulo, resumen: r, asignaciones = [], emisores = {} }: Readonly<{ titulo: string; resumen: ResumenFinanciero; asignaciones?: Asignacion[]; emisores?: Record<string, string> }>) {
  return <section className="ts-proposal-card"><h3>{titulo}</h3><dl>{[
    ['Capital invertido', clp(r.capitalClp)], ...(r.basePesosClp && r.basePesosClp !== r.capitalClp ? [['Base de pesos y concentración', clp(r.basePesosClp)]] : []), ['Costo anual', clp(r.costoAnualClp)], ['TAC sobre capital invertido', pct(r.tacPct, 4)], ['Retorno bruto · supuesto', pct(r.retornoBrutoPct, 4)], ['Retorno neto · supuesto', pct(r.retornoNetoPct, 4)], ['Volatilidad · supuesto', pct(r.volatilidadPct, 4)], ['Crecimiento', pct(r.crecimientoPct)],
  ].map(([label, valor]) => <div key={label}><dt>{label}</dt><dd>{valor}</dd></div>)}</dl>
    <details><summary>Concentración por fondo y AGF</summary><Tabla titulo={`Concentración por fondo · ${titulo}`} columnas={['Fondo', 'Peso']} filas={Object.entries(r.concentracionFondos).map(([id, peso]) => ({ id, celdas: [asignaciones.find(a => a.producto === id)?.nombre ?? id, pct(peso)] }))} />
      <Tabla titulo={`Concentración por AGF · ${titulo}`} columnas={['AGF', 'Peso']} filas={Object.entries(r.concentracionAgf).map(([id, peso]) => ({ id, celdas: [emisores[id] ?? id, pct(peso)] }))} /></details>
  </section>;
}
export function Asignaciones({ titulo, asignaciones, mostrarCambio = false, moneda = 'clp' }: Readonly<{ titulo: string; asignaciones: Asignacion[]; mostrarCambio?: boolean; moneda?: 'clp' | 'uf' }>) {
  if (!asignaciones.length) return null;
  const cambios = { serie: 'Cambio de serie', equivalente: 'Fondo equivalente', perfil: 'Ajuste al perfil', retencion: 'Se conserva' };
  const referencia = (a: Asignacion) => a.tramoId ?? `Lote ${(a.loteOrigen ?? 0) + 1}`;
  const producto = (a: Asignacion) => `${a.nombre}${a.serie ? ` · ${a.serie}` : ''}`;
  const consolidado = asignaciones.some(a => a.ticketFinalClp !== undefined && a.ticketFinalClp !== a.montoClp);
  return <section>
    <Tabla titulo={titulo} columnas={['Lote / tramo', 'Producto y serie', 'Categoría', moneda === 'clp' ? 'Monto CLP' : 'Monto UF', 'Peso', 'TAC', 'Liquidez', ...(mostrarCambio ? ['Operación'] : [])]} filas={asignaciones.map((a, i) => ({ id: String(i), celdas: [referencia(a), producto(a), categorias[a.categoria], moneda === 'clp' ? clp(a.montoClp) : uf(a.montoUf), pct(a.pesoPct ?? null), pct(a.tacPct, 4), `${a.liquidezDias} ${a.liquidezDias === 1 ? 'día' : 'días'}`, ...(mostrarCambio ? [a.fase ? cambios[a.fase] : 'Nueva inversión'] : [])] }))} />
    <details><summary>Detalle de instrumentos: tickets y retornos · supuesto</summary><Tabla titulo={`${titulo}: detalle · supuesto`} columnas={['Lote / tramo', 'Producto y serie', moneda === 'clp' ? 'Monto UF de referencia' : 'Monto CLP de referencia', ...(consolidado ? ['Ticket final CLP consolidado'] : []), 'Bruto · supuesto', 'Neto · supuesto']} filas={asignaciones.map((a, i) => ({ id: String(i), celdas: [referencia(a), producto(a), moneda === 'clp' ? uf(a.montoUf) : clp(a.montoClp), ...(consolidado ? [clp(a.ticketFinalClp ?? a.montoClp)] : []), pct(a.retornoBrutoPct ?? null, 4), pct(a.retornoNetoPct ?? null, 4)] }))} /></details>
  </section>;
}
export function Mensajes({ titulo, mensajes }: Readonly<{ titulo: string; mensajes: string[] }>) { return mensajes.length > 0 ? <section><h3>{titulo}</h3><ul>{mensajes.map((m, i) => <li key={`${i}-${m}`}>{m}</li>)}</ul></section> : null; }
const comentariosGenerales = new Set([
  'Alternativas limitadas a acuerdos de distribución vigentes; pueden existir opciones fuera de ese universo. Una persona revisa y decide antes de ejecutar.',
  'Mejor propuesta encontrada entre candidatos explorados; no se ha demostrado un mínimo global.',
  'La retención no constituye una nueva inversión.',
  'Los retornos, VP y proyecciones son supuestos, no historia ni promesa.',
  'VP: promedio aritmético simple de las categorías efectivas, una vez cada una. No se utiliza el retorno para preferir categorías.',
  'Los pendientes futuros no equivalen al capital adicional necesario hoy.',
  'Búsqueda determinista de candidatos; optimalidad no demostrada.',
]);
export function Avisos({ mensajes, avisoOrigen }: Readonly<{ mensajes: string[]; avisoOrigen?: string }>) {
  return <Mensajes titulo="Observaciones" mensajes={mensajes.filter(m => m !== avisoOrigen && !comentariosGenerales.has(m))} />;
}
export function Evidencia({ accesos }: Readonly<{ accesos: EvidenciaDecision[] }>) {
  if (!accesos.length) return null;
  const estados: Record<string, string> = { eligible: 'Elegible', conditional: 'Condicional', blocked: 'Bloqueada', out_of_scope: 'Fuera del universo', not_evaluated: 'No acreditado' };
  const usos = { destino: 'Destino propuesto', tenencia: 'Tenencia conservada', alternativa: 'Otra serie del mismo producto' };
  const filas = (alternativas: boolean) => accesos.filter(a => (a.uso === 'alternativa') === alternativas).map((a, i) => ({ id: String(i), celdas: [a.loteOrigen === undefined ? a.tramos.join(', ') : `Lote ${a.loteOrigen + 1}`, `${a.nombre} · ${a.serie ?? 'Sin serie'}`, ...(alternativas ? [`${a.serieAsignada ?? 'Sin serie'}`] : [usos[a.uso]]), clp(a.ticketClp), estados[a.estado] ?? a.estado, a.motivo, a.tareas.join(' ')] }));
  return <details><summary>Acceso y condiciones</summary>
    <Tabla titulo="Acceso de destinos y tenencias" columnas={['Lote / tramos', 'Producto y serie', 'Uso', 'Ticket CLP', 'Acceso a nueva inversión', 'Motivo', 'Condiciones']} filas={filas(false)} />
    {accesos.some(a => a.uso === 'alternativa') && <details><summary>Otras series de los productos asignados</summary><p>Acceso al mismo importe del destino o tenencia indicados. Una alternativa elegible también debe cumplir las restricciones de la cartera antes de proponerse.</p><Tabla titulo="Acceso de otras series" columnas={['Lote / tramos', 'Producto y serie', 'Serie asignada', 'Ticket CLP', 'Estado', 'Motivo', 'Condiciones']} filas={filas(true)} /></details>}
  </details>;
}
export function Trayectorias({ escenarios }: Readonly<{ escenarios: EscenarioResultado[] }>) {
  if (!escenarios.length) return null;
  return <details><summary>Trayectoria mensual, rescates y transferencias · supuesto</summary><p>Costo por período = saldo medio antes del retiro × TAC / 100 × días / 365,25. La proyección aplica retorno neto de TAC hasta la liquidación.</p>{escenarios.map(e => <details key={e.id}><summary>{e.id} · supuesto</summary><Tabla titulo={`Períodos ${e.id} · supuesto`} columnas={['Desde', 'Hasta', 'Asignación', 'Inicial UF', 'Antes del retiro UF', 'Bruto supuesto', 'TAC', 'Costo UF']} filas={(e.periodos ?? []).map((p, i) => ({ id: String(i), celdas: [p.desde, p.hasta, String(p.asignacion + 1), uf(p.saldoInicialUf), uf(p.saldoAntesRetiroUf), pct(p.retornoBrutoPct, 4), pct(p.tacPct, 4), uf(p.costoUf)] }))} /><Tabla titulo={`Rescates ${e.id} · supuesto`} columnas={['Pago', 'Fecha de pago', 'Liquidación', 'Asignación', 'Retiro UF', 'Transferencia']} filas={(e.rescates ?? []).map((r, i) => ({ id: String(i), celdas: [String(r.pagoIndice + 1), r.fecha, r.liquidacion, String(r.asignacion + 1), uf(r.uf), r.transferencia ? 'Excedente liberado' : 'Reserva propia'] }))} /></details>)}</details>;
}
export function Tabla({ titulo, columnas, filas }: Readonly<{ titulo: string; columnas: string[]; filas: { id: string; celdas: string[] }[] }>) {
  if (!filas.length) return null;
  return <section className="ts-proposal-table"><h3>{titulo}</h3><div className="ts-table-scroll" role="region" tabIndex={0} aria-label={`${titulo}: tabla desplazable`}><table><caption className="sr-only">{titulo}</caption><thead><tr>{columnas.map(c => <th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{filas.map(fila => <tr key={fila.id}>{fila.celdas.map((dato, indice) => <td key={`${fila.id}-${columnas[indice]}`}>{dato}</td>)}</tr>)}</tbody></table></div></section>;
}
