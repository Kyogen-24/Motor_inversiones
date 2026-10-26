import { ArrowUpRight } from 'lucide-react';
import type { EstadoAcceso, ResultadoPosicion } from '../domain/model';
import { clp, fecha, numero, pct } from './format';

const estados = {
  eligible: 'eligible', conditional: 'conditional', blocked: 'blocked', out_of_scope: 'out_of_scope',
};
export function Estado({ estado }: Readonly<{ estado: EstadoAcceso }>) {
  return <span className={`ts-status ts-status--${estado}`}><span className="ts-status-dot" aria-hidden="true" />{estados[estado]}</span>;
}
export default function PositionDetail({ posicion }: Readonly<{ posicion: ResultadoPosicion }>) {
  return <section className="ts-detail" aria-label={`Evidencia de ${posicion.nombre}`}>
    <div className="ts-detail-heading">
      <div><h3>{posicion.nombre}</h3><dl className="ts-review-meta"><div><dt>Administradora</dt><dd>{posicion.emisor ?? 'Identificación pendiente'}</dd></div><div><dt>Monto de esta posición</dt><dd>{clp(posicion.monto)}</dd></div></dl></div>
      <span className="ts-badge">{posicion.entrada.serie ? `Serie actual ${posicion.entrada.serie}` : 'Sin serie'}</span>
    </div>
    <p className="ts-muted">{posicion.motivo}</p>
    {posicion.alternativas.length > 0 ? <>
      <p className="ts-scroll-hint">Desplaza la tabla horizontalmente para consultar las series y sus condiciones.</p>
      {/* La región desplazable necesita foco para funcionar con teclado (WCAG 2.1.1). */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Región con desplazamiento horizontal por teclado. */}
      <section className="ts-table-scroll" tabIndex={0 /* NOSONAR: S6845. Foco requerido para desplazar la región con teclado. */} aria-label="Series y estados de acceso">
        <table className="ts-series-table">
          <caption className="sr-only">Todas las series del mismo fondo, evaluadas por primera coincidencia de R04</caption>
          <thead><tr><th scope="col">Serie</th><th scope="col" className="ts-num">TAC anual</th><th scope="col" className="ts-num">Mínimo CLP</th><th scope="col">Estado</th><th scope="col">Por qué</th></tr></thead>
          <tbody>{posicion.alternativas.map(a => <tr key={a.serie.codigo}>
            <th scope="row"><span className="ts-series-code">{a.serie.codigo}</span>{a.actual && <span className="ts-current">Actual</span>}{posicion.elegida === a.serie.codigo && !a.actual && <span className="ts-choice">Menor costo elegible</span>}</th>
            <td className="ts-num">{pct(String(a.serie.tac_pct))}</td><td className="ts-num">{clp(a.evidencia.minimo)}</td>
            <td><Estado estado={a.estado} /></td>
            <td className="ts-evidence"><p>{a.motivo}</p></td>
          </tr>)}</tbody>
        </table>
      </section>
      <p className="ts-footnote">«Actual» indica tenencia, no permiso de contratación. La primera regla aplicable determina el estado.</p>
      <details className="ts-access-evidence"><summary>Ver evidencia completa de acceso</summary>{posicion.alternativas.map(a => <details key={a.serie.codigo}><summary>Serie {a.serie.codigo} (regla R04.{a.regla})</summary><dl className="ts-evidence-data"><div><dt>Monto de la posición</dt><dd>{clp(a.evidencia.ticket)}</dd></div><div><dt>Mínimo</dt><dd>{clp(a.evidencia.minimo)}</dd></div><div><dt>Patrimonio agregado</dt><dd>{clp(a.evidencia.agregado)}</dd></div><div><dt>Fecha del patrimonio</dt><dd>{a.evidencia.patrimonioAl ? fecha(a.evidencia.patrimonioAl) : 'No informada'}</dd></div><div><dt>Fecha de corte</dt><dd>{fecha(a.evidencia.corte)}</dd></div><div><dt>Acuerdo vigente</dt><dd>{a.evidencia.acuerdoVigente ? 'Sí' : 'No'}</dd></div><div><dt>Serie habilitada</dt><dd>{a.evidencia.habilitada ? 'Sí' : 'No'}</dd></div><div><dt>Inicio del acuerdo</dt><dd>{a.evidencia.inicio ? fecha(a.evidencia.inicio) : 'No informado'}</dd></div><div><dt>Fin del acuerdo</dt><dd>{a.evidencia.fin ? fecha(a.evidencia.fin) : 'Sin fecha informada'}</dd></div><div><dt>Mandato</dt><dd>{a.evidencia.mandato ? 'Sí' : 'No'}</dd></div><div><dt>Plan APV</dt><dd>{a.evidencia.planApv ? 'Sí' : 'No'}</dd></div><div><dt>Apertura de serie</dt><dd>{a.serie.abierta ? 'Abierta' : 'Cerrada'}</dd></div><div><dt>Exclusiva APV</dt><dd>{a.serie.solo_apv ? 'Sí' : 'No'}</dd></div><div><dt>Requiere mandato</dt><dd>{a.serie.requiere_mandato ? 'Sí' : 'No'}</dd></div></dl></details>)}</details>
      <div className="ts-detail-result"><ArrowUpRight size={17} aria-hidden="true" /><div>
        <strong>{posicion.elegida !== posicion.entrada.serie ? `Cambio elegible: ${posicion.entrada.serie} a ${posicion.elegida}` : 'Se conserva la posición actual'}</strong>
        {posicion.elegida !== posicion.entrada.serie ? <dl className="ts-review-meta"><div><dt>Ahorro anual</dt><dd>{clp(posicion.ahorro)}</dd></div><div><dt>Reducción de TAC</dt><dd>{numero(posicion.bps)} puntos base</dd></div><div><dt>TAC posterior</dt><dd>{pct(posicion.tacPosterior)}</dd></div></dl> : <p>No existe una alternativa elegible de menor costo para el monto de esta posición.</p>}
        {posicion.empates.length > 1 && <p>Empate de costo: {posicion.empates.join(', ')}. Elección estable por código de serie.</p>}
      </div></div>
    </> : <p className="ts-footnote">Esta posición no genera comparación entre series.</p>}

    {posicion.condicional && <section className="ts-notice" aria-label="Ahorro condicional y tareas previas"><h3>Oportunidad condicional: serie {posicion.condicional.serie}</h3><dl className="ts-review-meta"><div><dt>TAC condicional</dt><dd>{pct(posicion.condicional.tac)}</dd></div><div><dt>Ahorro anual adicional</dt><dd>{clp(posicion.condicional.adicional)}</dd></div></dl><p>Respecto de la serie {posicion.elegida ?? 'actual'}, con TAC {pct(posicion.tacPosterior)}. No se incluye en el escenario elegible.</p><ul>{posicion.condicional.tareas.map(tarea => <li key={tarea}>{tarea}</li>)}</ul></section>}
    {posicion.advertencias.map(a => <div className="ts-notice" key={a.codigo}><strong>{a.codigo === 'VALORIZACION' ? 'Revisar valorización' : 'Valorización no comprobada'}</strong><p>{a.mensaje}</p>{a.declarado !== undefined && <dl className="ts-review-meta"><div><dt>Monto declarado</dt><dd>{clp(a.declarado)}</dd></div><div><dt>Monto calculado</dt><dd>{clp(a.calculado!)}</dd></div><div><dt>Diferencia</dt><dd>{clp(a.diferencia!)}</dd></div></dl>}</div>)}
  </section>;
}
