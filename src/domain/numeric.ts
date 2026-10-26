import Decimal from 'decimal.js';

// Configuración privada: 40 dígitos significativos, suficiente para 10.000 posiciones
// con entradas de hasta 16 dígitos significativos y productos de dos cantidades.
const MotorDecimal = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP, toExpNeg: -50, toExpPos: 50 });
export const decimal = (value: Decimal.Value) => new MotorDecimal(value);
export const sumar = (values: string[]) => values.reduce((total, value) => total.plus(value), decimal(0));
export const porcentaje = (parte: string, total: string): string | null =>
  decimal(total).isZero() ? null : decimal(parte).div(total).mul(100).toString();
export const redondear = (value: string, places: number) => decimal(value).toFixed(places);
export const diasEntre = (desde: string, hasta: string) => decimal(Date.parse(`${hasta}T00:00:00Z`)).minus(Date.parse(`${desde}T00:00:00Z`)).div(86_400_000);
export const aniosEntre = (desde: string, hasta: string) => diasEntre(desde, hasta).div('365.25');
export function mesesCalendario(desde: string, hasta: string): number {
  const inicio = new Date(`${desde}T00:00:00Z`);
  const fin = new Date(`${hasta}T00:00:00Z`);
  let meses = (fin.getUTCFullYear() - inicio.getUTCFullYear()) * 12 + fin.getUTCMonth() - inicio.getUTCMonth();
  if (aniversarioMensual(desde, meses) > hasta) meses--;
  const anterior = aniversarioMensual(desde, meses);
  const siguiente = aniversarioMensual(desde, meses + 1);
  return Math.max(0, meses + Number(diasEntre(anterior, hasta).div(diasEntre(anterior, siguiente))));
}
export function aniversarioMensual(desde: string, meses: number): string {
  const d = new Date(`${desde}T00:00:00Z`); const dia = d.getUTCDate();
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + meses);
  const ultimo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(dia, ultimo)); return d.toISOString().slice(0, 10);
}
export const clpAUf = (clp: string, valorUf: string) => decimal(clp).div(valorUf).toString();
export const ufAClp = (uf: string, valorUf: string) => decimal(uf).mul(valorUf).toString();
export const esFecha = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  && value >= '1900-01-01' && value <= '2200-12-31'
  && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
export function validarNumero(value: number, path: string, max = 1e15) {
  if (!Number.isFinite(value) || value < 0 || value > max || (value !== 0 && value < 1e-8)
    || decimal(value).sd() > 16) {
    throw new Error(`${path}: usa un número entre 0 y ${max}, con hasta 16 dígitos significativos y mínimo positivo 0,00000001.`);
  }
}
