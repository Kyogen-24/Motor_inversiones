import type { Asignacion, Busqueda, EvidenciaDecision, FuentesPropuesta, PropuestaCosto, ResumenFinanciero } from '../domain/proposalModel';
import { decimal, porcentaje } from '../domain/numeric';
import { categorias, clp, escenarios, fecha, numero, pct, uf } from './format';

export default function ProposalView({ propuesta: p }: Readonly<{ propuesta: PropuestaCosto }>) {
  const titulo = !p.admisible ? 'Sin propuesta admisible encontrada' : p.estado === 'propuesta' ? 'Mejora de costos sin aumentar riesgo' : 'Sin mejora de costo encontrada';
  return <article className="ts-proposal ts-proposal--cost" aria-labelledby="propuesta-costo-title">
    <h2 id="propuesta-costo-title" className="ts-cost-result-title">{titulo}</h2>
    <div className="ts-stat-row"><div><span>Capital comparado</span><strong>{clp(p.actual.capitalClp)}</strong><p>Misma base de inversión</p></div><div><span>Ahorro anual encontrado</span><strong>{p.admisible ? clp(p.ahorroAnualClp) : 'No disponible'}</strong><p>{p.admisible ? 'Diferencia de costo anual' : 'Sin cartera admisible'}</p></div><div><span>Volatilidad (supuesto)</span><strong>{pct(p.propuesta.volatilidadPct, 4)}</strong><p>{p.admisible ? 'Cartera propuesta' : 'Cartera actual'}</p></div></div>
    <section className="ts-cost-panel" aria-labelledby="comparacion-costos-title"><div className="ts-section-heading"><h2 id="comparacion-costos-title">El costo de tu portafolio</h2><span className="ts-badge">Anual (CLP)</span></div><p className="ts-muted">Cambios de serie y fondos equivalentes, sujetos a riesgo, perfil y concentración.</p><div className="ts-cost-line"><div><span>Costo actual</span><strong>{clp(p.actual.costoAnualClp)}</strong></div><div className="ts-cost-track" aria-hidden="true"><div className="ts-cost-fill" style={{ width: p.actual.costoAnualClp === '0' ? '0%' : '100%' }} /></div><p>TAC ponderada <strong>{pct(p.actual.tacPct, 4)}</strong></p></div>{p.admisible && <div className="ts-cost-line ts-cost-line--after"><div><span>Costo propuesto</span><strong>{clp(p.propuesta.costoAnualClp)}</strong></div><div className="ts-cost-track" aria-hidden="true"><div className="ts-cost-fill" style={{ width: `${porcentaje(p.propuesta.costoAnualClp, p.actual.costoAnualClp) ?? 0}%` }} /></div><p>Ahorro anual <strong>{clp(p.ahorroAnualClp)}</strong></p><p>TAC ponderada <strong>{pct(p.propuesta.tacPct, 4)}</strong></p></div>}</section>
    <ComparacionPosiciones propuesta={p} />
    <Tabla columnasNumericas={[1, 2]} titulo="Riesgo y retornos de la cartera" columnas={['Indicador', 'Actual', p.admisible ? 'Propuesta' : 'Diagnóstico actual']} filas={[
      { id: 'volatilidad', celdas: ['Volatilidad (supuesto)', pct(p.actual.volatilidadPct, 4), pct(p.propuesta.volatilidadPct, 4)] },
      { id: 'crecimiento', celdas: ['Crecimiento', pct(p.actual.crecimientoPct), pct(p.propuesta.crecimientoPct)] },
      { id: 'bruto', celdas: ['Retorno bruto (supuesto)', pct(p.actual.retornoBrutoPct, 4), pct(p.propuesta.retornoBrutoPct, 4)] },
      { id: 'neto', celdas: ['Retorno neto (supuesto)', pct(p.actual.retornoNetoPct, 4), pct(p.propuesta.retornoNetoPct, 4)] },
    ]} />
    <p className="ts-footnote">Riesgo: volatilidad ponderada simple, sin correlaciones; mismo método y supuestos en ambas carteras.</p>
    <ConcentracionComparada propuesta={p} />
    {p.escenarios.length > 0 && <Tabla columnasNumericas={[1, 2, 3]} titulo="Escenarios a cinco años (supuesto)" columnas={['Escenario', 'Ajuste al retorno', 'Saldo final (UF)', 'Costo acumulado (UF)']} filas={p.escenarios.map(e => ({ id: e.id, celdas: [escenarios[e.id], `${numero(e.ajustePp, 1)} pp`, uf(e.saldoFinalUf), uf(e.costoAcumuladoUf)] }))} />}
    <ConclusionCosto propuesta={p} />
    <Avisos mensajes={p.advertencias} avisoOrigen={p.fuentes?.aviso} />
    <Mensajes titulo="Incumplimientos / motivos de no admisión" mensajes={p.motivosNoAdmisible ?? []} />
    <ContextoPropuesta fuentes={p.fuentes} />
    <LimiteBusqueda busqueda={p.busqueda} />
    <Evidencia accesos={p.evidencias ?? []} />
  </article>;
}
function ComparacionPosiciones({ propuesta: p }: Readonly<{ propuesta: PropuestaCosto }>) {
  if (!p.admisible) return <Asignaciones titulo="Posiciones actuales" asignaciones={p.actuales ?? []} />;
  const operaciones = { serie: 'Cambio de serie', equivalente: 'Fondo equivalente', perfil: 'Ajuste al perfil', retencion: 'Se conserva' };
  const nombre = (a: Asignacion) => `${a.nombre}\n${a.serie ? `Serie: ${a.serie}` : 'Sin serie'}`;
  const actuales = new Map((p.actuales ?? []).map(a => [a.loteOrigen, a]));
  const hayReparto = new Set(p.asignaciones.map(a => a.loteOrigen)).size < p.asignaciones.length;
  return <section className="ts-holdings"><Tabla columnasNumericas={[1, 2, 4, 5]} titulo="Comparación por posición" columnas={['Posición actual', 'Monto actual CLP', 'TAC actual', 'Destino propuesto', 'Monto destinado CLP', 'TAC propuesta', 'Operación']} filas={p.asignaciones.map((a, i) => {
    const origen = actuales.get(a.loteOrigen);
    return { id: String(i), celdas: [origen ? nombre(origen) : 'Origen no informado', origen ? clp(origen.montoClp) : 'No informado', origen ? pct(origen.tacPct, 4) : 'No informada', nombre(a), clp(a.montoClp), pct(a.tacPct, 4), a.fase ? operaciones[a.fase] : 'Nueva inversión'] };
  })} totales={['Total cartera', clp(p.actual.capitalClp), pct(p.actual.tacPct, 4), 'Total propuesta', clp(p.propuesta.capitalClp), pct(p.propuesta.tacPct, 4), '—']} />{hayReparto && <p className="ts-footnote">Las posiciones repartidas tienen una fila por destino. Su monto actual se repite como referencia; no se suma entre filas.</p>}</section>;
}
function ConclusionCosto({ propuesta: p }: Readonly<{ propuesta: PropuestaCosto }>) {
  if (!p.admisible) return <section className="ts-result-summary" aria-label="Conclusión de mejora de costos"><h2>Conclusión del análisis</h2><p>No se encontró una cartera admisible. Los importes mostrados corresponden a la cartera actual.</p></section>;
  return <section className="ts-result-summary" aria-label="Conclusión de mejora de costos"><h2>Conclusión del análisis</h2>
    {p.estado === 'propuesta' ? <p>En total, el ahorro es de <strong>{clp(p.ahorroAnualClp)} al año</strong>. El costo anual pasa de <strong>{clp(p.actual.costoAnualClp)}</strong> a <strong>{clp(p.propuesta.costoAnualClp)}</strong>, y la TAC ponderada de <strong>{pct(p.actual.tacPct, 4)}</strong> a <strong>{pct(p.propuesta.tacPct, 4)}</strong>.</p> : <p>No se encontró una alternativa con menor costo dentro de las carteras evaluadas. El costo anual es de <strong>{clp(p.propuesta.costoAnualClp)}</strong>, con TAC ponderada de <strong>{pct(p.propuesta.tacPct, 4)}</strong>.</p>}
    <p>La volatilidad (supuesto) pasa de <strong>{pct(p.actual.volatilidadPct, 4)}</strong> a <strong>{pct(p.propuesta.volatilidadPct, 4)}</strong>, sin aumentar el riesgo según el método declarado. La cartera respeta los límites de concentración y crecimiento del perfil.</p>
  </section>;
}
function ConcentracionComparada({ propuesta: p }: Readonly<{ propuesta: PropuestaCosto }>) {
  const nombres = new Map([...(p.actuales ?? []), ...p.asignaciones].map(a => [a.producto, a.nombre]));
  const fondos = [...new Set([...Object.keys(p.actual.concentracionFondos), ...Object.keys(p.propuesta.concentracionFondos)])];
  const agfs = [...new Set([...Object.keys(p.actual.concentracionAgf), ...Object.keys(p.propuesta.concentracionAgf)])];
  const destino = p.admisible ? 'Peso propuesto' : 'Peso actual (diagnóstico)';
  return <details><summary>Concentración por fondo y AGF</summary><Tabla columnasNumericas={[1, 2]} titulo="Concentración por fondo" columnas={['Fondo', 'Peso actual', destino]} filas={fondos.map(id => ({ id, celdas: [nombres.get(id) ?? id, pct(p.actual.concentracionFondos[id] ?? '0'), pct(p.propuesta.concentracionFondos[id] ?? '0')] }))} /><Tabla columnasNumericas={[1, 2]} titulo="Concentración por AGF" columnas={['AGF', 'Peso actual', destino]} filas={agfs.map(id => ({ id, celdas: [p.fuentes?.emisores[id] ?? id, pct(p.actual.concentracionAgf[id] ?? '0'), pct(p.propuesta.concentracionAgf[id] ?? '0')] }))} /></details>;
}
export function ContextoPropuesta({ fuentes: f }: Readonly<{ fuentes?: FuentesPropuesta }>) {
  return <>
    {f && <dl className="ts-review-meta ts-proposal-context"><div><dt>UF de referencia para equivalencias CLP</dt><dd>{clp(f.valorUfClp)} al {fecha(f.fechaUf)}</dd></div></dl>}
    <p className="ts-footnote">Universo de propuesta: productos habilitados por acuerdos vigentes. Puede haber alternativas fuera de este universo.</p>
    {f && f.sinIdentificarClp !== '0' && <p className="ts-notice">Sin identificar: {clp(f.sinIdentificarClp)} ({pct(f.porcentajeSinIdentificar)} de la cartola). Este importe queda fuera del diagnóstico de costo y riesgo de la cartera actual.</p>}
    {f && f.excluidoClp !== '0' && <p className="ts-notice">Productos identificados excluidos de la base de costo y riesgo: {clp(f.excluidoClp)}.</p>}
    {f && f.exclusiones.length > 0 && <Tabla columnasNumericas={[1]} titulo="Posiciones excluidas del diagnóstico" columnas={['Posición', 'Monto CLP', 'Motivo']} filas={f.exclusiones.map((p, i) => ({ id: String(i), celdas: [p.nombre, clp(p.montoClp), p.motivo] }))} />}
  </>;
}
export function LimiteBusqueda({ busqueda }: Readonly<{ busqueda: Busqueda | null }>) {
  return busqueda?.estado === 'limite_alcanzado' ? <p className="ts-notice" role="status">La búsqueda alcanzó su límite. Puede haber otras alternativas que no se evaluaron.</p> : null;
}
export function Resumen({ titulo, resumen: r, asignaciones = [], emisores = {} }: Readonly<{ titulo: string; resumen: ResumenFinanciero; asignaciones?: Asignacion[]; emisores?: Record<string, string> }>) {
  return <section className="ts-proposal-card"><h3>{titulo}</h3><dl>{[
    ['Capital invertido', clp(r.capitalClp)], ...(r.basePesosClp && !decimal(r.basePesosClp).eq(r.capitalClp) ? [['Capital usado para pesos y límites', clp(r.basePesosClp)]] : []), ['Costo anual', clp(r.costoAnualClp)], ['TAC anual de las inversiones', pct(r.tacPct, 4)], ['Retorno bruto (supuesto)', pct(r.retornoBrutoPct, 4)], ['Retorno después de TAC (supuesto)', pct(r.retornoNetoPct, 4)], ['Volatilidad (supuesto)', pct(r.volatilidadPct, 4)], ['Exposición a activos de crecimiento', pct(r.crecimientoPct)],
  ].map(([label, valor]) => <div key={label}><dt>{label}</dt><dd>{valor}</dd></div>)}</dl>
    <details><summary>Concentración por fondo y AGF</summary><Tabla titulo={`Concentración por fondo: ${titulo}`} columnas={['Fondo', 'Peso']} filas={Object.entries(r.concentracionFondos).map(([id, peso]) => ({ id, celdas: [asignaciones.find(a => a.producto === id)?.nombre ?? id, pct(peso)] }))} />
      <Tabla titulo={`Concentración por AGF: ${titulo}`} columnas={['AGF', 'Peso']} filas={Object.entries(r.concentracionAgf).map(([id, peso]) => ({ id, celdas: [emisores[id] ?? id, pct(peso)] }))} /></details>
  </section>;
}
export function Asignaciones({ titulo, asignaciones, mostrarCambio = false, moneda = 'clp' }: Readonly<{ titulo: string; asignaciones: Asignacion[]; mostrarCambio?: boolean; moneda?: 'clp' | 'uf' }>) {
  if (!asignaciones.length) return null;
  const cambios = { serie: 'Cambio de serie', equivalente: 'Fondo equivalente', perfil: 'Ajuste al perfil', retencion: 'Se conserva' };
  const referencia = (a: Asignacion) => a.tramoId ?? `Lote ${(a.loteOrigen ?? 0) + 1}`;
  const producto = (a: Asignacion) => `${a.nombre}${a.serie ? `\nSerie: ${a.serie}` : ''}`;
  const consolidado = asignaciones.some(a => a.ticketFinalClp !== undefined && a.ticketFinalClp !== a.montoClp);
  return <section>
    <Tabla titulo={titulo} columnas={['Lote / tramo', 'Producto y serie', 'Categoría', moneda === 'clp' ? 'Monto CLP' : 'Monto UF', 'Peso', 'TAC', 'Liquidez', ...(consolidado ? ['Ticket final CLP consolidado'] : []), ...(mostrarCambio ? ['Operación'] : [])]} filas={asignaciones.map((a, i) => ({ id: String(i), celdas: [referencia(a), producto(a), categorias[a.categoria], moneda === 'clp' ? clp(a.montoClp) : uf(a.montoUf), pct(a.pesoPct ?? null), pct(a.tacPct, 4), `${a.liquidezDias} ${a.liquidezDias === 1 ? 'día' : 'días'}`, ...(consolidado ? [clp(a.ticketFinalClp ?? a.montoClp)] : []), ...(mostrarCambio ? [a.fase ? cambios[a.fase] : 'Nueva inversión'] : [])] }))} />
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
  const filas = (alternativas: boolean) => accesos.filter(a => (a.uso === 'alternativa') === alternativas).map((a, i) => ({ id: String(i), celdas: [a.loteOrigen === undefined ? a.tramos.join(', ') : `Lote ${a.loteOrigen + 1}`, `${a.nombre}\nSerie: ${a.serie ?? 'Sin serie'}`, ...(alternativas ? [`${a.serieAsignada ?? 'Sin serie'}`] : [usos[a.uso]]), clp(a.ticketClp), estados[a.estado] ?? a.estado, a.motivo, a.tareas.join(' ')] }));
  return <details><summary>Acceso y condiciones</summary>
    <Tabla titulo="Acceso de destinos y tenencias" columnas={['Lote / tramos', 'Producto y serie', 'Uso', 'Ticket CLP', 'Acceso a nueva inversión', 'Motivo', 'Condiciones']} filas={filas(false)} />
    {accesos.some(a => a.uso === 'alternativa') && <section><h3>Otras series de los productos asignados</h3><p>Acceso al mismo importe del destino o tenencia indicados. Una alternativa elegible también debe cumplir las restricciones de la cartera antes de proponerse.</p><Tabla titulo="Acceso de otras series" columnas={['Lote / tramos', 'Producto y serie', 'Serie asignada', 'Ticket CLP', 'Estado', 'Motivo', 'Condiciones']} filas={filas(true)} /></section>}
  </details>;
}
export function Tabla({ titulo, columnas, filas, totales, columnasNumericas = [] }: Readonly<{ titulo: string; columnas: string[]; filas: { id: string; celdas: string[] }[]; totales?: string[]; columnasNumericas?: number[] }>) {
  if (!filas.length) return null;
  const numericas = new Set(columnasNumericas);
  return <section className="ts-proposal-table"><h3>{titulo}</h3><div className="ts-table-scroll" role="region" tabIndex={0} aria-label={`${titulo}: tabla desplazable`}><table><caption className="sr-only">{titulo}</caption><thead><tr>{columnas.map((c, indice) => <th className={numericas.has(indice) ? 'ts-num' : undefined} scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{filas.map(fila => <tr key={fila.id}>{fila.celdas.map((dato, indice) => <td className={numericas.has(indice) ? 'ts-num' : undefined} key={`${fila.id}-${columnas[indice]}`}>{dato.includes('\n') ? <><span className="ts-table-primary">{dato.split('\n')[0]}</span>{'\n'}<span className="ts-table-secondary">{dato.slice(dato.indexOf('\n') + 1)}</span></> : dato}</td>)}</tr>)}</tbody>{totales && <tfoot><tr>{totales.map((dato, indice) => indice === 0 ? <th scope="row" key={indice}>{dato}</th> : <td className={numericas.has(indice) ? 'ts-num' : undefined} key={indice}>{dato}</td>)}</tr></tfoot>}</table></div></section>;
}
