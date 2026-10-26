import { Check } from 'lucide-react';
import type { Cartola } from '../domain/model';
import type { Vista } from './Navigation';
import { fecha } from './format';

type Props = Readonly<{ cartola?: Cartola; vista: Vista; analizado: boolean; propuestaCalculada: boolean; modalidadCalculando: 'costo' | 'meta' | null; validado: boolean; cargando: boolean; error: boolean; tieneSupuestos: boolean; tieneMeta: boolean }>;

export default function ClientContext(props: Props) {
  const { cartola, vista, analizado, propuestaCalculada, validado, cargando, error } = props;
  if (!cartola) return null;
  const { cliente, corte } = cartola;
  const completo = vista === 'datos' ? validado && !cargando && !error : vista === 'analisis' ? analizado : (vista === 'costo' || vista === 'meta') && propuestaCalculada;
  const estado = estadoCliente(props);
  return <section className="ts-client-strip" aria-label="Cliente del análisis"><div className="ts-client-id"><span className="ts-avatar">{cliente.referencia.slice(0, 2)}</span><div><strong>{cliente.referencia}</strong><span>Cliente</span></div></div><dl><div><dt>Fecha de corte</dt><dd>{fecha(corte)}</dd></div><div><dt>Perfil declarado</dt><dd className="ts-capitalize">{cliente.perfil_riesgo}</dd></div><div><dt>Plan APV</dt><dd>{cliente.plan_apv ? 'Sí' : 'No'}</dd></div></dl><span className="ts-analysis-ready">{completo && <Check size={13} aria-hidden="true" />}{estado}</span></section>;
}

function estadoCliente(props: Props): string {
  switch (props.vista) {
    case 'reglas': return 'Reglas de cálculo';
    case 'datos':
      if (props.cargando) return 'Revisando archivos…';
      if (props.error) return 'Revisar archivos';
      return props.validado ? 'Archivos listos para analizar' : 'Archivos pendientes';
    case 'analisis': return props.analizado ? 'Diagnóstico calculado' : 'Diagnóstico pendiente';
    default: return estadoPropuesta(props);
  }
}

function estadoPropuesta(props: Props): string {
  const nombre = props.vista === 'costo' ? 'Mejora de costos' : 'Planificación de meta';
  if (props.propuestaCalculada) return `${nombre} calculada`;
  if (props.modalidadCalculando === props.vista) return `Calculando ${nombre.toLowerCase()}…`;
  if (!props.analizado) return 'Análisis de cartola pendiente';
  if (!props.tieneSupuestos) return 'Faltan supuestos';
  if (props.vista === 'meta' && !props.tieneMeta) return 'Falta cargar la meta';
  if (props.modalidadCalculando) return 'En espera de mejora de costos';
  return props.error ? `${nombre}: cálculo pendiente de revisión` : `${nombre} pendiente`;
}
