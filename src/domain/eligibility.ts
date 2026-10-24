import type { Acceso, Acuerdo, Cartola, Producto, Serie } from './model';
import { decimal } from './numeric';

export const vigente = (acuerdo: Acuerdo, corte: string) => acuerdo.estado === 'active'
  && acuerdo.vigente_desde < corte && (acuerdo.vigente_hasta === null || acuerdo.vigente_hasta >= corte);

export function evaluarAcceso(serie: Serie, producto: Producto, ticket: number, actual: string | null,
  cartola: Cartola, acuerdo?: Acuerdo): Acceso {
  const activo = !!acuerdo && vigente(acuerdo, cartola.corte);
  const habilitada = activo && Object.hasOwn(acuerdo!.series[producto.id] ?? {}, serie.codigo);
  let regla = 6;
  let estado: Acceso['estado'] = 'eligible';
  let motivo = 'Cumple las condiciones de acceso para este ticket.';
  if (!habilitada) {
    regla = 0; estado = 'out_of_scope';
    motivo = activo ? 'La serie no está habilitada en el acuerdo.' : 'La AGF no tiene acuerdo vigente al corte.';
  } else if (!serie.abierta) {
    regla = 1; estado = 'blocked'; motivo = 'Serie cerrada a nuevas contrataciones.';
  } else if (serie.solo_apv && !cartola.cliente.plan_apv) {
    regla = 2; estado = 'blocked'; motivo = 'Serie exclusiva APV; el cliente no tiene plan APV.';
  } else if (serie.requiere_mandato && !acuerdo!.mandato) {
    regla = 3; estado = 'conditional'; motivo = 'Requiere mandato vigente para esta AGF.';
  } else if (decimal(ticket).lt(serie.minimo_clp)) {
    if (acuerdo!.patrimonio_al > cartola.corte) {
      regla = 5; estado = 'blocked'; motivo = 'El patrimonio agregado es posterior al corte y no acredita el mínimo de inversión.';
    } else if (decimal(acuerdo!.patrimonio_agregado_clp).gte(serie.minimo_clp)) {
      regla = 4; estado = 'conditional'; motivo = 'El ticket no alcanza el mínimo; el patrimonio agregado al corte sí. Requiere confirmación escrita de agregación.';
    } else {
      regla = 5; estado = 'blocked'; motivo = 'El patrimonio agregado es inferior al mínimo de inversión.';
    }
  }
  return {
    serie: { ...serie }, actual: serie.codigo === actual, estado, regla, motivo,
    evidencia: {
      ticket: decimal(ticket).toString(), minimo: decimal(serie.minimo_clp).toString(),
      agregado: acuerdo ? decimal(acuerdo.patrimonio_agregado_clp).toString() : null,
      patrimonioAl: acuerdo?.patrimonio_al ?? null, corte: cartola.corte, mandato: acuerdo?.mandato ?? false,
      planApv: cartola.cliente.plan_apv, habilitada, acuerdoVigente: activo,
      inicio: acuerdo?.vigente_desde ?? null, fin: acuerdo?.vigente_hasta ?? null,
    },
  };
}

export function tareasCondicionales(acceso: Acceso, acuerdo: Acuerdo | undefined): string[] {
  const tareas = ['Obtener confirmación escrita de la AGF antes de cualquier ejecución.'];
  if (acceso.regla === 3) tareas.unshift('Formalizar y comprobar el mandato requerido.');
  if (decimal(acceso.evidencia.ticket).lt(acceso.evidencia.minimo)) {
    if (!acuerdo || acuerdo.patrimonio_al > acceso.evidencia.corte) {
      tareas.unshift('Acreditar patrimonio agregado suficiente al corte o alcanzar el mínimo con el ticket.');
    } else if (decimal(acuerdo.patrimonio_agregado_clp).lt(acceso.evidencia.minimo)) {
      tareas.unshift('Alcanzar el mínimo de inversión; formalizar el mandato por sí solo no lo resuelve.');
    } else {
      tareas.unshift('Confirmar el mínimo y la aceptación del patrimonio agregado con la AGF.');
    }
  }
  tareas.push('Actualizar los datos y volver a evaluar todas las reglas de acceso.');
  return tareas;
}
