import { evaluarAcceso } from './eligibility';
import { aniosEntre, decimal, diasEntre, mesesCalendario, sumar } from './numeric';
import { maximoCrecimientoMeta, validarAsignaciones } from './proposalValidation';
import { proyectar } from './projection';
import { resumenAsignaciones } from './risk';
import { asignacionesActuales, completarAsignaciones, convertirAsignacion, crearPresupuestoBusqueda, cupo, evidenciaAccesos, fuentesPropuesta, minimo } from './proposalSearch';
import type { Asignacion, Categoria, EntradaPropuestaMeta, PagoMeta, PropuestaMeta, ReservaMeta, Tramo } from './proposalModel';
import type { Producto, Serie } from './model';

/** R06: soporte, VP y tickets se aceptan juntos, sobre montos finales. */
export function construirPropuestaMeta(e: EntradaPropuestaMeta): PropuestaMeta {
  const { meta: m, supuestos: s } = e;
  const pagos = m.desembolsos.map((p, indice) => {
    const meses = mesesCalendario(m.fecha_referencia, p.fecha);
    const tramo = s.tramos.find(t => meses >= t.desde_meses && (t.hasta_meses === null || meses < t.hasta_meses));
    if (!tramo) throw new Error(`meta.desembolsos[${indice}]: no hay tramo para ${meses} meses.`);
    return { ...p, indice, meses, tramo };
  }).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.indice - b.indice);
  const capital = decimal(m.capital_asignado_clp).div(m.valor_uf_clp);
  const maximo = maximoCrecimientoMeta(s, e.cartola.cliente.perfil_riesgo, pagos[0].meses);
  const tramos = s.tramos.filter(t => pagos.some(p => p.tramo.id === t.id));
  const primerPagoPorTramo = new Map<string, string>();
  for (const p of pagos) if (!primerPagoPorTramo.has(p.tramo.id)) primerPagoPorTramo.set(p.tramo.id, p.fecha);
  const presupuesto = crearPresupuestoBusqueda();
  const opciones = { exigirAccesoFinal: true, baseConcentracionClp: String(m.capital_asignado_clp), maxCrecimientoPct: maximo };
  type ReservaCalculada = Omit<ReservaMeta, 'retornoBrutoPct' | 'vpUf'> & { retornoBrutoPct: string; vpUf: string };
  type Candidato = { reservas: ReservaCalculada[]; pagos: PagoMeta[]; noAsignable: string };
  let mejor: Candidato | null = null;
  let completa = false;

  function destinos(t: Tramo, categorias: Categoria[]) {
    const primerPago = primerPagoPorTramo.get(t.id);
    if (!primerPago) return [];
    const dias = diasEntre(m.fecha_referencia, primerPago);
    return categorias.flatMap(cat => e.catalogo.productos.filter(p => p.categoria === cat && decimal(p.liquidez_dias).lte(dias)).flatMap<{ p: Producto; serie: Serie | null }>(p => {
      if (p.tipo === 'cash' || p.tipo === 'time_deposit') return [{ p, serie: null }];
      if (p.tipo !== 'mutual_fund' && p.tipo !== 'investment_fund') return [];
      return p.series.filter(serie => evaluarAcceso(serie, p, String(m.capital_asignado_clp), null, e.cartola, e.acuerdos.acuerdos.find(a => a.emisor === p.emisor)).estado === 'eligible').map(serie => ({ p, serie }));
    }).sort((a, b) => decimal(a.serie?.tac_pct ?? 0).cmp(b.serie?.tac_pct ?? 0) || a.p.id.localeCompare(b.p.id) || (a.serie?.codigo ?? '').localeCompare(b.serie?.codigo ?? '')));
  }

  function evaluar(soportes: Categoria[][]) {
    if (!presupuesto.intentarNodo()) return;
    const reservas: ReservaCalculada[] = tramos.map((t, i) => {
      const tasa = sumar(soportes[i].map(cat => String(s.categorias[cat].retorno_real_bruto_pct))).div(soportes[i].length);
      return { tramoId: t.id, categorias: soportes[i], retornoBrutoPct: tasa.toString(), vpUf: '0', capitalUf: '0', asignaciones: [] };
    });
    let disponible = capital;
    const calculados: PagoMeta[] = pagos.map(p => {
      const r = reservas.find(r => r.tramoId === p.tramo.id)!;
      const vp = decimal(p.uf).div(decimal(1).plus(decimal(r.retornoBrutoPct).div(100)).pow(aniosEntre(m.fecha_referencia, p.fecha)));
      const reservado = minimo(vp, disponible); disponible = disponible.minus(reservado);
      r.vpUf = decimal(r.vpUf).plus(vp).toString(); r.capitalUf = decimal(r.capitalUf).plus(reservado).toString();
      return { indice: p.indice, fecha: p.fecha, uf: String(p.uf), meses: String(p.meses), tramoId: p.tramo.id, vpUf: vp.toString(), reservadoVpUf: reservado.toString(), noFinanciadoInicialUf: vp.minus(reservado).toString(), pendienteBaseUf: String(p.uf) };
    });
    if (disponible.gt(0)) reservas[reservas.length - 1].capitalUf = decimal(reservas.at(-1)!.capitalUf).plus(disponible).toString();

    function asignar(i: number, cartera: Asignacion[]) {
      if (!presupuesto.intentarNodo() || completa) return;
      if (i === reservas.length) {
        if (!validarAsignaciones(cartera, e, opciones).valida) return;
        const efectivas = reservas.map(r => ({ ...r, asignaciones: cartera.filter(a => a.tramoId === r.tramoId) }));
        if (efectivas.some(r => decimal(r.capitalUf).gt(0) && r.asignaciones.length > 0 && r.categorias.some(c => !r.asignaciones.some(a => a.categoria === c)))) return;
        const noAsignable = capital.minus(sumar(cartera.map(a => a.montoClp)).div(m.valor_uf_clp));
        if (noAsignable.lt(0)) return;
        const candidato = { reservas: efectivas.map(r => ({ ...r, capitalUf: sumar(r.asignaciones.map(a => a.montoClp)).div(m.valor_uf_clp).toString() })), pagos: calculados, noAsignable: noAsignable.toString() };
        if (mejor === null || noAsignable.lt(mejor.noAsignable)) mejor = candidato;
        if (noAsignable.isZero()) completa = true;
        return;
      }
      const r = reservas[i]; const candidatos = destinos(tramos[i], r.categorias);
      function repartir(j: number, restante: ReturnType<typeof decimal>, partes: Asignacion[]) {
        if (!presupuesto.intentarNodo() || completa) return;
        if (restante.isZero() || j === candidatos.length) { asignar(i + 1, [...cartera, ...partes]); return; }
        const { p, serie } = candidatos[j];
        const capacidad = minimo(restante, cupo(p, [...cartera, ...partes], String(m.capital_asignado_clp), e, maximo));
        const invertidas = [...cartera, ...partes];
        const ticketPrevio = (producto: string, codigo: string | null) => sumar(invertidas.filter(a => a.producto === producto && a.serie === codigo).map(a => a.montoClp));
        const importes = [capacidad, decimal(serie?.minimo_clp ?? 0).minus(ticketPrevio(p.id, serie?.codigo ?? null)), ...candidatos.slice(j + 1).map(c => restante.minus(decimal(c.serie?.minimo_clp ?? 0).minus(ticketPrevio(c.p.id, c.serie?.codigo ?? null))))];
        // Límites de ticket y complementos permiten repartir sin perder una solución por prefijos.
        for (const monto of [...new Map(importes.map(m => [m.toString(), m])).values()]) {
          if (monto.lte(0) || monto.gt(capacidad)) continue;
          repartir(j + 1, restante.minus(monto), [...partes, { ...convertirAsignacion(p, serie, monto.toString(), m.valor_uf_clp), tramoId: r.tramoId }]);
          if (completa || presupuesto.agotado) return;
        }
        if (!presupuesto.agotado && !completa) repartir(j + 1, restante, partes);
      }
      repartir(0, decimal(r.capitalUf).mul(m.valor_uf_clp), []);
    }
    asignar(0, []);
  }

  function* soportes(categorias: Categoria[], prefijo: Categoria[] = [], desde = 0): Generator<Categoria[]> {
    for (let i = desde; i < categorias.length; i++) { const grupo = [...prefijo, categorias[i]]; yield grupo; yield* soportes(categorias, grupo, i + 1); }
  }
  function combinar(i: number, elegidos: Categoria[][]) {
    if (presupuesto.agotado || completa) return;
    if (i === tramos.length) { evaluar(elegidos); return; }
    const disponibles = tramos[i].categorias.filter(c => destinos(tramos[i], [c]).length > 0);
    for (const grupo of soportes(disponibles.length ? disponibles : [tramos[i].categorias[0]])) {
      if (!presupuesto.intentarNodo()) return;
      combinar(i + 1, [...elegidos, grupo]); if (completa || presupuesto.agotado) return;
    }
  }
  if (!capital.isZero()) combinar(0, []);
  // La búsqueda no prueba inviabilidad. Sin capital no se inventa un soporte para VP.
  const encontrado = mejor as Candidato | null;
  const elegido = encontrado?.reservas.some(r => r.asignaciones.length > 0) ? encontrado : null;
  const reservas: ReservaMeta[] = (elegido?.reservas ?? []).map(r => r.asignaciones.length ? r : { ...r, categorias: [], retornoBrutoPct: null, vpUf: null });
  const asignaciones = reservas.flatMap(r => r.asignaciones);
  const validacion = validarAsignaciones(asignaciones, e, opciones);
  const admisible = asignaciones.length > 0 && validacion.valida;
  const escenarios = proyectar(asignaciones, s, m.fecha_referencia, pagos.at(-1)!.fecha, pagos.map(p => ({ fecha: p.fecha, uf: String(p.uf), indice: p.indice, tramoId: p.tramo.id })));
  const base = escenarios.find(e => e.id === 'base')!;
  const pendientes = new Map(base.pagos.map(p => [p.indice, p.pendienteUf]));
  const detalle = (elegido?.pagos ?? pagos.map(p => ({ indice: p.indice, fecha: p.fecha, uf: String(p.uf), meses: String(p.meses), tramoId: p.tramo.id, vpUf: '0', reservadoVpUf: '0', noFinanciadoInicialUf: String(p.uf), pendienteBaseUf: String(p.uf) }))).map(p => ({ ...p, pendienteBaseUf: pendientes.get(p.indice) ?? p.uf }));
  const capitalReservado = new Map(reservas.map(r => [r.tramoId, decimal(r.capitalUf)]));
  for (const p of detalle) {
    if (!reservas.some(r => r.tramoId === p.tramoId && r.asignaciones.length > 0)) { p.vpUf = null; p.reservadoVpUf = '0'; p.noFinanciadoInicialUf = null; continue; }
    const disponible = capitalReservado.get(p.tramoId) ?? decimal(0);
    const reservado = minimo(decimal(p.vpUf ?? 0), disponible);
    p.reservadoVpUf = reservado.toString();
    p.noFinanciadoInicialUf = decimal(p.vpUf ?? 0).minus(reservado).toString();
    capitalReservado.set(p.tramoId, disponible.minus(reservado));
  }
  const vp = elegido && reservas.every(r => r.vpUf !== null) ? sumar(reservas.map(r => r.vpUf ?? '0')) : null;
  const noAsignable = elegido?.noAsignable ?? capital.toString();
  for (const r of reservas) { r.pesoRequeridoPct = r.vpUf === null ? undefined : decimal(r.vpUf).div(capital).mul(100).toString(); r.pesoEfectivoPct = decimal(r.capitalUf).div(capital).mul(100).toString(); }
  const tickets = new Map<string, string>();
  for (const a of asignaciones) { const k = `${a.producto}|${a.serie}`; tickets.set(k, decimal(tickets.get(k) ?? 0).plus(a.montoClp).toString()); }
  for (const a of asignaciones) { a.ticketFinalClp = tickets.get(`${a.producto}|${a.serie}`); a.pesoPct = decimal(a.montoClp).div(m.capital_asignado_clp).mul(100).toString(); }
  const resumen = asignaciones.length ? resumenAsignaciones(asignaciones, s, String(m.valor_uf_clp), String(m.capital_asignado_clp)) : null;
  const alcanza = admisible && decimal(base.pendienteUf ?? 0).isZero();
  completarAsignaciones(asignaciones, e, String(m.capital_asignado_clp));
  const referencia = asignacionesActuales(e);
  const actual = resumenAsignaciones(referencia.asignaciones, s, String(m.valor_uf_clp));
  completarAsignaciones(referencia.asignaciones, e, actual.capitalClp);
  return { modalidad: 'meta', versionReglas: 'nivel-2.0', actual, actuales: referencia.asignaciones, fuentes: fuentesPropuesta(e), capitalClp: String(m.capital_asignado_clp), vpTotalClp: vp?.mul(m.valor_uf_clp).toString() ?? null, deficitVpClp: vp ? (vp.gt(capital) ? vp.minus(capital) : decimal(0)).mul(m.valor_uf_clp).toString() : null, excedenteVpClp: vp ? (capital.gt(vp) ? capital.minus(vp) : decimal(0)).mul(m.valor_uf_clp).toString() : null, noAsignableClp: decimal(noAsignable).mul(m.valor_uf_clp).toString(), nombre: m.nombre, estado: !admisible ? 'sin_candidato' : alcanza && decimal(noAsignable).isZero() ? 'propuesta' : 'propuesta_parcial', admisible, motivosNoAdmisible: admisible ? [] : [...validacion.restricciones, 'No se encontró una inversión admisible.'], contexto: { supuestosFuente: s.fuente ?? 'no informado', fechaUf: s.uf.fecha },
    valorUfClp: String(m.valor_uf_clp), capitalUf: capital.toString(), vpTotalUf: vp?.toString() ?? null, deficitVpUf: vp ? (vp.gt(capital) ? vp.minus(capital) : decimal(0)).toString() : null, excedenteVpUf: vp ? (capital.gt(vp) ? capital.minus(vp) : decimal(0)).toString() : null, capitalNoAsignableUf: noAsignable, pendienteBaseClp: decimal(base.pendienteUf ?? 0).mul(m.valor_uf_clp).toString(), pagos: detalle, reservas, resumen,
    crecimientoGeneralPct: String(s.perfiles[e.cartola.cliente.perfil_riesgo].max_crecimiento_pct), mesesPrimerPago: String(pagos[0].meses), crecimientoMaximoPct: capital.isZero() ? null : maximo, crecimientoEfectivoPct: resumen?.crecimientoPct ?? null, conclusionBase: alcanza ? 'alcanza' : 'no_alcanza', escenarios, busqueda: capital.isZero() ? null : presupuesto.resultado(), evidencias: evidenciaAccesos(e, asignaciones, true),
    advertencias: [s._aviso ?? 'Los retornos, VP y proyecciones son supuestos, no historia ni promesa.', 'Alternativas limitadas a acuerdos de distribución vigentes; pueden existir opciones fuera de ese universo. Una persona revisa y decide antes de ejecutar.', 'VP: promedio aritmético simple de las categorías efectivas, una vez cada una. No se utiliza el retorno para preferir categorías.', 'Los pendientes futuros no equivalen al capital adicional necesario hoy.', 'Búsqueda determinista de candidatos; optimalidad no demostrada.'], restricciones: [...validacion.restricciones, ...(decimal(noAsignable).gt(0) ? [`${noAsignable} UF no asignables respetando categoría, acceso, liquidez, concentración y perfil.`] : []), ...(capital.isZero() ? ['capital_cero'] : [])] };
}
