import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { ChevronRight, Layers3, PanelLeftClose, Upload } from 'lucide-react';
import AnalysisView from './AnalysisView';
import ProposalView from './ProposalView';
import GoalView from './GoalView';
import DataPanel from './DataPanel';
import ClientContext from './ClientContext';
import Navigation, { type Vista } from './Navigation';
import { useAppWorkflow } from './useAppWorkflow';
import type { TipoEntrada } from '../infrastructure/input';
const titulosVista = { analisis: 'Análisis de cartola', datos: 'Archivos de entrada', reglas: 'Cómo se calcula', costo: 'Mejora de costos', meta: 'Planificación de meta' };
const descripcionesVista = { analisis: 'Costos de la cartera y alternativas de ahorro.', datos: 'Cartola, catálogo, acuerdos y parámetros del análisis.', reglas: 'Metodología y criterios de cálculo.', costo: 'Comparación de costos y riesgo de la cartera.', meta: 'Asignación por plazos, cobertura de pagos y escenarios.' };
type Workflow = ReturnType<typeof useAppWorkflow>;

export default function App() {
  return <AppLayout {...useAppWorkflow()} />;
}

function AppLayout(workflow: Workflow) {
  const { vista, setVista, resultado, menuAbierto, setMenuAbierto } = workflow;
  const titulo = useRef<HTMLHeadingElement>(null);
  const disparadorMenu = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (resultado) requestAnimationFrame(() => titulo.current?.focus());
  }, [resultado]);
  useEffect(() => {
    if (workflow.error || workflow.propuesta) requestAnimationFrame(() => titulo.current?.focus());
  }, [workflow.error, workflow.propuesta]);
  function cerrarMenu() {
    setMenuAbierto(false);
    requestAnimationFrame(() => disparadorMenu.current?.focus());
  }
  function navegar(next: Vista) { setVista(next); setMenuAbierto(false); requestAnimationFrame(() => titulo.current?.focus()); }
  return <div className="ts-app">
    <a className="ts-skip" href="#contenido">Saltar al contenido</a>
    <Navigation vista={vista} abierto={menuAbierto} navegar={navegar} alCerrar={cerrarMenu} />
    <div className="ts-main-shell">
      <header className="ts-topbar"><div className="ts-breadcrumb"><button ref={disparadorMenu} className="ts-icon-button ts-mobile-toggle" aria-label="Abrir navegación" aria-expanded={menuAbierto} onClick={() => setMenuAbierto(true)}><PanelLeftClose size={18} /></button><Layers3 size={15} aria-hidden="true" /><span>Espacio de trabajo</span><ChevronRight size={13} aria-hidden="true" /><strong>{titulosVista[vista]}</strong></div></header>
      <main id="contenido" className="ts-main" tabIndex={-1}>
        <PageHeading vista={vista} resultado={resultado} titulo={titulo} alActualizar={() => navegar('datos')} />
        <ClientContext cartola={resultado?.contexto.cartola ?? workflow.revisionDatos.cartola} vista={vista} analizado={Boolean(resultado)} propuestaCalculada={Boolean(workflow.propuesta)} modalidadCalculando={workflow.modalidadCalculando} validado={workflow.validado} cargando={workflow.cargando} error={Boolean(workflow.error)} tieneSupuestos={Boolean(workflow.entradas.supuestos)} tieneMeta={Boolean(workflow.entradas.meta)} />
        {vista !== 'datos' && workflow.error && <div className="ts-error" role="alert"><strong>No se pudo generar la propuesta</strong><p>{workflow.error}</p><button className="ts-button" onClick={() => navegar('datos')}>Revisar archivos de entrada</button><details><summary>Información para soporte</summary><p>{workflow.detalleError}</p></details></div>}
        {workflow.calculando && <p role="status">{workflow.modalidadCalculando === 'costo' ? 'Calculando mejora de costos…' : 'Calculando planificación de meta…'} Puedes seguir navegando.</p>}
        <ContenidoPrincipal workflow={workflow} />
      </main>
    </div>
  </div>;
}

function PageHeading({ vista, resultado, titulo, alActualizar }: Readonly<{ vista: Vista; resultado: Workflow['resultado']; titulo: RefObject<HTMLHeadingElement | null>; alActualizar: () => void }>) {
  return <div className="ts-page-heading"><div><h1 ref={titulo} tabIndex={-1}>{titulosVista[vista]}</h1><p>{descripcionesVista[vista]}</p></div>
    {['analisis', 'costo', 'meta'].includes(vista) && resultado && <button className="ts-button ts-button--primary" onClick={alActualizar}><Upload size={15} aria-hidden="true" />Actualizar archivos</button>}
  </div>;
}

function ContenidoPrincipal({ workflow }: Readonly<{ workflow: Workflow }>) {
  if (workflow.vista === 'datos') return <PanelDatos workflow={workflow} />;
  if (workflow.vista === 'reglas') return <Reglas />;
  if (workflow.vista === 'analisis') return workflow.resultado ? <VistaAnalisis workflow={workflow} /> : <PanelDatos workflow={workflow} />;
  return <VistaPropuestas workflow={workflow} />;
}

