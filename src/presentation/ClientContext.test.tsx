import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { cargarEjemplo } from '../infrastructure/input';
import ClientContext from './ClientContext';
import type { Vista } from './Navigation';

const base = { cartola: cargarEjemplo().cartola, analizado: true, propuestaCalculada: false, modalidadCalculando: null, validado: true, cargando: false, error: false, tieneSupuestos: true, tieneMeta: true };

describe('estado del cliente por vista', () => {
  it.each<[Vista, string, boolean]>([
    ['analisis', 'Diagnóstico calculado', true],
    ['costo', 'Mejora de costos pendiente', false],
    ['meta', 'Planificación de meta pendiente', false],
    ['datos', 'Archivos listos para analizar', true],
    ['reglas', 'Reglas de cálculo', false],
  ])('muestra el estado propio de %s', (vista, texto, completo) => {
    const html = renderToStaticMarkup(<ClientContext {...base} vista={vista} />);
    expect(html).toContain(texto);
    expect(html.includes('<svg')).toBe(completo);
  });

  it('distingue espera, cálculo y resultado sin declarar terminada una propuesta pendiente', () => {
    for (const [cambios, texto, completo] of [
      [{ modalidadCalculando: 'costo' as const }, 'En espera de mejora de costos', false],
      [{ modalidadCalculando: 'meta' as const }, 'Calculando planificación de meta…', false],
      [{ propuestaCalculada: true }, 'Planificación de meta calculada', true],
      [{ tieneMeta: false }, 'Falta cargar la meta', false],
      [{ error: true }, 'Planificación de meta: cálculo pendiente de revisión', false],
    ] as const) {
      const html = renderToStaticMarkup(<ClientContext {...base} {...cambios} vista="meta" />);
      expect(html).toContain(texto);
      expect(html.includes('<svg')).toBe(completo);
    }
  });
});
