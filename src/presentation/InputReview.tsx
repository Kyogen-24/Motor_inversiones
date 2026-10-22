import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Acuerdos, Cartola, Catalogo } from '../domain/model';
import { sumar } from '../domain/numeric';
import type { Entradas, TipoEntrada } from '../infrastructure/input';
import { clp, fecha, pct } from './format';

const etiquetas = { cartola: 'Cartola', catalogo: 'Catálogo', acuerdos: 'Acuerdos' };
const cantidad = (valor: number | null) => valor === null ? 'No informado' : new Intl.NumberFormat('es-CL', { maximumFractionDigits: 8 }).format(valor);
const siNo = (valor: boolean) => valor ? 'Sí' : 'No';
const nombreProducto = (id: string | null, catalogo?: Catalogo) => {
  if (id === null) return 'Sin identificar';
  const producto = catalogo?.productos.find(p => p.id === id);
  return producto ? `${producto.nombre} · ${id}` : id;
};
const nombreEmisor = (id: string, catalogo?: Catalogo) => catalogo?.emisores.find(e => e.id === id)?.nombre ?? id;

export default function InputReview({ datos, nombres, errores }: Readonly<{
  datos: Partial<Entradas>;
  nombres: Record<TipoEntrada, string>;
  errores: Partial<Record<TipoEntrada, string>>;
}>) {
  const [activa, setActiva] = useState<TipoEntrada>('cartola');
  if (!Object.values(nombres).some(Boolean)) return null;
  return <section className="ts-input-review" aria-labelledby="revision-title">
    <div className="ts-section-heading"><h2 id="revision-title">Revisa los datos</h2></div>
    <nav className="ts-tabs" aria-label="Datos de los archivos">{(Object.keys(etiquetas) as TipoEntrada[]).map(tipo =>
      <button key={tipo} type="button" className={activa === tipo ? 'is-active' : ''} aria-pressed={activa === tipo} aria-controls="revision-contenido" onClick={() => setActiva(tipo)}>{etiquetas[tipo]}</button>
    )}</nav>
    <section id="revision-contenido" aria-label={etiquetas[activa]}>
      <p className="ts-review-file">{nombres[activa] || 'Archivo sin seleccionar'}</p>
      {errores[activa] && <p className="ts-review-warning">Este archivo requiere correcciones. Revisa el aviso de su tarjeta.</p>}
      {!datos[activa] && <p className="ts-muted">Selecciona un archivo con formato válido para ver su contenido.</p>}
      {activa === 'cartola' && datos.cartola && <CartolaReview cartola={datos.cartola} catalogo={datos.catalogo} />}
      {activa === 'catalogo' && datos.catalogo && <CatalogoReview catalogo={datos.catalogo} />}
      {activa === 'acuerdos' && datos.acuerdos && <AcuerdosReview acuerdos={datos.acuerdos} catalogo={datos.catalogo} />}
    </section>
  </section>;
}

function Ficha({ campos }: Readonly<{ campos: [string, ReactNode][] }>) {
  return <dl className="ts-review-meta">{campos.map(([titulo, valor]) => <div key={titulo}><dt>{titulo}</dt><dd>{valor}</dd></div>)}</dl>;
}

function Tabla({ titulo, columnas, filas }: Readonly<{ titulo: string; columnas: string[]; filas: string[][] }>) {
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const filtro = busqueda.trim().toLocaleLowerCase('es');
  const resultados = filas.filter(fila => fila.join(' ').toLocaleLowerCase('es').includes(filtro));
  const paginas = Math.max(1, Math.ceil(resultados.length / 50));
  const actual = Math.min(pagina, paginas - 1);
  return <div className="ts-review-table">
    <div className="ts-review-tools"><span>{resultados.length} registros</span>{filas.length > 10 && <label className="ts-search">Buscar en {titulo.toLowerCase()}<input type="search" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(0); }} /></label>}</div>
    <p className="ts-scroll-hint">Desplaza la tabla para ver todas las columnas.</p>
    {/* El foco permite desplazar la tabla con teclado (S6845). */}
    <section className="ts-table-scroll" tabIndex={0} aria-label={`${titulo}: tabla desplazable`}> {/* NOSONAR */}
      <table><caption className="sr-only">{titulo}</caption><thead><tr>{columnas.map(columna => <th scope="col" key={columna}>{columna}</th>)}</tr></thead>
        <tbody>{resultados.slice(actual * 50, (actual + 1) * 50).map((fila, indice) => <tr key={indice}>{fila.map((valor, i) => <td key={columnas[i]}>{valor}</td>)}</tr>)}</tbody>
      </table>
    </section>
    {resultados.length === 0 && <p className="ts-muted">Sin registros.</p>}
    {paginas > 1 && <div className="ts-review-pagination"><button type="button" className="ts-button" disabled={actual === 0} onClick={() => setPagina(actual - 1)}>Anterior</button><span>Página {actual + 1} de {paginas}</span><button type="button" className="ts-button" disabled={actual === paginas - 1} onClick={() => setPagina(actual + 1)}>Siguiente</button></div>}
  </div>;
}

