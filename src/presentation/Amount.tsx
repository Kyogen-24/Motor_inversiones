import { clp, uf } from './format';

/** Un importe en UF y su equivalencia de referencia, con jerarquía explícita. */
export default function Amount({ valorUf, valorClp }: Readonly<{ valorUf: string | null; valorClp: string | null }>) {
  return <span className="ts-amount"><span>{uf(valorUf)}</span><small>Equivalente en CLP: {clp(valorClp)}</small></span>;
}
