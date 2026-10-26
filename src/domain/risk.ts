import { decimal, porcentaje, sumar } from './numeric';
import type { Asignacion, Supuestos } from './proposalModel';

export function resumenAsignaciones(asignaciones: Asignacion[], supuestos: Supuestos, valorUf: string, basePesosClp?: string) {
  const capital = sumar(asignaciones.map(a => a.montoClp)).toString();
  const base = basePesosClp ?? capital;
  const costo = sumar(asignaciones.map(a => decimal(a.montoClp).mul(a.tacPct).div(100).toString())).toString();
  const bruto = capital === '0' ? null : decimal(sumar(asignaciones.map(a => decimal(a.montoClp).mul(supuestos.categorias[a.categoria].retorno_real_bruto_pct).toString())).toString()).div(capital).toString();
  const volatilidad = capital === '0' ? null : decimal(sumar(asignaciones.map(a => decimal(a.montoClp).mul(supuestos.categorias[a.categoria].volatilidad_pct).toString())).toString()).div(capital).toString();
  const crecimiento = base === '0' ? null : decimal(sumar(asignaciones.map(a => decimal(a.montoClp).mul(supuestos.categorias[a.categoria].peso_crecimiento).toString())).toString()).div(base).mul(100).toString();
  const fondos: Record<string, string> = {}; const agf: Record<string, string> = {};
  for (const a of asignaciones) { if (a.categoria === 'caja' || a.categoria === 'deposito_plazo') continue; fondos[a.producto] = decimal(fondos[a.producto] ?? 0).plus(a.montoClp).toString(); agf[a.emisor] = decimal(agf[a.emisor] ?? 0).plus(a.montoClp).toString(); }
  for (const [key, value] of Object.entries(fondos)) fondos[key] = porcentaje(value, base) ?? '0';
  for (const [key, value] of Object.entries(agf)) agf[key] = porcentaje(value, base) ?? '0';
  const tac = porcentaje(costo, capital);
  return { basePesosClp: base, capitalClp: capital, capitalUf: decimal(capital).div(valorUf).toString(), costoAnualClp: costo, tacPct: tac, retornoBrutoPct: bruto, retornoNetoPct: bruto === null || tac === null ? null : decimal(bruto).minus(tac).toString(), volatilidadPct: volatilidad, crecimientoPct: crecimiento, concentracionFondos: fondos, concentracionAgf: agf };
}
export const crecimientoMaximoEfectivo = (maximoPct: number, mesesPrimerPago: number) => decimal(maximoPct).mul(Math.min(1, mesesPrimerPago / 24)).toString();
