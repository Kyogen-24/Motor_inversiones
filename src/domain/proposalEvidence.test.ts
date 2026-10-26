import { describe, expect, it } from 'vitest';
import { cargarEjemplo } from '../infrastructure/input';
import { proponerCostos } from '../application/proponerCostos';
import { proponerMeta } from '../application/proponerMeta';
import { convertirAsignacion, evidenciaAccesos } from './proposalSearch';

describe('evidencia de decisiones de nivel 2', () => {
  it('evalúa otras series con el ticket del destino y conserva el lote', () => {
    const d = cargarEjemplo();
    const p = d.catalogo.productos.find(p => p.id === 'alfa-deuda-uf')!;
    const a = { ...convertirAsignacion(p, p.series.find(s => s.codigo === 'B')!, '60000000', 40000), loteOrigen: 0, fase: 'serie' as const };
    const evidencia = evidenciaAccesos(d, [a], false);
    expect(evidencia).toHaveLength(p.series.length);
    expect(evidencia.every(e => e.ticketClp === '60000000' && e.loteOrigen === 0)).toBe(true);
    expect(evidencia.find(e => e.serie === 'B')).toMatchObject({ uso: 'destino', estado: 'eligible' });
    expect(evidencia.find(e => e.serie === 'F')).toMatchObject({ uso: 'alternativa', estado: 'conditional' });
    expect(evidencia.find(e => e.serie === 'F')?.tareas.join(' ')).toContain('confirmación escrita');
  });
  it('separa lotes de costo y consolida tickets de meta entre tramos', () => {
    const d = cargarEjemplo();
    const p = d.catalogo.productos.find(p => p.id === 'beta-deuda-uf-corto')!;
    const a = convertirAsignacion(p, p.series.find(s => s.codigo === 'B')!, '6000000', 40000);
    const lotes = evidenciaAccesos(d, [{ ...a, loteOrigen: 0 }, { ...a, loteOrigen: 1 }], false).filter(e => e.uso === 'destino');
    expect(lotes.map(e => [e.loteOrigen, e.ticketClp, e.estado])).toEqual([[0, '6000000', 'conditional'], [1, '6000000', 'conditional']]);
    const meta = evidenciaAccesos(d, [{ ...a, tramoId: 'T1' }, { ...a, tramoId: 'T2' }], true).filter(e => e.uso === 'destino');
    expect(meta).toHaveLength(1);
    expect(meta[0]).toMatchObject({ ticketClp: '12000000', estado: 'eligible', tramos: ['T1', 'T2'] });
  });
  it('identifica la retención fuera de acuerdos y evita evidencia de tickets vacíos', () => {
    const r = proponerCostos(cargarEjemplo());
    expect(r.evidencias!.every(e => Number(e.ticketClp) > 0)).toBe(true);
    expect(r.evidencias!.find(e => e.producto === 'gamma-rv-chile' && e.serie === 'CLASI')).toMatchObject({ uso: 'tenencia', estado: 'out_of_scope' });
    expect(r.evidencias!.length).toBeLessThan(30);
  });
  it('conserva en ambas propuestas la exclusión y porcentaje del diagnóstico original', () => {
    const d = cargarEjemplo();
    for (const r of [proponerCostos(d), proponerMeta(d)]) {
      expect(r.fuentes).toMatchObject({ cliente: 'ACC-4471', corte: '2026-09-30', sinIdentificarClp: '5000000', excluidoClp: '0' });
      expect(r.fuentes!.exclusiones).toEqual([{ nombre: 'FM Zeta Acciones Asia, serie A', montoClp: '5000000', motivo: 'Producto o serie sin identificar; no se atribuye costo ni ahorro.' }]);
      expect(Number(r.fuentes!.porcentajeSinIdentificar)).toBeCloseTo(5000000 / 235000000 * 100, 12);
    }
  });
});
