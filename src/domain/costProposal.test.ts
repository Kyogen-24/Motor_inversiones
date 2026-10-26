import { describe, it, expect } from 'vitest';
import { cargarEjemplo } from '../infrastructure/input';
import { proponerCostos } from '../application/proponerCostos';
import { decimal } from './numeric';

describe('R07: retención y carteras completas', () => {
  it.each(['cash', 'time_deposit'])('repara el perfil con %s sin exigir serie ni acuerdo', tipo => {
    const d = cargarEjemplo();
    d.cartola.posiciones = [{ producto: 'alfa-rv-global', serie: 'CLASI', monto_clp: 100000000, cuotas: null, valor_cuota: null }];
    d.supuestos.perfiles.moderado.max_crecimiento_pct = 0;
    d.supuestos.limites = { max_por_fondo_pct: 40, max_por_agf_pct: 60 };
    for (const p of d.catalogo.productos) for (const s of p.series) s.abierta = false;
    d.catalogo.productos = d.catalogo.productos.filter(p => (p.tipo !== 'cash' && p.tipo !== 'time_deposit') || p.tipo === tipo);
    for (const id of Object.keys(d.acuerdos.productos_sin_serie)) if (!d.catalogo.productos.some(p => p.id === id)) delete d.acuerdos.productos_sin_serie[id];
    const r = proponerCostos(d);
    expect(r.admisible).toBe(true);
    expect(r.propuesta.capitalClp).toBe('100000000');
    expect(r.propuesta.costoAnualClp).toBe('0');
    expect(r.propuesta.crecimientoPct).toBe('0');
    expect(decimal(r.propuesta.volatilidadPct!).lte(r.actual.volatilidadPct!)).toBe(true);
    expect(r.asignaciones.every(a => a.serie === null && a.fase === 'perfil')).toBe(true);
    expect(r.evidencias?.some(e => e.uso === 'destino' && e.estado === 'eligible')).toBe(true);
  });
  it('un retorno bruto distinto cambia escenarios pero no selecciona destinos', () => {
    const d = cargarEjemplo(); const antes = proponerCostos(d);
    d.supuestos.categorias.rv_global.retorno_real_bruto_pct = -5;
    const despues = proponerCostos(d);
    const decisiones = (r: typeof antes) => r.asignaciones.map(a => [a.producto, a.serie, a.montoClp]);
    expect(decisiones(despues)).toEqual(decisiones(antes));
    expect(despues.escenarios[1].saldoFinalUf).not.toBe(antes.escenarios[1].saldoFinalUf);
    expect(despues.propuesta.volatilidadPct).toBe(antes.propuesta.volatilidadPct);
  });
  it('repara un perfil incompatible solo cuando hace falta, sin aumentar volatilidad', () => {
    const d = cargarEjemplo();
    d.cartola.posiciones = [{ producto: 'alfa-rv-global', serie: 'CLASI', monto_clp: 100000000, cuotas: null, valor_cuota: null }];
    d.supuestos.perfiles.moderado.max_crecimiento_pct = 5;
    d.supuestos.limites = { max_por_fondo_pct: 100, max_por_agf_pct: 100 };
    const r = proponerCostos(d);
    expect(r.admisible).toBe(true);
    expect(decimal(r.propuesta.crecimientoPct!).lte(5)).toBe(true);
    expect(decimal(r.propuesta.volatilidadPct!).lte(r.actual.volatilidadPct!)).toBe(true);
    expect(r.asignaciones.some(a => a.fase === 'perfil')).toBe(true);
  });
  it('detiene realmente la búsqueda grande sin declarar un óptimo global', () => {
    const d = cargarEjemplo(); d.cartola.posiciones = [...d.cartola.posiciones, ...d.cartola.posiciones];
    const r = proponerCostos(d);
    expect(r.busqueda.estado).toBe('limite_alcanzado');
    expect(r.busqueda.nodos).toBe(50000);
    expect(r.busqueda.optimalidad).toBe('no_demostrada');
  });
  it('retiene una serie actual barata fuera de acuerdo sin fabricar una mejora negativa', () => {
    const d = cargarEjemplo();
    d.cartola.posiciones = [{ producto: 'alfa-deuda-uf', serie: 'CLASI', monto_clp: 10000000, cuotas: null, valor_cuota: null }];
    d.catalogo.productos.find(p => p.id === 'alfa-deuda-uf')!.series[0].tac_pct = 0.1;
    delete d.acuerdos.acuerdos.find(a => a.emisor === 'alfa')!.series['alfa-deuda-uf'].CLASI;
    d.supuestos.limites = { max_por_fondo_pct: 100, max_por_agf_pct: 100 };
    const r = proponerCostos(d);
    expect(r.ahorroAnualClp).toBe('0');
    expect(r.asignaciones[0].producto).toBe('alfa-deuda-uf');
    expect(r.cambios.join(' ')).not.toContain('más barato');
  });
  it('reparte un lote concentrado entre fondos y valida la cartera final', () => {
    const d = cargarEjemplo();
    d.cartola.posiciones = [{ producto: 'alfa-deuda-uf', serie: 'CLASI', monto_clp: 80000000, cuotas: null, valor_cuota: null }];
    d.supuestos.limites = { max_por_fondo_pct: 60, max_por_agf_pct: 100 };
    const r = proponerCostos(d);
    expect(r.admisible).toBe(true);
    expect(r.asignaciones.length).toBeGreaterThan(1);
    expect(Object.values(r.propuesta.concentracionFondos).every(v => decimal(v).lte(60))).toBe(true);
    expect(r.propuesta.capitalClp).toBe('80000000');
    expect(decimal(r.propuesta.volatilidadPct!).lte(r.actual.volatilidadPct!)).toBe(true);
  });
  it('no suma lotes originales para acreditar un mínimo y no usa comisiones', () => {
    const d = cargarEjemplo();
    d.cartola.posiciones = [0, 1].map(() => ({ producto: 'alfa-deuda-uf', serie: 'CLASI', monto_clp: 6000000, cuotas: null, valor_cuota: null }));
    d.supuestos.limites = { max_por_fondo_pct: 100, max_por_agf_pct: 100 };
    const r = proponerCostos(d);
    for (const a of r.asignaciones.filter(a => a.fase !== 'retencion')) {
      const serie = d.catalogo.productos.find(p => p.id === a.producto)!.series.find(s => s.codigo === a.serie)!;
      expect(decimal(a.montoClp).gte(serie.minimo_clp)).toBe(true);
    }
    d.catalogo.productos.reverse();
    for (const a of d.acuerdos.acuerdos) for (const series of Object.values(a.series)) for (const codigo of Object.keys(series)) series[codigo] = 99;
    expect(proponerCostos(d).asignaciones).toEqual(r.asignaciones);
  });
});
