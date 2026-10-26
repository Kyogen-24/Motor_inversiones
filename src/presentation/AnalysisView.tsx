import { useState } from 'react';
import { ArrowUpRight, Check, ChevronRight, Database, Info, Layers3 } from 'lucide-react';
import type { Analisis, ResultadoPosicion } from '../domain/model';
import { decimal } from '../domain/numeric';
import { porcentaje } from '../domain/numeric';
import { clp, fecha, numero, pct } from './format';
import { Estado } from './PositionDetail';

type Props = Readonly<{ resultado: Analisis }>;
type Pestana = 'resumen' | 'posiciones' | 'acceso';
type PropsResumen = Props & Readonly<{ verSeries: (indice: number) => void; verPosiciones: () => void }>;

export default function AnalysisView({ resultado }: Props) {
  const [pestana, setPestana] = useState<Pestana>('resumen');
  const [busqueda, setBusqueda] = useState('');
  const total = resultado.totales;
  const contexto = resultado.contexto;
  const filtradas = resultado.posiciones.filter(p => `${p.nombre} ${p.emisor ?? ''} ${p.entrada.serie ?? ''}`.toLowerCase().includes(busqueda.toLowerCase()));
  function verSeries(_indice: number) {
    setPestana('acceso');
    requestAnimationFrame(() => document.getElementById('series-title')?.focus());
  }
  return <>
          <section className="ts-client-strip" aria-label="Contexto del análisis"><div className="ts-client-id"><span className="ts-avatar">{contexto.cartola.cliente.referencia.slice(0, 2)}</span><div><strong>{contexto.cartola.cliente.referencia}</strong><span>Cliente</span></div></div><dl><div><dt>Fecha de corte</dt><dd>{fecha(contexto.cartola.corte)}</dd></div><div><dt>Perfil declarado</dt><dd className="ts-capitalize">{contexto.cartola.cliente.perfil_riesgo}</dd></div><div><dt>Plan APV</dt><dd>{contexto.cartola.cliente.plan_apv ? 'Sí' : 'No'}</dd></div></dl><span className="ts-analysis-ready"><Check size={13} aria-hidden="true" />Análisis calculado</span></section>
          <fieldset className="ts-tabs" aria-label="Secciones del análisis">
            {([{ id: 'resumen', label: 'Vista general' }, { id: 'posiciones', label: `Posiciones (${resultado.posiciones.length})` }, { id: 'acceso', label: 'Series' }] as const).map(tab => <button key={tab.id} aria-pressed={pestana === tab.id} className={pestana === tab.id ? 'is-active' : ''} onClick={() => setPestana(tab.id)}>{tab.label}</button>)}
          </fieldset>
          {pestana === 'resumen' && <Resumen resultado={resultado} verSeries={verSeries} verPosiciones={() => setPestana('posiciones')} />}
          {pestana === 'posiciones' && <section className="ts-holdings ts-holdings--full">
            <div className="ts-section-heading"><h2>Diagnóstico de costos</h2><label className="ts-search">Buscar posición<input type="search" placeholder="Fondo, AGF o serie…" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label></div>
            <p className="ts-footnote">{filtradas.length} de {resultado.posiciones.length} posiciones. Pesos sobre {clp(total.computable)} computables.</p>
            <TablaDiagnostico posiciones={filtradas} totales={filtradas.length === resultado.posiciones.length ? total : undefined} />
            <p className="ts-footnote">Identificado: {clp(total.identificado)} en {total.identificadas} posiciones. Excluido de la base por tipo o costo no verificable: {clp(total.excluido)}. Sin identificar: {clp(total.sinIdentificar)}.</p>
            <div className="ts-section-heading ts-comparison-heading"><h2>Ahorro elegible</h2></div>
            <TablaPosiciones posiciones={filtradas} verSeries={verSeries} />
            <AhorroCondicional posiciones={filtradas.filter(p => p.condicional)} total={filtradas.length === resultado.posiciones.length ? total.condicional : undefined} verSeries={verSeries} />
            {!filtradas.length && <p className="ts-empty-search">No hay posiciones que coincidan con «{busqueda}».</p>}
          </section>}
          {pestana === 'acceso' && <section className="ts-series-overview"><h2 id="series-title" tabIndex={-1}>Estado de cada serie por posición</h2><p className="ts-muted">El ticket es el monto de cada posición. La serie actual se identifica por separado.</p><TablaSeries posiciones={resultado.posiciones} /></section>}
    <footer className="ts-analysis-footer"><details><summary>Contexto del análisis</summary><p>Catálogo {contexto.catalogo.version} · Fuente: {contexto.catalogo.fuente_costos} · Costos al {fecha(contexto.catalogo.corte_costos)}</p><p>Lectura: todo el catálogo. Propuesta: series habilitadas con acuerdo vigente, dentro del mismo fondo y AGF.</p><blockquote className="ts-universe-declaration">Esta propuesta considera productos de las administradoras con las que {contexto.acuerdos.distribuidor} mantiene acuerdos de distribución vigentes. Puede haber en el mercado alternativas de menor costo fuera de ese universo.</blockquote><p>Una persona revisa y decide.</p><p>AGF con acuerdo vigente: {resultado.acuerdosVigentes.length ? resultado.acuerdosVigentes.join(', ') : 'ninguna'}.</p><p>Perfil declarado el {fecha(contexto.cartola.cliente.perfil_evaluado_el)}.</p></details></footer>
  </>;
}

