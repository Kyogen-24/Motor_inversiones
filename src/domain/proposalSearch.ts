import { decimal, porcentaje, sumar } from './numeric';
import { diagnosticarPosicion } from './diagnosis';
import type { Asignacion, EntradaPropuestaCosto, EvidenciaDecision } from './proposalModel';
import type { Producto, Serie } from './model';
import { evaluarAcceso, tareasCondicionales } from './eligibility';

export function crearPresupuestoBusqueda(limite = 50000) {
  let nodos = 0; let agotado = false;
  return { intentarNodo() { if (nodos >= limite) { agotado = true; return false; } nodos++; return true; }, get nodos() { return nodos; }, get agotado() { return agotado; }, resultado() { return { estado: agotado ? 'limite_alcanzado' as const : 'completa' as const, nodos, presupuesto: limite, optimalidad: 'no_demostrada' as const }; } };
}
export const esFondo = (p: Producto) => p.tipo === 'mutual_fund' || p.tipo === 'investment_fund' || p.tipo === 'equity_etf';
export function asignacionesActuales(e: EntradaPropuestaCosto) {
  const productos = new Map(e.catalogo.productos.map(p => [p.id, p]));
  const advertencias: string[] = [];
  const asignaciones = e.cartola.posiciones.flatMap((pos, loteOrigen) => {
    const p = productos.get(pos.producto ?? ''); const s = p?.series.find(s => s.codigo === pos.serie);
    const computable = p && ((p.tipo === 'cash' || p.tipo === 'time_deposit') || (p.tipo === 'equity_etf' && p.tac_pct !== undefined) || ((p.tipo === 'mutual_fund' || p.tipo === 'investment_fund') && s));
    if (!computable) { advertencias.push(`Se excluye «${p?.nombre ?? pos.descripcion_original ?? 'sin identificar'}», $${pos.monto_clp}: no tiene costo computable.`); return []; }
    return [{ ...convertirAsignacion(p, s ?? null, String(pos.monto_clp), e.supuestos.uf.valor_clp), fase: 'retencion' as const, loteOrigen }];
  });
  return { asignaciones, advertencias };
}
export const minimo = (...xs: ReturnType<typeof decimal>[]) => xs.reduce((a, b) => a.lte(b) ? a : b);
export function convertirAsignacion(p: Producto, s: Serie | null, monto: string, uf: number): Asignacion {
  return { producto: p.id, serie: s?.codigo ?? null, emisor: p.emisor, nombre: p.nombre, categoria: p.categoria as Asignacion['categoria'], montoClp: monto, montoUf: decimal(monto).div(uf).toString(), tacPct: String(s?.tac_pct ?? (esFondo(p) ? p.tac_pct : 0) ?? 0), liquidezDias: p.liquidez_dias };
}
export function cupo(p: Producto, asignadas: Asignacion[], base: string, e: EntradaPropuestaCosto, maxCrecimiento: string) {
  let disponible = decimal(base);
  if (esFondo(p)) {
    const fondo = sumar(asignadas.filter(a => a.producto === p.id).map(a => a.montoClp));
    const agf = sumar(asignadas.filter(a => a.emisor === p.emisor && a.categoria !== 'caja' && a.categoria !== 'deposito_plazo').map(a => a.montoClp));
    disponible = minimo(disponible, decimal(base).mul(e.supuestos.limites.max_por_fondo_pct).div(100).minus(fondo), decimal(base).mul(e.supuestos.limites.max_por_agf_pct).div(100).minus(agf));
  }
  const crecimiento = e.supuestos.categorias[p.categoria as Asignacion['categoria']].peso_crecimiento;
  if (crecimiento > 0) {
    const usado = sumar(asignadas.map(a => decimal(a.montoClp).mul(e.supuestos.categorias[a.categoria].peso_crecimiento).toString()));
    disponible = minimo(disponible, decimal(base).mul(maxCrecimiento).div(100).minus(usado).div(crecimiento));
  }
  return disponible.gt(0) ? disponible : decimal(0);
}
export function evidenciaAccesos(e: EntradaPropuestaCosto, asignadas: Asignacion[], consolidar: boolean): EvidenciaDecision[] {
  const grupos = new Map<string, Asignacion[]>();
  for (const a of asignadas) {
    if (decimal(a.montoClp).lte(0)) continue;
    const key = `${a.producto}|${a.serie}|${consolidar ? '' : a.loteOrigen}|${a.fase === 'retencion'}`;
    grupos.set(key, [...(grupos.get(key) ?? []), a]);
  }
  const evidencia: EvidenciaDecision[] = [];
  const acuerdos = new Map(e.acuerdos.acuerdos.map(a => [a.emisor, a]));
  const productos = new Map(e.catalogo.productos.map(p => [p.id, p]));
  for (const grupo of grupos.values()) {
    const a = grupo[0]; const p = productos.get(a.producto)!;
    const ticket = sumar(grupo.map(a => a.montoClp)).toString();
    const contexto = { producto: p.id, nombre: p.nombre, serieAsignada: a.serie, loteOrigen: consolidar ? undefined : a.loteOrigen, tramos: [...new Set(grupo.flatMap(a => a.tramoId ? [a.tramoId] : []))], ticketClp: ticket };
    const uso = a.fase === 'retencion' ? 'tenencia' as const : 'destino' as const;
    if (a.serie === null) {
      const sinAgf = p.tipo === 'cash' || p.tipo === 'time_deposit';
      evidencia.push({ ...contexto, serie: null, uso, estado: sinAgf ? 'eligible' : 'not_evaluated', motivo: sinAgf ? 'Producto sin serie; no requiere acuerdo de AGF.' : 'Tenencia existente sin serie; no se acredita acceso a una nueva inversión.', tareas: [] });
      continue;
    }
    for (const s of [...p.series].sort((a, b) => a.codigo.localeCompare(b.codigo))) {
      const acuerdo = acuerdos.get(p.emisor); const acceso = evaluarAcceso(s, p, ticket, null, e.cartola, acuerdo);
      evidencia.push({ ...contexto, serie: s.codigo, uso: s.codigo === a.serie ? uso : 'alternativa', estado: acceso.estado, motivo: acceso.motivo, tareas: acceso.estado === 'conditional' ? tareasCondicionales(acceso, acuerdo) : [] });
    }
  }
  return evidencia;
}
export function fuentesPropuesta(e: EntradaPropuestaCosto) {
  const posiciones = e.cartola.posiciones.map((p, i) => diagnosticarPosicion(p, i, e.cartola, e.catalogo, e.acuerdos));
  const sinIdentificar = sumar(posiciones.filter(p => p.clasificacion === 'unidentified').map(p => p.monto)).toString();
  const exclusiones = posiciones.filter(p => p.clasificacion !== 'computable').map(p => ({ nombre: p.nombre, montoClp: p.monto, motivo: p.tipo === 'insurance_savings' ? 'Seguro con ahorro: excluido de la base de TAC.' : p.motivo }));
  return { cliente: e.cartola.cliente.referencia, corte: e.cartola.corte, sinIdentificarClp: sinIdentificar, porcentajeSinIdentificar: porcentaje(sinIdentificar, sumar(posiciones.map(p => p.monto)).toString()), excluidoClp: sumar(posiciones.filter(p => p.clasificacion === 'excluded').map(p => p.monto)).toString(), exclusiones, emisores: Object.fromEntries(e.catalogo.emisores.map(e => [e.id, e.nombre])), distribuidor: e.acuerdos.distribuidor, catalogoVersion: e.catalogo.version, catalogoFecha: e.catalogo.corte_costos, catalogoFuente: e.catalogo.fuente_costos, supuestosVersion: e.supuestos.version ?? 'no informada', supuestosFecha: e.supuestos.fecha ?? 'no informada', aviso: e.supuestos._aviso ?? 'Datos declarados: confirmar su fuente antes de decidir.', valorUfClp: String(e.supuestos.uf.valor_clp), fechaUf: e.supuestos.uf.fecha };
}
export function completarAsignaciones(asignaciones: Asignacion[], e: EntradaPropuestaCosto, base: string) {
  for (const a of asignaciones) {
    a.pesoPct = decimal(base).isZero() ? undefined : decimal(a.montoClp).div(base).mul(100).toString();
    a.retornoBrutoPct = String(e.supuestos.categorias[a.categoria].retorno_real_bruto_pct);
    a.retornoNetoPct = decimal(a.retornoBrutoPct).minus(a.tacPct).toString();
    a.volatilidadPct = String(e.supuestos.categorias[a.categoria].volatilidad_pct);
  }
}
