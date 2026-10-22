import { redondear } from '../domain/numeric';

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
export const pct = (value: string | null, places = 2) => value === null ? 'No disponible' : `${numero(value, places)} %`;
export const fecha = (value: string) => new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
