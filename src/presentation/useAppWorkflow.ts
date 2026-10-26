import { useEffect, useRef, useState } from 'react';
import type { Analisis } from '../domain/model';
import { analizarCartola } from '../application/analizarCartola';
import { cancelarPropuestas, ejecutarPropuesta } from '../infrastructure/proposalWorker';
import type { PropuestaCosto, PropuestaMeta } from '../domain/proposalModel';
import { leerArchivos, errorDeAnalisis, type Entradas, type TipoEntrada } from '../infrastructure/input';
import { validarNegocio } from '../domain/validation';
import type { Vista } from './Navigation';

const nombresVacios: Record<TipoEntrada, string> = { cartola: '', catalogo: '', acuerdos: '', supuestos: '', meta: '' };

export function useAppWorkflow() {
  const [vista, setVista] = useState<Vista>('datos');
  const [resultado, setResultado] = useState<Analisis | null>(null);
  const [propuesta, setPropuesta] = useState<PropuestaCosto | PropuestaMeta | null>(null);
  const [entradas, setEntradas] = useState<Partial<Entradas>>({});
  const [revisionDatos, setRevisionDatos] = useState<Partial<Entradas>>({});
  const [validado, setValidado] = useState(false);
  const [nombres, setNombres] = useState(nombresVacios);
  const [archivos, setArchivos] = useState<Partial<Record<TipoEntrada, File>>>({});
  const [error, setError] = useState('');
  const [erroresArchivo, setErroresArchivo] = useState<Partial<Record<TipoEntrada, string>>>({});
  const [detalleError, setDetalleError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [revision, setRevision] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const operacion = useRef(0);
  const operacionPropuesta = useRef(0);
  const [calculando, setCalculando] = useState(false);
  useEffect(() => () => { operacionPropuesta.current++; cancelarPropuestas(); }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const cerrarEnEscritorio = () => { if (!media.matches) setMenuAbierto(false); };
    media.addEventListener('change', cerrarEnEscritorio);
    return () => media.removeEventListener('change', cerrarEnEscritorio);
  }, []);
  useEffect(() => {
    const id = ++operacion.current;
    let cancelado = false;
    async function revisar() {
      setCargando(true); setValidado(false);
      try {
        const { cambios, errores } = await leerArchivos(archivos);
        if (cancelado || operacion.current !== id) return;
        const datos = { ...entradas };
        for (const tipo of Object.keys(archivos) as TipoEntrada[]) delete datos[tipo];
        for (const cambio of cambios) Object.assign(datos, { [cambio.tipo]: cambio.datos });
        setRevisionDatos(datos); setErroresArchivo(errores);
        if (errores.cartola || errores.catalogo || errores.acuerdos || !datos.cartola || !datos.catalogo || !datos.acuerdos) return;
        validarNegocio(datos.cartola, datos.catalogo, datos.acuerdos);
        setValidado(true);
      } catch (err) {
        if (cancelado || operacion.current !== id) return;
        const archivo = errorDeAnalisis(err);
        if (archivo) setErroresArchivo({ [archivo.tipo]: archivo.message });
        else setError('No se pudieron revisar los archivos. Vuelve a seleccionarlos.');
      } finally { if (!cancelado && operacion.current === id) setCargando(false); }
    }
    void revisar();
    return () => { cancelado = true; };
  }, [archivos, entradas]);

  function seleccionar(tipo: TipoEntrada, archivo: File) {
    operacionPropuesta.current++; cancelarPropuestas(); setCalculando(false);
    operacion.current++;
    setArchivos(prev => ({ ...prev, [tipo]: archivo }));
    setValidado(false); setCargando(true);
    setRevisionDatos(prev => { const datos = { ...prev }; delete datos[tipo]; return datos; });
    setResultado(null); setPropuesta(null); setError(''); setErroresArchivo(prev => { const siguiente = { ...prev }; delete siguiente[tipo]; return siguiente; }); setDetalleError('');
  }
  function limpiar() {
    operacionPropuesta.current++; cancelarPropuestas(); setCalculando(false);
    operacion.current++;
    setRevisionDatos({}); setValidado(false);
    setEntradas({}); setResultado(null); setPropuesta(null); setNombres(nombresVacios); setArchivos({});
    setRevision(r => r + 1); setError(''); setErroresArchivo({}); setDetalleError(''); setCargando(false);
  }
  function analizar() {
    if (!validado || !revisionDatos.cartola || !revisionDatos.catalogo || !revisionDatos.acuerdos) return;
    setError(''); setDetalleError('');
    try {
      const analisis = analizarCartola(revisionDatos.cartola, revisionDatos.catalogo, revisionDatos.acuerdos);
      const etiquetas = { ...nombres };
      for (const tipo of Object.keys(archivos) as TipoEntrada[]) etiquetas[tipo] = archivos[tipo]!.name;
      setEntradas(revisionDatos); setNombres(etiquetas); setResultado(analisis); setPropuesta(null); setArchivos({}); setRevision(r => r + 1);
      setVista('analisis');
    } catch (err) {
      const archivo = errorDeAnalisis(err);
      if (archivo) { setValidado(false); setErroresArchivo({ [archivo.tipo]: archivo.message }); return; }
      setError('No se pudo completar el análisis. Revisa la información para soporte y solicita archivos corregidos.');
      setDetalleError(err instanceof Error ? err.message : 'Error no identificado.');
    }
  }
  async function generar(modalidad: 'costo' | 'meta') {
    if (calculando || !entradas.cartola || !entradas.catalogo || !entradas.acuerdos || !entradas.supuestos || (modalidad === 'meta' && !entradas.meta)) return;
    const id = ++operacionPropuesta.current;
    setPropuesta(null); setError(''); setDetalleError(''); setCalculando(true); setVista('propuestas');
    try {
      const entrada = { cartola: entradas.cartola, catalogo: entradas.catalogo, acuerdos: entradas.acuerdos, supuestos: entradas.supuestos, ...(modalidad === 'meta' ? { meta: entradas.meta! } : {}) };
      const respuesta = await ejecutarPropuesta(id, modalidad, entrada);
      if (operacionPropuesta.current === id && respuesta.revision === id) setPropuesta(respuesta.resultado);
    } catch (err) {
      if (operacionPropuesta.current !== id || (err instanceof DOMException && err.name === 'AbortError')) return;
      const archivo = errorDeAnalisis(err);
      setError(archivo?.message ?? (err instanceof Error ? err.message : 'No se pudo generar la propuesta.'));
      setDetalleError(err instanceof Error ? err.message : 'Error no identificado.');
    } finally { if (operacionPropuesta.current === id) setCalculando(false); }
  }
  function generarCosto() { void generar('costo'); }
  function generarMeta() { void generar('meta'); }
  return { vista, setVista, resultado, propuesta, entradas, revisionDatos, validado, nombres, archivos, error, erroresArchivo, detalleError, cargando, calculando, revision, menuAbierto, setMenuAbierto, seleccionar, limpiar, analizar, generarCosto, generarMeta };
}
