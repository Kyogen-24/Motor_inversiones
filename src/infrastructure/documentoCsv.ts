import { decimal } from '../domain/numeric';
import { filasCsv } from './csv';

type Registro = { ruta: string; tipo: string; valor: string };
const tipos = new Set(['objeto', 'lista', 'texto', 'numero', 'booleano', 'nulo']);

function leerValor({ ruta, tipo, valor }: Registro): unknown {
  switch (tipo) {
    case 'objeto':
    case 'lista':
    case 'nulo':
      if (valor !== '') throw new Error(`CSV, ruta «${ruta}»: ${tipo} requiere una celda valor vacía.`);
      return tipo === 'objeto' ? {} : tipo === 'lista' ? [] : null;
    case 'texto': return valor;
    case 'booleano':
      if (valor !== 'true' && valor !== 'false') throw new Error(`CSV, ruta «${ruta}»: usa true o false.`);
      return valor === 'true';
    case 'numero': {
      const texto = valor.trim().replace(',', '.');
      if (!/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(texto)) throw new Error(`CSV, ruta «${ruta}»: número inválido; no uses separadores de miles.`);
      const numero = Number(texto);
      if (!Number.isFinite(numero) || decimal(texto).sd() > 16 || !decimal(texto).eq(decimal(numero))) {
        throw new Error(`CSV, ruta «${ruta}»: número fuera de precisión; se admiten hasta 16 dígitos significativos.`);
      }
      return numero;
    }
    default: throw new Error(`CSV, ruta «${ruta}»: tipo no admitido.`);
  }
}

/** JSON Pointer conserva claves numéricas, barras y tildes sin inferir estructuras. */
function partesRuta(ruta: string): string[] {
  if (ruta === '') return [];
  if (!ruta.startsWith('/') || /~(?![01])/.test(ruta)) throw new Error(`CSV: ruta inválida «${ruta}». Usa JSON Pointer, con / entre campos.`);
  return ruta.slice(1).split('/').map(parte => parte.replaceAll('~1', '/').replaceAll('~0', '~'));
}

export function interpretarDocumentoCsv(contenido: string): unknown {
  const [cabecera, ...filas] = filasCsv(contenido.replace(/^\uFEFF/, ''), 100000);
  if (!cabecera || cabecera.length !== 3 || new Set(cabecera).size !== 3 || !['ruta', 'tipo', 'valor'].every(c => cabecera.includes(c))) {
    throw new Error('CSV: este archivo requiere las columnas ruta, tipo y valor.');
  }
  const indices = ['ruta', 'tipo', 'valor'].map(c => cabecera.indexOf(c));
  const registros = new Map<string, { tipo: string; valor: unknown; partes: string[] }>();
  for (const [indice, fila] of filas.entries()) {
    if (fila.length !== 3) throw new Error(`CSV, registro ${indice + 2}: se requieren tres campos.`);
    const [ruta, tipo, valor] = indices.map(i => fila[i]);
    if (registros.has(ruta)) throw new Error(`CSV: ruta repetida «${ruta}».`);
    if (!tipos.has(tipo)) throw new Error(`CSV, registro ${indice + 2}: tipo no admitido «${tipo}».`);
    const partes = partesRuta(ruta);
    if (partes.length > 50) throw new Error('CSV: la profundidad máxima es de 50 campos.');
    registros.set(ruta, { tipo, valor: leerValor({ ruta, tipo, valor }), partes });
  }
  const raiz = registros.get('');
  if (!raiz || raiz.tipo !== 'objeto') throw new Error('CSV: incluye la raíz con ruta vacía, tipo objeto y valor vacío.');
  for (const [ruta, registro] of registros) {
    if (ruta === '') continue;
    const separador = ruta.lastIndexOf('/');
    const padre = registros.get(ruta.slice(0, separador));
    if (!padre || (padre.tipo !== 'objeto' && padre.tipo !== 'lista')) throw new Error(`CSV, ruta «${ruta}»: falta un objeto o lista padre.`);
    const clave = registro.partes[registro.partes.length - 1];
    if (padre.tipo === 'lista' && (!/^(0|[1-9]\d*)$/.test(clave) || Number(clave) >= 100000)) {
      throw new Error(`CSV, ruta «${ruta}»: índice de lista inválido.`);
    }
    // DefineProperty trata __proto__ como dato, igual que JSON.parse.
    Object.defineProperty(padre.valor, clave, { value: registro.valor, enumerable: true, writable: true, configurable: true });
  }
  for (const registro of registros.values()) {
    if (registro.tipo === 'lista') {
      const lista = registro.valor as unknown[];
      if (Object.keys(lista).length !== lista.length) throw new Error('CSV: los índices de cada lista deben ser consecutivos desde 0.');
    }
  }
  return raiz.valor;
}
