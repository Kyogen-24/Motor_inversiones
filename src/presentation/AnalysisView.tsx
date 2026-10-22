import { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Database, Info, Layers3 } from 'lucide-react';
import type { Analisis, ResultadoPosicion } from '../domain/model';
import { clp, fecha, numero, pct } from './format';
import PositionDetail from './PositionDetail';

type Props = Readonly<{ resultado: Analisis }>;
type Pestana = 'resumen' | 'posiciones' | 'acceso';
type PropsResumen = Props & Readonly<{ verSeries: (indice: number) => void; verPosiciones: () => void }>;

export default function AnalysisView({ resultado }: Props) {
  const [pestana, setPestana] = useState<Pestana>('resumen');
  const [seleccionada, setSeleccionada] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const total = resultado.totales;
  const contexto = resultado.contexto;
  const filtradas = resultado.posiciones.filter(p => `${p.nombre} ${p.emisor ?? ''} ${p.entrada.serie ?? ''}`.toLowerCase().includes(busqueda.toLowerCase()));
  function verSeries(indice: number) {
    setSeleccionada(indice);
    setPestana('acceso');
    requestAnimationFrame(() => document.getElementById('series-title')?.focus());
  }
  return <>
          <section className="ts-client-strip" aria-label="Contexto del análisis"><div className="ts-client-id"><span className="ts-avatar">{contexto.cartola.cliente.referencia.slice(0, 2)}</span><div><strong>{contexto.cartola.cliente.referencia}</strong><span>Cliente</span></div></div><dl><div><dt>Fecha de corte</dt><dd>{fecha(contexto.cartola.corte)}</dd></div><div><dt>Perfil declarado</dt><dd className="ts-capitalize">{contexto.cartola.cliente.perfil_riesgo}</dd></div><div><dt>Plan APV</dt><dd>{contexto.cartola.cliente.plan_apv ? 'Sí' : 'No'}</dd></div></dl><span className="ts-analysis-ready"><Check size={13} aria-hidden="true" />Análisis calculado</span></section>
          <fieldset className="ts-tabs" aria-label="Secciones del análisis">
            {([{ id: 'resumen', label: 'Vista general' }, { id: 'posiciones', label: `Posiciones (${resultado.posiciones.length})` }, { id: 'acceso', label: 'Acceso y series' }] as const).map(tab => <button key={tab.id} aria-pressed={pestana === tab.id} className={pestana === tab.id ? 'is-active' : ''} onClick={() => setPestana(tab.id)}>{tab.label}</button>)}
          </fieldset>
          {pestana === 'resumen' && <Resumen resultado={resultado} verSeries={verSeries} verPosiciones={() => setPestana('posiciones')} />}
          {pestana === 'posiciones' && <section className="ts-holdings ts-holdings--full"><div className="ts-section-heading"><div><h2>Detalle de posiciones</h2></div><label className="ts-search">Buscar posición<input type="search" placeholder="Fondo, AGF o serie…" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label></div><TablaPosiciones posiciones={filtradas} verSeries={verSeries} />{!filtradas.length && <p className="ts-empty-search">No hay posiciones que coincidan con «{busqueda}».</p>}<p className="ts-footnote">Identificado: {clp(total.identificado)} en {total.identificadas} posiciones. Excluido de la base por tipo o costo no verificable: {clp(total.excluido)}. Sin identificar: {clp(total.sinIdentificar)}.</p></section>}
          {pestana === 'acceso' && <section><div className="ts-section-heading ts-series-selector"><div><h2 id="series-title" tabIndex={-1}>Acceso y series</h2></div><label>Posición<select value={seleccionada} onChange={e => setSeleccionada(Number(e.target.value))}>{resultado.posiciones.map(p => <option key={p.indice} value={p.indice}>{p.indice + 1}. {p.nombre}</option>)}</select></label></div>{resultado.posiciones[seleccionada] ? <PositionDetail posicion={resultado.posiciones[seleccionada]} /> : <div className="ts-empty"><h3>No hay posiciones para evaluar</h3><p>La cartola está vacía. Puedes cargar otro archivo en Datos de entrada.</p></div>}</section>}
    <footer className="ts-analysis-footer"><p>Catálogo {contexto.catalogo.version} · Fuente: {contexto.catalogo.fuente_costos} · Costos al {fecha(contexto.catalogo.corte_costos)}</p><details><summary>Contexto del análisis</summary><p>Reglas {resultado.versionReglas} · Obtención de costos: no informada.</p><p>Universo de propuesta: {resultado.acuerdosVigentes.length ? resultado.acuerdosVigentes.join(', ') : 'sin acuerdos vigentes'}.</p><p>Perfil declarado el {fecha(contexto.cartola.cliente.perfil_evaluado_el)}; vigencia no evaluada en nivel 1.</p></details></footer>
  </>;
}