function Resumen({ resultado, verSeries, verPosiciones }: PropsResumen) {
  const total = resultado.totales;
  const condicionales = resultado.posiciones.filter(p => p.condicional);
  const emisoresConAcuerdo = new Set(resultado.acuerdosVigentes);
  const sinAcuerdo = resultado.posiciones.filter(p => p.alternativas.length > 0 && p.ahorro === '0' && p.emisor && !emisoresConAcuerdo.has(p.emisor));
  const advertencias = resultado.posiciones.filter(p => p.clasificacion !== 'computable' || p.advertencias.length);
  const hayCondicional = total.condicional !== '0';
  const costoCondicional = decimal(total.costoPosterior).minus(total.condicional).toString();
  const ahorroConCondiciones = decimal(total.ahorro).add(total.condicional).toString();
  const porcentajeCostoCondicional = porcentaje(costoCondicional, total.costo);
  const tacCondicional = total.computable === '0' ? null : decimal(costoCondicional).div(total.computable).mul(100).toString();
  return <>

            <div className="ts-stat-row"><div><span>Patrimonio en cartola</span><strong>{clp(total.monto)}<small>CLP</small></strong><p>{resultado.posiciones.length} posiciones en total</p></div><div><span>Base computable para TAC</span><strong>{clp(total.computable)}<small>CLP</small></strong><p>{total.computables} posiciones con costo verificable</p></div><div><span>Sin identificar</span><strong>{clp(total.sinIdentificar)}<small>CLP</small></strong><p>{pct(total.porcentajeSinIdentificar)} del patrimonio total</p></div></div>
            <div className="ts-overview-grid ts-overview-grid--single">
              <section className="ts-cost-panel" aria-labelledby="costos-title"><div className="ts-section-heading"><h2 id="costos-title">El costo de tu portafolio</h2><span className="ts-badge">Anual · CLP</span></div><p className="ts-muted">Mismos fondos y montos. Solo cambian las series.</p>
                <div className="ts-cost-line"><div><span>Costo actual</span><strong>{clp(total.costo)}</strong></div><div className="ts-cost-track"><div className="ts-cost-fill" style={{ width: total.costo === '0' ? '0%' : '100%' }} /></div><p>TAC ponderada <strong>{pct(total.tac, 4)}</strong></p></div>
                <div className="ts-cost-line ts-cost-line--after"><div><span>Costo elegible</span><strong>{clp(total.costoPosterior)}</strong></div><div className="ts-cost-track"><div className="ts-cost-fill" style={{ width: `${total.porcentajeCostoPosterior ?? 0}%` }} /></div><p>Ahorro elegible <strong>{clp(total.ahorro)}</strong> · TAC ponderada <strong>{pct(total.tacPosterior, 4)}</strong></p></div>
                {hayCondicional && <div className="ts-cost-line ts-cost-line--conditional"><div><span>Costo con condiciones cumplidas</span><strong>{clp(costoCondicional)}</strong></div><div className="ts-cost-track"><div className="ts-cost-fill" style={{ width: `${porcentajeCostoCondicional ?? 0}%` }} /></div><p>Ahorro total posible <strong>{clp(ahorroConCondiciones)}</strong> · TAC ponderada <strong>{pct(tacCondicional, 4)}</strong></p><p>Incluye <strong>{clp(total.condicional)}</strong> de ahorro condicional adicional.</p></div>}
                <div className="ts-cost-caption"><Info size={14} aria-hidden="true" /><p>{hayCondicional ? 'El ahorro adicional requiere cumplir las condiciones y reevaluar el acceso. ' : ''}Las TAC usan {clp(total.computable)} computables.</p></div>
              </section>
            </div>
            <section className="ts-holdings" aria-labelledby="posiciones-title"><div className="ts-section-heading"><h2 id="posiciones-title">Ahorro elegible</h2><button className="ts-text-button" onClick={verPosiciones}>Ver diagnóstico<ArrowUpRight size={15} aria-hidden="true" /></button></div><TablaPosiciones posiciones={resultado.posiciones} verSeries={verSeries} /></section>
            <AhorroCondicional posiciones={condicionales} total={total.condicional} verSeries={verSeries} />
            <section className="ts-result-summary" aria-label="Resumen del ahorro">
              <p>En total, el ahorro elegible es de <strong>{clp(total.ahorro)} al año</strong>{total.tac !== null && total.tacPosterior !== null && <>, y la TAC ponderada {decimal(total.ahorro).gt(0) ? 'baja' : 'se mantiene'} de <strong>{pct(total.tac, 4)}</strong> a <strong>{pct(total.tacPosterior, 4)}</strong></>}.</p>
              {hayCondicional && <p>El ahorro condicional adicional es de <strong>{clp(total.condicional)}</strong>{condicionales.length > 1 && <> ({condicionales.map(p => clp(p.condicional!.adicional)).join(' + ')})</>}, sujeto a las condiciones de la tabla. Si se cumplen y se reevalúa el acceso, el ahorro total podría subir a <strong>{clp(ahorroConCondiciones)} al año</strong>.</p>}
              {sinAcuerdo.map(p => <p key={p.indice}>La posición en <strong>{p.nombre}</strong> no tiene ahorro por serie: su AGF no tiene acuerdo vigente. Cambiar de AGF requiere una propuesta de cartera.</p>)}
            </section>
            {advertencias.length > 0 && <section className="ts-review-notice"><Info size={18} aria-hidden="true" /><div><h2>Antes de decidir, revisa estos datos</h2>{advertencias.map(p => <p key={p.indice}><strong>{p.nombre}:</strong> {p.clasificacion !== 'computable' ? `${clp(p.monto)} · ${p.motivo}` : p.advertencias.map(a => a.mensaje).join(' ')} <button onClick={() => verSeries(p.indice)}>Ver evidencia</button></p>)}</div></section>}
          
  </>;
}

