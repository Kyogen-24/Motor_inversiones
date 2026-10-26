import { evaluarAcceso } from './eligibility';
import { decimal, esFecha, validarNumero } from './numeric';
import { crecimientoMaximoEfectivo, resumenAsignaciones } from './risk';
import type { Asignacion, EntradaPropuestaCosto, EntradaPropuestaMeta, Supuestos } from './proposalModel';
import { validarNegocio } from './validation';

export const categoriasNivel2 = ['caja', 'deposito_plazo', 'deuda_corto_clp', 'deuda_uf_corto', 'deuda_uf_mediano', 'deuda_uf_largo', 'balanceado', 'rv_chile', 'rv_global'] as const;
const categoriasValidas = new Set<string>(categoriasNivel2);
function exigir(valor: boolean, ruta: string, motivo: string): asserts valor { if (!valor) throw new Error(`${ruta}: ${motivo}`); }

export function validarSupuestos(s: Supuestos): void {
  exigir(esFecha(s.uf.fecha), 'supuestos.uf.fecha', 'fecha inválida.');
  validarNumero(s.uf.valor_clp, 'supuestos.uf.valor_clp');
  exigir(s.uf.valor_clp > 0, 'supuestos.uf.valor_clp', 'debe ser positiva.');
  for (const cat of categoriasNivel2) {
    const c = s.categorias[cat];
    exigir(!!c, `supuestos.categorias.${cat}`, 'falta supuesto requerido.');
    exigir(Number.isFinite(c.retorno_real_bruto_pct) && c.retorno_real_bruto_pct > -98.5 && c.retorno_real_bruto_pct <= 100, `supuestos.categorias.${cat}.retorno_real_bruto_pct`, 'retorno fuera de dominio en escenario adverso.');
    validarNumero(c.volatilidad_pct, `supuestos.categorias.${cat}.volatilidad_pct`, 100);
    const esperado = cat.startsWith('rv_') ? 1 : cat === 'balanceado' ? 0.5 : 0;
    exigir(c.peso_crecimiento === esperado, `supuestos.categorias.${cat}.peso_crecimiento`, `debe ser ${esperado}.`);
  }
  for (const [id, p] of Object.entries(s.perfiles)) validarNumero(p.max_crecimiento_pct, `supuestos.perfiles.${id}.max_crecimiento_pct`, 100);
  validarNumero(s.limites.max_por_fondo_pct, 'supuestos.limites.max_por_fondo_pct', 100);
  validarNumero(s.limites.max_por_agf_pct, 'supuestos.limites.max_por_agf_pct', 100);
  exigir(s.tramos.length > 0 && s.tramos.length <= 100, 'supuestos.tramos', 'se requieren entre 1 y 100 tramos.');
  const ids = new Set<string>(); let desde = 0;
  s.tramos.forEach((t, i) => {
    const ruta = `supuestos.tramos[${i}]`;
    exigir(!!t.id && !ids.has(t.id), ruta, 'identificador vacío o duplicado.'); ids.add(t.id);
    exigir(Number.isInteger(t.desde_meses) && t.desde_meses === desde, `${ruta}.desde_meses`, 'los tramos deben ser contiguos desde 0 meses.');
    exigir(t.hasta_meses === null ? i === s.tramos.length - 1 : Number.isInteger(t.hasta_meses) && t.hasta_meses > t.desde_meses, `${ruta}.hasta_meses`, 'frontera inválida.');
    desde = t.hasta_meses ?? desde;
    exigir(t.categorias.length > 0 && new Set(t.categorias).size === t.categorias.length && t.categorias.every(c => categoriasValidas.has(c)), `${ruta}.categorias`, 'categoría desconocida o repetida.');
  });
  exigir(s.tramos.at(-1)?.hasta_meses === null, 'supuestos.tramos', 'el último tramo debe ser abierto.');
  const ajustes = { adverso: -1.5, base: 0, favorable: 1.5 };
  exigir(s.escenarios.length === 3 && new Set(s.escenarios.map(e => e.id)).size === 3 && s.escenarios.every(e => ajustes[e.id] === e.ajuste_retorno_pp), 'supuestos.escenarios', 'deben ser exactamente adverso −1,5 pp, base 0 pp y favorable +1,5 pp.');
}

