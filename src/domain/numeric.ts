import Decimal from 'decimal.js';

// Configuración privada: 40 dígitos significativos, suficiente para 10.000 posiciones
// con entradas de hasta 16 dígitos significativos y productos de dos cantidades.
const MotorDecimal = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP, toExpNeg: -50, toExpPos: 50 });
export const decimal = (value: Decimal.Value) => new MotorDecimal(value);
export const sumar = (values: string[]) => values.reduce((total, value) => total.plus(value), decimal(0));
export const porcentaje = (parte: string, total: string): string | null =>
  decimal(total).isZero() ? null : decimal(parte).div(total).mul(100).toString();
export const redondear = (value: string, places: number) => decimal(value).toFixed(places);
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