export function TablaDiagnostico({ posiciones, totales }: Readonly<{ posiciones: Analisis['posiciones']; totales?: Analisis['totales'] }>) {
  return <><p className="ts-scroll-hint">Desplaza la tabla para consultar peso, TAC y costo anual.</p>
    <section className="ts-table-scroll" tabIndex={0} aria-label="Diagnóstico de costos por posición">
      <table className="ts-position-table ts-diagnosis-table"><caption className="sr-only">Diagnóstico R02: monto, peso sobre la base computable, TAC y costo anual por posición</caption>
        <thead><tr><th scope="col">Posición / Serie actual</th><th scope="col" className="ts-num">Monto CLP</th><th scope="col" className="ts-num">Peso computable</th><th scope="col" className="ts-num">TAC actual</th><th scope="col" className="ts-num">Costo anual CLP</th><th scope="col">Clasificación y advertencias</th></tr></thead>
        <tbody>{posiciones.map(p => <tr key={p.indice}>
          <th scope="row"><ProductoPosicion posicion={p} /></th><td className="ts-num">{clp(p.monto)}</td><td className="ts-num">{pct(p.peso)}</td><td className="ts-num">{pct(p.tac)}</td><td className="ts-num">{clp(p.costo)}</td>
          <td className="ts-diagnosis-reason"><strong>{p.clasificacion === 'computable' ? 'Computable' : p.clasificacion === 'unidentified' ? 'Sin identificar' : 'Excluida de TAC'}</strong><p>{p.motivo}</p>{p.advertencias.map(a => <p key={a.codigo}>{a.mensaje}</p>)}</td>
        </tr>)}</tbody>
        {totales && <tfoot><tr><th scope="row">Total computable</th><td className="ts-num">{clp(totales.computable)}</td><td className="ts-num">{totales.computable === '0' ? 'No disponible' : '100,00 %'}</td><td className="ts-num">{pct(totales.tac, 4)}</td><td className="ts-num">{clp(totales.costo)}</td><td>{totales.computables} posiciones computables</td></tr></tfoot>}
      </table>
    </section></>;
}

