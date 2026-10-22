export interface Serie {
  codigo: string;
  tac_pct: number;
  minimo_clp: number;
  abierta: boolean;
  solo_apv: boolean;
  requiere_mandato: boolean;
}
export type TipoProducto = 'mutual_fund' | 'investment_fund' | 'equity_etf' | 'time_deposit' | 'cash' | 'insurance_savings' | 'other';
export interface Producto {
  id: string;
  emisor: string;
  nombre: string;
  tipo: TipoProducto;
  categoria: string;
  liquidez_dias: number;
  series: Serie[];
  tac_pct?: number;
}
export interface Catalogo {
  version: string;
  corte_costos: string;
  fuente_costos: string;
  emisores: { id: string; nombre: string; tipo: string }[];
  productos: Producto[];
}
export interface Acuerdo {
  emisor: string;
  estado: string;
  vigente_desde: string;
  vigente_hasta: string | null;
  mandato: boolean;
  patrimonio_agregado_clp: number;
  patrimonio_al: string;
  series: Record<string, Record<string, number>>;
}
export interface Acuerdos {
  distribuidor: string;
  acuerdos: Acuerdo[];
  productos_sin_serie: Record<string, { comision_distribucion_pct: number }>;
}
export interface Posicion {
  producto: string | null;
  serie: string | null;
  descripcion_original?: string;
  cuotas: number | null;
  valor_cuota: number | null;
  monto_clp: number;
}
export interface Cartola {
  cliente: { referencia: string; perfil_riesgo: string; perfil_evaluado_el: string; plan_apv: boolean };
  corte: string;
  moneda: 'CLP';
  posiciones: Posicion[];
}
export type EstadoAcceso = 'eligible' | 'conditional' | 'blocked' | 'out_of_scope';
export interface Acceso {
  serie: Serie;
  actual: boolean;
  estado: EstadoAcceso;
  regla: number;
  motivo: string;
  evidencia: {
    ticket: string;
    minimo: string;
    agregado: string | null;
    patrimonioAl: string | null;
    mandato: boolean;
    planApv: boolean;
    habilitada: boolean;
    acuerdoVigente: boolean;
    inicio: string | null;
    fin: string | null;
  };
}
export interface Advertencia {
  codigo: string;
  mensaje: string;
  declarado?: string;
  calculado?: string;
  diferencia?: string;
}
export interface ResultadoPosicion {
  indice: number;
  entrada: Posicion;
  nombre: string;
  emisor: string | null;
  tipo: TipoProducto | null;
  clasificacion: 'computable' | 'unidentified' | 'excluded';
  motivo: string;
  monto: string;
  peso: string | null;
  tac: string | null;
  costo: string | null;
  alternativas: Acceso[];
  elegida: string | null;
  tacPosterior: string | null;
  costoPosterior: string | null;
  ahorro: string;
  bps: string;
  empates: string[];
  condicional: { serie: string; tac: string; adicional: string; tareas: string[] } | null;
  advertencias: Advertencia[];
}
export interface Analisis {
  versionReglas: 'nivel-1.0';
  contexto: { cartola: Cartola; catalogo: Catalogo; acuerdos: Acuerdos };
  posiciones: ResultadoPosicion[];
  totales: {
    monto: string;
    identificado: string;
    computable: string;
    sinIdentificar: string;
    porcentajeSinIdentificar: string | null;
    excluido: string;
    costo: string;
    tac: string | null;
    ahorro: string;
    costoPosterior: string;
    tacPosterior: string | null;
    condicional: string;
    porcentajeAhorro: string | null;
    porcentajeCostoPosterior: string | null;
    computables: number;
    identificadas: number;
    cambios: number;
  };
  acuerdosVigentes: string[];
}
