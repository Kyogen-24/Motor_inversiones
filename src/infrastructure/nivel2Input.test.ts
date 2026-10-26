import { describe, expect, it } from 'vitest';
import { cargarEjemplo, interpretar } from './input';

describe('validación semántica de nivel 2', () => {
  it('rechaza un hueco entre tramos aunque el JSON tenga tipos válidos', () => {
    const datos = cargarEjemplo();
    const supuestos = structuredClone(datos.supuestos);
    supuestos.tramos[1].desde_meses = 25;
    expect(() => interpretar('supuestos', supuestos)).toThrow('tramos[1].desde_meses');
  });

  it('rechaza escenarios que no sean los tres ajustes declarados', () => {
    const datos = cargarEjemplo();
    const supuestos = structuredClone(datos.supuestos);
    supuestos.escenarios[0].ajuste_retorno_pp = -1;
    expect(() => interpretar('supuestos', supuestos)).toThrow('supuestos.escenarios');
  });
});
