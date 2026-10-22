import type { Acuerdos, Cartola, Catalogo } from './model';
import { esFecha, validarNumero } from './numeric';

function exigir(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function unicos(values: string[], path: string) {
  exigir(new Set(values).size === values.length, `${path}: existen identificadores duplicados. Corrige la ambigüedad.`);
}
export function validarNegocio(cartola: Cartola, catalogo: Catalogo, acuerdos: Acuerdos) {
  exigir(cartola.moneda === 'CLP', 'cartola.moneda: solo se admite CLP.');
  for (const [path, date] of [
    ['cartola.corte', cartola.corte], ['cliente.perfil_evaluado_el', cartola.cliente.perfil_evaluado_el],
    ['catalogo.corte_costos', catalogo.corte_costos],
  ]) exigir(esFecha(date), `${path}: fecha inválida. Usa AAAA-MM-DD entre 1900 y 2200.`);
  exigir(cartola.posiciones.length <= 10000, 'cartola.posiciones: máximo 10.000 filas.');
  unicos(catalogo.emisores.map(e => e.id), 'catalogo.emisores');
  unicos(catalogo.productos.map(p => p.id), 'catalogo.productos');
  unicos(acuerdos.acuerdos.map(a => a.emisor), 'acuerdos');
  catalogo.productos.forEach((producto, index) => {
    const path = `catalogo.productos[${index}]`;
    exigir(catalogo.emisores.some(e => e.id === producto.emisor), `${path}.emisor: no existe en emisores.`);
    unicos(producto.series.map(s => s.codigo), `${path}.series`);
    if (producto.tac_pct !== undefined) validarNumero(producto.tac_pct, `${path}.tac_pct`, 100);
    if (producto.tipo === 'mutual_fund' || producto.tipo === 'investment_fund') {
      exigir(producto.series.length > 0, `${path}.series: un fondo debe declarar sus series y costos.`);
    }
    producto.series.forEach((serie, i) => {
      validarNumero(serie.tac_pct, `${path}.series[${i}].tac_pct`, 100);
      validarNumero(serie.minimo_clp, `${path}.series[${i}].minimo_clp`);
    });
  });
  cartola.posiciones.forEach((posicion, index) => {
    validarNumero(posicion.monto_clp, `cartola.posiciones[${index}].monto_clp`);
    if (posicion.cuotas !== null) validarNumero(posicion.cuotas, `cartola.posiciones[${index}].cuotas`);
    if (posicion.valor_cuota !== null) validarNumero(posicion.valor_cuota, `cartola.posiciones[${index}].valor_cuota`);
  });
  acuerdos.acuerdos.forEach((acuerdo, index) => {
    const path = `acuerdos[${index}]`;
    exigir(catalogo.emisores.some(e => e.id === acuerdo.emisor), `${path}.emisor: no existe en el catálogo.`);
    exigir(esFecha(acuerdo.vigente_desde) && esFecha(acuerdo.patrimonio_al)
      && (acuerdo.vigente_hasta === null || esFecha(acuerdo.vigente_hasta)), `${path}: fecha inválida.`);
    exigir(acuerdo.vigente_hasta === null || acuerdo.vigente_hasta >= acuerdo.vigente_desde, `${path}: el fin precede al inicio.`);
    validarNumero(acuerdo.patrimonio_agregado_clp, `${path}.patrimonio_agregado_clp`);
    Object.entries(acuerdo.series).forEach(([id, series]) => {
      const producto = catalogo.productos.find(p => p.id === id);
      exigir(!!producto && producto.emisor === acuerdo.emisor, `${path}.series.${id}: producto inexistente o de otro emisor.`);
      Object.entries(series).forEach(([codigo, comision]) => {
        exigir(producto.series.some(s => s.codigo === codigo), `${path}.series.${id}.${codigo}: serie inexistente.`);
        validarNumero(comision, `${path}.series.${id}.${codigo}`, 100);
      });
    });
  });
  Object.entries(acuerdos.productos_sin_serie).forEach(([id, entry]) => {
    exigir(catalogo.productos.some(p => p.id === id && p.series.length === 0), `productos_sin_serie.${id}: producto sin serie inexistente.`);
    validarNumero(entry.comision_distribucion_pct, `productos_sin_serie.${id}.comision_distribucion_pct`, 100);
  });
}