export function TablaSeries({ posiciones }: Readonly<{ posiciones: Analisis['posiciones'] }>) {
  const conSeries = posiciones.filter(posicion => posicion.alternativas.length > 0);
  return <section className="ts-table-scroll" tabIndex={0 /* NOSONAR: S6845. Desplazamiento horizontal por teclado. */} aria-label="Estado de cada serie por posición">
    <table className="ts-position-table ts-series-overview-table"><caption className="sr-only">Nivel 1: estado de cada serie por posición</caption>
      <thead><tr><th scope="col">Posición</th><th scope="col">Serie</th><th scope="col" className="ts-num">TAC %</th><th scope="col">Estado</th><th scope="col" className="ts-num">Regla</th><th scope="col">Motivo</th></tr></thead>
      <tbody>{conSeries.flatMap(posicion => posicion.alternativas.map((alternativa, indice) => <tr key={`${posicion.indice}-${alternativa.serie.codigo}`}>
        {indice === 0 && <th scope="rowgroup" rowSpan={posicion.alternativas.length}><ProductoPosicion posicion={posicion} /></th>}
        <th scope="row"><strong>{alternativa.serie.codigo}</strong></th>
        <td className="ts-num">{pct(String(alternativa.serie.tac_pct))}</td>
        <td>{alternativa.actual ? <span className="ts-current-status">Actual</span> : <Estado estado={alternativa.estado} />}</td>
        <td className="ts-num">{alternativa.actual ? '—' : alternativa.regla}</td>
        <td className="ts-series-motive">{alternativa.actual ? 'Serie que tiene hoy el cliente.' : alternativa.motivo}</td>
      </tr>))}</tbody>
    </table>
  </section>;
}

