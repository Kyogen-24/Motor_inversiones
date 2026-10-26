import { z } from 'zod';
import type { Acuerdos, Cartola, Catalogo } from '../domain/model';
import type { Meta, Supuestos } from '../domain/proposalModel';
import { esFecha } from '../domain/numeric';
import { validarSupuestos } from '../domain/proposalValidation';
import { interpretarCartolaCsv } from './cartolaCsv';
import { interpretarDocumentoCsv } from './documentoCsv';
import catalogo from '../../data/catalogo.json';
import acuerdos from '../../data/acuerdos.json';
import cartola from '../../data/cartola.json';
import supuestos from '../../data/supuestos.json';
import meta from '../../data/meta.json';

const texto = z.string().min(1).max(500).refine(value => value.trim().length > 0, 'El texto no puede contener solo espacios.');
const numero = z.number().finite().nonnegative().max(1e15);
const tasa = numero.max(100);
const retorno = z.number().finite().min(-100).max(100);
const fecha = z.string().refine(esFecha, 'Fecha inválida. Usa AAAA-MM-DD entre 1900 y 2200.');
const serie = z.looseObject({
  codigo: texto, tac_pct: tasa, minimo_clp: numero,
  abierta: z.boolean().default(true), solo_apv: z.boolean().default(false), requiere_mandato: z.boolean().default(false),
});
const catalogoSchema = z.looseObject({
  version: texto, corte_costos: fecha, fuente_costos: texto,
  emisores: z.array(z.looseObject({ id: texto, nombre: texto, tipo: texto })).max(1000),
  productos: z.array(z.looseObject({
    id: texto, emisor: texto, nombre: texto,
    tipo: z.enum(['mutual_fund', 'investment_fund', 'equity_etf', 'time_deposit', 'cash', 'insurance_savings', 'other']),
    categoria: texto, liquidez_dias: numero, series: z.array(serie).max(100), tac_pct: tasa.optional(),
  })).max(1000),
});
const acuerdosSchema = z.looseObject({
  distribuidor: texto,
  acuerdos: z.array(z.looseObject({
    emisor: texto, estado: texto, vigente_desde: fecha,
    vigente_hasta: fecha.nullable(), mandato: z.boolean(), patrimonio_agregado_clp: numero, patrimonio_al: fecha,
    series: z.record(texto, z.record(texto, tasa)),
  })).max(1000),
  productos_sin_serie: z.record(texto, z.looseObject({ comision_distribucion_pct: tasa })).default({}),
});
const cartolaSchema = z.looseObject({
  cliente: z.looseObject({ referencia: texto, perfil_riesgo: texto, perfil_evaluado_el: fecha, plan_apv: z.boolean() }),
  corte: fecha, moneda: z.literal('CLP'),
  posiciones: z.array(z.looseObject({
    producto: texto.nullable(), serie: texto.nullable(), descripcion_original: texto.optional(),
    cuotas: numero.nullable(), valor_cuota: numero.nullable(), monto_clp: numero,
  })).max(10000),
});
const categoria = z.looseObject({ retorno_real_bruto_pct: retorno, volatilidad_pct: tasa, peso_crecimiento: z.number().finite().min(0).max(1) });
const tramo = z.looseObject({ id: texto, desde_meses: z.number().int().nonnegative(), hasta_meses: z.number().int().nonnegative().nullable(), categorias: z.array(texto).min(1).max(9) });
const supuestosSchema = z.looseObject({
  uf: z.looseObject({ valor_clp: numero.positive(), fecha }), categorias: z.record(texto, categoria),
  perfiles: z.record(texto, z.looseObject({ max_crecimiento_pct: tasa })), limites: z.looseObject({ max_por_fondo_pct: tasa, max_por_agf_pct: tasa }),
  tramos: z.array(tramo).min(1).max(100), escenarios: z.array(z.looseObject({ id: z.enum(['adverso', 'base', 'favorable']), ajuste_retorno_pp: z.number().finite().min(-100).max(100) })).length(3),
});
const metaSchema = z.looseObject({ tipo: texto, nombre: texto, referencia_cliente: texto, capital_asignado_clp: numero, valor_uf_clp: numero.positive(), fecha_referencia: fecha, desembolsos: z.array(z.looseObject({ fecha, uf: numero.positive() })).min(1).max(1000) });
export type TipoEntrada = 'cartola' | 'catalogo' | 'acuerdos' | 'supuestos' | 'meta';
export interface Entradas { cartola: Cartola; catalogo: Catalogo; acuerdos: Acuerdos; supuestos: Supuestos; meta: Meta }
const schemas: { [K in TipoEntrada]: z.ZodType<Entradas[K]> } = { cartola: cartolaSchema, catalogo: catalogoSchema, acuerdos: acuerdosSchema, supuestos: supuestosSchema as z.ZodType<Supuestos>, meta: metaSchema as z.ZodType<Meta> };
export function interpretar<K extends TipoEntrada>(tipo: K, value: unknown): Entradas[K] {
  const result = schemas[tipo].safeParse(value);
  if (!result.success) {
    const messages = result.error.issues.slice(0, 8).map(issue => {
      const path = [tipo, ...issue.path].join('.');
      const mensaje = issue.code === 'custom' ? issue.message
        : issue.code === 'too_big' ? 'Valor o cantidad de elementos superior al límite admitido.'
        : issue.code === 'too_small' ? 'Falta contenido o el valor es negativo.'
        : issue.code === 'invalid_value' ? 'Valor no admitido. Revisa las opciones permitidas y usa moneda CLP.'
        : 'Campo obligatorio o tipo incorrecto. Revisa el formato requerido (números sin comillas y valores nulos explícitos).';
      return `${path}: ${mensaje}`;
    });
    throw new Error(messages.join('\n'));
  }
  validarSemantica(tipo, result.data);
  return result.data;
}

