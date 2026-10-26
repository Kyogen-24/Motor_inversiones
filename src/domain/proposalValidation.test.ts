import { describe, expect, it } from 'vitest';
import { cargarEjemplo } from '../infrastructure/input';
import { validarAsignaciones } from './proposalValidation';
import type { Asignacion } from './proposalModel';

describe('validarAsignaciones', () => {
  it('consolida todas las series de un fondo para aplicar el límite', () => {
    const datos = cargarEjemplo();
    const asignaciones: Asignacion[] = [
      { producto: 'alfa-deuda-uf', serie: 'B', emisor: 'alfa', nombre: 'Alfa', categoria: 'deuda_uf_mediano', montoClp: '50000000', montoUf: '1250', tacPct: '1.45', liquidezDias: 2 },
      { producto: 'alfa-deuda-uf', serie: 'F', emisor: 'alfa', nombre: 'Alfa', categoria: 'deuda_uf_mediano', montoClp: '50000000', montoUf: '1250', tacPct: '0.95', liquidezDias: 2 },
    ];
    const resultado = validarAsignaciones(asignaciones, datos, { exigirAccesoFinal: false });
    expect(resultado.valida).toBe(false);
    expect(resultado.restricciones.join(' ')).toContain('Concentración por fondo');
  });
});
