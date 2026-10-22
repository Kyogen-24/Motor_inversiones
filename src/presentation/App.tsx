import { useEffect, useRef, useState } from 'react';
import { ChevronRight, Layers3, PanelLeftClose, Upload } from 'lucide-react';
import type { Analisis } from '../domain/model';
import { analizarCartola } from '../application/analizarCartola';
import { leerArchivos, errorDeAnalisis, type Entradas, type TipoEntrada } from '../infrastructure/input';
import AnalysisView from './AnalysisView';
import DataPanel from './DataPanel';
import Navigation, { type Vista } from './Navigation';
const titulosVista = { analisis: 'Análisis de cartola', datos: 'Archivos de entrada', reglas: 'Cómo se calcula' };
const descripcionesVista = { analisis: 'Entiende lo que pagas. Descubre qué puedes mejorar.', datos: 'Carga los archivos para analizar costos y comparar series.', reglas: 'Cada cifra tiene una regla detrás.' };
const nombresVacios = { cartola: '', catalogo: '', acuerdos: '' };

export default function App() {
  const [vista, setVista] = useState<Vista>('datos');
  const [resultado, setResultado] = useState<Analisis | null>(null);
  const [entradas, setEntradas] = useState<Partial<Entradas>>({});
  const [nombres, setNombres] = useState(nombresVacios);
  const [archivos, setArchivos] = useState<Partial<Record<TipoEntrada, File>>>({});
  const [error, setError] = useState('');
  const [erroresArchivo, setErroresArchivo] = useState<Partial<Record<TipoEntrada, string>>>({});
  const [detalleError, setDetalleError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [revision, setRevision] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const operacion = useRef(0);
  const titulo = useRef<HTMLHeadingElement>(null);
  const disparadorMenu = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const cerrarEnEscritorio = () => { if (!media.matches) setMenuAbierto(false); };
    media.addEventListener('change', cerrarEnEscritorio);
    return () => media.removeEventListener('change', cerrarEnEscritorio);
  }, []);
  function cerrarMenu() {
    setMenuAbierto(false);
    requestAnimationFrame(() => disparadorMenu.current?.focus());
  }
  function navegar(next: Vista) { setVista(next); setMenuAbierto(false); requestAnimationFrame(() => titulo.current?.focus()); }
  function seleccionar(tipo: TipoEntrada, archivo: File) {
    operacion.current++;
    setArchivos(prev => ({ ...prev, [tipo]: archivo }));
    setResultado(null); setCargando(false); setError(''); setErroresArchivo(prev => { const siguiente = { ...prev }; delete siguiente[tipo]; return siguiente; }); setDetalleError('');
  }
  function limpiar() {
    operacion.current++;
    setEntradas({}); setResultado(null); setNombres(nombresVacios); setArchivos({});
    setRevision(r => r + 1); setError(''); setErroresArchivo({}); setDetalleError(''); setCargando(false);
  }
  async function analizar() {
    const id = ++operacion.current;
    setCargando(true); setResultado(null); setError(''); setErroresArchivo({}); setDetalleError('');
    try {
      const nuevos: Partial<Entradas> = { ...entradas };
      const etiquetas = { ...nombres };
      const { cambios, errores } = await leerArchivos(archivos);
      if (operacion.current !== id) return;
      if (Object.keys(errores).length) { setErroresArchivo(errores); return; }
      for (const cambio of cambios) {
        Object.assign(nuevos, { [cambio.tipo]: cambio.datos }); etiquetas[cambio.tipo] = cambio.nombre;
      }
      if (!nuevos.cartola || !nuevos.catalogo || !nuevos.acuerdos) throw new Error('Carga cartola, catálogo y acuerdos antes de analizar.');
      const analisis = analizarCartola(nuevos.cartola, nuevos.catalogo, nuevos.acuerdos);
      if (operacion.current !== id) return;
      setEntradas(nuevos); setNombres(etiquetas); setResultado(analisis); setArchivos({}); setRevision(r => r + 1);
      setVista('analisis');
      requestAnimationFrame(() => titulo.current?.focus());
    } catch (err) {
      if (operacion.current !== id) return;
      const archivo = errorDeAnalisis(err);
      if (archivo) { setErroresArchivo({ [archivo.tipo]: archivo.message }); return; }
      setError('No se pudo completar el análisis. Revisa la información para soporte y solicita archivos corregidos.');
      setDetalleError(err instanceof Error ? err.message : 'Error no identificado.');
    } finally { if (operacion.current === id) setCargando(false); }
  }
  const tiposConError = (Object.keys(erroresArchivo) as TipoEntrada[]);
  const etiquetasArchivo = { cartola: 'Cartola del cliente', catalogo: 'Catálogo de productos', acuerdos: 'Acuerdos de distribución' };
  const actualizarDatos = Object.values(nombres).some(Boolean);
  const datosVisibles = vista === 'datos' || (vista === 'analisis' && !resultado);

  return <div className="ts-app">
    <a className="ts-skip" href="#contenido">Saltar al contenido</a>
    <Navigation vista={vista} abierto={menuAbierto} navegar={navegar} alCerrar={cerrarMenu} />
    <div className="ts-main-shell">
      <header className="ts-topbar"><div className="ts-breadcrumb"><button ref={disparadorMenu} className="ts-icon-button ts-mobile-toggle" aria-label="Abrir navegación" aria-expanded={menuAbierto} onClick={() => setMenuAbierto(true)}><PanelLeftClose size={18} /></button><Layers3 size={15} aria-hidden="true" /><span>Espacio de trabajo</span><ChevronRight size={13} aria-hidden="true" /><strong>{titulosVista[vista]}</strong></div></header>
      <main id="contenido" className="ts-main" tabIndex={-1}>
        <div className="ts-page-heading"><div><h1 ref={titulo} tabIndex={-1}>{titulosVista[vista]}</h1><p>{descripcionesVista[vista]}</p></div>
          {vista === 'analisis' && resultado && <button className="ts-button ts-button--primary" onClick={() => navegar('datos')}><Upload size={15} aria-hidden="true" />Actualizar archivos</button>}
        </div>
        {datosVisibles && (error || tiposConError.length > 0) && <div className="ts-error" role="alert"><strong>Revisa los archivos indicados</strong>{error && <p>{error}</p>}{tiposConError.length > 0 && <ul>{tiposConError.map(tipo => <li key={tipo}><a href={`#archivo-${tipo}`}>{etiquetasArchivo[tipo]}: revisar los datos señalados.</a></li>)}</ul>}{detalleError && <details><summary>Información para soporte</summary><p>{detalleError}</p></details>}</div>}
        {datosVisibles && <DataPanel actualizando={actualizarDatos} erroresArchivo={erroresArchivo} nombres={nombres} archivos={archivos} alSeleccionar={seleccionar} alAnalizar={analizar} alLimpiar={limpiar} cargando={cargando} revision={revision} listo={(['cartola', 'catalogo', 'acuerdos'] as const).every(tipo => entradas[tipo] || archivos[tipo])} />}
        {vista === 'reglas' && <Reglas />}
        {resultado && <div hidden={vista !== 'analisis'}><AnalysisView resultado={resultado} /></div>}

      </main>
    </div>
  </div>;
}

