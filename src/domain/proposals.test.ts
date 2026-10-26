import { describe, expect, it } from 'vitest';
import { proponerCostos } from '../application/proponerCostos';
import { proponerMeta } from '../application/proponerMeta';
import { cargarEjemplo } from '../infrastructure/input';
import { decimal } from './numeric';
import { proyectar } from './projection';
import type { Asignacion } from './proposalModel';

describe('nivel 2: propuestas deterministas', () => {
  it('reduce costo sin aumentar el riesgo ni retirar capital', () => {
    const datos = cargarEjemplo();
    const resultado = proponerCostos({ cartola: datos.cartola, catalogo: datos.catalogo, acuerdos: datos.acuerdos, supuestos: datos.supuestos });
    expect(resultado.estado).toBe('propuesta');
    expect(resultado.propuesta.costoAnualClp).toBe('2525000');
    expect(resultado.ahorroAnualClp).toBe('2655000');
    expect(decimal(resultado.propuesta.volatilidadPct!).lte(resultado.actual.volatilidadPct!)).toBe(true);
    expect(resultado.asignaciones.reduce((total, item) => total.plus(item.montoClp), decimal(0)).toString()).toBe(resultado.actual.capitalClp);
    expect(resultado.escenarios.map(e => [e.id, e.ajustePp])).toEqual([['adverso', '-1.5'], ['base', '0'], ['favorable', '1.5']]);
  });
  it('ordena pagos de la meta, separa VP y cobertura, y no inventa capital', () => {
    const datos = cargarEjemplo();
    const resultado = proponerMeta({ cartola: datos.cartola, catalogo: datos.catalogo, acuerdos: datos.acuerdos, supuestos: datos.supuestos, meta: datos.meta });
    expect(resultado.pagos).toHaveLength(8);
    expect(resultado.pagos.map(p => p.fecha)).toEqual([...resultado.pagos.map(p => p.fecha)].sort());
    expect(resultado.vpTotalUf).not.toBeNull();
    expect(resultado.escenarios).toHaveLength(3);
    expect(['alcanza', 'no_alcanza']).toContain(resultado.conclusionBase);
  });
  it('calcula saldo medio mensual y TAC una sola vez', () => {
    const datos = cargarEjemplo();
    const asignacion: Asignacion = { producto: 'x', serie: 'x', emisor: 'x', nombre: 'x', categoria: 'balanceado', montoClp: '40000000', montoUf: '1000', tacPct: '1', liquidezDias: 0 };
    const supuestos = structuredClone(datos.supuestos); supuestos.categorias.balanceado.retorno_real_bruto_pct = 3;
    const resultado = proyectar([asignacion], supuestos, '2026-01-01', '2027-01-01');
    // ACT/365,25: 365 días no son un año exacto; el saldo usa la TAC una sola vez.
    expect(resultado.map(e => decimal(e.saldoFinalUf).toFixed(3))).toEqual(['1004.997', '1019.986', '1034.976']);
    // Oráculo mensual independiente: aniversarios civiles, no un único promedio anual.
    const dias = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    for (const [i, neto] of [.005, .02, .035].entries()) {
      const costo = dias.slice(1).reduce((total, dia, j) => total + (1000 * (1 + neto) ** (dias[j] / 365.25) + 1000 * (1 + neto) ** (dia / 365.25)) / 2 * .01 * (dia - dias[j]) / 365.25, 0);
      expect(Number(resultado[i].costoAcumuladoUf)).toBeCloseTo(costo, 9);
    }
  });
});