function Resumen({ resultado, verSeries, verPosiciones }: PropsResumen) {
  const total = resultado.totales;
  const condicionales = resultado.posiciones.filter(p => p.condicional);
  const advertencias = resultado.posiciones.filter(p => p.clasificacion !== 'computable' || p.advertencias.length);
  return <>

            <div className="ts-stat-row"><div><span>Patrimonio en cartola</span><strong>{clp(total.monto)}<small>CLP</small></strong><p>{resultado.posiciones.length} posiciones en total</p></div><div><span>Base computable para TAC</span><strong>{clp(total.computable)}<small>CLP</small></strong><p>{total.computables} posiciones con costo verificable</p></div><div><span>Sin identificar</span><strong>{clp(total.sinIdentificar)}<small>CLP</small></strong><p>{pct(total.porcentajeSinIdentificar)} del patrimonio total</p></div></div>
            <div className="ts-overview-grid">
              <section className="ts-cost-panel" aria-labelledby="costos-title"><div className="ts-section-heading"><h2 id="costos-title">El costo de tu portafolio</h2><span className="ts-badge">Anual · CLP</span></div><p className="ts-muted">Mismos fondos y montos. Solo cambia la serie elegible.</p>
                <div className="ts-cost-line"><div><span>Costo actual</span><strong>{clp(total.costo)}</strong></div><div className="ts-cost-track"><div className="ts-cost-fill" style={{ width: total.costo === '0' ? '0%' : '100%' }} /></div><p>TAC ponderada <strong>{pct(total.tac, 4)}</strong></p></div>
                <div className="ts-cost-line ts-cost-line--after"><div><span>Con cambios elegibles</span><strong>{clp(total.costoPosterior)}</strong></div><div className="ts-cost-track"><div className="ts-cost-fill" style={{ width: `${total.porcentajeCostoPosterior ?? 0}%` }} /></div><p>TAC ponderada <strong>{pct(total.tacPosterior, 4)}</strong></p></div>
                <div className="ts-cost-caption"><Info size={14} aria-hidden="true" /><p>Ambas TAC usan {clp(total.computable)} computables. Incluyen depósitos y efectivo a costo cero.</p></div>
              </section>
              <section className="ts-saving-panel" aria-labelledby="ahorro-title"><span className="ts-saving-icon"><ArrowDown size={19} aria-hidden="true" /></span><h2 id="ahorro-title">Ahorro elegible anual</h2><strong className="ts-saving-value">{clp(total.ahorro)}</strong><p>{total.porcentajeAhorro === null ? 'Sin costo computable para comparar.' : `${pct(total.porcentajeAhorro, 1)} menos en costos anuales`}</p><div className="ts-saving-divider" /><div className="ts-saving-description"><Check size={15} aria-hidden="true" /><span>{total.cambios} cambios de serie elegibles</span></div><div className="ts-saving-description"><Check size={15} aria-hidden="true" /><span>Mismo fondo, AGF y exposición</span></div><button className="ts-text-button" onClick={verPosiciones}>Revisar los cambios<ArrowRight size={15} aria-hidden="true" /></button></section>
            </div>
            <section className="ts-holdings" aria-labelledby="posiciones-title"><div className="ts-section-heading"><div><h2 id="posiciones-title">Tus posiciones, una a una</h2></div><button className="ts-text-button" onClick={verPosiciones}>Ver detalle<ArrowUpRight size={15} aria-hidden="true" /></button></div><TablaPosiciones posiciones={resultado.posiciones} verSeries={verSeries} /></section>
            <section className="ts-conditional-section" aria-labelledby="condicional-title"><div className="ts-section-heading"><div><h2 id="condicional-title">Oportunidades que requieren confirmación</h2><p>Este ahorro adicional no está incluido en el escenario elegible.</p></div><strong className="ts-conditional-total">{clp(total.condicional)}<span>adicionales / año</span></strong></div>
              {condicionales.length ? <div className="ts-conditional-list">{condicionales.map(p => <details key={p.indice}><summary><div><strong>{p.nombre}</strong><span>Serie {p.condicional!.serie} · TAC {pct(p.condicional!.tac)}</span></div><span className="ts-conditional-amount">+{clp(p.condicional!.adicional)}<ChevronDown size={15} aria-hidden="true" /></span></summary><div className="ts-conditional-body"><p>Comparado con la serie elegible {p.elegida ?? 'actual'}. Requiere confirmar condiciones antes de ejecutar.</p><ul>{p.condicional!.tareas.map(t => <li key={t}>{t}</li>)}</ul><button className="ts-text-button" onClick={() => verSeries(p.indice)}>Revisar regla y evidencia<ArrowUpRight size={14} aria-hidden="true" /></button></div></details>)}</div> : <p className="ts-muted">No hay alternativas condicionales con ahorro adicional para estas entradas.</p>}
            </section>
            {advertencias.length > 0 && <section className="ts-review-notice"><Info size={18} aria-hidden="true" /><div><h2>Antes de decidir, revisa estos datos</h2>{advertencias.map(p => <p key={p.indice}><strong>{p.nombre}:</strong> {p.clasificacion !== 'computable' ? `${clp(p.monto)} · ${p.motivo}` : p.advertencias.map(a => a.mensaje).join(' ')} <button onClick={() => verSeries(p.indice)}>Ver evidencia</button></p>)}</div></section>}
          
  </>;
}

