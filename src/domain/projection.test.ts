import { describe, it, expect } from 'vitest';
import { cargarEjemplo } from '../infrastructure/input';
import { proyectar } from './projection';
import type { Asignacion } from './proposalModel';
import { decimal, mesesCalendario } from './numeric';
const activo = (uf: string, tramoId = 'corto', liquidezDias = 0): Asignacion => ({ producto: 'x', serie: null, emisor: 'x', nombre: 'X', categoria: 'caja', montoClp: decimal(uf).mul(40000).toString(), montoUf: uf, tacPct: '0', liquidezDias, tramoId });

describe('R03: trayectorias y rescates', () => {
  it('calcula 50 % de cobertura por UF, incluyendo un pago parcial', () => {
    const d = cargarEjemplo(); d.supuestos.categorias.caja.retorno_real_bruto_pct = 0;
    const r = proyectar([activo('330')], d.supuestos, '2026-01-01', '2026-03-01', [{ fecha: '2026-02-01', uf: '220', tramoId: 'corto' }, { fecha: '2026-03-01', uf: '440', tramoId: 'corto' }])[1];
    expect(r.pagos.map(p => p.pagadoUf)).toEqual(['220', '110']);
    expect(r.coberturaPct).toBe('50'); expect(r.pendienteUf).toBe('330');
  });
  it.each(['2026-02-01', '2026-02-06'])('coordina liquidez futura entre pagos simultáneos o próximos: %s', segundaFecha => {
    const d = cargarEjemplo(); d.supuestos.categorias.caja.retorno_real_bruto_pct = 0;
    const r = proyectar([activo('100', 'corto', 10), activo('100')], d.supuestos, '2026-01-01', segundaFecha, [
      { indice: 0, fecha: '2026-02-01', uf: '150', tramoId: 'corto' }, { indice: 1, fecha: segundaFecha, uf: '50', tramoId: 'corto' },
    ])[1];
    expect(r.pagos.map(p => p.pagadoUf)).toEqual(['150', '50']);
    expect(r.pendienteUf).toBe('0'); expect(r.saldoFinalUf).toBe('0');
  });
  it('mide meses por aniversarios ajustados al fin de mes y fracción', () => {
    expect(mesesCalendario('2026-01-31', '2026-02-28')).toBe(1);
    expect(mesesCalendario('2026-01-31', '2026-03-15')).toBeCloseTo(1 + 15 / 31, 12);
  });
  it('registra aniversarios mensuales y costo con saldo previo al retiro sin segundo débito', () => {
    const d = cargarEjemplo(); d.supuestos.categorias.caja.retorno_real_bruto_pct = 13;
    const r = proyectar([{ ...activo('100'), tacPct: '1' }], d.supuestos, '2026-01-01', '2026-03-01')[1];
    // Dos intervalos ACT/365,25; 12 % neto efectivo, costo por saldos medios.
    expect(r.periodos).toHaveLength(2);
    expect(Number(r.saldoFinalUf)).toBeCloseTo(100 * 1.12 ** (59 / 365.25), 10);
    const s1 = 100 * 1.12 ** (31 / 365.25); const s2 = 100 * 1.12 ** (59 / 365.25);
    expect(Number(r.costoAcumuladoUf)).toBeCloseTo((100 + s1) / 2 * .01 * 31 / 365.25 + (s1 + s2) / 2 * .01 * 28 / 365.25, 10);
  });
  it('vacía exactamente saldos en un retiro total proporcional', () => {
    const d = cargarEjemplo(); d.supuestos.categorias.caja.retorno_real_bruto_pct = 0;
    const r = proyectar([activo('1'), activo('2'), activo('4')], d.supuestos, '2026-01-01', '2026-02-01', [{ fecha: '2026-02-01', uf: '8', tramoId: 'corto' }])[1];
    expect(r.saldoFinalUf).toBe('0'); expect(r.fechaAgotamiento).toBe('2026-02-01'); expect(r.pendienteUf).toBe('1');
  });
  it('libera excedentes de tramos terminados y conserva reservas futuras', () => {
    const d = cargarEjemplo(); d.supuestos.categorias.caja.retorno_real_bruto_pct = 0;
    const r = proyectar([activo('200'), activo('10', 'medio'), activo('1000', 'largo')], d.supuestos, '2026-01-01', '2026-04-01', [
      { fecha: '2026-02-01', uf: '100', tramoId: 'corto' }, { fecha: '2026-03-01', uf: '100', tramoId: 'medio' }, { fecha: '2026-04-01', uf: '1000', tramoId: 'largo' },
    ])[1];
    expect(r.pagos[1].pagadoUf).toBe('100'); expect(r.saldoFinalUf).toBe('10');
    expect(r.rescates?.some(x => x.transferencia)).toBe(true);
  });
  it('no transfiere excedentes sin plazo de liquidez y deja de capitalizar al rescatar', () => {
    const d = cargarEjemplo(); d.supuestos.categorias.caja.retorno_real_bruto_pct = 12;
    const r = proyectar([activo('200', 'corto', 10), activo('1', 'medio')], d.supuestos, '2026-01-01', '2026-02-06', [
      { fecha: '2026-02-01', uf: '100', tramoId: 'corto' }, { fecha: '2026-02-06', uf: '100', tramoId: 'medio' },
    ])[1];
    expect(Number(r.pagos[1].pagadoUf)).toBeLessThan(2);
    expect(r.rescates?.find(x => x.pagoIndice === 0)?.liquidacion).toBe('2026-01-22');
  });
});
