import { proponerCostos } from '../application/proponerCostos';
import { proponerMeta } from '../application/proponerMeta';
import type { EntradaPropuestaMeta } from '../domain/proposalModel';
import type { RespuestaPropuesta, SolicitudPropuesta } from './proposalWorker';

self.onmessage = (event: MessageEvent<SolicitudPropuesta>) => {
  const { revision, modalidad, entrada } = event.data;
  let respuesta: RespuestaPropuesta;
  try { respuesta = { revision, resultado: modalidad === 'costo' ? proponerCostos(entrada) : proponerMeta(entrada as EntradaPropuestaMeta) }; }
  catch (error) { respuesta = { revision, error: error instanceof Error ? error.message : 'Error de cálculo no identificado.' }; }
  self.postMessage(respuesta);
};
