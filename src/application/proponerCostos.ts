import { construirPropuestaCosto } from '../domain/costProposal';
import type { EntradaPropuestaCosto } from '../domain/proposalModel';
import { validarEntradaPropuesta } from '../domain/proposalValidation';
export function proponerCostos(entrada: EntradaPropuestaCosto) { validarEntradaPropuesta(entrada); return construirPropuestaCosto(entrada); }
