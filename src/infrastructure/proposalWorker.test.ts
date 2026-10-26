import { afterEach, describe, expect, it, vi } from 'vitest';
import { cargarEjemplo } from './input';
import { cancelarPropuestas, ejecutarPropuesta } from './proposalWorker';

class WorkerControlado {
  static instancias: WorkerControlado[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminado = false;
  constructor() { WorkerControlado.instancias.push(this); }
  postMessage() { /* El worker real es la frontera asíncrona; el test controla su respuesta. */ }
  terminate() { this.terminado = true; }
  responder(data: unknown) { this.onmessage?.({ data } as MessageEvent); }
}
afterEach(() => { vi.unstubAllGlobals(); WorkerControlado.instancias = []; });
describe('adaptador de Worker local', () => {
  it('propaga un error de generación con ruta sin dejar el worker vivo', async () => {
    vi.stubGlobal('Worker', WorkerControlado);
    const p = ejecutarPropuesta(1, 'costo', cargarEjemplo());
    WorkerControlado.instancias[0]?.responder({ revision: 1, error: 'supuestos.perfiles: falta perfil.' });
    await expect(p).rejects.toThrow('supuestos.perfiles');
    expect(WorkerControlado.instancias[0].terminado).toBe(true);
  });
  it('cancela una ejecución anterior y no entrega respuestas de otra revisión', async () => {
    vi.stubGlobal('Worker', WorkerControlado);
    const anterior = ejecutarPropuesta(1, 'costo', cargarEjemplo());
    cancelarPropuestas();
    await expect(anterior).rejects.toMatchObject({ name: 'AbortError' });
    const siguiente = ejecutarPropuesta(2, 'costo', cargarEjemplo());
    WorkerControlado.instancias.at(-1)?.responder({ revision: 1, resultado: {} });
    await expect(siguiente).rejects.toThrow('revisión');
  });
});
