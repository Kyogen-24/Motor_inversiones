import { decimal, validarNumero } from '../domain/numeric';
import { filasCsv } from './csv';

const contexto = ['referencia', 'perfil_riesgo', 'perfil_evaluado_el', 'plan_apv', 'corte', 'moneda'];
const obligatorias = [...contexto, 'producto', 'serie', 'cuotas', 'valor_cuota', 'monto_clp'];
const permitidas = new Set([...obligatorias, 'descripcion_original']);

function numeroCsv(valor: string, campo: string, registro: number): number {
  const texto = valor.trim();
  if (!/^-?\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?$/.test(texto)) {
    throw new Error(`CSV, registro ${registro}, ${campo}: usa un número sin separadores de miles.`);
  }
  const normalizado = texto.replace(',', '.');
  const numero = Number(normalizado);
  if (decimal(normalizado).sd() > 16 || !decimal(normalizado).eq(decimal(numero))) {
    throw new Error(`CSV, registro ${registro}, ${campo}: el número supera la precisión admitida de 16 dígitos significativos.`);
  }
  validarNumero(numero, `CSV, registro ${registro}, ${campo}`);
  return numero;
}

/** Convierte el formato tabular; input.ts aplica después el mismo esquema que al JSON. */
export function interpretarCartolaCsv(contenido: string): unknown {
  const [cabecera, ...filas] = filasCsv(contenido.replace(/^\uFEFF/, ''));
  if (!cabecera || !filas.length) throw new Error('CSV: incluye la cabecera y al menos una posición.');
  if (new Set(cabecera).size !== cabecera.length) throw new Error('CSV: la cabecera contiene columnas repetidas.');
  const columnas = new Set(cabecera);
  const faltantes = obligatorias.filter(columna => !columnas.has(columna));
  if (faltantes.length) throw new Error(`CSV: faltan columnas obligatorias: ${faltantes.join(', ')}.`);
  const desconocidas = cabecera.filter(columna => !permitidas.has(columna));
  if (desconocidas.length) throw new Error(`CSV: columnas no admitidas: ${desconocidas.join(', ')}.`);
  const registros = filas.map((fila, indice) => {
    if (fila.length !== cabecera.length) throw new Error(`CSV, registro ${indice + 2}: la cantidad de campos no coincide con la cabecera.`);
    return Object.fromEntries(cabecera.map((columna, i) => [columna, fila[i]]));
  });
  const primero = registros[0];
  const posiciones = registros.map((fila, indice) => {
    const registro = indice + 2;
    for (const campo of contexto) {
      if (fila[campo] !== primero[campo]) throw new Error(`CSV, registro ${registro}, ${campo}: todas las posiciones deben tener el mismo cliente, perfil, corte y moneda.`);
    }
    const nullable = (valor: string) => valor === '' || valor === 'null' ? null : valor;
    const numeroNullable = (campo: string) => nullable(fila[campo]) === null ? null : numeroCsv(fila[campo], campo, registro);
    return {
      producto: nullable(fila.producto), serie: nullable(fila.serie),
      ...(fila.descripcion_original ? { descripcion_original: fila.descripcion_original } : {}),
      cuotas: numeroNullable('cuotas'), valor_cuota: numeroNullable('valor_cuota'),
      monto_clp: numeroCsv(fila.monto_clp, 'monto_clp', registro),
    };
  });
  if (primero.plan_apv !== 'true' && primero.plan_apv !== 'false') throw new Error('CSV, plan_apv: usa true o false.');
  return {
    cliente: { referencia: primero.referencia, perfil_riesgo: primero.perfil_riesgo, perfil_evaluado_el: primero.perfil_evaluado_el, plan_apv: primero.plan_apv === 'true' },
    corte: primero.corte, moneda: primero.moneda, posiciones,
  };
}
