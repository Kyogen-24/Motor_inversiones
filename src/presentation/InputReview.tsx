import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Acuerdos, Cartola, Catalogo } from '../domain/model';
import { sumar } from '../domain/numeric';
import type { Entradas, TipoEntrada } from '../infrastructure/input';
import { clp, fecha } from './format';

const etiquetas = { cartola: 'Cartola', catalogo: 'Catálogo', acuerdos: 'Acuerdos' };
const formatoCantidad = new Intl.NumberFormat('es-CL', { maximumSignificantDigits: 21 });
const cantidad = (valor: number | null) => valor === null ? 'Sin dato (null)' : formatoCantidad.format(valor);
const montoEntrada = (valor: number) => `$${cantidad(valor)}`;
const tasaEntrada = (valor: number) => `${cantidad(valor)} %`;
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
      {datos[activa] && <Adicionales titulo="Otros campos del archivo" datos={datos[activa]} conocidos={activa === 'cartola' ? ['cliente', 'corte', 'moneda', 'posiciones'] : activa === 'catalogo' ? ['version', 'corte_costos', 'fuente_costos', 'emisores', 'productos'] : ['distribuidor', 'acuerdos', 'productos_sin_serie']} />}
    </section>
  </section>;
}

function Ficha({ campos }: Readonly<{ campos: [string, ReactNode][] }>) {
  return <dl className="ts-review-meta">{campos.map(([titulo, valor]) => <div key={titulo}><dt>{titulo}</dt><dd>{valor}</dd></div>)}</dl>;
}

// Los objetos abiertos del contrato conservan campos adicionales, también anidados.
function camposRecibidos(valor: unknown, ruta: string): string[][] {
  if (valor !== null && typeof valor === 'object') {
    const entradas = Object.entries(valor);
    if (!entradas.length) return [[ruta, Array.isArray(valor) ? 'Lista vacía' : 'Objeto vacío']];
    return entradas.flatMap(([clave, dato]) => camposRecibidos(dato, Array.isArray(valor) ? `${ruta}[${Number(clave) + 1}]` : `${ruta}.${clave}`));
  }
  let texto = String(valor);
  if (valor === null) texto = 'Sin dato (null)';
  else if (typeof valor === 'boolean') texto = siNo(valor);
  else if (typeof valor === 'number') texto = cantidad(valor);
  else if (valor === '') texto = 'Texto vacío';
  return [[ruta, texto]];
}

function Adicionales({ titulo, datos, conocidos }: Readonly<{ titulo: string; datos: object; conocidos: string[] }>) {
  const camposConocidos = new Set(conocidos);
  const filas = Object.entries(datos).filter(([clave]) => !camposConocidos.has(clave)).flatMap(([clave, valor]) => camposRecibidos(valor, clave));
  return filas.length > 0 ? <Tabla titulo={titulo} columnas={['Campo recibido', 'Valor recibido']} filas={filas} /> : null;
}

function Tabla({ titulo, columnas, filas }: Readonly<{ titulo: string; columnas: string[]; filas: string[][] }>) {
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const filtro = busqueda.trim().toLocaleLowerCase('es');
  const resultados = filas.filter(fila => fila.join(' ').toLocaleLowerCase('es').includes(filtro));
  const paginas = Math.max(1, Math.ceil(resultados.length / 50));
  const actual = Math.min(pagina, paginas - 1);
  const numericas = columnas.map(columna => /CLP|TAC|Cuotas|Comisión/.test(columna));
  return <div className="ts-review-table">
    <div className="ts-review-tools"><h3>{titulo}</h3><span>{resultados.length} de {filas.length} registros</span>{filas.length > 10 && <label className="ts-search">Buscar en {titulo.toLowerCase()}<input type="search" value={busqueda} onChange={e => { setBusqueda(e.target.value); setPagina(0); }} /></label>}</div>
    <p className="ts-scroll-hint">Desplaza la tabla para ver todas las columnas.</p>
    {/* El foco permite desplazar la tabla con teclado (S6845). */}
    <section className="ts-table-scroll" tabIndex={0} aria-label={`${titulo}: tabla desplazable`}> {/* NOSONAR */}
      <table><caption className="sr-only">{titulo}</caption><thead><tr>{columnas.map((columna, i) => <th scope="col" key={columna} className={numericas[i] ? 'ts-num' : undefined}>{columna}</th>)}</tr></thead>
        <tbody>{resultados.slice(actual * 50, (actual + 1) * 50).map((fila, indice) => <tr key={indice}>{fila.map((valor, i) => <td key={columnas[i]} className={numericas[i] ? 'ts-num' : undefined}>{valor}</td>)}</tr>)}</tbody>
      </table>
    </section>
    {resultados.length === 0 && <p className="ts-muted">Sin registros.</p>}
    {paginas > 1 && <div className="ts-review-pagination"><button type="button" className="ts-button" disabled={actual === 0} onClick={() => setPagina(actual - 1)}>Anterior</button><span>Página {actual + 1} de {paginas}</span><button type="button" className="ts-button" disabled={actual === paginas - 1} onClick={() => setPagina(actual + 1)}>Siguiente</button></div>}
  </div>;
}

