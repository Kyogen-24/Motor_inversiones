import { useId } from 'react';
import type { PagoMeta } from '../domain/proposalModel';
import { fecha, uf } from './format';

/** Solo calcula geometría: los pagos y faltantes vienen resueltos por el motor. */
export default function GoalTimeline({ pagos, escenario = 'base' }: Readonly<{ pagos: PagoMeta[]; escenario?: string }>) {
  const id = useId();
  if (!pagos.length) return null;
  const ordenados = [...pagos].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.indice - b.indice);
  const fechas = ordenados.map(p => Date.parse(`${p.fecha}T00:00:00Z`));
  const inicio = fechas[0];
  const rango = fechas[fechas.length - 1] - inicio;
  const ancho = Math.max(800, ordenados.length * 160);
  const niveles: number[][] = [[], []];
  const puntos = ordenados.map((pago, i) => {
    const x = rango ? 88 + (fechas[i] - inicio) / rango * (ancho - 176) : ancho / 2;
    const lado = i % 2;
    let nivel = niveles[lado].findIndex(ultimo => x - ultimo >= 156);
    if (nivel < 0) nivel = niveles[lado].length;
    niveles[lado][nivel] = x;
    return { pago, x, lado, nivel };
  });
  const eje = 32 + niveles[0].length * 88;
  const alto = eje + niveles[1].length * 88 + 40;
  return <section className="ts-proposal-card ts-goal-timeline" aria-labelledby={`${id}-heading`}>
    <h3 id={`${id}-heading`}>Calendario de pagos ({escenario}, supuesto)</h3>
    <div className="ts-table-scroll" role="region" tabIndex={0} aria-label="Calendario de pagos: línea de tiempo desplazable">
      <svg viewBox={`0 0 ${ancho} ${alto}`} style={{ minWidth: ancho }} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>Pagos y faltantes por fecha</title>
        <desc id={`${id}-desc`}>Cada punto representa un pago. La distancia horizontal es proporcional al tiempo; cada etiqueta indica su importe y el faltante del escenario {escenario}.</desc>
        <line x1="88" y1={eje} x2={ancho - 88} y2={eje} className="ts-timeline-axis" />
        {puntos.map(({ pago, x, lado, nivel }) => {
          const y = lado === 0 ? eje - 76 - nivel * 88 : eje + 30 + nivel * 88;
          const faltante = pago.pendienteBaseUf !== '0';
          return <g key={pago.indice}>
            <line x1={x} x2={x} y1={eje} y2={lado === 0 ? y + 54 : y - 16} className="ts-timeline-axis" />
            <circle cx={x} cy={eje} r={faltante ? 6 : 4} className={faltante ? 'ts-timeline-dot--pending' : 'ts-timeline-dot'} />
            <text x={x} y={y} textAnchor="middle" className="ts-timeline-date">{fecha(pago.fecha)}</text>
            <text x={x} y={y + 21} textAnchor="middle">{uf(pago.uf)}</text>
            <text x={x} y={y + 42} textAnchor="middle" className={faltante ? 'ts-timeline-pending' : 'ts-timeline-covered'}>{faltante ? `Falta ${uf(pago.pendienteBaseUf)}` : 'Pago cubierto'}</text>
          </g>;
        })}
      </svg>
    </div>
  </section>;
}
