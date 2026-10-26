import { describe, expect, it } from 'vitest';
import { proponerMeta } from '../application/proponerMeta';
import { cargarEjemplo } from '../infrastructure/input';
import { proyectar } from './projection';
import type { Asignacion } from './proposalModel';

describe('convergencia R03/R06/R07', () => {
  it('no usa la reserva de un tramo para pagar otro tramo', () => {
    const datos = cargarEjemplo();
    const asignaciones: Asignacion[] = [
      { producto: 'uno', serie: 'B', emisor: 'a', nombre: 'Uno', categoria: 'caja', montoClp: '4000000', montoUf: '100', tacPct: '0', liquidezDias: 0, tramoId: 'corto' },
      { producto: 'dos', serie: 'B', emisor: 'b', nombre: 'Dos', categoria: 'caja', montoClp: '40000000', montoUf: '1000', tacPct: '0', liquidezDias: 0, tramoId: 'largo' },
    ];
    const base = proyectar(asignaciones, datos.supuestos, '2026-09-30', '2027-09-30', [{ indice: 0, fecha: '2027-09-30', uf: '200', tramoId: 'corto' }])[1];
    expect(Number(base.pagos[0].pagadoUf)).toBeGreaterThan(100);
    expect(Number(base.pagos[0].pagadoUf)).toBeLessThan(101);
    expect(Number(base.pagos[0].pendienteUf)).toBeGreaterThan(99);
    expect(Number(base.saldoFinalUf)).toBeGreaterThan(1000);
    expect(base.primeraFechaPendiente).toBe('2027-09-30');
  });

  it('calza la meta sin inventar tickets de 700 UF y conserva límites declarados', () => {
    const datos = cargarEjemplo();
    const resultado = proponerMeta({ cartola: datos.cartola, catalogo: datos.catalogo, acuerdos: datos.acuerdos, supuestos: datos.supuestos, meta: datos.meta });
    expect(resultado.pagos).toHaveLength(8);
    expect(resultado.reservas.some(reserva => reserva.asignaciones.length > 0)).toBe(true);
    expect(resultado.restricciones.join(' ')).not.toContain('700 UF');
    expect(resultado.resumen?.concentracionFondos).toBeDefined();
    expect(resultado.escenarios.map(escenario => escenario.ajustePp)).toEqual(['-1.5', '0', '1.5']);
    expect(resultado.escenarios.every(escenario => escenario.pagos.length === 8)).toBe(true);
  });

  it('la conclusión base exige cubrir todos los pagos, no solo que el VP sea suficiente', () => {
    const datos = cargarEjemplo();
    datos.meta.capital_asignado_clp = 1;
    const resultado = proponerMeta({ cartola: datos.cartola, catalogo: datos.catalogo, acuerdos: datos.acuerdos, supuestos: datos.supuestos, meta: datos.meta });
    expect(resultado.conclusionBase).toBe('no_alcanza');
    expect(Number(resultado.escenarios[1].coberturaPct)).toBeLessThan(100);
  });
});
