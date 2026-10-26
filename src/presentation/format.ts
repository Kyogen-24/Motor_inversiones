import { redondear } from '../domain/numeric';
import type { Categoria } from '../domain/proposalModel';

export const categorias: Record<Categoria, string> = {
  caja: 'Efectivo', deposito_plazo: 'Depósito a plazo', deuda_corto_clp: 'Deuda de corto plazo en pesos', deuda_uf_corto: 'Deuda de corto plazo en UF', deuda_uf_mediano: 'Deuda de mediano plazo en UF', deuda_uf_largo: 'Deuda de largo plazo en UF', balanceado: 'Balanceado', rv_chile: 'Acciones de Chile', rv_global: 'Acciones globales',
};
export const escenarios = { adverso: 'Adverso', base: 'Base', favorable: 'Favorable' };

export function numero(value: string | null, places = 0): string {
  if (value === null) return 'No disponible';
  const [integer, fraction] = redondear(value, places).split('.');
  const sign = integer.startsWith('-') ? '-' : '';
  const digits = sign ? integer.slice(1) : integer;
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= 3) {
    groups.push(digits.slice(Math.max(0, end - 3), end));
  }
  groups.reverse();
  const grouped = sign + groups.join('.');
  return fraction === undefined ? grouped : `${grouped},${fraction}`;
}
export const clp = (value: string | null) => value === null ? 'No disponible' : `$${numero(value)}`;
export const uf = (value: string | null) => value === null ? 'No disponible' : `${numero(value, 4)} UF`;
export const pct = (value: string | null, places = 2) => value === null ? 'No disponible' : `${numero(value, places)} %`;
const formatoFecha = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const fecha = (value: string) => formatoFecha.format(new Date(`${value}T00:00:00Z`));