export function validarEntradaPropuesta(e: EntradaPropuestaCosto | EntradaPropuestaMeta): void {
  validarNegocio(e.cartola, e.catalogo, e.acuerdos); validarSupuestos(e.supuestos);
  exigir(e.cartola.corte === e.supuestos.uf.fecha, 'supuestos.uf.fecha', 'debe coincidir con el corte.');
  exigir(!!e.supuestos.perfiles[e.cartola.cliente.perfil_riesgo], 'supuestos.perfiles', 'falta el perfil del cliente.');
  e.catalogo.productos.forEach((p, i) => {
    if (p.tipo === 'other' || p.tipo === 'insurance_savings') return;
    exigir(categoriasValidas.has(p.categoria), `catalogo.productos[${i}].categoria`, 'categoría desconocida.');
    validarNumero(p.liquidez_dias, `catalogo.productos[${i}].liquidez_dias`);
    exigir(Number.isInteger(p.liquidez_dias), `catalogo.productos[${i}].liquidez_dias`, 'debe ser un número entero de días.');
    const bruto = e.supuestos.categorias[p.categoria as typeof categoriasNivel2[number]].retorno_real_bruto_pct;
    for (const tac of p.series.length ? p.series.map(s => s.tac_pct) : [p.tac_pct ?? 0]) exigir(1 + (bruto - 1.5 - tac) / 100 > 0, `supuestos.categorias.${p.categoria}.retorno_real_bruto_pct`, `retorno neto fuera de dominio para ${p.id}.`);
  });
  if (!('meta' in e)) return;
  const m = e.meta;
  exigir(m.referencia_cliente === e.cartola.cliente.referencia, 'meta.referencia_cliente', 'no coincide con la cartola.');
  exigir(m.fecha_referencia === e.cartola.corte, 'meta.fecha_referencia', 'debe coincidir con el corte y la UF de supuestos.');
  exigir(m.valor_uf_clp === e.supuestos.uf.valor_clp, 'meta.valor_uf_clp', 'debe coincidir con supuestos.uf.valor_clp.');
  validarNumero(m.capital_asignado_clp, 'meta.capital_asignado_clp');
  exigir(m.desembolsos.length > 0 && m.desembolsos.length <= 1000, 'meta.desembolsos', 'se requieren entre 1 y 1.000 pagos.');
  m.desembolsos.forEach((p, i) => {
    exigir(esFecha(p.fecha) && p.fecha > m.fecha_referencia, `meta.desembolsos[${i}].fecha`, 'debe ser posterior a la referencia.');
    validarNumero(p.uf, `meta.desembolsos[${i}].uf`); exigir(p.uf > 0, `meta.desembolsos[${i}].uf`, 'debe ser positivo.');
  });
}

export interface ValidacionPropuesta {
  valida: boolean;
  restricciones: string[];
}

/** Restricciones comunes de nivel 2. No altera asignaciones ni completa capital faltante. */
export function validarAsignaciones(
  asignaciones: Asignacion[],
  entrada: EntradaPropuestaCosto,
  opciones: { exigirAccesoFinal?: boolean; maxCrecimientoPct?: string; capitalEsperadoClp?: string; verificarConcentracion?: boolean; baseConcentracionClp?: string; consolidarTickets?: boolean } = {},
): ValidacionPropuesta {
  const restricciones: string[] = [];
  const { catalogo, acuerdos, cartola, supuestos } = entrada;
  const productosPorId = new Map(catalogo.productos.map(producto => [producto.id, producto]));
  const acuerdosPorEmisor = new Map(acuerdos.acuerdos.map(acuerdo => [acuerdo.emisor, acuerdo]));
  const resumen = resumenAsignaciones(asignaciones, supuestos, String(supuestos.uf.valor_clp), opciones.baseConcentracionClp);
  if (opciones.capitalEsperadoClp !== undefined && !decimal(resumen.capitalClp).eq(opciones.capitalEsperadoClp)) {
    restricciones.push('El capital asignado no coincide con el capital disponible; el importe no asignable se declara separado.');
  }
  if (opciones.verificarConcentracion !== false) {
    for (const [producto, peso] of Object.entries(resumen.concentracionFondos)) {
      if (decimal(peso).gt(supuestos.limites.max_por_fondo_pct)) restricciones.push(`Concentración por fondo excedida: ${producto} (${peso}%).`);
    }
    for (const [agf, peso] of Object.entries(resumen.concentracionAgf)) {
      if (decimal(peso).gt(supuestos.limites.max_por_agf_pct)) restricciones.push(`Concentración por AGF excedida: ${agf} (${peso}%).`);
    }
  }
  if (opciones.maxCrecimientoPct !== undefined && resumen.crecimientoPct !== null && decimal(resumen.crecimientoPct).gt(opciones.maxCrecimientoPct)) {
    restricciones.push(`Crecimiento excede el máximo de perfil reducido (${opciones.maxCrecimientoPct}%).`);
  }
  if (opciones.exigirAccesoFinal) {
    const tickets = new Map<string, typeof asignaciones>();
    for (const [indice, asignacion] of asignaciones.entries()) {
      if (asignacion.fase === 'retencion') continue;
      if (asignacion.serie === null && (asignacion.categoria === 'caja' || asignacion.categoria === 'deposito_plazo')) continue;
      const key = `${asignacion.producto}|${asignacion.serie ?? ''}|${opciones.consolidarTickets === false ? asignacion.loteOrigen ?? indice : ''}`;
      tickets.set(key, [...(tickets.get(key) ?? []), asignacion]);
    }
    for (const lote of tickets.values()) {
      const primero = lote[0];
      const producto = productosPorId.get(primero.producto);
      const serie = producto?.series.find(item => item.codigo === primero.serie);
      if (!producto || !serie || !(primero.categoria in supuestos.categorias)) {
        restricciones.push(`Destino no verificable: ${primero.nombre}.`);
        continue;
      }
      const ticket = lote.reduce((total, item) => total.plus(item.montoClp), decimal(0)).toString();
      const acuerdo = acuerdosPorEmisor.get(producto.emisor);
      const acceso = evaluarAcceso(serie, producto, ticket, null, cartola, acuerdo);
      if (acceso.estado !== 'eligible') restricciones.push(`Acceso final no elegible para ${producto.nombre} ${serie.codigo}: ${acceso.motivo}`);
    }
  }
  return { valida: restricciones.length === 0, restricciones };
}

export function maximoCrecimientoMeta(supuestos: Supuestos, perfil: string, mesesPrimerPago: number): string {
  const limite = supuestos.perfiles[perfil];
  if (!limite) throw new Error('supuestos.perfiles: falta el perfil del cliente.');
  return crecimientoMaximoEfectivo(limite.max_crecimiento_pct, mesesPrimerPago);
}