function TablaPosiciones({ posiciones, verSeries }: Readonly<{ posiciones: Analisis['posiciones']; verSeries: (indice: number) => void }>) {
  return <><p className="ts-scroll-hint">Desplaza la tabla horizontalmente para consultar todas las columnas.</p>
    {/* La región desplazable necesita foco para funcionar con teclado. */}
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Desplazamiento horizontal por teclado. */}
    <section className="ts-table-scroll" tabIndex={0 /* NOSONAR: S6845. Desplazamiento por teclado. */} aria-label="Posiciones y cambios elegibles"><table className="ts-position-table"><caption className="sr-only">Montos en CLP, TAC anual porcentual y ahorro elegible por año</caption><thead><tr><th scope="col">Producto / Serie actual</th><th scope="col" className="ts-num">Monto CLP</th><th scope="col" className="ts-num">TAC actual</th><th scope="col">Menor costo elegible</th><th scope="col" className="ts-num">Ahorro anual</th><th scope="col"><span className="sr-only">Evidencia</span></th></tr></thead><tbody>{posiciones.map(p => <FilaPosicion key={p.indice} posicion={p} verSeries={verSeries} />)}</tbody></table></section></>;
}

function sinCambio(p: ResultadoPosicion): string {
  if (p.clasificacion === 'unidentified') return 'Revisar identificación';
  if (p.clasificacion === 'excluded') return 'Excluido de TAC';
  if (p.tipo === 'cash' || p.tipo === 'time_deposit') return 'Sin serie · Costo cero';
  return 'Sin cambio elegible';
}

function FilaPosicion({ posicion: p, verSeries }: Readonly<{ posicion: ResultadoPosicion; verSeries: (indice: number) => void }>) {
  let Icono = Layers3;
  if (p.clasificacion === 'unidentified') Icono = Info;
  else if (p.tipo === 'time_deposit' || p.tipo === 'cash') Icono = Database;
  return <tr><th scope="row"><div className="ts-product-cell"><span className={`ts-product-icon ${p.clasificacion === 'unidentified' ? 'ts-product-icon--unknown' : ''}`} aria-hidden="true"><Icono size={17} /></span><div><strong>{p.nombre}</strong><span>{p.emisor ?? 'Sin identificar'}{p.entrada.serie ? ` · ${p.entrada.serie}` : ''}</span></div></div></th>
    <td className="ts-num">{clp(p.monto)}<small>{p.peso === null ? 'Fuera de base TAC' : `${pct(p.peso)} de base TAC`}</small></td>
    <td className="ts-num">{p.tac === null ? 'No disponible' : pct(p.tac)}<small>{p.costo === null ? 'Costo no atribuido' : `${clp(p.costo)} / año`}</small></td>
    <td>{p.elegida !== p.entrada.serie ? <span className="ts-series-transition">{p.entrada.serie}<ArrowRight size={13} aria-hidden="true" /><strong>{p.elegida}</strong><span>TAC {pct(p.tacPosterior)}</span></span> : <span className="ts-no-change">{sinCambio(p)}</span>}</td>
    <td className={`ts-num ${p.ahorro !== '0' ? 'ts-savings-cell' : 'ts-muted'}`}>{clp(p.ahorro)}{p.bps !== '0' && <small>{numero(p.bps)} puntos base menos</small>}</td>
    <td><button className="ts-row-action" aria-label={`Ver evidencia de posición ${p.indice + 1}: ${p.nombre}`} onClick={() => verSeries(p.indice)}><ChevronRight size={17} aria-hidden="true" /></button></td>
  </tr>;
}