export function CartolaReview({ cartola, catalogo }: Readonly<{ cartola: Cartola; catalogo?: Catalogo }>) {
  return <>
    <Ficha campos={[
      ['Cliente', cartola.cliente.referencia], ['Corte', fecha(cartola.corte)], ['Moneda', cartola.moneda],
      ['Perfil de riesgo', cartola.cliente.perfil_riesgo], ['Perfil evaluado', fecha(cartola.cliente.perfil_evaluado_el)], ['Plan APV', siNo(cartola.cliente.plan_apv)],
      ['Total en cartola', clp(sumar(cartola.posiciones.map(p => String(p.monto_clp))).toString())],
    ]} />
    <Adicionales titulo="Otros datos del cliente" datos={cartola.cliente} conocidos={['referencia', 'perfil_riesgo', 'perfil_evaluado_el', 'plan_apv']} />
    <Tabla titulo="Posiciones de la cartola" columnas={['Fila', 'Producto / identificación', 'Descripción original', 'Serie', 'Cuotas', 'Valor cuota · CLP', 'Monto declarado · CLP']} filas={cartola.posiciones.map((p, indice) => [
      String(indice + 1), nombreProducto(p.producto, catalogo), p.descripcion_original ?? 'No informada',
      p.serie ?? 'Sin serie (null)', cantidad(p.cuotas), cantidad(p.valor_cuota), montoEntrada(p.monto_clp),
    ])} />
    {cartola.posiciones.map((p, indice) => <Adicionales key={indice} titulo={`Otros campos de la posición ${indice + 1}`} datos={p} conocidos={['producto', 'descripcion_original', 'serie', 'cuotas', 'valor_cuota', 'monto_clp']} />)}
  </>;
}