function CartolaReview({ cartola, catalogo }: Readonly<{ cartola: Cartola; catalogo?: Catalogo }>) {
  return <>
    <Ficha campos={[
      ['Cliente', cartola.cliente.referencia], ['Corte', fecha(cartola.corte)], ['Moneda', cartola.moneda],
      ['Perfil de riesgo', cartola.cliente.perfil_riesgo], ['Perfil evaluado', fecha(cartola.cliente.perfil_evaluado_el)], ['Plan APV', siNo(cartola.cliente.plan_apv)],
      ['Total en cartola', clp(sumar(cartola.posiciones.map(p => String(p.monto_clp))).toString())],
    ]} />
    <Tabla titulo="Posiciones de la cartola" columnas={['Producto / identificación', 'Serie', 'Cuotas', 'Valor cuota · CLP', 'Monto · CLP']} filas={cartola.posiciones.map(p => [
      p.producto === null ? p.descripcion_original ?? 'Sin identificar' : nombreProducto(p.producto, catalogo),
      p.serie ?? 'Sin serie', cantidad(p.cuotas), cantidad(p.valor_cuota), clp(String(p.monto_clp)),
    ])} />
  </>;
}

const tiposProducto = { mutual_fund: 'Fondo mutuo', investment_fund: 'Fondo de inversión', equity_etf: 'ETF', time_deposit: 'Depósito a plazo', cash: 'Efectivo', insurance_savings: 'Seguro de ahorro', other: 'Otro' };
function CatalogoReview({ catalogo }: Readonly<{ catalogo: Catalogo }>) {
  const [busqueda, setBusqueda] = useState('');
  const productos = catalogo.productos.filter(p => `${p.nombre} ${p.id} ${nombreEmisor(p.emisor, catalogo)}`.toLocaleLowerCase('es').includes(busqueda.trim().toLocaleLowerCase('es')));
  return <>
    <Ficha campos={[
      ['Versión', catalogo.version], ['Fecha de costos', fecha(catalogo.corte_costos)], ['Fuente', catalogo.fuente_costos],
      ['Productos', catalogo.productos.length], ['Emisores', catalogo.emisores.length],
    ]} />
    <details className="ts-review-item"><summary>Emisores del catálogo</summary><Tabla titulo="Emisores" columnas={['Nombre', 'Identificador', 'Tipo declarado']} filas={catalogo.emisores.map(e => [e.nombre, e.id, e.tipo])} /></details>
    {catalogo.productos.length > 10 && <label className="ts-search ts-review-search">Buscar producto o emisor<input type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label>}
    <p className="ts-review-count">{productos.length} productos</p>
    {productos.map((p, indice) => <details className="ts-review-item" key={`${p.id}-${indice}`}>
      <summary><span><strong>{p.nombre}</strong><small>{nombreEmisor(p.emisor, catalogo)} · {p.id}</small></span><span>{p.series.length} series</span></summary>
      <Ficha campos={[
        ['Tipo', tiposProducto[p.tipo]], ['Categoría', p.categoria], ['Liquidez', `${cantidad(p.liquidez_dias)} días`],
        ...(p.tac_pct === undefined ? [] : [['TAC del producto', pct(String(p.tac_pct))] as [string, ReactNode]]),
      ]} />
      <Tabla titulo={`Series de ${p.nombre}`} columnas={['Serie', 'TAC anual', 'Mínimo · CLP', 'Abierta', 'Solo APV', 'Requiere mandato']} filas={p.series.map(s => [s.codigo, pct(String(s.tac_pct)), clp(String(s.minimo_clp)), siNo(s.abierta), siNo(s.solo_apv), siNo(s.requiere_mandato)])} />
    </details>)}
  </>;
}

function AcuerdosReview({ acuerdos, catalogo }: Readonly<{ acuerdos: Acuerdos; catalogo?: Catalogo }>) {
  const [busqueda, setBusqueda] = useState('');
  const visibles = acuerdos.acuerdos.filter(a => `${a.emisor} ${nombreEmisor(a.emisor, catalogo)}`.toLocaleLowerCase('es').includes(busqueda.trim().toLocaleLowerCase('es')));
  return <>
    <Ficha campos={[[ 'Distribuidor', acuerdos.distribuidor ], ['Acuerdos', acuerdos.acuerdos.length]]} />
    {acuerdos.acuerdos.length > 10 && <label className="ts-search ts-review-search">Buscar emisor<input type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label>}
    {visibles.length === 0 && <p className="ts-muted">Sin acuerdos.</p>}
    {visibles.map((a, indice) => <details className="ts-review-item" key={`${a.emisor}-${indice}`}>
      <summary><span><strong>{nombreEmisor(a.emisor, catalogo)}</strong><small>{a.emisor}</small></span><span>{a.estado === 'active' ? 'Activo' : a.estado}</span></summary>
      <Ficha campos={[
        ['Estado declarado', a.estado], ['Inicio', fecha(a.vigente_desde)], ['Fin', a.vigente_hasta === null ? 'Sin fecha de fin' : fecha(a.vigente_hasta)],
        ['Mandato', siNo(a.mandato)], ['Patrimonio agregado', clp(String(a.patrimonio_agregado_clp))], ['Patrimonio al', fecha(a.patrimonio_al)],
      ]} />
      <Tabla titulo={`Series habilitadas de ${nombreEmisor(a.emisor, catalogo)}`} columnas={['Producto / identificación', 'Serie habilitada', 'Comisión de distribución']} filas={Object.entries(a.series).flatMap(([id, series]) => Object.entries(series).map(([codigo, comision]) => [nombreProducto(id, catalogo), codigo, pct(String(comision))]))} />
    </details>)}
    <details className="ts-review-item"><summary>Productos sin serie</summary><Tabla titulo="Comisiones de productos sin serie" columnas={['Producto / identificación', 'Comisión de distribución']} filas={Object.entries(acuerdos.productos_sin_serie).map(([id, dato]) => [nombreProducto(id, catalogo), pct(String(dato.comision_distribucion_pct))])} /></details>
  </>;
}
