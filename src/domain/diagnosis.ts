import type { Acceso, Acuerdos, Cartola, Catalogo, Posicion, Producto, ResultadoPosicion, Serie } from './model';
import { decimal } from './numeric';
import { evaluarAcceso, tareasCondicionales } from './eligibility';

export function diagnosticarPosicion(entrada: Posicion, indice: number, cartola: Cartola,
  catalogo: Catalogo, acuerdos: Acuerdos): ResultadoPosicion {
  const producto = catalogo.productos.find(p => p.id === entrada.producto);
  const serie = producto?.series.find(s => s.codigo === entrada.serie);
  const fondo = producto?.tipo === 'mutual_fund' || producto?.tipo === 'investment_fund';
  const conocida = !!producto && (!fondo || !!serie);
  const tac = tasaComputable(producto, serie);
  const clasificacion = clasificarCosto(producto, conocida, tac);
  const costo = tac === undefined ? null : decimal(entrada.monto_clp).mul(tac).div(100).toString();
  const tasa = tac === undefined ? null : decimal(tac).toString();
  const emisor = producto ? catalogo.emisores.find(e => e.id === producto.emisor) : undefined;
  if (producto && !emisor) throw new Error(`Emisor del producto no encontrado: ${producto.emisor}`);
  const result: ResultadoPosicion = {
    indice, entrada: { ...entrada }, nombre: producto?.nombre ?? entrada.descripcion_original ?? entrada.producto ?? 'Posición sin identificar',
    emisor: emisor?.nombre ?? null,
    tipo: producto?.tipo ?? null, ...clasificacion,
    monto: decimal(entrada.monto_clp).toString(), peso: null, tac: tasa, costo,
    alternativas: [], elegida: entrada.serie, tacPosterior: tasa, costoPosterior: costo,
    ahorro: '0', bps: '0', empates: [], condicional: null, advertencias: [],
  };
  comprobarValorizacion(result, fondo);
  if (!conocida || !fondo || tac === undefined) return result;
  const acuerdo = acuerdos.acuerdos.find(a => a.emisor === producto!.emisor);
  result.alternativas = producto!.series.map(s => evaluarAcceso(s, producto!, entrada.monto_clp, entrada.serie, cartola, acuerdo));
  const elegibles = result.alternativas.filter(a => a.estado === 'eligible' && decimal(entrada.monto_clp).gt(0) && decimal(a.serie.tac_pct).lt(tac)).sort(compararAlternativas);
  const mejor = elegibles[0];
  const tasaPosterior = mejor?.serie.tac_pct ?? tac;
  if (mejor) {
    result.elegida = mejor.serie.codigo;
    result.empates = elegibles.filter(a => decimal(a.serie.tac_pct).eq(tasaPosterior)).map(a => a.serie.codigo);
    result.tacPosterior = decimal(tasaPosterior).toString();
    result.ahorro = decimal(tac).minus(tasaPosterior).mul(entrada.monto_clp).div(100).toString();
    result.bps = decimal(tac).minus(tasaPosterior).mul(100).toString();
    result.costoPosterior = decimal(entrada.monto_clp).mul(tasaPosterior).div(100).toString();
  }
  const condicional = result.alternativas.filter(a => a.estado === 'conditional'
    && decimal(a.serie.tac_pct).lt(tasaPosterior)).sort(compararAlternativas)[0];
  if (condicional && decimal(entrada.monto_clp).gt(0)) result.condicional = {
    serie: condicional.serie.codigo, tac: decimal(condicional.serie.tac_pct).toString(),
    adicional: decimal(tasaPosterior).minus(condicional.serie.tac_pct).mul(entrada.monto_clp).div(100).toString(),
    tareas: tareasCondicionales(condicional, acuerdo),
  };
  return result;
}

function tasaComputable(producto: Producto | undefined, serie: Serie | undefined): number | undefined {
  if (!producto) return undefined;
  if (producto.tipo === 'cash' || producto.tipo === 'time_deposit') return 0;
  if (producto.tipo === 'mutual_fund' || producto.tipo === 'investment_fund') return serie?.tac_pct;
  if (producto.tipo === 'equity_etf') return producto.tac_pct;
  return undefined;
}

function clasificarCosto(producto: Producto | undefined, conocida: boolean, tac: number | undefined): Pick<ResultadoPosicion, 'clasificacion' | 'motivo'> {
  if (!conocida) return {
    clasificacion: 'unidentified', motivo: 'Producto o serie sin identificar; no se atribuye costo ni ahorro.',
  };
  if (tac !== undefined) return {
    clasificacion: 'computable',
    motivo: producto?.tipo === 'cash' || producto?.tipo === 'time_deposit'
      ? 'Incluido en la base de TAC con costo cero.' : 'Costo declarado en el catálogo.',
  };
  if (producto?.tipo === 'insurance_savings') return {
    clasificacion: 'excluded', motivo: 'Seguro reconocido, excluido de la TAC. Desglose documental pendiente de nivel 3.',
  };
  return { clasificacion: 'excluded', motivo: 'Producto reconocido sin costo computable; excluido de la TAC.' };
}

function comprobarValorizacion(result: ResultadoPosicion, fondo: boolean) {
  const entrada = result.entrada;
  if (entrada.cuotas !== null && entrada.valor_cuota !== null) {
    const calculated = decimal(entrada.cuotas).mul(entrada.valor_cuota);
    const difference = calculated.minus(entrada.monto_clp).abs();
    if (difference.gt(1)) result.advertencias.push({
      codigo: 'VALORIZACION', mensaje: 'Cuotas × valor cuota difiere del monto declarado en más de 1 CLP. Se conserva el monto declarado.',
      declarado: result.monto, calculado: calculated.toString(), diferencia: difference.toString(),
    });
  } else if (fondo) result.advertencias.push({ codigo: 'SIN_VALORIZACION', mensaje: 'No se comprobó la valorización: faltan cuotas o valor cuota. Se usa el monto declarado.' });
}

function compararAlternativas(a: Acceso, b: Acceso): number {
  const diferencia = decimal(a.serie.tac_pct).cmp(b.serie.tac_pct);
  if (diferencia !== 0) return diferencia;
  if (a.serie.codigo < b.serie.codigo) return -1;
  if (a.serie.codigo > b.serie.codigo) return 1;
  return 0;
}
