import type { Acuerdos, Analisis, Cartola, Catalogo } from '../domain/model';
import { diagnosticarPosicion } from '../domain/diagnosis';
import { vigente } from '../domain/eligibility';
import { porcentaje, sumar } from '../domain/numeric';
import { validarNegocio } from '../domain/validation';

export function analizarCartola(cartola: Cartola, catalogo: Catalogo, acuerdos: Acuerdos): Analisis {
  validarNegocio(cartola, catalogo, acuerdos);
  const posiciones = cartola.posiciones.map((posicion, indice) => diagnosticarPosicion(posicion, indice, cartola, catalogo, acuerdos));
  const computables = posiciones.filter(p => p.clasificacion === 'computable');
  const identificadas = posiciones.filter(p => p.clasificacion !== 'unidentified');
  const monto = sumar(posiciones.map(p => p.monto)).toString();
  const computable = sumar(computables.map(p => p.monto)).toString();
  const sinIdentificar = sumar(posiciones.filter(p => p.clasificacion === 'unidentified').map(p => p.monto)).toString();
  const costo = sumar(computables.map(p => p.costo!)).toString();
  const ahorro = sumar(posiciones.map(p => p.ahorro)).toString();
  const costoPosterior = sumar(computables.map(p => p.costoPosterior!)).toString();
  for (const posicion of computables) posicion.peso = porcentaje(posicion.monto, computable);
  return {
    versionReglas: 'nivel-1.1', contexto: structuredClone({ cartola, catalogo, acuerdos }), posiciones,
    totales: {
      monto, computable, identificado: sumar(identificadas.map(p => p.monto)).toString(), sinIdentificar,
      porcentajeSinIdentificar: porcentaje(sinIdentificar, monto),
      excluido: sumar(posiciones.filter(p => p.clasificacion === 'excluded').map(p => p.monto)).toString(),
      costo, tac: porcentaje(costo, computable), ahorro, costoPosterior,
      tacPosterior: porcentaje(costoPosterior, computable),
      condicional: sumar(posiciones.map(p => p.condicional?.adicional ?? '0')).toString(),
      porcentajeAhorro: porcentaje(ahorro, costo), porcentajeCostoPosterior: porcentaje(costoPosterior, costo), computables: computables.length,
      identificadas: identificadas.length, cambios: posiciones.filter(p => p.elegida !== p.entrada.serie).length,
    },
    acuerdosVigentes: acuerdos.acuerdos.filter(a => vigente(a, cartola.corte)).map(a => {
      const emisor = catalogo.emisores.find(e => e.id === a.emisor);
      if (!emisor) throw new Error(`Emisor del acuerdo no encontrado: ${a.emisor}`);
      return emisor.nombre;
    }),
  };
}
