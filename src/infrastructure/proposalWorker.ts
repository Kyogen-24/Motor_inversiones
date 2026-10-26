import type { EntradaPropuestaCosto, EntradaPropuestaMeta, PropuestaCosto, PropuestaMeta } from '../domain/proposalModel';

export interface SolicitudPropuesta { revision: number; modalidad: 'costo' | 'meta'; entrada: EntradaPropuestaCosto | EntradaPropuestaMeta; }
export type RespuestaPropuesta = { revision: number; resultado: PropuestaCosto | PropuestaMeta; error?: never } | { revision: number; error: string; resultado?: never };
const pendientes = new Set<() => void>();
export function cancelarPropuestas() { for (const cancelar of pendientes) cancelar(); }

/** Un Worker local por ejecución. Terminarlo cancela también la búsqueda sin bloquear la UI. */
export function ejecutarPropuesta(revision: number, modalidad: SolicitudPropuesta['modalidad'], entrada: SolicitudPropuesta['entrada']): Promise<{ revision: number; resultado: PropuestaCosto | PropuestaMeta }> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./proposal.worker.ts', import.meta.url), { type: 'module' });
    const terminar = () => { worker.terminate(); pendientes.delete(cancelar); };
    const cancelar = () => { terminar(); reject(new DOMException('Cálculo cancelado por una nueva revisión.', 'AbortError')); };
    pendientes.add(cancelar);
    worker.onmessage = (event: MessageEvent<RespuestaPropuesta>) => {
      terminar(); const respuesta = event.data;
      if (respuesta.revision !== revision) reject(new Error('La respuesta corresponde a otra revisión de archivos.'));
      else if (respuesta.error !== undefined) reject(new Error(respuesta.error));
      else resolve({ revision, resultado: respuesta.resultado });
    };
    worker.onerror = event => { terminar(); reject(new Error(event.message || 'No se pudo completar el cálculo local.')); };
    try { worker.postMessage({ revision, modalidad, entrada } satisfies SolicitudPropuesta); }
    catch (error) { terminar(); reject(error); }
  });
}
