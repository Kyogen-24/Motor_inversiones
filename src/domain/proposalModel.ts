import type { Acuerdos, Cartola, Catalogo } from './model';

export type Categoria = 'caja' | 'deposito_plazo' | 'deuda_corto_clp' | 'deuda_uf_corto' | 'deuda_uf_mediano' | 'deuda_uf_largo' | 'balanceado' | 'rv_chile' | 'rv_global';
export interface Supuestos { _aviso?: string; version?: string; fecha?: string; fuente?: string; uf: { valor_clp: number; fecha: string }; categorias: Record<Categoria, { retorno_real_bruto_pct: number; volatilidad_pct: number; peso_crecimiento: number }>; perfiles: Record<string, { max_crecimiento_pct: number }>; limites: { max_por_fondo_pct: number; max_por_agf_pct: number }; tramos: Tramo[]; escenarios: Escenario[]; }
export interface Tramo { id: string; desde_meses: number; hasta_meses: number | null; categorias: Categoria[]; }
export interface Meta { _aviso?: string; tipo: string; nombre: string; referencia_cliente: string; capital_asignado_clp: number; valor_uf_clp: number; fecha_referencia: string; desembolsos: Desembolso[]; }
export interface Desembolso { fecha: string; uf: number; }
export interface Escenario { id: 'adverso' | 'base' | 'favorable'; ajuste_retorno_pp: number; }
export interface Asignacion { producto: string; serie: string | null; emisor: string; nombre: string; categoria: Categoria; montoClp: string; montoUf: string; tacPct: string; liquidezDias: number; tramoId?: string; fase?: 'serie' | 'equivalente' | 'retencion' | 'perfil'; }
export interface ResumenFinanciero { capitalClp: string; capitalUf: string; costoAnualClp: string; tacPct: string | null; retornoBrutoPct: string | null; retornoNetoPct: string | null; volatilidadPct: string | null; crecimientoPct: string | null; concentracionFondos: Record<string, string>; concentracionAgf: Record<string, string>; }
export interface PagoEscenario { indice: number; fecha: string; pagadoUf: string; pendienteUf: string; }
export interface EscenarioResultado { id: Escenario['id']; ajustePp: string; saldoFinalUf: string; costoAcumuladoUf: string; coberturaPct: string | null; pagadoUf: string | null; pendienteUf: string | null; fechaAgotamiento: string | null; primeraFechaPendiente: string | null; pagos: PagoEscenario[]; }
export interface Busqueda { estado: 'completa' | 'limite_alcanzado'; nodos: number; presupuesto: number; optimalidad: 'no_demostrada'; }
export interface PropuestaCosto { modalidad: 'costo'; versionReglas: 'nivel-2.0'; estado: 'propuesta' | 'sin_mejora' | 'sin_candidato'; contexto: { supuestosFuente: string; fechaUf: string }; metodoRiesgo: 'volatilidad_ponderada_simple'; actual: ResumenFinanciero; propuesta: ResumenFinanciero; asignaciones: Asignacion[]; cambios: string[]; ahorroAnualClp: string; escenarios: EscenarioResultado[]; busqueda: Busqueda; advertencias: string[]; restricciones: string[]; }
export interface PagoMeta { indice: number; fecha: string; uf: string; meses: string; tramoId: string; vpUf: string | null; pendienteBaseUf: string; }
export interface ReservaMeta { tramoId: string; categorias: Categoria[]; retornoBrutoPct: string | null; vpUf: string | null; capitalUf: string; asignaciones: Asignacion[]; }
export interface PropuestaMeta { modalidad: 'meta'; versionReglas: 'nivel-2.0'; estado: 'propuesta' | 'propuesta_parcial' | 'sin_candidato'; contexto: { supuestosFuente: string; fechaUf: string }; valorUfClp: string; capitalUf: string; vpTotalUf: string | null; deficitVpUf: string | null; excedenteVpUf: string | null; capitalNoAsignableUf: string; pendienteBaseClp: string; pagos: PagoMeta[]; reservas: ReservaMeta[]; resumen: ResumenFinanciero | null; crecimientoMaximoPct: string | null; crecimientoEfectivoPct: string | null; conclusionBase: 'alcanza' | 'no_alcanza'; escenarios: EscenarioResultado[]; busqueda: Busqueda | null; advertencias: string[]; restricciones: string[]; }
export type EntradaPropuestaCosto = { cartola: Cartola; catalogo: Catalogo; acuerdos: Acuerdos; supuestos: Supuestos; };
export type EntradaPropuestaMeta = EntradaPropuestaCosto & { meta: Meta; };

export interface EvidenciaDecision { producto: string; nombre: string; serie: string | null; serieAsignada: string | null; uso: 'destino' | 'tenencia' | 'alternativa'; loteOrigen?: number; tramos: string[]; ticketClp: string; estado: string; motivo: string; tareas: string[]; }
export interface PeriodoProyeccion { desde: string; hasta: string; asignacion: number; saldoInicialUf: string; saldoAntesRetiroUf: string; retornoBrutoPct: string; tacPct: string; costoUf: string; }
export interface Rescate { fecha: string; liquidacion: string; asignacion: number; pagoIndice: number; uf: string; transferencia: boolean; }
export interface Asignacion { loteOrigen?: number; pesoPct?: string; ticketFinalClp?: string; }
export interface ResumenFinanciero { basePesosClp?: string; }
export interface PropuestaCosto { admisible?: boolean; motivosNoAdmisible?: string[]; evidencias?: EvidenciaDecision[]; actuales?: Asignacion[]; }
export interface PropuestaMeta { nombre?: string; admisible?: boolean; motivosNoAdmisible?: string[]; evidencias?: EvidenciaDecision[]; crecimientoGeneralPct?: string; mesesPrimerPago?: string; }
export interface PagoMeta { reservadoVpUf?: string; noFinanciadoInicialUf?: string | null; }
export interface ReservaMeta { pesoRequeridoPct?: string; pesoEfectivoPct?: string; }
export interface EscenarioResultado { periodos?: PeriodoProyeccion[]; rescates?: Rescate[]; agotamientoTramos?: Record<string, string>; }
export interface FuentesPropuesta { distribuidor: string; catalogoVersion: string; catalogoFecha: string; catalogoFuente: string; supuestosVersion: string; supuestosFecha: string; aviso: string; valorUfClp: string; fechaUf: string; }
export interface FuentesPropuesta { cliente: string; corte: string; sinIdentificarClp: string; porcentajeSinIdentificar: string | null; excluidoClp: string; emisores: Record<string, string>; }
export interface FuentesPropuesta { exclusiones: { nombre: string; montoClp: string; motivo: string }[]; }
export interface PropuestaCosto { fuentes?: FuentesPropuesta; }
export interface PropuestaMeta { fuentes?: FuentesPropuesta; capitalClp?: string; vpTotalClp?: string | null; deficitVpClp?: string | null; excedenteVpClp?: string | null; noAsignableClp?: string; }
export interface PropuestaMeta { actual?: ResumenFinanciero; actuales?: Asignacion[]; }
export interface Asignacion { retornoBrutoPct?: string; retornoNetoPct?: string; volatilidadPct?: string; }