const tiposProducto = { mutual_fund: 'Fondo mutuo', investment_fund: 'Fondo de inversión', equity_etf: 'ETF', time_deposit: 'Depósito a plazo', cash: 'Efectivo', insurance_savings: 'Seguro de ahorro', other: 'Otro' };
export function CatalogoReview({ catalogo }: Readonly<{ catalogo: Catalogo }>) {
  const [busqueda, setBusqueda] = useState('');
  const productos = catalogo.productos.filter(p => `${p.nombre} ${p.id} ${nombreEmisor(p.emisor, catalogo)}`.toLocaleLowerCase('es').includes(busqueda.trim().toLocaleLowerCase('es')));
  return <>
    <Ficha campos={[
      ['Versión', catalogo.version], ['Fecha de costos', fecha(catalogo.corte_costos)], ['Fuente', catalogo.fuente_costos],
      ['Productos', catalogo.productos.length], ['Emisores', catalogo.emisores.length],
    ]} />
    <Tabla titulo="Emisores del catálogo" columnas={['Nombre', 'Identificador', 'Tipo declarado']} filas={catalogo.emisores.map(e => [e.nombre, e.id, e.tipo])} />
    {catalogo.emisores.map(e => <Adicionales key={e.id} titulo={`Otros campos de ${e.nombre}`} datos={e} conocidos={['nombre', 'id', 'tipo']} />)}
    <p className="ts-footnote">Las series muestran los valores normalizados: si se omiten, abierta = Sí, solo APV = No y requiere mandato = No.</p>
    {catalogo.productos.length > 10 && <label className="ts-search ts-review-search">Buscar producto o emisor<input type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></label>}
    <p className="ts-review-count">{productos.length} productos</p>
    {productos.map((p, indice) => <details className="ts-review-item" key={`${p.id}-${indice}`}>
      <summary><span><strong>{p.nombre}</strong><small>{nombreEmisor(p.emisor, catalogo)} · {p.id}</small></span><span>{p.series.length} series</span></summary>
      <Ficha campos={[
        ['Emisor', `${nombreEmisor(p.emisor, catalogo)} · ${p.emisor}`], ['Tipo', `${tiposProducto[p.tipo]} · ${p.tipo}`], ['Categoría', p.categoria], ['Liquidez', `${cantidad(p.liquidez_dias)} días`],
        ...(p.tac_pct === undefined ? [] : [['TAC del producto', tasaEntrada(p.tac_pct)] as [string, ReactNode]]),
      ]} />
      {p.series.length ? <Tabla titulo={`Series de ${p.nombre}`} columnas={['Serie', 'TAC anual', 'Mínimo · CLP', 'Abierta', 'Solo APV', 'Requiere mandato']} filas={p.series.map(s => [s.codigo, tasaEntrada(s.tac_pct), montoEntrada(s.minimo_clp), siNo(s.abierta), siNo(s.solo_apv), siNo(s.requiere_mandato)])} /> : <p className="ts-footnote">Producto sin series.</p>}
      {p.series.map(s => <Adicionales key={s.codigo} titulo={`Otros campos de la serie ${s.codigo}`} datos={s} conocidos={['codigo', 'tac_pct', 'minimo_clp', 'abierta', 'solo_apv', 'requiere_mandato']} />)}
      <Adicionales titulo={`Otros datos de ${p.nombre}`} datos={p} conocidos={['id', 'nombre', 'emisor', 'tipo', 'categoria', 'liquidez_dias', 'tac_pct', 'series']} />
    </details>)}
  </>;
}

export function AcuerdosReview({ acuerdos, catalogo }: Readonly<{ acuerdos: Acuerdos; catalogo?: Catalogo }>) {
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
        ['Mandato', siNo(a.mandato)], ['Patrimonio agregado', montoEntrada(a.patrimonio_agregado_clp)], ['Patrimonio al', fecha(a.patrimonio_al)],
      ]} />
      <Tabla titulo={`Series habilitadas de ${nombreEmisor(a.emisor, catalogo)}`} columnas={['Producto / identificación', 'Serie habilitada', 'Comisión anual de distribución']} filas={Object.entries(a.series).flatMap(([id, series]) => Object.keys(series).length ? Object.entries(series).map(([codigo, comision]) => [nombreProducto(id, catalogo), codigo, tasaEntrada(comision)]) : [[nombreProducto(id, catalogo), 'Sin series habilitadas', 'No informada']])} />
      <Adicionales titulo={`Otros campos del acuerdo ${a.emisor}`} datos={a} conocidos={['emisor', 'estado', 'vigente_desde', 'vigente_hasta', 'mandato', 'patrimonio_agregado_clp', 'patrimonio_al', 'series']} />
    </details>)}
    <Tabla titulo="Productos sin serie" columnas={['Producto / identificación', 'Comisión de distribución']} filas={Object.entries(acuerdos.productos_sin_serie).map(([id, dato]) => [nombreProducto(id, catalogo), tasaEntrada(dato.comision_distribucion_pct)])} />
    {Object.entries(acuerdos.productos_sin_serie).map(([id, dato]) => <Adicionales key={id} titulo={`Otros campos de ${id}`} datos={dato} conocidos={['comision_distribucion_pct']} />)}
    <p className="ts-footnote">Las comisiones se muestran como información del archivo; no intervienen en la selección de series ni se suman a la TAC. La vigencia se evalúa al analizar, usando el corte de la cartola.</p>
  </>;
}