function validarSemantica<K extends TipoEntrada>(tipo: K, value: Entradas[K]) {
  if (tipo !== 'supuestos') return;
  const supuestos = value as Supuestos;
  validarSupuestos(supuestos);
  let desde = 0;
  for (let indice = 0; indice < supuestos.tramos.length; indice++) {
    const item = supuestos.tramos[indice];
    if (item.desde_meses !== desde) throw new Error(`supuestos.tramos[${indice}].desde_meses: los tramos deben ser contiguos desde 0 meses.`);
    if (item.hasta_meses === null) {
      if (indice !== supuestos.tramos.length - 1) throw new Error(`supuestos.tramos[${indice}].hasta_meses: solo el último tramo puede ser abierto.`);
    } else {
      if (item.hasta_meses <= item.desde_meses) throw new Error(`supuestos.tramos[${indice}].hasta_meses: debe ser mayor que desde_meses.`);
      desde = item.hasta_meses;
    }
    if (new Set(item.categorias).size !== item.categorias.length) throw new Error(`supuestos.tramos[${indice}].categorias: no se permiten categorías repetidas.`);
    for (const categoriaTramo of item.categorias) if (!Object.hasOwn(supuestos.categorias, categoriaTramo)) throw new Error(`supuestos.tramos[${indice}].categorias: la categoría ${categoriaTramo} no tiene supuesto.`);
  }
  const esperado = new Map([['adverso', -1.5], ['base', 0], ['favorable', 1.5]]);
  if (new Set(supuestos.escenarios.map(escenario => escenario.id)).size !== 3 || supuestos.escenarios.some(escenario => esperado.get(escenario.id) !== escenario.ajuste_retorno_pp)) {
    throw new Error('supuestos.escenarios: deben ser exactamente adverso −1,5 pp, base 0 pp y favorable +1,5 pp.');
  }
}
export class ErrorArchivo extends Error {
  constructor(public tipo: TipoEntrada, mensaje: string) { super(mensaje); }
}
const titulosEntrada: Record<TipoEntrada, string> = {
  cartola: 'la cartola del cliente', catalogo: 'el catálogo de productos', acuerdos: 'los acuerdos de distribución',
  supuestos: 'los supuestos declarados', meta: 'la meta',
};
const etiquetasCampo: Record<string, string> = {
  supuestos: 'Supuestos', meta: 'Meta', desembolsos: 'Desembolsos', fecha_referencia: 'Fecha de referencia', valor_uf_clp: 'Valor UF de referencia', uf: 'UF', capital_asignado_clp: 'Capital asignado en CLP', referencia_cliente: 'Referencia del cliente', retorno_real_bruto_pct: 'Retorno real bruto supuesto', volatilidad_pct: 'Volatilidad supuesta', peso_crecimiento: 'Factor de crecimiento', tramos: 'Tramos', desde_meses: 'Desde meses', hasta_meses: 'Hasta meses', categorias: 'Categorías', perfiles: 'Perfiles', max_crecimiento_pct: 'Máximo de crecimiento', limites: 'Límites', max_por_fondo_pct: 'Máximo por fondo', max_por_agf_pct: 'Máximo por AGF', escenarios: 'Escenarios', ajuste_retorno_pp: 'Ajuste al retorno bruto supuesto',
  cliente: 'Datos del cliente', referencia: 'Referencia del cliente', perfil_riesgo: 'Perfil de riesgo',
  perfil_evaluado_el: 'Fecha de evaluación del perfil', plan_apv: 'Condición APV',
  corte: 'Fecha de corte', moneda: 'Moneda', posiciones: 'Posiciones', producto: 'Producto',
  serie: 'Serie', cuotas: 'Cantidad de cuotas', valor_cuota: 'Valor de la cuota', monto_clp: 'Monto en CLP',
  version: 'Versión del catálogo', corte_costos: 'Fecha de los costos', fuente_costos: 'Fuente de los costos',
  emisores: 'Emisores', productos: 'Productos', id: 'Identificador', nombre: 'Nombre', emisor: 'Emisor',
  tipo: 'Tipo de producto o emisor', categoria: 'Categoría', liquidez_dias: 'Plazo de liquidez en días',
  series: 'Series', codigo: 'Código de la serie', tac_pct: 'Costo anual (TAC)', minimo_clp: 'Monto mínimo en CLP',
  abierta: 'Disponibilidad de la serie', solo_apv: 'Restricción APV', requiere_mandato: 'Requisito de mandato',
  distribuidor: 'Distribuidor', acuerdos: 'Acuerdos', estado: 'Estado del acuerdo',
  vigente_desde: 'Inicio de vigencia', vigente_hasta: 'Fin de vigencia', mandato: 'Mandato',
  patrimonio_agregado_clp: 'Patrimonio agregado en CLP', patrimonio_al: 'Fecha del patrimonio',
  productos_sin_serie: 'Productos sin serie', comision_distribucion_pct: 'Comisión de distribución',
};
const etiquetasFila: Record<string, string> = { posiciones: 'Posición', productos: 'Producto', emisores: 'Emisor', series: 'Serie', acuerdos: 'Acuerdo' };
function describirCampo(path: PropertyKey[]): string {
  const partes: string[] = [];
  for (let i = 0; i < path.length; i++) {
    const clave = String(path[i]);
    if (typeof path[i + 1] === 'number') {
      partes.push(`${etiquetasFila[clave] || etiquetasCampo[clave] || clave} ${Number(path[++i]) + 1}`);
    } else partes.push(etiquetasCampo[clave] || clave);
  }
  return partes.join(' · ') || 'Contenido del archivo';
}

