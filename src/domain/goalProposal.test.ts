import { describe, expect, it } from 'vitest';
import { cargarEjemplo } from '../infrastructure/input';
import { proponerMeta } from '../application/proponerMeta';
import { decimal, sumar } from './numeric';

describe('R06: selección conjunta', () => {
  it('no publica un VP de selección ficticio cuando no tiene instrumentos', () => {
    const d = cargarEjemplo(); d.supuestos.tramos = [{ id: 'unico', desde_meses: 0, hasta_meses: null, categorias: ['deuda_uf_corto'] }];
    for (const p of d.catalogo.productos) if (p.categoria === 'deuda_uf_corto') for (const s of p.series) s.abierta = false;
    const r = proponerMeta(d);
    expect(r.estado).toBe('sin_candidato'); expect(r.vpTotalUf).toBeNull();
    expect(r.reservas.flatMap(r => r.categorias)).toHaveLength(0);
    expect(r.conclusionBase).toBe('no_alcanza');
  });
  it('conserva la parte invertible sin inventar soporte para una reserva vacía', () => {
    const d = cargarEjemplo(); d.meta.desembolsos = [{ fecha: '2027-03-01', uf: 100 }, { fecha: '2029-03-01', uf: 100 }];
    for (const p of d.catalogo.productos) if (p.categoria === 'deuda_uf_corto') for (const s of p.series) s.abierta = false;
    const r = proponerMeta(d); const vacia = r.reservas.find(r => r.tramoId === 'T2')!;
    expect(r.admisible).toBe(true); expect(vacia.categorias).toEqual([]); expect(vacia.retornoBrutoPct).toBeNull();
    expect(r.vpTotalUf).toBeNull(); expect(r.pagos[1].vpUf).toBeNull();
    expect(r.pagos[1].pendienteBaseUf).toBe('100');
  });
  it('prueba mínimos y complementos, sin declarar no asignable una combinación viable', () => {
    const d = cargarEjemplo(); d.meta.capital_asignado_clp = 12000000;
    d.meta.desembolsos = [{ fecha: '2028-09-30', uf: 300 }];
    d.supuestos.tramos = [{ id: 'unico', desde_meses: 0, hasta_meses: null, categorias: ['deuda_uf_mediano'] }];
    d.supuestos.limites = { max_por_fondo_pct: 75, max_por_agf_pct: 100 };
    for (const p of d.catalogo.productos) if (p.categoria === 'deuda_uf_mediano') for (const s of p.series) {
      s.abierta = s.codigo === 'B'; s.minimo_clp = p.emisor === 'alfa' ? 4000000 : 8000000; s.tac_pct = p.emisor === 'alfa' ? .1 : .2;
    }
    const r = proponerMeta(d); const a = r.reservas.flatMap(r => r.asignaciones);
    expect(r.capitalNoAsignableUf).toBe('0');
    expect(a.map(a => [a.emisor, a.montoClp])).toEqual([['alfa', '4000000'], ['delta', '8000000']]);
  });
  it('reconcilia VP reservado por pago con las inversiones finales después de cupos', () => {
    const d = cargarEjemplo();
    d.supuestos.tramos = [{ id: 'unico', desde_meses: 0, hasta_meses: null, categorias: ['deuda_uf_corto'] }];
    d.meta.desembolsos = [{ fecha: '2028-09-30', uf: 1750 }];
    const r = proponerMeta(d);
    expect(r.reservas[0].capitalUf).toBe('700');
    expect(r.pagos[0].reservadoVpUf).toBe('700');
    expect(Number(r.pagos[0].noFinanciadoInicialUf)).toBeGreaterThan(988);
  });
  it('considera efectivo sin serie ni acuerdo para una meta próxima', () => {
    const d = cargarEjemplo(); d.meta.capital_asignado_clp = 4000000;
    d.meta.desembolsos = [{ fecha: '2027-03-01', uf: 100 }];
    const r = proponerMeta(d);
    expect(r.reservas[0].asignaciones[0].producto).toBe('efectivo-clp');
    expect(r.reservas[0].asignaciones[0].serie).toBeNull();
    expect(r.admisible).toBe(true);
  });
  it('consolida tickets de distintos tramos antes de acreditar mínimos', () => {
    const d = cargarEjemplo();
    d.supuestos.limites = { max_por_fondo_pct: 100, max_por_agf_pct: 100 };
    d.supuestos.tramos = [{ id: 'uno', desde_meses: 0, hasta_meses: 60, categorias: ['deuda_uf_corto'] }, { id: 'dos', desde_meses: 60, hasta_meses: null, categorias: ['deuda_uf_corto'] }];
    d.meta.capital_asignado_clp = 12000000;
    d.meta.desembolsos = [{ fecha: '2029-09-30', uf: 150 }, { fecha: '2032-09-30', uf: 150 }];
    const r = proponerMeta(d);
    const a = r.reservas.flatMap(t => t.asignaciones);
    expect(a).toHaveLength(2);
    expect(a.every(x => x.serie === 'B')).toBe(true);
    expect(sumar(a.map(x => x.montoClp)).toString()).toBe('12000000');
    expect(a.every(x => decimal(x.montoClp).lt(10000000))).toBe(true);
  });
  it('calcula VP con promedio de categorías efectivas una vez cada una', () => {
    const d = cargarEjemplo();
    const r = proponerMeta(d);
    const t = r.reservas.find(t => t.tramoId === 'T4')!;
    expect(t.categorias).toEqual(['balanceado', 'rv_global']);
    expect(t.retornoBrutoPct).toBe('4.4');
    expect(t.asignaciones.every(a => t.categorias.includes(a.categoria))).toBe(true);
  });
  it('reserva pagos cronológicamente cuando el capital no alcanza', () => {
    const d = cargarEjemplo(); d.meta.capital_asignado_clp = 4000000;
    d.meta.desembolsos = [{ fecha: '2027-02-01', uf: 200 }, { fecha: '2027-03-01', uf: 100 }];
    const r = proponerMeta(d);
    expect(r.pagos[0].reservadoVpUf).toBe('100');
    expect(r.pagos[1].reservadoVpUf).toBe('0');
    expect(Number(r.pagos[0].noFinanciadoInicialUf)).toBeGreaterThan(99);
    expect(r.conclusionBase).toBe('no_alcanza');
  });
});