function PanelDatos({ workflow }: Readonly<{ workflow: Workflow }>) {
  const tiposConError = Object.keys(workflow.erroresArchivo) as TipoEntrada[];
  const etiquetas: Record<TipoEntrada, string> = { cartola: 'Cartola del cliente', catalogo: 'Catálogo de productos', acuerdos: 'Acuerdos de distribución', supuestos: 'Supuestos', meta: 'Meta' };
  const actualizarDatos = Object.values(workflow.nombres).some(Boolean);
  return <>
    {(workflow.error || tiposConError.length > 0) && <div className="ts-error" role="alert"><strong>Revisa los archivos indicados</strong>{workflow.error && <p>{workflow.error}</p>}{tiposConError.length > 0 && <ul>{tiposConError.map(tipo => <li key={tipo}><a href={`#archivo-${tipo}`}>{etiquetas[tipo]}: revisar los datos señalados.</a></li>)}</ul>}{workflow.detalleError && <details><summary>Información para soporte</summary><p>{workflow.detalleError}</p></details>}</div>}
    <DataPanel datos={workflow.revisionDatos} validado={workflow.validado} actualizando={actualizarDatos} erroresArchivo={workflow.erroresArchivo} nombres={workflow.nombres} archivos={workflow.archivos} alSeleccionar={workflow.seleccionar} alAnalizar={workflow.analizar} alLimpiar={workflow.limpiar} cargando={workflow.cargando} revision={workflow.revision} listo={workflow.validado && !workflow.calculando} />
  </>;
}

function VistaAnalisis({ workflow }: Readonly<{ workflow: Workflow }>) {
  return <AnalysisView resultado={workflow.resultado!} />;
}

export function EstadoPropuestas({ workflow, modalidad }: Readonly<{ workflow: Pick<Workflow, 'resultado' | 'entradas'>; modalidad: 'costo' | 'meta' }>) {
  if (!workflow.resultado) return <p className="ts-muted">Carga los archivos de entrada y pulsa Analizar cartola.</p>;
  if (!workflow.entradas.supuestos) return <p className="ts-muted">Agrega los supuestos y vuelve a analizar la cartola para calcular las propuestas.</p>;
  if (modalidad === 'meta' && !workflow.entradas.meta) return <p className="ts-muted">Agrega la meta y vuelve a analizar la cartola para evaluar sus pagos.</p>;
  return null;
}

function VistaPropuestas({ workflow }: Readonly<{ workflow: Workflow }>) {
  const { propuesta } = workflow;
  return <>{!propuesta && <EstadoPropuestas workflow={workflow} modalidad={workflow.vista === 'costo' ? 'costo' : 'meta'} />}{!workflow.resultado && <button className="ts-button" onClick={() => workflow.setVista('datos')}>Ir a archivos de entrada</button>}{propuesta && (propuesta.modalidad === 'costo' ? <ProposalView propuesta={propuesta} /> : <GoalView propuesta={propuesta} />)}</>;
}

function Reglas() {
  return <article className="ts-rules">
    <section><h2>Costos de la cartera</h2><p>Costo anual = monto invertido × TAC / 100. La TAC ponderada se calcula sobre el capital computable.</p><p>Efectivo y depósitos tienen costo cero. Seguros, productos sin costo verificable y posiciones sin identificar se presentan por separado.</p></section>
    <section><h2>Acceso a series</h2><p>El acuerdo debe estar activo al corte, con inicio anterior y término igual o posterior. La primera condición aplicable determina el acceso:</p><ol><li>Sin acuerdo vigente o sin habilitación de la serie: fuera de alcance.</li><li>Serie cerrada: bloqueada.</li><li>Serie APV sin plan APV: bloqueada.</li><li>Mandato requerido y ausente: condicional.</li><li>Ticket bajo el mínimo con patrimonio suficiente al corte: condicional.</li><li>Ticket bajo el mínimo sin patrimonio válido suficiente: bloqueada.</li><li>Sin restricciones anteriores: elegible.</li></ol><p>Las condiciones requieren confirmación y una nueva evaluación. Una tenencia actual no autoriza por sí sola nuevas compras.</p></section>
    <section><h2>Comparación de costos</h2><p>El ahorro anual es la diferencia de TAC aplicada al monto invertido. El ahorro condicional se muestra separado y parte de la mejor alternativa elegible o de la tenencia actual.</p><p>Las propuestas de costo mantienen o reducen la volatilidad, respetan concentración y perfil y conservan categorías salvo ajustes necesarios para cumplir esas restricciones. Las comisiones no intervienen en selección, costos ni desempates.</p></section>
    <section><h2>Asignación para metas</h2><p>Los pagos se ordenan por fecha y se financian con inversiones acordes al plazo. El VP usa el retorno real bruto supuesto de las categorías seleccionadas. El capital se reserva para los pagos próximos y el excedente se destina al tramo más largo.</p><p>El máximo de crecimiento se reduce al acercarse el primer pago: máximo del perfil × min(1, meses / 24). La cobertura corresponde a las UF efectivamente pagadas. La conclusión base incluye los costos y distingue pagos pendientes de déficit de VP.</p></section>
    <section><h2>Proyecciones (supuesto)</h2><p>Retorno real neto = retorno bruto ponderado − TAC ponderada. Los escenarios ajustan el bruto en −1,5 puntos porcentuales, sin ajuste y +1,5 puntos porcentuales.</p><p>El costo acumulado suma el saldo medio de cada período por la TAC y el plazo. Se consideran aniversarios mensuales, fechas de liquidación y pagos, con días reales / 365,25.</p></section>
    <section><h2>Fuentes y valorización</h2><p>Los cálculos utilizan los archivos cargados y la fecha de corte. Las equivalencias CLP/UF usan el valor y la fecha de referencia indicados. Retornos y volatilidad son supuestos declarados.</p><p>El monto declarado es la base del análisis. Se advierten diferencias superiores a 1 CLP respecto de cuotas por valor cuota.</p></section>
  </article>;
}
