import { Check, CircleAlert, FileJson, Upload, RotateCcw } from 'lucide-react';
import InputReview from './InputReview';
import type { Entradas, TipoEntrada } from '../infrastructure/input';

const fuentes = [
  { tipo: 'cartola', titulo: 'Cartola del cliente', descripcion: 'Posiciones, montos, corte y condición APV.' },
  { tipo: 'catalogo', titulo: 'Catálogo de productos', descripcion: 'Emisores, series, costos y mínimos.' },
  { tipo: 'acuerdos', titulo: 'Acuerdos de distribución', descripcion: 'Vigencia, habilitación, mandato y patrimonio.' },
  { tipo: 'supuestos', titulo: 'Supuestos', descripcion: 'Retornos, volatilidad, perfiles, tramos y escenarios.' },
  { tipo: 'meta', titulo: 'Meta', descripcion: 'Capital asignado y desembolsos futuros en UF.' },
] as const;
interface Props {
  readonly datos: Partial<Entradas>;
  readonly validado: boolean;
  readonly actualizando: boolean;
  readonly erroresArchivo: Partial<Record<TipoEntrada, string>>;
  readonly nombres: Partial<Record<TipoEntrada, string>>;
  readonly archivos: Partial<Record<TipoEntrada, File>>;
  readonly alSeleccionar: (tipo: TipoEntrada, archivo: File) => void;
  readonly alAnalizar: () => void;
  readonly alLimpiar: () => void;
  readonly cargando: boolean;
  readonly revision: number;
  readonly listo: boolean;
}
export default function DataPanel({ datos, validado, actualizando, erroresArchivo, nombres, archivos, alSeleccionar, alAnalizar, alLimpiar, cargando, revision, listo }: Props) {
  const disponibles = fuentes.filter(f => archivos[f.tipo] || nombres[f.tipo]);
  const faltantes = fuentes.filter(f => !archivos[f.tipo] && !nombres[f.tipo]);
  return <section className="ts-input-panel" aria-labelledby="datos-title">
    <div className="ts-section-heading"><div><h2 id="datos-title">{actualizando ? 'Actualizar archivos' : 'Selecciona archivos de entrada'}</h2><p>Cartola, catálogo y acuerdos para el diagnóstico. Supuestos para proyecciones y meta para evaluar pagos.</p></div></div>
    <p className="ts-upload-progress" aria-live="polite">{disponibles.length} de 5 archivos disponibles.{faltantes.length > 0 && ` Falta: ${faltantes.map(f => f.titulo.toLowerCase()).join(', ')}.`}</p>
    <div className="ts-source-grid">{fuentes.map(f => {
      const nombre = archivos[f.tipo]?.name || nombres[f.tipo];
      const seleccionado = Boolean(nombre);
      const invalido = Boolean(erroresArchivo[f.tipo]);
      let clase = 'ts-source';
      let estado = 'Pendiente';
      if (seleccionado) { clase += ' ts-source--selected'; estado = 'Validado'; }
      if (archivos[f.tipo]) estado = 'Pendiente de validar';
      if (datos[f.tipo]) estado = 'Formato válido';
      if (validado) estado = 'Archivo válido';
      if (cargando && seleccionado) estado = 'Revisando…';
      if (invalido) { clase = 'ts-source ts-source--error'; estado = 'Revisar archivo'; }
      return <div className={clase} key={f.tipo}>
        <div className="ts-source-heading"><FileJson size={22} strokeWidth={1.5} aria-hidden="true" />
          <output className="ts-source-status">{invalido && <CircleAlert size={14} aria-hidden="true" />}{!invalido && seleccionado && <Check size={14} aria-hidden="true" />}{estado}</output>
        </div>
        <h3>{f.titulo}</h3><p>{f.descripcion}</p>
        <div className="ts-file-picker">
          <input className="sr-only" key={`${f.tipo}-${revision}`} id={`archivo-${f.tipo}`} type="file" accept=".json,application/json" disabled={cargando}
            aria-invalid={invalido || undefined} aria-label={`${seleccionado ? 'Cambiar' : 'Seleccionar'} JSON: ${f.titulo}`} aria-describedby={`nombre-${f.tipo}${invalido ? ` error-${f.tipo}` : ''}`}
            onChange={e => { const file = e.target.files?.[0]; if (file) alSeleccionar(f.tipo, file); }} />
          <label htmlFor={`archivo-${f.tipo}`} className="ts-file-label"><Upload size={15} aria-hidden="true" />{seleccionado ? 'Cambiar archivo' : 'Seleccionar JSON'}</label>
        </div>
        <span id={`nombre-${f.tipo}`} className="ts-file-name" title={nombre || undefined}>{nombre || 'Ningún archivo seleccionado'}</span>
        {archivos[f.tipo] && nombres[f.tipo] && <p className="ts-replacement-note">Reemplazará a {nombres[f.tipo]}.</p>}
        {!archivos[f.tipo] && nombres[f.tipo] && <p className="ts-replacement-note">Se conservará en el próximo análisis.</p>}
        {invalido && <p className="ts-file-error" id={`error-${f.tipo}`}>{erroresArchivo[f.tipo]}</p>}
      </div>;
    })}</div>
    <div className="ts-input-actions"><button className="ts-button ts-button--primary" onClick={alAnalizar} disabled={cargando || !listo}><Upload size={16} aria-hidden="true" />{cargando ? 'Revisando archivos…' : 'Analizar cartola'}</button>
      <button className="ts-button" onClick={alLimpiar} disabled={cargando}><RotateCcw size={15} aria-hidden="true" />Limpiar datos</button>
      <p>Hasta 5 MB por archivo.</p>
    </div>
    <InputReview datos={datos} nombres={{ cartola: archivos.cartola?.name || nombres.cartola, catalogo: archivos.catalogo?.name || nombres.catalogo, acuerdos: archivos.acuerdos?.name || nombres.acuerdos, supuestos: archivos.supuestos?.name || nombres.supuestos, meta: archivos.meta?.name || nombres.meta }} errores={erroresArchivo} />
  </section>;
}