function TablaPosiciones({ posiciones, verSeries }: Readonly<{ posiciones: Analisis['posiciones']; verSeries: (indice: number) => void }>) {
  const conSerie = posiciones.filter(p => p.entrada.serie);
  const computable = conSerie.filter(p => p.clasificacion === 'computable');
  const montoTotal = conSerie.reduce((acumulado, p) => acumulado.add(p.monto), decimal(0));
  const montoComputable = computable.reduce((acumulado, p) => acumulado.add(p.monto), decimal(0));
  const costoActual = computable.reduce((acumulado, p) => acumulado.add(p.costo ?? '0'), decimal(0));
  const costoPosterior = computable.reduce((acumulado, p) => acumulado.add(p.costoPosterior ?? '0'), decimal(0));
  const ahorro = computable.reduce((acumulado, p) => acumulado.add(p.ahorro), decimal(0));
  const tacActual = montoComputable.equals(0) ? null : costoActual.div(montoComputable).mul(100).toString();
  const tacPosterior = montoComputable.equals(0) ? null : costoPosterior.div(montoComputable).mul(100).toString();
  return <><p className="ts-scroll-hint">Desplaza la tabla horizontalmente para consultar todas las columnas.</p>
    {/* La región desplazable necesita foco para funcionar con teclado. */}
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Desplazamiento horizontal por teclado. */}
    <section className="ts-table-scroll" tabIndex={0 /* NOSONAR: S6845. Desplazamiento por teclado. */} aria-label="Posiciones y cambios elegibles"><table className="ts-position-table ts-comparison-table"><caption className="sr-only">R05: serie actual, serie elegible y ahorro anual disponible</caption><thead><tr><th scope="col">Posición</th><th scope="col" className="ts-num">Monto CLP</th><th scope="col">Serie actual</th><th scope="col">Serie elegible</th><th scope="col" className="ts-num">Ahorro puntos base</th><th scope="col" className="ts-num">Ahorro anual CLP</th><th scope="col"><span className="sr-only">Evidencia</span></th></tr></thead><tbody>{conSerie.map(p => <FilaPosicion key={p.indice} posicion={p} verSeries={verSeries} />)}</tbody>
      {conSerie.length > 0 && <tfoot><tr><th scope="row">Total con serie</th><td className="ts-num">{clp(montoTotal.toString())}</td><td>TAC {pct(tacActual, 4)}</td><td>TAC {pct(tacPosterior, 4)}</td><td className="ts-num">—</td><td className="ts-num">{clp(ahorro.toString())}</td><td /></tr></tfoot>}
    </table></section>
    {conSerie.length > 0 && <p className="ts-footnote">TAC de estas posiciones · Base computable: {clp(montoComputable.toString())}.</p>}
  </>;
}

function sinCambio(p: ResultadoPosicion): string {
  if (p.clasificacion === 'unidentified') return 'Revisar identificación';
  if (p.clasificacion === 'excluded') return 'Excluido de TAC';
  if (p.tipo === 'cash' || p.tipo === 'time_deposit') return 'Sin serie · Costo cero';
  const actual = p.alternativas.find(a => a.actual);
  if (actual?.regla === 0) return actual.motivo;
  return 'Sin alternativa elegible de menor costo';
}

function ProductoPosicion({ posicion: p }: Readonly<{ posicion: ResultadoPosicion }>) {
  let Icono = Layers3;
  if (p.clasificacion === 'unidentified') Icono = Info;
  else if (p.tipo === 'time_deposit' || p.tipo === 'cash') Icono = Database;
  return <div className="ts-product-cell"><span className={`ts-product-icon ${p.clasificacion === 'unidentified' ? 'ts-product-icon--unknown' : ''}`} aria-hidden="true"><Icono size={17} /></span><div><strong>{p.indice + 1}. {p.nombre}</strong><span>{p.emisor ?? 'Sin identificar'}{p.entrada.serie ? ` · ${p.entrada.serie}` : ''}</span>{p.entrada.producto && <span>{p.entrada.producto}</span>}</div></div>;
}

function FilaPosicion({ posicion: p, verSeries }: Readonly<{ posicion: ResultadoPosicion; verSeries: (indice: number) => void }>) {
  return <tr><th scope="row"><ProductoPosicion posicion={p} /></th>
    <td className="ts-num">{clp(p.monto)}</td>
    <td>{p.entrada.serie ?? 'Sin serie'}<small>TAC {pct(p.tac)}</small></td>
    <td>{p.elegida !== p.entrada.serie ? <><strong>{p.elegida}</strong><small>TAC {pct(p.tacPosterior)}</small>{p.empates.length > 1 && <small>Empate: {p.empates.join(', ')}. Elección por código.</small>}</> : <><span className="ts-no-change">Se conserva</span><small>{sinCambio(p)}</small></>}</td>
    <td className="ts-num">{numero(p.bps)}</td>
    <td className={`ts-num ${p.ahorro !== '0' ? 'ts-savings-cell' : 'ts-muted'}`}>{clp(p.ahorro)}</td>
    <td><button className="ts-row-action" aria-label={`Ver evidencia de posición ${p.indice + 1}: ${p.nombre}`} onClick={() => verSeries(p.indice)}><ChevronRight size={17} aria-hidden="true" /></button></td>
  </tr>;
}

