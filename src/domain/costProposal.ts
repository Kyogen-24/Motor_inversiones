import { evaluarAcceso } from './eligibility';
import { decimal, sumar } from './numeric';
import { validarAsignaciones } from './proposalValidation';
import { resumenAsignaciones } from './risk';
import { proyectar } from './projection';
import { asignacionesActuales, completarAsignaciones, convertirAsignacion, crearPresupuestoBusqueda, cupo, esFondo, evidenciaAccesos, fuentesPropuesta, minimo } from './proposalSearch';
import type { Asignacion, EntradaPropuestaCosto, PropuestaCosto } from './proposalModel';

/** Búsqueda finita por lotes. Solo una cartera completa verificada se vuelve candidata. */
export function construirPropuestaCosto(e: EntradaPropuestaCosto): PropuestaCosto {
  const { cartola, catalogo, supuestos } = e;
  const productos = new Map(catalogo.productos.map(p => [p.id, p]));
  const { asignaciones: actuales } = asignacionesActuales(e);
  const actual = resumenAsignaciones(actuales, supuestos, String(supuestos.uf.valor_clp));
  const base = actual.capitalClp;
  const max = String(supuestos.perfiles[cartola.cliente.perfil_riesgo].max_crecimiento_pct);
  const opciones = { exigirAccesoFinal: true, consolidarTickets: false, capitalEsperadoClp: base, baseConcentracionClp: base, maxCrecimientoPct: max };
  const presupuesto = crearPresupuestoBusqueda();
  const inicial = validarAsignaciones(actuales, e, opciones);
  let mejor: Asignacion[] | null = inicial.valida ? actuales : null;
  let costoMejor = inicial.valida ? decimal(actual.costoAnualClp) : null;
  let cambiosMejor = 0;

  function buscar(reparacion: boolean) {
    function lote(indice: number, cartera: Asignacion[]) {
      if (!presupuesto.intentarNodo()) return;
      if (indice === actuales.length) {
        const r = resumenAsignaciones(cartera, supuestos, String(supuestos.uf.valor_clp));
        if (!validarAsignaciones(cartera, e, opciones).valida || decimal(r.volatilidadPct ?? 0).gt(actual.volatilidadPct ?? 0) || decimal(r.costoAnualClp).gt(actual.costoAnualClp)) return;
        const cambios = cartera.filter(a => a.fase !== 'retencion').length;
        if (costoMejor === null || decimal(r.costoAnualClp).lt(costoMejor) || (decimal(r.costoAnualClp).eq(costoMejor) && cambios < cambiosMejor)) { mejor = cartera; costoMejor = decimal(r.costoAnualClp); cambiosMejor = cambios; }
        return;
      }
      const origen = actuales[indice];
      const original = productos.get(origen.producto)!;
      if (!esFondo(original)) { lote(indice + 1, [...cartera, origen]); return; }
      const destinos = catalogo.productos.filter(p => (esFondo(p) || (reparacion && (p.tipo === 'cash' || p.tipo === 'time_deposit'))) && (reparacion || p.categoria === origen.categoria)).flatMap(p => {
        const series = p.tipo === 'cash' || p.tipo === 'time_deposit' ? [null] : p.series.filter(s => evaluarAcceso(s, p, origen.montoClp, null, cartola, e.acuerdos.acuerdos.find(a => a.emisor === p.emisor)).estado === 'eligible');
        return series.map(s => ({ ...convertirAsignacion(p, s, '0', supuestos.uf.valor_clp), fase: (p.categoria !== origen.categoria ? 'perfil' : p.id === origen.producto ? 'serie' : 'equivalente') as Asignacion['fase'], loteOrigen: origen.loteOrigen, minimo: s?.minimo_clp ?? 0 }));
      });
      const candidatos = [{ ...origen, minimo: 0 }, ...destinos.filter(a => a.producto !== origen.producto || a.serie !== origen.serie)]
        .sort((a, b) => decimal(a.tacPct).cmp(b.tacPct) || Number(a.fase !== 'retencion') - Number(b.fase !== 'retencion') || Number(a.fase === 'equivalente') - Number(b.fase === 'equivalente') || a.producto.localeCompare(b.producto) || (a.serie ?? '').localeCompare(b.serie ?? ''));
      function repartir(j: number, restante: ReturnType<typeof decimal>, partes: Asignacion[]) {
        if (!presupuesto.intentarNodo()) return;
        if (restante.isZero()) { lote(indice + 1, [...cartera, ...partes]); return; }
        if (j === candidatos.length) return;
        const candidato = candidatos[j]; const p = productos.get(candidato.producto)!;
        const capacidad = minimo(restante, cupo(p, [...cartera, ...partes], base, e, max));
        const importes = [capacidad, decimal(candidato.minimo), ...candidatos.slice(j + 1).map(c => restante.minus(c.minimo))];
        for (const monto of [...new Map(importes.map(m => [m.toString(), m])).values()]) {
          if (monto.lte(0) || monto.gt(capacidad) || monto.lt(candidato.minimo)) continue;
          const { minimo: _minimo, ...a } = candidato;
          const parte = { ...a, montoClp: monto.toString(), montoUf: monto.div(supuestos.uf.valor_clp).toString() };
          const costoParcial = sumar([...cartera, ...partes, parte].map(a => decimal(a.montoClp).mul(a.tacPct).div(100).toString()));
          if (costoMejor !== null && costoParcial.gt(costoMejor)) continue;
          repartir(j + 1, restante.minus(monto), [...partes, parte]);
          if (presupuesto.agotado) return;
        }
        repartir(j + 1, restante, partes);
      }
      repartir(0, decimal(origen.montoClp), []);
    }
    lote(0, []);
  }
  buscar(false);
  if (mejor === null && !presupuesto.agotado) buscar(true);
  const asignaciones: Asignacion[] = mejor ?? actuales;
  const validacion = validarAsignaciones(asignaciones, e, opciones);
  const admisible = mejor !== null && validacion.valida;
  const propuesta = resumenAsignaciones(asignaciones, supuestos, String(supuestos.uf.valor_clp));
  const ahorro = decimal(actual.costoAnualClp).minus(propuesta.costoAnualClp);
  completarAsignaciones(actuales, e, base); completarAsignaciones(asignaciones, e, base);
  const cambios = asignaciones.filter(a => a.fase !== 'retencion').map(a => `Lote ${(a.loteOrigen ?? 0) + 1}: ${actuales.find(o => o.loteOrigen === a.loteOrigen)?.nombre} → ${a.nombre} ${a.serie ?? ''}, $${a.montoClp}; ${a.fase === 'perfil' ? 'reparación necesaria de perfil/concentración' : a.fase === 'serie' ? 'serie del mismo fondo' : 'equivalente de la misma categoría'}.`);
  return { modalidad: 'costo', versionReglas: 'nivel-2.0', fuentes: fuentesPropuesta(e), estado: !admisible ? 'sin_candidato' : ahorro.gt(0) ? 'propuesta' : 'sin_mejora', admisible, motivosNoAdmisible: admisible ? [] : validacion.restricciones,
    contexto: { supuestosFuente: supuestos.fuente ?? 'no informado', fechaUf: supuestos.uf.fecha }, metodoRiesgo: 'volatilidad_ponderada_simple', actual, propuesta, actuales, asignaciones, cambios, ahorroAnualClp: ahorro.toString(), escenarios: admisible ? proyectar(asignaciones, supuestos, cartola.corte, cincoAnios(cartola.corte)) : [], busqueda: presupuesto.resultado(), evidencias: evidenciaAccesos(e, asignaciones, false),
    advertencias: ['Alternativas limitadas a acuerdos de distribución vigentes; pueden existir opciones fuera de ese universo. Una persona revisa y decide antes de ejecutar.', 'Mejor propuesta encontrada entre candidatos explorados; no se ha demostrado un mínimo global.', !admisible ? 'No se encontró una cartera admisible; las tenencias mostradas son el diagnóstico actual.' : 'La retención no constituye una nueva inversión.'], restricciones: validacion.restricciones };
}
function cincoAnios(fecha: string) { const d = new Date(`${fecha}T00:00:00Z`); d.setUTCFullYear(d.getUTCFullYear() + 5); return d.toISOString().slice(0, 10); }
