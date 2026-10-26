import { aniosEntre, aniversarioMensual, decimal, sumar } from './numeric';
import { minimo } from './proposalSearch';
import type { Asignacion, Escenario, EscenarioResultado, PeriodoProyeccion, Rescate, Supuestos } from './proposalModel';

export interface PagoProyeccion { fecha: string; uf: string; indice?: number; tramoId?: string; }
export function proyectar(asignaciones: Asignacion[], supuestos: Supuestos, inicio: string, fin: string, pagos: PagoProyeccion[] = []): EscenarioResultado[] {
  const escenarios: Escenario[] = [{ id: 'adverso', ajuste_retorno_pp: -1.5 }, { id: 'base', ajuste_retorno_pp: 0 }, { id: 'favorable', ajuste_retorno_pp: 1.5 }];
  return escenarios.map(e => trayectoria(asignaciones, supuestos, inicio, fin, pagos, e));
}
function antes(fecha: string, dias: number) { return new Date(Date.parse(`${fecha}T00:00:00Z`) - dias * 86400000).toISOString().slice(0, 10); }
function trayectoria(asignaciones: Asignacion[], s: Supuestos, inicio: string, fin: string, pagos: PagoProyeccion[], escenario: Escenario): EscenarioResultado {
  let fecha = inicio; let costo = decimal(0); let pagado = decimal(0); let pendiente = decimal(0);
  const saldos = asignaciones.map(a => decimal(a.montoUf));
  const ordenados = pagos.map((p, i) => ({ ...p, indice: p.indice ?? i })).filter(p => p.fecha <= fin).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.indice - b.indice);
  const preparados = new Map<number, ReturnType<typeof decimal>>();
  const completados = new Set<number>();
  const periodos: PeriodoProyeccion[] = []; const rescates: Rescate[] = [];
  const detalle: EscenarioResultado['pagos'] = []; const agotamientoTramos: Record<string, string> = {};
  const ultimaFecha = new Map<string | undefined, string>();
  for (const p of ordenados) ultimaFecha.set(p.tramoId, p.fecha);
  const total = () => sumar(saldos.map(x => x.toString())).plus(sumar([...preparados.values()].map(x => x.toString())));
  let agotamiento: string | null = total().isZero() ? inicio : null; let primeraFechaPendiente: string | null = null;
  const netos = asignaciones.map(a => {
    const n = decimal(s.categorias[a.categoria].retorno_real_bruto_pct).plus(escenario.ajuste_retorno_pp).minus(a.tacPct).div(100);
    if (decimal(1).plus(n).lte(0)) throw new Error(`supuestos.categorias.${a.categoria}: retorno neto fuera de dominio.`);
    return n;
  });
  type Evento = { fecha: string; tipo: 'periodo' | 'rescate' | 'pago'; pago?: typeof ordenados[number]; liquidez?: number };
  const eventos: Evento[] = [{ fecha: fin, tipo: 'periodo' }];
  for (let mes = 1; aniversarioMensual(inicio, mes) < fin; mes++) eventos.push({ fecha: aniversarioMensual(inicio, mes), tipo: 'periodo' });
  const liquideces = [...new Set(asignaciones.map(a => a.liquidezDias))].sort((a, b) => b - a);
  for (const p of ordenados) {
    for (const liquidez of liquideces) { const f = antes(p.fecha, liquidez); if (f >= inicio) eventos.push({ fecha: f, tipo: 'rescate', pago: p, liquidez }); }
    eventos.push({ fecha: p.fecha, tipo: 'pago', pago: p });
  }
  const prioridad = { periodo: 0, rescate: 1, pago: 2 };
  eventos.sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.pago?.indice ?? -1) - (b.pago?.indice ?? -1) || prioridad[a.tipo] - prioridad[b.tipo]);
  function retirar(indices: number[], requerido: ReturnType<typeof decimal>, pago: typeof ordenados[number], transferencia: boolean) {
    const disponible = sumar(indices.map(i => saldos[i].toString())); const retiro = minimo(requerido, disponible);
    if (retiro.lte(0)) return decimal(0);
    let restante = retiro;
    for (const [j, i] of indices.entries()) {
      const monto = retiro.eq(disponible) ? saldos[i] : j === indices.length - 1 ? restante : minimo(saldos[i], retiro.mul(saldos[i]).div(disponible));
      saldos[i] = retiro.eq(disponible) ? decimal(0) : saldos[i].minus(monto);
      restante = restante.minus(monto);
      if (monto.gt(0)) rescates.push({ fecha: pago.fecha, liquidacion: fecha, asignacion: i, pagoIndice: pago.indice, uf: monto.toString(), transferencia });
    }
    preparados.set(pago.indice, (preparados.get(pago.indice) ?? decimal(0)).plus(retiro)); return retiro;
  }
  for (const evento of eventos) {
    if (evento.fecha > fecha) {
      const dt = aniosEntre(fecha, evento.fecha);
      saldos.forEach((saldo, i) => {
        const a = asignaciones[i]; const previo = saldo.mul(decimal(1).plus(netos[i]).pow(dt));
        const costoPeriodo = saldo.plus(previo).div(2).mul(a.tacPct).div(100).mul(dt);
        periodos.push({ desde: fecha, hasta: evento.fecha, asignacion: i, saldoInicialUf: saldo.toString(), saldoAntesRetiroUf: previo.toString(), retornoBrutoPct: decimal(s.categorias[a.categoria].retorno_real_bruto_pct).plus(escenario.ajuste_retorno_pp).toString(), tacPct: a.tacPct, costoUf: costoPeriodo.toString() });
        costo = costo.plus(costoPeriodo); saldos[i] = previo;
      }); fecha = evento.fecha;
    }
    const p = evento.pago;
    if (!p) continue;
    if (evento.tipo === 'rescate') {
      const restante = decimal(p.uf).minus(preparados.get(p.indice) ?? 0);
      if (restante.lte(0)) continue;
      const propios = asignaciones.map((a, i) => (p.tramoId === undefined || a.tramoId === p.tramoId) && antes(p.fecha, a.liquidezDias) >= fecha ? i : -1).filter(i => i >= 0);
      const compromisosPrevios = sumar(ordenados.filter(anterior => anterior.tramoId === p.tramoId && !completados.has(anterior.indice) && (anterior.fecha < p.fecha || (anterior.fecha === p.fecha && anterior.indice < p.indice))).map(anterior => decimal(anterior.uf).minus(preparados.get(anterior.indice) ?? 0).toString()));
      const potencialBruto = sumar(propios.map(i => saldos[i].mul(decimal(1).plus(netos[i]).pow(aniosEntre(fecha, antes(p.fecha, asignaciones[i].liquidezDias)))).toString())).minus(compromisosPrevios);
      const potencial = potencialBruto.gt(0) ? potencialBruto : decimal(0);
      const liquidables = propios.filter(i => asignaciones[i].liquidezDias === evento.liquidez);
      const grupo = sumar(liquidables.map(i => saldos[i].toString()));
      if (grupo.gt(0)) retirar(liquidables, potencial.lte(restante) ? grupo : restante.mul(grupo).div(potencial), p, false);
      let falta = decimal(p.uf).minus(preparados.get(p.indice) ?? 0);
      const futuroPropio = potencial.gt(grupo) ? potencial.minus(grupo) : decimal(0);
      falta = falta.minus(futuroPropio);
      if (falta.gt(0) && p.tramoId !== undefined) {
        // Solo reservas terminadas ANTES de la liquidación, nunca capital de pagos futuros.
        const liberados = asignaciones.map((a, i) => a.tramoId !== p.tramoId && a.liquidezDias === evento.liquidez && (ultimaFecha.get(a.tramoId) ?? fin) < fecha ? i : -1).filter(i => i >= 0)
          .sort((a, b) => (ultimaFecha.get(asignaciones[a].tramoId) ?? fin).localeCompare(ultimaFecha.get(asignaciones[b].tramoId) ?? fin) || a - b);
        for (const i of liberados) { falta = falta.minus(retirar([i], falta, p, true)); if (falta.lte(0)) break; }
      }
    } else if (evento.tipo === 'pago') {
      const pago = minimo(decimal(p.uf), preparados.get(p.indice) ?? decimal(0)); preparados.delete(p.indice);
      completados.add(p.indice);
      const falta = decimal(p.uf).minus(pago); pagado = pagado.plus(pago); pendiente = pendiente.plus(falta);
      detalle.push({ indice: p.indice, fecha, pagadoUf: pago.toString(), pendienteUf: falta.toString() });
      if (falta.gt(0)) primeraFechaPendiente ??= fecha;
      if (p.tramoId && sumar(asignaciones.map((a, i) => a.tramoId === p.tramoId ? saldos[i].toString() : '0')).isZero()) agotamientoTramos[p.tramoId] ??= fecha;
      if (total().isZero()) agotamiento ??= fecha;
    }
  }
  const exigido = sumar(ordenados.map(p => p.uf));
  return { id: escenario.id, ajustePp: String(escenario.ajuste_retorno_pp), saldoFinalUf: total().toString(), costoAcumuladoUf: costo.toString(), coberturaPct: exigido.gt(0) ? pagado.div(exigido).mul(100).toString() : null, pagadoUf: pagos.length ? pagado.toString() : null, pendienteUf: pagos.length ? pendiente.toString() : null, fechaAgotamiento: agotamiento, primeraFechaPendiente, pagos: detalle, periodos, rescates, agotamientoTramos };
}