// La validación de negocio conserva rutas técnicas; aquí se traducen para la carga.
export function errorDeAnalisis(error: unknown): ErrorArchivo | null {
  if (!(error instanceof Error)) return null;
  const separador = error.message.indexOf(':');
  if (separador < 0) return null;
  const ruta = error.message.slice(0, separador);
  const partes = ruta.replaceAll('[', '.').replaceAll(']', '').split('.');
  const raiz = partes[0];
  let tipo: TipoEntrada;
  if (raiz === 'cartola' || raiz === 'cliente') tipo = 'cartola';
  else if (raiz === 'catalogo') tipo = 'catalogo';
  else if (raiz === 'acuerdos' || raiz === 'productos_sin_serie') tipo = 'acuerdos';
  else if (raiz === 'supuestos' || raiz === 'categorias' || raiz === 'perfiles' || raiz === 'tramos') tipo = 'supuestos';
  else if (raiz === 'meta' || raiz === 'desembolsos') tipo = 'meta';
  else return null;
  if (raiz === 'cartola' || raiz === 'catalogo') partes.shift();
  const campo = describirCampo(partes.map(parte => /^\d+$/.test(parte) ? Number(parte) : parte));
  const mensaje = error.message.slice(separador + 1).trim();
  const explicaciones: Record<string, string> = {
    'no existe en emisores.': 'El emisor indicado no aparece en el catálogo. Revisa su identificador o incorpora el emisor que falta.',
    'no existe en el catálogo.': 'El emisor del acuerdo no aparece en el catálogo. Revisa que ambos archivos correspondan al mismo conjunto de datos.',
    'producto inexistente o de otro emisor.': 'El producto del acuerdo no aparece en el catálogo o pertenece a otro emisor.',
    'serie inexistente.': 'La serie del acuerdo no aparece entre las series de ese producto en el catálogo.',
    'existen identificadores duplicados. Corrige la ambigüedad.': 'Hay identificadores repetidos. Cada emisor, producto, serie o acuerdo debe poder distinguirse sin ambigüedad.',
    'el fin precede al inicio.': 'La fecha de fin del acuerdo es anterior a su inicio. Revisa ambas fechas.',
  };
  const motivo = explicaciones[mensaje] ?? mensaje;
  return new ErrorArchivo(tipo, `${campo}: ${motivo}\nSolicita que corrijan este dato y selecciona el archivo actualizado con «Cambiar archivo».`);
}
export async function leerArchivo<K extends TipoEntrada>(tipo: K, file: File): Promise<Entradas[K]> {
  if (file.size > 5 * 1024 * 1024) throw new ErrorArchivo(tipo, `«${file.name}» es demasiado grande. El límite es 5 MB. Solicita un archivo más pequeño.`);
  let content: string;
  try { content = await file.text(); }
  catch { throw new ErrorArchivo(tipo, `«${file.name}»: no se pudo leer el archivo. Vuelve a seleccionarlo.`); }
  let data: unknown;
  const esCsv = /\.csv$/i.test(file.name) || file.type.split(';')[0] === 'text/csv';
  if (esCsv) {
    try { data = tipo === 'cartola' ? interpretarCartolaCsv(content) : interpretarDocumentoCsv(content); }
    catch (error) { throw new ErrorArchivo(tipo, `«${file.name}»: ${error instanceof Error ? error.message : 'CSV inválido.'}`); }
  } else {
    try { data = JSON.parse(content.replace(/^\uFEFF/, '')); }
    catch { throw new ErrorArchivo(tipo, `«${file.name}» contiene JSON inválido y no se puede abrir. Solicita una copia corregida y vuelve a cargarla.`); }
  }
  const resultado = schemas[tipo].safeParse(data);
  if (resultado.success) {
    try { validarSemantica(tipo, resultado.data); return resultado.data; }
    catch (error) { throw new ErrorArchivo(tipo, error instanceof Error ? error.message : 'La relación entre los datos no es válida.'); }
  }
  const otro = (Object.keys(schemas) as TipoEntrada[]).find(key => key !== tipo && schemas[key].safeParse(data).success);
  if (otro) throw new ErrorArchivo(tipo, `«${file.name}» contiene ${titulosEntrada[otro]}. En esta sección necesitas ${titulosEntrada[tipo]}. Pulsa «Cambiar archivo» y selecciona el archivo correspondiente.`);
  const problemas = resultado.error.issues.slice(0, 8).map(issue => {
    let valor: unknown = data;
    for (const clave of issue.path) valor = valor !== null && typeof valor === 'object' ? Reflect.get(valor, clave) : undefined;
    const falta = valor === undefined || (typeof valor === 'string' && !valor.trim());
    const motivo = falta ? 'Falta este dato.'
      : issue.code === 'too_big' ? 'Supera el límite permitido.'
      : issue.code === 'custom' ? issue.message
      : 'El valor no tiene el formato requerido.';
    return `• ${describirCampo(issue.path)}: ${motivo}`;
  });
  const adicionales = resultado.error.issues.length - problemas.length;
  throw new ErrorArchivo(tipo, `Revisa estos datos en «${file.name}»:\n${problemas.join('\n')}${adicionales ? `\nHay ${adicionales} problemas adicionales en el archivo.` : ''}\nSolicita una versión corregida a quien prepara los archivos y cárgala con «Cambiar archivo».`);
}
export async function leerArchivos(archivos: Partial<Record<TipoEntrada, File>>) {
  const lecturas = await Promise.allSettled((Object.keys(archivos) as TipoEntrada[]).map(async tipo => ({
    tipo, datos: await leerArchivo(tipo, archivos[tipo]!), nombre: archivos[tipo]!.name,
  })));
  const cambios: { tipo: TipoEntrada; datos: Entradas[TipoEntrada]; nombre: string }[] = [];
  const errores: Partial<Record<TipoEntrada, string>> = {};
  for (const lectura of lecturas) {
    if (lectura.status === 'fulfilled') { cambios.push(lectura.value); continue; }
    const motivo: unknown = lectura.reason;
    if (!(motivo instanceof ErrorArchivo)) throw motivo;
    errores[motivo.tipo] = motivo.message;
  }
  return { cambios, errores };
}

export const cargarEjemplo = (): Entradas => {
  const base = { cartola: interpretar('cartola', cartola), catalogo: interpretar('catalogo', catalogo), acuerdos: interpretar('acuerdos', acuerdos) } as Entradas;
  // Helper exclusivo de pruebas. Son propiedades no enumerables para conservar exactamente
  // el contexto observable del diagnóstico de nivel 1; la aplicación jamás las autcarga.
  Object.defineProperties(base, { supuestos: { value: interpretar('supuestos', supuestos), enumerable: false, writable: true }, meta: { value: interpretar('meta', meta), enumerable: false, writable: true } });
  return base;
};