function Reglas() {
  return <article className="ts-rules"><section><h2>Un diagnóstico, no una ejecución</h2><p>Varenne analiza costos y compara series del mismo fondo y AGF. No cambia instrumentos ni montos. No ejecuta operaciones. Una persona revisa la evidencia y decide.</p></section><section><h2>Qué entra en el cálculo</h2><dl><div><dt>R02 · Costo anual</dt><dd>Monto declarado × TAC anual porcentual / 100.</dd></div><div><dt>TAC ponderada</dt><dd>Suma de costos anuales / monto computable × 100. Depósitos y efectivo entran con costo cero. Seguros, otros productos y líneas sin identificar se excluyen; ETF solo entran con costo declarado.</dd></div><div><dt>R05 · Ahorro elegible</dt><dd>Diferencia entre TAC actual y menor TAC elegible × monto / 100. Solo se propone un cambio si reduce estrictamente el costo. Un punto porcentual equivale a 100 puntos base.</dd></div><div><dt>Ahorro condicional</dt><dd>Reducción adicional respecto de la mejor opción elegible aplicada, o de la actual. Se muestra separada y exige confirmación escrita, actualización de datos y reevaluación completa.</dd></div></dl></section><section><h2>R01 y R04 · Orden de acceso</h2><p>El acuerdo debe estar activo, empezar antes del corte y no haber terminado antes del corte. La primera coincidencia determina el estado:</p><ol start={0}><li>Sin acuerdo vigente o sin habilitación de la serie: fuera de alcance.</li><li>Serie cerrada: bloqueada.</li><li>Solo APV y cliente sin APV: bloqueada.</li><li>Mandato requerido y ausente: condicional.</li><li>Ticket bajo el mínimo y patrimonio agregado suficiente: condicional.</li><li>Ticket bajo el mínimo: bloqueada.</li><li>Sin restricciones anteriores: elegible.</li></ol><p>Las comisiones no intervienen en costos, selección ni desempates. En empate con la serie actual se conserva la tenencia; entre alternativas más baratas se usa el código en orden lexicográfico.</p></section><section><h2>Precisión y límites</h2><p>Se utiliza el monto declarado y se advierte si cuotas × valor cuota difiere en más de 1 CLP. Se calculan decimales con 40 dígitos significativos; se redondea solo al presentar: CLP al peso, TAC ponderada a cuatro decimales y pesos a dos, con mitades hacia arriba.</p><p>Hasta 10.000 posiciones, 1.000 productos, 100 series por producto y 5 MB por archivo. Números de hasta 16 dígitos significativos; importes entre 0 y 1.000.000.000.000.000, mínimo positivo 0,00000001. Tasas entre 0 y 100 %. Fechas entre 1900 y 2200.</p><p>La fecha de corte determina la vigencia. Si la base es cero, TAC y pesos se muestran como no disponibles. Las posiciones duplicadas se conservan; sus tickets no se suman para alcanzar mínimos.</p></section><section><h2>Alcance de esta entrega</h2><p>Nivel 1: R01, R02, R04 y R05, con independencia de comisiones. No incluye metas, retornos, reasignación entre fondos, controles completos del nivel 3, documento firmado ni huella SHA-256.</p></section></article>;
}