function AhorroCondicional({ posiciones, total, verSeries }: Readonly<{ posiciones: ResultadoPosicion[]; total?: string; verSeries: (indice: number) => void }>) {
  const montoTotal = posiciones.reduce((acumulado, p) => acumulado.add(p.monto), decimal(0));
  const costoBase = posiciones.reduce((acumulado, p) => acumulado.add(p.costoPosterior ?? '0'), decimal(0));
  const costoCondicional = posiciones.reduce((acumulado, p) => acumulado.add(decimal(p.monto).mul(p.condicional!.tac).div(100)), decimal(0));
  const tacBase = montoTotal.equals(0) ? '0' : costoBase.div(montoTotal).mul(100).toString();
  const tacCondicional = montoTotal.equals(0) ? '0' : costoCondicional.div(montoTotal).mul(100).toString();
  return <section className="ts-conditional-section" aria-labelledby="condicional-title"><div className="ts-section-heading"><h2 id="condicional-title">Ahorro condicional adicional</h2>{total !== undefined && <strong className="ts-conditional-total">{clp(total)}</strong>}</div>
    {posiciones.length ? <><p className="ts-scroll-hint">Desplaza la tabla horizontalmente para consultar todas las condiciones.</p><section className="ts-table-scroll" tabIndex={0 /* NOSONAR: S6845. Desplazamiento horizontal por teclado. */} aria-label="Ahorros condicionales"><table className="ts-position-table ts-comparison-table ts-conditional-table"><caption className="sr-only">R05: oportunidades condicionales, requisitos y ahorro condicional adicional</caption><thead><tr><th scope="col">Posición</th><th scope="col" className="ts-num">Monto CLP</th><th scope="col">Serie elegible</th><th scope="col">Serie condicional</th><th scope="col">Condición</th><th scope="col" className="ts-num">Ahorro adicional CLP</th><th scope="col"><span className="sr-only">Evidencia</span></th></tr></thead><tbody>{posiciones.map(p => <tr key={p.indice}><th scope="row"><ProductoPosicion posicion={p} /></th><td className="ts-num">{clp(p.monto)}</td><td>{p.elegida ?? 'Sin serie'}<small>TAC {pct(p.tacPosterior)}</small></td><td><strong>{p.condicional!.serie}</strong><small>TAC {pct(p.condicional!.tac)}</small></td><td className="ts-conditional-reason">{condicionR04(p)}</td><td className="ts-num ts-savings-cell">{clp(p.condicional!.adicional)}</td><td><button className="ts-row-action" aria-label={`Ver condición y evidencia de posición ${p.indice + 1}: ${p.nombre}`} onClick={() => verSeries(p.indice)}><ChevronRight size={17} aria-hidden="true" /></button></td></tr>)}</tbody>{total !== undefined && <tfoot><tr><th scope="row">Total adicional</th><td className="ts-num">{clp(montoTotal.toString())}</td><td>TAC {pct(tacBase, 4)}</td><td>TAC {pct(tacCondicional, 4)}</td><td>—</td><td className="ts-num">{clp(total)}</td><td /></tr></tfoot>}</table></section></> : <p className="ts-muted">No hay alternativas condicionales con ahorro adicional para estas entradas.</p>}
    {posiciones.length > 0 && total !== undefined && <p className="ts-footnote">TAC de estas posiciones · Base computable: {clp(montoTotal.toString())}.</p>}
  </section>;
}

function condicionR04(posicion: ResultadoPosicion): string {
  const acceso = posicion.alternativas.find(alternativa => alternativa.serie.codigo === posicion.condicional?.serie);
  if (acceso?.regla === 3) return 'La serie requiere mandato y no hay mandato con esa AGF. Requiere obtenerlo y reevaluar el acceso.';
  if (acceso?.regla === 4) return 'El mínimo supera el ticket, pero el patrimonio agregado al corte lo alcanza. Requiere confirmación escrita de la AGF.';
  return acceso?.motivo ?? 'Condición de acceso por confirmar.';
}
