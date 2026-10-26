function separadorCsv(texto: string): string {
  let entreComillas = false;
  for (const caracter of texto) {
    if (caracter === '"') entreComillas = !entreComillas;
    if (!entreComillas && (caracter === ',' || caracter === ';')) return caracter;
    if (!entreComillas && (caracter === '\n' || caracter === '\r')) break;
  }
  throw new Error('CSV: falta una cabecera con columnas separadas por coma o punto y coma.');
}

export function filasCsv(texto: string, limite = 10000): string[][] {
  const separador = separadorCsv(texto);
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = '';
  let entreComillas = false;
  let comillasCerradas = false;
  function terminarFila() {
    if (fila.length || campo || comillasCerradas) filas.push([...fila, campo]);
    if (filas.length > limite + 1) throw new Error(`CSV: se admiten como máximo ${limite.toLocaleString('es-CL')} registros de datos.`);
    fila = []; campo = ''; comillasCerradas = false;
  }
  for (let i = 0; i < texto.length; i++) {
    const caracter = texto[i];
    if (entreComillas) {
      if (caracter !== '"') campo += caracter;
      else if (texto[i + 1] === '"') { campo += '"'; i++; }
      else { entreComillas = false; comillasCerradas = true; }
      continue;
    }
    if (caracter === separador) { fila.push(campo); campo = ''; comillasCerradas = false; }
    else if (caracter === '\n' || caracter === '\r') {
      terminarFila();
      if (caracter === '\r' && texto[i + 1] === '\n') i++;
    } else if (caracter === '"' && !campo && !comillasCerradas) entreComillas = true;
    else {
      if (caracter === '"' || comillasCerradas) throw new Error(`CSV: comillas inválidas en el registro ${filas.length + 1}.`);
      campo += caracter;
    }
  }
  if (entreComillas) throw new Error('CSV: hay un campo entre comillas sin cerrar.');
  terminarFila();
  return filas;
}

