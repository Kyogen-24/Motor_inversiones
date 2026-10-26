import { construirPropuestaMeta } from '../domain/goalProposal';
import type { EntradaPropuestaMeta } from '../domain/proposalModel';
import { validarEntradaPropuesta } from '../domain/proposalValidation';
export function proponerMeta(entrada: EntradaPropuestaMeta) { validarEntradaPropuesta(entrada); return construirPropuestaMeta(entrada); }
