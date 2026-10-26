import { describe, expect, it } from 'vitest';
import { cargarEjemplo, interpretar } from '../infrastructure/input';
import { proponerCostos } from '../application/proponerCostos';
import { proponerMeta } from '../application/proponerMeta';
import { resumenAsignaciones } from './risk';
import { validarAsignaciones } from './proposalValidation';
import type { Asignacion } from './proposalModel';

describe('correcciones de entradas y bases', () => {
  it('rechaza liquidez fraccionaria antes de programar liquidaciones civiles', () => {
    const d = cargarEjemplo(); d.catalogo.productos[0].liquidez_dias = 0.5;
    expect(() => proponerCostos(d)).toThrow('liquidez_dias');
  });
  it('rechaza identificadores de tramo duplicados en importación y caso de uso', () => {
    const d = cargarEjemplo(); d.supuestos.tramos[1].id = 'T1';
    expect(() => interpretar('supuestos', d.supuestos)).toThrow('tramos');
    expect(() => proponerCostos(d)).toThrow('tramos');
  });
  it.each([['rv_global', 0], ['balanceado', 1], ['caja', 0.5]] as const)('rechaza peso de crecimiento incompatible de %s', (cat, peso) => {
    const d = cargarEjemplo(); d.supuestos.categorias[cat].peso_crecimiento = peso;
    expect(() => interpretar('supuestos', d.supuestos)).toThrow('peso_crecimiento');
    expect(() => proponerCostos(d)).toThrow('peso_crecimiento');
  });
  it.each(['2026-09-30', '2026-09-29'])('rechaza pago que no es futuro %s', fecha => {
    const d = cargarEjemplo(); d.meta.desembolsos[0].fecha = fecha;
    expect(() => proponerMeta(d)).toThrow('desembolsos');
  });
  it('rechaza un retorno fuera de dominio antes de construir', () => {
    const d = cargarEjemplo(); d.supuestos.categorias.caja.retorno_real_bruto_pct = -99;
    expect(() => proponerCostos(d)).toThrow('retorno');
  });
  it('usa el presupuesto para concentración incluso con capital parcialmente invertido', () => {
    const d = cargarEjemplo();
    const a: Asignacion = { producto: 'beta-deuda-uf-corto', serie: 'B', emisor: 'beta', nombre: 'Beta', categoria: 'deuda_uf_corto', montoClp: '28000000', montoUf: '700', tacPct: '0.8', liquidezDias: 1 };
    const resumen = resumenAsignaciones([a], d.supuestos, '40000', '70000000');
    expect(resumen.concentracionFondos[a.producto]).toBe('40');
    expect(validarAsignaciones([a], d, { baseConcentracionClp: '70000000' }).valida).toBe(true);
    expect(validarAsignaciones([{ ...a, montoClp: '28000001' }], d, { baseConcentracionClp: '70000000' }).valida).toBe(false);
  });
});
