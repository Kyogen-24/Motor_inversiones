import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

// Fuentes de los dos documentos: node docs/diagrams/generar.mjs.
// La geometría es determinista; los textos describen el código de src/.
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const root = fileURLToPath(new URL('.', import.meta.url));
const css = `
:root{--ink:#1c1d1f;--muted:#596575;--rule:#e4e7ec;--paper:#fff;--wash:#f6f8fb;--accent:#266df0;--tint:#e9f0ff}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:24px}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,system-ui,sans-serif;line-height:1.6}main{max-width:1440px;margin:auto;padding:48px 40px}h1{font-size:40px;line-height:1.12;letter-spacing:-.045em;max-width:1000px;margin:12px 0 18px}h2{font-size:26px;letter-spacing:-.03em;margin:0 0 8px}h3{font-size:16px;margin:0 0 8px}.eyebrow{font-size:11px;letter-spacing:.14em;font-weight:750;text-transform:uppercase;color:var(--accent)}.lead{max-width:940px;color:var(--muted);font-size:17px}.meta{font-size:12px;color:var(--muted)}a{color:#195acb;text-underline-offset:3px}nav{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0 36px}nav a{padding:8px 12px;border:1px solid var(--rule);border-radius:6px;font-size:13px;text-decoration:none}nav a:hover,nav a:focus-visible{background:var(--tint);outline:2px solid var(--accent)}section{margin:48px 0 64px;scroll-margin-top:24px}.figure{overflow-x:auto;border:1px solid var(--rule);border-radius:8px;margin:20px 0}svg{display:block;width:100%;height:auto;min-width:920px;font-family:Inter,system-ui,sans-serif}svg a:hover rect,svg a:focus rect{stroke:#266df0;stroke-width:1.4}table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:13px}th{text-align:left;background:var(--wash);font-size:11px;letter-spacing:.06em;text-transform:uppercase}td,th{padding:14px 16px;border-bottom:1px solid var(--rule);vertical-align:top}td:first-child{width:23%}th:first-child{width:23%}code{font-family:ui-monospace,monospace;font-size:.9em;overflow-wrap:anywhere}.rule{padding:16px 20px;border-left:3px solid var(--accent);background:var(--wash);font-size:14px}.cards{display:grid;grid-template-columns:1.2fr 1fr;gap:24px;margin-top:32px}.card{border:1px solid var(--rule);border-radius:8px;padding:24px}.card p{color:var(--muted);font-size:14px}footer{border-top:1px solid var(--rule);padding:20px 0;font-size:12px;color:var(--muted)}.table-scroll{overflow-x:auto}button{font:inherit;padding:8px 12px;border:1px solid var(--rule);border-radius:6px;background:#fff;cursor:pointer}
tr:target{background:var(--tint);outline:2px solid var(--accent);outline-offset:-2px}
@media(max-width:760px){main{padding:28px 16px}h1{font-size:30px}.cards{grid-template-columns:1fr}table{min-width:860px}nav{gap:6px}section{margin:36px 0 48px}}
@media print{main{padding:0}nav,button{display:none}.figure{overflow:visible}svg{min-width:0}section{break-before:page}tr{break-inside:avoid}.cards{break-inside:avoid}a{color:inherit}h1{font-size:30px}}
`;
function page(title, subtitle, body, other) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>${esc(title)} · Motor de inversiones</title><style>${css}</style></head><body><main><header><p class="eyebrow">Motor de inversiones · documentación técnica</p><h1>${esc(title)}</h1><p class="lead">${esc(subtitle)}</p><p class="meta">Código contrastado: 25 de octubre de 2026 · alcance implementado: niveles 1 y 2 · <a href="${other}">Ver el otro diagrama</a></p></header>${body}<footer>Los nombres de funciones corresponden a src/. Las flechas del Data flow representan transferencia o transformación de datos; las llamadas y las condiciones se precisan en el detalle de cada lámina. Los cálculos se realizan localmente en el navegador.</footer></main></body></html>`;
}

// Exploded axonometric: proyección 2:1 compartida por todas las caras.
const iso = (x,y,z) => [280+x-y, 496+(x+y)/2-z];
const pt = a => a.join(' ');
const path = points => `M ${points.map(pt).join(' L ')} Z`;
const face = (coords, fill, stroke='#8993a2') => `<path d="${path(coords)}" fill="${fill}" stroke="${stroke}" stroke-width=".8"/>`;
const parts = [
  {key:'dominio',name:'Dominio',z:0,focal:true,tag:'REGLAS Y CÁLCULOS PUROS',lines:['diagnosticarPosicion · evaluarAcceso','construirPropuestaCosto · construirPropuestaMeta','validarAsignaciones · resumenAsignaciones · proyectar'],desc:'Resuelve elegibilidad, costos, riesgo, plazos y escenarios.',tiles:[[24,24,92,64],[112,24,192,64],[24,84,192,124]]},
  {key:'aplicacion',name:'Aplicación',z:148,tag:'CASOS DE USO PUROS',lines:['analizarCartola(cartola, catalogo, acuerdos)','proponerCostos(entrada) · proponerMeta(entrada)','validarEntradaPropuesta → constructor del dominio'],desc:'Coordina las reglas y devuelve contratos serializables.',tiles:[[24,24,192,52],[24,68,104,116],[120,68,192,116]]},
  {key:'infraestructura',name:'Infraestructura',z:296,tag:'ADAPTADORES DEL NAVEGADOR',lines:['leerArchivos → leerArchivo → schema.safeParse','validarSemantica · errorDeAnalisis','ejecutarPropuesta → proposal.worker.ts → postMessage'],desc:'Convierte archivos a modelos y aísla el cálculo asíncrono.',tiles:[[24,24,104,116],[120,24,192,116]]},
  {key:'presentacion',name:'Presentación',z:444,tag:'INTERACCIÓN, ESTADO Y LECTURA',lines:['App · useAppWorkflow: seleccionar / analizar / generar','InputReview · AnalysisView · ProposalView · GoalView','Navigation · format: fechas, CLP, UF y porcentajes'],desc:'Recoge datos, habilita acciones y muestra resultados.',tiles:[[24,24,192,44],[24,60,72,116],[84,60,132,116],[144,60,192,116]]},
];
const explanations = {
  presentacion: {
    tag: 'LO QUE VE Y UTILIZA EL USUARIO',
    description: ['Permite cargar archivos, iniciar el análisis', 'y consultar los resultados de la cartera.'],
    example: ['seleccionar(tipo, archivo) registra el JSON cargado', 'e invalida el análisis anterior para actualizarlo.'],
  },
  infraestructura: {
    tag: 'LECTURA DE ARCHIVOS Y EJECUCIÓN LOCAL',
    description: ['Lee y valida los archivos y ejecuta las propuestas', 'sin bloquear la pantalla.'],
    example: ['leerArchivo(tipo, file) lee y valida el JSON;', 'devuelve datos tipados o un error del archivo.'],
  },
  aplicacion: {
    tag: 'COORDINACIÓN DEL ANÁLISIS',
    description: ['Organiza los pasos necesarios para completar', 'un análisis o generar una propuesta.'],
    example: ['analizarCartola(cartola, catalogo, acuerdos) valida,', 'diagnostica cada posición y reúne costos y ahorro.'],
  },
  dominio: {
    tag: 'REGLAS FINANCIERAS DEL MOTOR',
    description: ['Aplica las reglas para calcular costos,', 'riesgo y cobertura de los pagos.'],
    example: ['evaluarAcceso(serie, producto, ticket, …) comprueba', 'acuerdo, APV, mandato y mínimo; devuelve acceso y motivo.'],
  },
};
let exploded = `<svg viewBox="0 0 1280 732" role="img" aria-labelledby="ax-title ax-desc"><title id="ax-title">Arquitectura en Exploded axonometric</title><desc id="ax-desc">Cuatro placas en proyección dimétrica: dominio como base, aplicación, infraestructura y presentación. Cada placa identifica responsabilidades y funciones. La separación vertical expresa composición, no una cadena de llamadas.</desc><rect width="1280" height="732" fill="#fff"/><g data-exploded data-origin="280 496" data-gap="136">`;
for (const [x,y] of [[0,160],[240,0]]) {
  const a=iso(x,y,12),b=iso(x,y,444);
  exploded+=`<line data-role="trace" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#a4adba" stroke-dasharray="4,3" stroke-width=".8"/>`;
}
for(const [i,p] of parts.entries()) {
  const z=p.z,t=12,w=240,d=160;
  const sil=[iso(0,d,z+t),iso(0,d,z+t),iso(0,0,z+t),iso(0,0,z+t),iso(w,0,z+t),iso(w,0,z+t),iso(w,0,z),iso(w,0,z),iso(w,d,z),iso(w,d,z),iso(0,d,z),iso(0,d,z)];
  const anchor=iso(w,0,z+t/2), ay=anchor[1];
  exploded+=`<g data-part="${p.key}" data-name="${p.name}" data-rect="0 0 240 160 0" data-z="${z}" data-t="12" data-level="${i}" ${p.focal?'data-focal':''}><path data-role="silhouette" d="${path(sil)}" fill="#fff" stroke="#606c7c" stroke-width="1.2"/>`;
  exploded+=face([iso(0,d,z+t),iso(w,d,z+t),iso(w,d,z),iso(0,d,z)],p.focal?'#bdd1fa':'#e9ecf1');
  exploded+=face([iso(w,0,z+t),iso(w,d,z+t),iso(w,d,z),iso(w,0,z)],p.focal?'#94b5f4':'#d3d9e2');
  exploded+=face([iso(0,0,z+t),iso(w,0,z+t),iso(w,d,z+t),iso(0,d,z+t)],p.focal?'#e9f0ff':'#fff');
  for(const [x0,y0,x1,y1] of p.tiles) {
    exploded+=face([iso(x0,y0,z+13),iso(x1,y0,z+13),iso(x1,y1,z+13),iso(x0,y1,z+13)],p.focal?'#d6e4ff':'#f1f3f7','#adb7c5');
    const l0=iso(x0+8,y0+8,z+14),l1=iso(x1-8,y0+8,z+14);
    exploded+=`<path d="M ${pt(l0)} L ${pt(l1)}" fill="none" stroke="${p.focal?'#266df0':'#8c98a9'}" stroke-width="2"/>`;
  }
  const explanation=explanations[p.key];
  exploded+=`<g data-role="label"><circle cx="${anchor[0]}" cy="${ay}" r="2" fill="${p.focal?'#266df0':'#596575'}"/><line data-role="leader" x1="${anchor[0]+6}" y1="${ay}" x2="588" y2="${ay}" stroke="${p.focal?'#266df0':'#8993a2'}" stroke-width=".8"/><text data-role="name" x="600" y="${ay-5}" font-size="22" font-weight="700" fill="#1c1d1f">${p.name}</text><text x="600" y="${ay+15}" font-size="10" letter-spacing="1.2" fill="${p.focal?'#266df0':'#596575'}">${explanation.tag}</text>`;
  explanation.description.forEach((l,j)=>exploded+=`<text x="600" y="${ay+38+j*18}" font-size="14" fill="#344153">${esc(l)}</text>`);
  exploded+=`<text x="600" y="${ay+80}" font-size="10" font-weight="700" letter-spacing="1" fill="#596575">EJEMPLO</text>`;
  explanation.example.forEach((l,j)=>exploded+=`<text x="600" y="${ay+98+j*18}" font-size="13" fill="#596575">${esc(l)}</text>`);
  exploded+='</g></g>';
}
exploded+='</g></svg>';
const architectureBody=`<div class="figure">${exploded}</div><p class="rule">La vista explota las piezas de una misma aplicación. El orden vertical expresa capas; las dependencias exactas son: presentación → infraestructura y aplicación; infraestructura → dominio y, desde el Worker, aplicación; aplicación → dominio.</p><div class="cards"><article class="card"><h2>Contratos que cruzan las capas</h2><p><code>File</code> → <code>Entradas</code> tipadas → <code>Analisis</code> / <code>EntradaPropuestaCosto</code> / <code>EntradaPropuestaMeta</code> → <code>PropuestaCosto</code> / <code>PropuestaMeta</code>.</p><p>El nivel 1 se calcula desde la interfaz en el hilo principal. Los dos casos de uso de nivel 2 se ejecutan en un Worker local, con revisión, modalidad y entrada explícitas.</p></article><article class="card"><h2>Reglas compartidas</h2><p><code>numeric.ts</code> centraliza aritmética decimal y fechas. <code>proposalSearch.ts</code> limita la búsqueda y calcula cupos. <code>proposalValidation.ts</code> verifica las asignaciones finales. <code>risk.ts</code> resume costo, crecimiento y volatilidad. <code>projection.ts</code> simula los escenarios.</p><p>Aplicación y dominio no importan React, Zod ni lectores de archivos. Las vistas formatean los resultados del motor.</p></article></div><p class="meta">Ampliación de funciones y recorridos: <a href="flujo-funcional.html">Data flow completo</a>.</p>`;
const technicalDetails=`<details><summary>Consultar las funciones de cada capa</summary><div class="table-scroll"><table><thead><tr><th>Capa</th><th>Funciones y componentes</th></tr></thead><tbody>${[...parts].reverse().map(p=>`<tr><td>${p.name}</td><td>${p.lines.map(l=>`<code>${esc(l)}</code>`).join('<br>')}</td></tr>`).join('')}</tbody></table></div></details>`;
writeFileSync(root+'arquitectura.html',page('La arquitectura, capa por capa','Cada capa cumple una responsabilidad distinta. El diagrama la explica con una descripción breve y un ejemplo de uso en la aplicación.',architectureBody+technicalDetails,'flujo-funcional.html'));

// Data flow: seis etapas y cuatro roles. Cada lámina detalla un subproceso.
// Nodo: [id, rol, columna, título en líneas, resumen, función/ruta, entrada, operación, salida].
const N=(id,lane,col,title,sub,fn,input,operation,output)=>({id,lane,col,title,sub,fn,input,operation,output});
const panels=[
{id:'mapa',title:'01 · Recorrido de extremo a extremo',intro:'La cartola, el catálogo y los acuerdos alimentan el diagnóstico. El nivel 2 vuelve a consumir las entradas tipadas; no utiliza una cartera ya optimizada por el nivel 1 como punto de partida.',steps:['Cargar','Interpretar','Analizar','Solicitar','Procesar','Presentar'],focus:'m4',nodes:[
N('m0',0,0,['Cartola · catálogo','acuerdos'],'+ supuestos / meta','seleccionar','Cartola, catálogo, acuerdos; supuestos y meta según modalidad.','Cartola: cliente, corte, posiciones y montos. Catálogo: emisores, productos, series, TAC, mínimos y liquidez. Acuerdos: vigencia, series habilitadas, mandato y patrimonio. Supuestos: retornos, volatilidad, perfiles, límites, tramos, escenarios y UF. Meta: capital y desembolsos.','File por tipo.'),
N('m1',1,1,['leerArchivos'],'File → Entradas','leerArchivos / leerArchivo','Archivos seleccionados.','Lee, interpreta JSON, valida esquema y semántica; devuelve cambios y errores por tipo. Ver lámina 02.','Entradas tipadas o errores por archivo.'),
N('m2',2,2,['analizarCartola'],'Nivel 1','analizarCartola','Cartola + catálogo + acuerdos.','Valida negocio y diagnostica cada posición; consolida costos y ahorro elegible. Ver láminas 03 y 04.','Analisis con posiciones, totales y contexto.'),
N('m3',0,3,['generarCosto /','generarMeta'],'Acción del usuario','generar','Entradas confirmadas al analizar.','Costo exige los tres archivos base y supuestos; meta exige además meta. Inicia una revisión de propuesta.','EntradaPropuesta + modalidad + revisión.'),
N('m4',1,4,['ejecutarPropuesta'],'Worker local','ejecutarPropuesta / self.onmessage','Solicitud serializable.','Crea el Worker y deriva a proponerCostos o proponerMeta. Ver lámina 05.','Caso de uso de nivel 2.'),
N('m5',2,4,['construirPropuesta','Costo / Meta'],'R07 / R06 + R03','proponerCostos / proponerMeta','Entradas validadas para la modalidad.','Costo busca ahorro sin mayor volatilidad; meta reserva capital por pagos y plazos. Ambos aplican restricciones y escenarios. Ver láminas 06 a 10.','PropuestaCosto o PropuestaMeta.'),
N('m6',3,5,['AnalysisView'],'Salida nivel 1','AnalysisView','Analisis.','Muestra costos, comparación de series, estados de acceso y evidencia.','Diagnóstico de cartola.'),
N('m7',0,5,['ProposalView /','GoalView'],'Salida nivel 2','ProposalView / GoalView','Respuesta de la revisión vigente.','Muestra asignaciones, comparación, restricciones y escenarios. La meta separa admisibilidad y cobertura.','Propuesta de costo o meta.')],edges:[['m0','m1'],['m1','m2'],['m2','m6'],['m1','m3'],['m3','m4','accent','SOLICITUD'],['m4','m5'],['m5','m7']]},
{id:'carga',title:'02 · Carga, interpretación y revisión',intro:'La ruta real de carga usa leerArchivo y safeParse. interpretar es otra entrada pública para valores ya leídos; no se inserta artificialmente en la cadena del lector.',steps:['Seleccionar','Leer','Interpretar','Validar','Revisar','Confirmar'],focus:'i4',nodes:[
N('i0',0,0,['seleccionar'],'Invalida revisión','useAppWorkflow.seleccionar','Tipo de entrada + File.','Cancela propuestas, incrementa operación, invalida diagnóstico y propuesta; incorpora el archivo a la revisión pendiente.','Estado pendiente de revisión.'),
N('i1',1,1,['leerArchivos'],'allSettled','leerArchivos','Mapa parcial de archivos.','Ejecuta leerArchivo por tipo con Promise.allSettled; conserva cada lectura válida y cada ErrorArchivo.','{ cambios, errores }.'),
N('i2',1,2,['leerArchivo'],'JSON.parse','leerArchivo','File de hasta 5 MB.','Lee file.text(), elimina BOM inicial, aplica JSON.parse y schema.safeParse. Detecta archivo de otro tipo y enumera errores de campos.','Objeto con estructura admitida o ErrorArchivo.'),
N('i3',2,3,['validarSemantica'],'Supuestos','validarSemantica / validarSupuestos','Resultado del esquema.','Para supuestos comprueba categorías, pesos de crecimiento, tramos contiguos y escenarios exactos −1,5/0/+1,5 pp; los defaults de series vienen del esquema.','Modelo tipado con semántica validada.'),
N('i4',0,4,['revisar'],'useEffect','useAppWorkflow: revisar','Cambios, errores y entradas previas.','Descarta lecturas obsoletas. Reconstruye revisionDatos. Solo habilita análisis con cartola, catálogo y acuerdos válidos y validarNegocio superado.','validado + revisionDatos + erroresArchivo.'),
N('i5',0,5,['analizar'],'Confirma entradas','useAppWorkflow.analizar','revisionDatos validado.','Llama analizarCartola, confirma entradas/nombres, limpia archivos pendientes y abre la vista de análisis.','Analisis y entradas confirmadas.'),
N('i6',3,3,['ErrorArchivo'],'Corregir entrada','errorDeAnalisis','Fallo de lectura, esquema o negocio.','Asocia la ruta al tipo de archivo y traduce el motivo para la interfaz. Una carga fallida no produce resultados vigentes.','Mensaje por archivo o error general.')],edges:[['i0','i1'],['i1','i2'],['i2','i3'],['i3','i4','accent','ENTRADAS'],['i4','i5'],['i2','i6']]},
{id:'nivel1',title:'03 · analizarCartola y diagnosticarPosicion',intro:'El diagnóstico evalúa cada tenencia por separado. El cambio de serie se limita al mismo producto; una oportunidad condicional nunca se incorpora al ahorro elegible.',steps:['Recibir','Identificar','Clasificar','Evaluar','Elegir','Consolidar'],focus:'d3',nodes:[
N('d0',0,0,['analizarCartola'],'Tres entradas','analizarCartola','Cartola + catálogo + acuerdos.','Ejecuta validarNegocio y mapea cada posición a diagnosticarPosicion con su índice y el contexto completo.','Una evaluación por posición.'),
N('d1',2,1,['diagnosticar','Posicion'],'Producto y serie','diagnosticarPosicion','Posición y catálogo.','Busca producto por id y serie por código. Para fondos exige ambos; identifica emisor y conserva entrada/monto declarados.','Producto/serie conocidos o sin identificar.'),
N('d2',2,2,['tasaComputable /','clasificarCosto'],'Computable o excluida','tasaComputable / clasificarCosto','Producto, serie y monto.','Efectivo/depósito: TAC 0. Fondos: TAC de serie; ETF: TAC declarada. Seguro reconocido: excluido. Desconocido: sin identificar. Calcula costo = monto × TAC / 100; comprobarValorizacion advierte diferencias mayores a 1 CLP.','ResultadoPosicion inicial con costo y advertencias.'),
N('d3',2,3,['evaluarAcceso'],'Una vez por serie','evaluarAcceso','Fondo conocido con TAC y su acuerdo.','Evalúa todas las series del producto usando el ticket de la posición. Primera coincidencia: alcance, apertura, APV, mandato, mínimo y patrimonio. Ver lámina 04.','Alternativas con estado, regla, motivo y evidencia.'),
N('d4',2,4,['comparar','Alternativas'],'TAC y código','diagnosticarPosicion: selección','Alternativas y TAC actual.','Solo eligible, monto positivo y TAC estrictamente menor. Ordena por TAC y luego código. Conserva empates; calcula costo posterior, ahorro en CLP y reducción en bps. Sin alternativa mantiene la serie.','Serie elegida y ahorro elegible.'),
N('d5',3,4,['tareas','Condicionales'],'Ahorro separado','tareasCondicionales','Alternativa conditional más barata que la elegida.','Registra potencial adicional y tareas: mandato, mínimo/agregación, confirmación escrita y reevaluación.','Oportunidad condicional independiente.'),
N('d6',2,5,['sumar /','porcentaje'],'Totales','analizarCartola: consolidación','Resultados de posiciones.','Suma capital computable, costo y ahorro; TAC = costo / capital computable × 100; peso de cada computable sobre esa misma base. Separa excluidos y sin identificar. Clona el contexto.','Analisis: posiciones, totales, acuerdosVigentes, contexto.'),
N('d7',3,2,['Retorno temprano'],'Sin comparación','diagnosticarPosicion: return','Posición desconocida, no fondo o sin TAC.','Devuelve la clasificación y sus advertencias sin evaluar cambios de serie.','Posición conservada, sin ahorro inventado.')],edges:[['d0','d1'],['d1','d2'],['d2','d3','accent','POSICIÓN'],['d3','d4'],['d4','d6'],['d3','d5'],['d2','d7']]},
{id:'acceso',title:'04 · evaluarAcceso: orden de primera coincidencia',intro:'Las comprobaciones se detienen en el primer resultado aplicable. La marca de serie actual solo describe tenencia: no concede acceso a una nueva contratación.',steps:['Alcance','Apertura','APV','Mandato','Mínimo','Resultado'],focus:'a4',nodes:[
N('a0',1,0,['vigente /','habilitada'],'Regla 0','evaluarAcceso: alcance','Serie, producto, ticket, cartola y acuerdo.','Acuerdo activo, vigente_desde < corte y fin nulo o ≥ corte; luego la serie debe existir en acuerdo.series[producto]. Si falla: out_of_scope.','Sigue a apertura solo si está habilitada.'),
N('a1',1,1,['abierta'],'Regla 1','evaluarAcceso: apertura','Serie habilitada.','Si abierta = false: blocked. Solo continúa si admite nuevas contrataciones.','Estado o siguiente comprobación.'),
N('a2',1,2,['solo_apv'],'Regla 2','evaluarAcceso: APV','Serie abierta y plan_apv.','Si es exclusiva APV y el cliente no tiene plan: blocked.','Estado o siguiente comprobación.'),
N('a3',1,3,['requiere','Mandato'],'Regla 3','evaluarAcceso: mandato','Serie y mandato del acuerdo.','Si requiere mandato y no existe: conditional. Esta condición precede a la prueba de mínimos.','Estado o siguiente comprobación.'),
N('a4',2,4,['ticket / mínimo'],'Reglas 4 y 5','evaluarAcceso: ticket','Ticket, mínimo, patrimonio y fecha.','Si ticket < mínimo: patrimonio posterior al corte → blocked (5); patrimonio al corte suficiente → conditional (4); insuficiente → blocked (5). Si ticket ≥ mínimo → eligible (6).','Estado decidido por la primera coincidencia.'),
N('a5',2,5,['Acceso'],'Evidencia','evaluarAcceso: return','Resultado de cualquiera de las comprobaciones.','Devuelve copia de serie, actual, estado, regla, motivo y evidencia: ticket, mínimo, patrimonio, fechas, habilitación, mandato y APV.','Acceso consumido por diagnóstico y propuestas.')],edges:[['a0','a1'],['a1','a2'],['a2','a3'],['a3','a4','accent','TICKET'],['a4','a5']]},
{id:'worker',title:'05 · Ejecución de propuestas y control de revisión',intro:'Cada cálculo crea su propio Worker. El cambio de archivos, la limpieza y el desmontaje cancelan las propuestas anteriores; el resultado solo se acepta si conserva la revisión activa.',steps:['Solicitar','Enviar','Derivar','Validar','Resolver','Aceptar'],focus:'w2',nodes:[
N('w0',0,0,['generar'],'Costo o meta','useAppWorkflow.generar','Entradas confirmadas.','Verifica requisitos y calculando; incrementa id, limpia propuesta/error y activa calculando.','{ revision, modalidad, entrada }.'),
N('w1',1,1,['ejecutar','Propuesta'],'new Worker','ejecutarPropuesta','Solicitud de propuesta.','Crea Worker de módulo y registra cancelación. Envía con postMessage.','Mensaje al Worker.'),
N('w2',2,2,['self.onmessage'],'Selecciona caso','proposal.worker.ts: self.onmessage','Mensaje serializado.','Costo llama proponerCostos; meta llama proponerMeta. Atrapa excepciones y mantiene la revisión en la respuesta.','Caso de uso seleccionado.'),
N('w3',2,3,['validarEntrada','Propuesta'],'Reglas de entrada','validarEntradaPropuesta','EntradaPropuestaCosto / Meta.','Revalida negocio y supuestos sin Zod. Exige corte/fecha UF iguales, perfil presente, categorías/liquidez y retorno neto válido. Meta añade cliente, fecha, UF y desembolsos coherentes.','Entrada aceptada o error.'),
N('w4',2,4,['construirPropuesta','Costo / Meta'],'Cálculo puro','proponerCostos / proponerMeta','Entrada validada.','Invoca el constructor de dominio correspondiente. El Worker devuelve resultado o error mediante postMessage.','RespuestaPropuesta.'),
N('w5',0,5,['revision === id'],'Resultado vigente','ejecutarPropuesta + generar','Respuesta del Worker.','Termina Worker y comprueba revisión; rechaza error/mismatch. El hook comprueba además operacionPropuesta.current === id antes de setPropuesta.','Propuesta vigente o mensaje de error.'),
N('w6',3,1,['cancelar','Propuestas'],'terminate','cancelarPropuestas','Nueva selección, limpiar o desmontaje.','Termina Workers pendientes y rechaza AbortError; la revisión antigua no puede reemplazar la actual.','Operación cancelada.')],edges:[['w0','w1'],['w1','w2','accent','SOLICITUD'],['w2','w3'],['w3','w4'],['w4','w5'],['w1','w6']]},
{id:'costo',title:'06 · construirPropuestaCosto: búsqueda por lotes',intro:'Se mantiene o baja la volatilidad y se minimiza el costo dentro de los candidatos explorados. El retorno solo se calcula como consecuencia. La reparación hacia perfil se activa si no se encontró cartera admisible en la primera búsqueda y queda presupuesto.',steps:['Base actual','Candidatos','Repartir','Verificar','Comparar','Entregar'],focus:'c3',nodes:[
N('c0',1,0,['asignaciones','Actuales'],'Base computable','asignacionesActuales / resumenAsignaciones','Cartola y contexto validado.','Convierte tenencias computables a Asignacion en CLP/UF, conserva loteOrigen y fase retencion. Calcula capital, costo, volatilidad y crecimiento actuales. Valida la actual como candidato inicial.','Base de capital y cartera de referencia.'),
N('c1',2,1,['buscar(false)'],'Misma categoría','construirPropuestaCosto: buscar / lote','Lotes actuales, catálogo y acuerdos.','Para cada lote permite retención y destinos elegibles de la misma categoría. Marca fase serie, equivalente o perfil. Ordena por TAC y desempates deterministas; caja/depósito retenidos no se reasignan como fondos.','Candidatos por lote.'),
N('c2',2,2,['repartir / cupo'],'Capital y mínimos','repartir / cupo','Restante del lote y cartera parcial.','Calcula cupo por fondo, AGF y crecimiento; explora capacidad, mínimos y complementos de mínimos. Poda si el costo parcial ya supera el mejor. Cuenta cada nodo.','Carteras completas candidatas.'),
N('c3',2,3,['validar','Asignaciones'],'Restricciones finales','validarAsignaciones','Cartera completa.','Exige capital conservado, concentración, crecimiento y acceso final por ticket del lote. Descarta si volatilidad > actual o costo > actual. Ver lámina 09.','Candidato admisible o descartado.'),
N('c4',2,4,['costoMejor'],'Costo → cambios','construirPropuestaCosto: comparación','Candidatos admisibles.','Retiene menor costo; a igual costo, menos cambios. El método de riesgo es la misma media ponderada simple, sin correlaciones, en ambas carteras.','Mejor cartera explorada.'),
N('c5',3,1,['buscar(true)'],'Reparación condicional','construirPropuestaCosto: reparación','Sin candidato y presupuesto no agotado.','Amplía categorías y admite caja/depósito para reparar restricciones de perfil/concentración; conserva las verificaciones de costo y riesgo.','Segundo recorrido de la misma búsqueda.'),
N('c6',3,3,['50.000 nodos'],'Corte compartido','crearPresupuestoBusqueda','Cada llamada a intentarNodo.','Al alcanzar el límite se corta la búsqueda. Registra estado, nodos y presupuesto; no certifica óptimo ni inviabilidad.','Evidencia de búsqueda finita.'),
N('c7',2,5,['PropuestaCosto'],'Escenarios y ahorro','construirPropuestaCosto: return','Mejor cartera o referencia actual.','Revalida, completa pesos y evidencia; calcula ahorro anual. Estado: sin_candidato, sin_mejora o propuesta. Si es admisible, proyecta cinco años con tres escenarios.','Actual/propuesta, cambios, ahorro, admisible, escenarios y fuentes.')],edges:[['c0','c1'],['c1','c2'],['c2','c3','accent','CARTERA'],['c3','c4'],['c4','c7'],['c1','c5'],['c2','c6']]},
{id:'meta-vp',title:'07 · construirPropuestaMeta: pagos, tramos y VP',intro:'La reserva se calcula por orden cronológico y depende de las categorías efectivas del tramo. El VP usa un retorno real bruto supuesto; cobertura futura y déficit de VP son magnitudes diferentes.',steps:['Ordenar','Limitar','Soportes','Descontar','Reservar','Asignar'],focus:'g3',nodes:[
N('g0',1,0,['desembolsos.map'],'Fecha → meses → tramo','construirPropuestaMeta: preparación','Meta y supuestos.','Calcula mesesCalendario desde referencia; selecciona tramo por [desde_meses, hasta_meses), ordena por fecha e índice y guarda primer pago de cada tramo.','Pagos ordenados con tramo.'),
N('g1',2,1,['maximoCrecimiento','Meta'],'Capital en UF','maximoCrecimientoMeta','Capital CLP, UF, perfil y meses al primer pago.','Capital UF = CLP / UF. Tope efectivo = tope del perfil × min(1, meses / 24). El límite baja gradualmente cuando el primer pago ocurre antes de 24 meses.','Capital y tope efectivo de crecimiento.'),
N('g2',2,2,['combinar /','soportes'],'Categorías disponibles','combinar / soportes / destinos','Tramos con pagos y categorías permitidas.','Genera combinaciones de categorías con destinos. destinos filtra categoría, liquidez ≤ días al primer pago del tramo y acceso eligible; ordena por TAC, producto y serie.','Soporte candidato de cada tramo.'),
N('g3',2,3,['evaluar'],'Retorno supuesto','evaluar: reservas','Una combinación de soportes.','Usa promedio aritmético de retornos reales brutos de categorías, cada una una vez. VP de pago = UF / (1 + r)^t, con años por aniosEntre. Suma VP por tramo.','Reservas calculadas y VP por desembolso.'),
N('g4',2,4,['reservado /','disponible'],'Prioridad temporal','evaluar: calculados','Capital disponible y VP de pagos ordenados.','Reserva min(VP, disponible), reduce disponible y registra parte no financiada. Todo excedente se agrega al tramo activo más largo.','Capital requerido y reservado por tramo.'),
N('g5',2,5,['asignar /','repartir'],'Continúa en lámina 08','asignar','Reservas y candidatos elegibles.','Intenta materializar las reservas en productos respetando cupos, liquidez y tickets. No aumenta riesgo para cerrar una brecha.','Candidato invertible o capital no asignable.')],edges:[['g0','g1'],['g1','g2'],['g2','g3','accent','SOPORTES'],['g3','g4'],['g4','g5']]},
{id:'meta-asignacion',title:'08 · Meta: asignación efectiva, cobertura y conclusión',intro:'Una combinación solo se conserva si sus categorías están realmente representadas y la cartera supera la validación final. La búsqueda se detiene al hallar asignación completa o al agotar su presupuesto.',steps:['Destinos','Repartir','Validar','Seleccionar','Proyectar','Concluir'],focus:'h2',nodes:[
N('h0',1,0,['destinos'],'Categoría → serie','destinos','Tramo, categorías y capital de meta.','Prioriza las categorías del soporte; filtra liquidez al primer pago. Para fondos usa evaluarAcceso; caja y depósitos no exigen acuerdo de AGF. Ordena destinos por costo.','Destinos para la reserva.'),
N('h1',2,1,['asignar /','repartir'],'Ticket consolidado','asignar / repartir','Reserva en UF convertida a CLP.','Explora cupos y mínimos restantes descontando ticketPrevio por producto/serie, incluidos otros tramos. Avanza por reservas y candidatos con el contador compartido.','Asignaciones con tramoId.'),
N('h2',2,2,['validarAsignaciones'],'Cartera final','validarAsignaciones + soporte efectivo','Cartera completa.','Verifica acceso final con tickets consolidados, fondo/AGF y crecimiento. Rechaza soportes que declaran una categoría sin inversión efectiva dentro de una reserva financiada.','Candidato válido con capital no asignable.'),
N('h3',2,3,['mejor / completa'],'Capital asignable','construirPropuestaMeta: selección','Candidatos válidos.','Prefiere menor capital no asignable; termina al asignar todo. Sin candidato invertido, no inventa soporte ni VP: conserva null donde no se puede acreditar.','Reservas efectivas o sin candidato.'),
N('h4',2,4,['proyectar'],'Tres escenarios','proyectar','Asignaciones, pagos, inicio y última fecha de pago.','Simula cada escenario y obtiene pendientes de cada pago, cobertura, saldo y agotamiento; luego vincula pendientes del escenario base al detalle. Ver lámina 10.','Escenarios y pendienteBase.'),
N('h5',3,5,['PropuestaMeta'],'Alcanza / no alcanza','construirPropuestaMeta: return','Validación, reservas y escenario base.','Admisible exige asignaciones y validación final. Alcanza exige además pendiente base = 0. Estado propuesta requiere cobertura y capital totalmente asignado; de lo contrario propuesta_parcial o sin_candidato.','VP/deficit, capital no asignable, pagos, reservas, cobertura y conclusión.'),
N('h6',3,3,['pesos / tickets'],'Evidencia final','completarAsignaciones / evidenciaAccesos','Asignaciones efectivas y capital total de meta.','Peso requerido = VP / capital; efectivo = reserva / capital. Consolida tickets y documenta acceso, límites y motivos; compara con la cartera actual como referencia.','Trazabilidad de la propuesta.')],edges:[['h0','h1'],['h1','h2','accent','CARTERA'],['h2','h3'],['h3','h4'],['h4','h5'],['h3','h6']]},
{id:'restricciones',title:'09 · validarAsignaciones y resumenAsignaciones',intro:'Estas funciones se comparten entre costo y meta. El capital invertido y la base de concentración se conservan separados; caja y depósitos quedan fuera de las concentraciones por fondo y AGF.',steps:['Resumir','Capital','Concentrar','Perfil','Acceso','Resolver'],focus:'v3',nodes:[
N('v0',1,0,['resumen','Asignaciones'],'Misma metodología','resumenAsignaciones','Asignaciones + supuestos + valor UF + base opcional.','Costo = Σ monto × TAC / 100; TAC = costo / invertido × 100. Bruto y volatilidad = Σ monto × supuesto / invertido. Neto = bruto − TAC. Crecimiento = Σ monto × peso_crecimiento / base × 100.','Resumen financiero y concentraciones.'),
N('v1',2,1,['capitalEsperado'],'Cuando se exige','validarAsignaciones: capital','Resumen y opciones del caso de uso.','En costo exige igualdad con capital de referencia. En meta el no asignable se declara por separado, sin completarlo con inversión ficticia.','Restricción de capital, si corresponde.'),
N('v2',2,2,['fondos / AGF'],'Límites globales','validarAsignaciones: concentración','Concentraciones calculadas.','Acumula importes por producto y emisor, los divide por la base y contrasta con límites. Excluye caja/depósito de esas concentraciones.','Restricciones por fondo y AGF.'),
N('v3',2,3,['maxCrecimientoPct'],'Tope de perfil','validarAsignaciones: crecimiento','Crecimiento y tope efectivo.','Renta variable pesa 1, balanceados 0,5 y resto 0. Rechaza si crecimiento supera el máximo entregado: general en costo, reducido por plazo en meta.','Restricción de crecimiento.'),
N('v4',2,4,['evaluarAcceso'],'Ticket de destino','validarAsignaciones: acceso final','Asignaciones agrupadas por producto/serie.','Omite retenciones y caja/depósito sin serie. Costo separa lotes; meta consolida. Reevalúa acceso con el ticket final; solo eligible supera la prueba.','Restricciones de acceso final.'),
N('v5',3,5,['Validacion','Propuesta'],'valida + motivos','validarAsignaciones: return','Lista acumulada de restricciones.','valida = restricciones.length === 0. La validación no modifica la cartera y no prueba cobertura financiera.','{ valida, restricciones }.')],edges:[['v0','v1'],['v1','v2'],['v2','v3','accent','EXPOSICIÓN'],['v3','v4'],['v4','v5']]},
{id:'proyeccion',title:'10 · proyectar y trayectoria: eventos, rescates y pagos',intro:'R03 se calcula sobre trayectorias netas. El costo acumulado es una medida informativa del costo sobre saldo medio: la TAC ya está descontada del retorno neto, por lo que no se resta otra vez del saldo.',steps:['Escenarios','Eventos','Capitalizar','Rescatar','Pagar','Reportar'],focus:'p2',nodes:[
N('p0',1,0,['proyectar'],'−1,5 / 0 / +1,5 pp','proyectar','Asignaciones, supuestos, inicio, fin y pagos.','Crea adverso, base y favorable; llama trayectoria una vez por escenario. Costo usa cinco años sin pagos; meta termina en su último desembolso.','Tres trayectorias independientes.'),
N('p1',2,1,['trayectoria'],'Calendario ordenado','trayectoria: preparación','Escenario y asignaciones en UF.','Crea aniversarios mensuales, fin, eventos de rescate en fecha de pago − liquidez y eventos de pago. Ordena por fecha, índice y prioridad; prepara saldos y fondos rescatados.','Secuencia de eventos determinista.'),
N('p2',2,2,['netos / periodos'],'R03 por intervalo','trayectoria: capitalización','Saldos y tiempo entre eventos.','r neto = (bruto supuesto + ajuste − TAC)/100. Saldo antes de retiro = saldo × (1 + r neto)^dt. Costo = (saldo inicial + saldo antes de retiro)/2 × TAC/100 × dt. dt en años.','Saldos actualizados y evidencia de cada período.'),
N('p3',2,3,['retirar'],'Liquidez y reserva','trayectoria: evento rescate / retirar','Pago y saldos liquidables de su tramo.','Reserva fondos para el pago según liquidez y compromisos previos; retira proporcionalmente. Si falta, puede usar reservas de otros tramos ya terminados antes de liquidar; nunca capital comprometido para pagos futuros.','Fondos preparados y evidencia de rescates.'),
N('p4',2,4,['min(pago,','preparado)'],'Evento de pago','trayectoria: evento pago','Pago exigido y capital preparado.','Paga hasta lo disponible, suma pagado y pendiente, marca pago completado y registra primera fecha pendiente y agotamiento por tramo/global. Repite hasta el fin.','Detalle de pagos y estados de agotamiento.'),
N('p5',3,5,['Escenario','Resultado'],'Cobertura en UF','trayectoria: return','Saldos finales y pagos acumulados.','Saldo final incluye saldos más preparados. Cobertura = pagado / exigido × 100; sin pagos es null. Devuelve costo acumulado, pendientes, fechas, períodos y rescates.','Saldo final o agotamiento, cobertura y trazabilidad.')],edges:[['p0','p1'],['p1','p2','accent','EVENTOS'],['p2','p3'],['p3','p4'],['p4','p5']]},
];

const lanes=[['USUARIO /','INTERFAZ','UI'],['ENTRADA /','ADAPTADORES','IO'],['APLICACIÓN /','DOMINIO','MOT'],['RESULTADO /','EVIDENCIA','OUT']];
const accessSub={a0:'Falla: out_of_scope',a1:'Cerrada: blocked',a2:'Sin APV: blocked',a3:'Sin mandato: conditional',a4:'Ticket / agregado al corte',a5:'Estado + regla + motivo'};
const panelsById=new Map(panels.map(p=>[p.id,p]));
const nodesByPanel=new Map(panels.map(p=>[p.id,new Map(p.nodes.map(n=>[n.id,n]))]));
const accessPanel=panelsById.get('acceso');
if(!accessPanel) throw new Error('Falta la lámina de acceso.');
for(const n of accessPanel.nodes) n.sub=accessSub[n.id];
// Evita que una salida secundaria atraviese otro nodo de su columna.
for(const [panel,id,col] of [['mapa','m6',3],['nivel1','d5',3],['nivel1','d7',2],['costo','c6',2],['carga','i6',2]]) {
  const node=nodesByPanel.get(panel)?.get(id);
  if(!node) throw new Error(`No existe el nodo ${id} en la lámina ${panel}.`);
  node.col=col;
}
const focalEdges={mapa:['m4','m5','SOLICITUD'],carga:['i3','i4','ENTRADAS'],nivel1:['d0','d1','POSICIÓN'],acceso:['a3','a4','TICKET'],worker:['w1','w2','SOLICITUD'],costo:['c0','c1','LOTE'], 'meta-vp':['g0','g1','PAGOS'],'meta-asignacion':['h0','h1','RESERVA'],restricciones:['v0','v1','CARTERA'],proyeccion:['p0','p1','EVENTOS']};
for(const p of panels) {
  const [from,to,label]=focalEdges[p.id]; p.focus=to;
  p.edges=p.edges.map(([a,b])=>a===from&&b===to?[a,b,'accent',label]:[a,b]);
}
function diagram(p) {
  const active=[...new Set(p.nodes.map(n=>n.lane))].sort((a,b)=>a-b);
  const domainOnly=['nivel1','acceso','costo','meta-vp','meta-asignacion','restricciones','proyeccion'].includes(p.id);
  const roles=domainOnly?[['CASO DE USO /','CONTEXTO','CTX'],['DOMINIO /','PREPARACIÓN','PRE'],['DOMINIO /','CÁLCULO','MOT'],['SALIDA /','EVIDENCIA','OUT']]:lanes.map(l=>[...l]);
  if(p.id==='worker')roles[2]=['WORKER /','CASOS DE USO','RUN'];
  const legendY=36+active.length*80;
  const W=840,H=legendY+80,cy=n=>36+active.indexOf(n.lane)*80+40,cx=n=>140+n.col*112+56;
  const lookup=new Map(p.nodes.map(n=>[n.id,n]));
  const focal=lookup.get(p.focus);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${p.id}-title ${p.id}-desc"><title id="${p.id}-title">${esc(p.title)}</title><desc id="${p.id}-desc">${esc(p.intro)} Cada nodo enlaza a su detalle de entrada, transformación y salida.</desc><defs><pattern id="${p.id}-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r=".6" fill="#e4e7ec"/></pattern><marker id="${p.id}-muted" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6Z" fill="#6f7988"/></marker><marker id="${p.id}-accent" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6Z" fill="#266df0"/></marker></defs><rect width="840" height="${H}" fill="#fff"/><rect y="36" width="840" height="${active.length*80}" fill="url(#${p.id}-dots)"/>`;
  active.forEach((lane,i)=>{const l=roles[lane],y=36+i*80;if(lane===2)s+=`<rect y="${y}" width="840" height="80" fill="#f5f7fa"/>`;s+=`<line x1="0" y1="${y}" x2="840" y2="${y}" stroke="#e4e7ec"/><text x="70" y="${y+36}" text-anchor="middle" font-size="8" font-weight="700" fill="#596575" letter-spacing=".8">${l[0]}</text><text x="70" y="${y+48}" text-anchor="middle" font-size="8" font-weight="700" fill="#596575" letter-spacing=".8">${l[1]}</text>`;});
  s+=`<line x1="140" y1="36" x2="140" y2="${legendY}" stroke="#e4e7ec"/><line x1="0" y1="${legendY}" x2="840" y2="${legendY}" stroke="#e4e7ec"/>`;
  p.steps.forEach((label,j)=>{const x=196+j*112,is=j===focal.col;s+=`<rect x="${x-16}" y="6" width="32" height="16" rx="8" fill="${is?'#e9f0ff':'#eef0f3'}"/><text x="${x}" y="18" text-anchor="middle" font-size="8" fill="${is?'#266df0':'#596575'}">0${j+1}</text><text x="${x}" y="30" text-anchor="middle" font-size="8" fill="${is?'#266df0':'#596575'}">${esc(label)}</text>`;});
  for(const [a,b,style,label] of p.edges) {
    const n=lookup.get(a),m=lookup.get(b),x1=cx(n)+50,x2=cx(m),y2=cy(m);
    const sameSide=p.edges.filter(([from,to])=>from===a&&lookup.get(to).col!==n.col);
    const rank=sameSide.findIndex(([from,to])=>from===a&&to===b);
    const y1=cy(n)+(sameSide.length>1?(rank-(sameSide.length-1)/2)*24:0);
    const color=style==='accent'?'#266df0':'#6f7988';
    let d;
    if(n.lane===m.lane)d=`M ${x1} ${y1} H ${x2-50}`;
    else if(n.col===m.col){d=y2>y1?`M ${cx(n)} ${y1+32} V ${y2-32}`:`M ${cx(n)} ${y1-32} V ${y2+32}`;}
    else {const end=y2>y1?y2-32:y2+32,sgn=y2>y1?1:-1;d=`M ${x1} ${y1} H ${x2-8} Q ${x2} ${y1} ${x2} ${y1+8*sgn} V ${end}`;}
    s+=`<path d="${d}" fill="none" stroke="${color}" stroke-width="${style==='accent'?1.2:1}" marker-end="url(#${p.id}-${style==='accent'?'accent':'muted'})"/>`;
    if(label){const lx=x2-39,ly=(y1+y2)/2;s+=`<rect x="${lx-31}" y="${ly-6}" width="62" height="12" fill="#fff"/><text x="${lx}" y="${ly+2}" text-anchor="middle" font-size="6.5" font-weight="700" fill="#266df0">${label}</text>`;}
  }
  for(const n of p.nodes) {
    const x=cx(n)-50,y=cy(n)-32,focus=n.id===p.focus;
    s+=`<a href="#detail-${n.id}" aria-label="Detalle de ${esc(n.fn)}"><title>${esc(n.fn+' — '+n.operation)}</title><rect x="${x}" y="${y}" width="100" height="64" rx="6" fill="${focus?'#e9f0ff':'#fff'}" stroke="${focus?'#266df0':'#b8c1ce'}"/><rect x="${x+4}" y="${y+4}" width="20" height="10" rx="2" fill="#eef0f4"/><text x="${x+14}" y="${y+11}" text-anchor="middle" font-size="6" font-weight="700" fill="#596575">${roles[n.lane][2]}</text>`;
    n.title.forEach((l,j)=>s+=`<text x="${x+50}" y="${y+25+j*10}" text-anchor="middle" font-size="${l.length>19?6.8:8}" font-weight="650" fill="#1c1d1f">${esc(l)}</text>`);
    s+=`<text x="${x+50}" y="${y+47}" text-anchor="middle" font-size="6.2" fill="#596575">${esc(n.sub)}</text><rect x="${x+4}" y="${y+54}" width="16" height="8" rx="2" fill="#647b99"/><text x="${x+12}" y="${y+60}" text-anchor="middle" font-size="5" fill="#fff">${n.lane===0&&n.col===0?'DB':'TB'}</text><rect x="${x+80}" y="${y+54}" width="16" height="8" rx="2" fill="#75846c"/><text x="${x+88}" y="${y+60}" text-anchor="middle" font-size="5" fill="#fff">${n.lane===3?'FL':'TB'}</text></a>`;
  }
  s+=`<text x="144" y="${legendY+17}" font-size="7" fill="#596575" font-weight="700">ETAPAS</text><text x="220" y="${legendY+17}" font-size="7" fill="#596575">${esc(p.steps.join(' → '))}</text><text x="144" y="${legendY+38}" font-size="7" fill="#596575" font-weight="700">DATOS</text><text x="220" y="${legendY+38}" font-size="7" fill="#596575">DB: archivo · TB: modelo tipado · FL: resultado · chip izquierdo: entrada; derecho: salida</text><text x="144" y="${legendY+59}" font-size="7" fill="#596575" font-weight="700">LECTURA</text><text x="220" y="${legendY+59}" font-size="7" fill="#596575">Flecha azul: transformación focal · pulsa un nodo para consultar su detalle.</text></svg>`;
  return s;
}
const nav='<nav aria-label="Láminas del flujo">'+panels.map(p=>`<a href="#${p.id}">${esc(p.title)}</a>`).join('')+'</nav>';
const body=nav+`<p class="rule">Este documento desarrolla el flujo en diez láminas Data flow. Los nodos son navegables y cada lámina incluye el contrato de entrada, la operación y la salida de las funciones. La separación de pasos de una misma función expresa su lógica interna, no funciones adicionales.</p>`+panels.map(p=>`<section id="${p.id}"><h2>${esc(p.title)}</h2><p class="lead">${esc(p.intro)}</p><div class="figure">${diagram(p)}</div><div class="table-scroll"><table aria-label="Detalle de ${esc(p.title)}"><thead><tr><th>Función / paso</th><th>Recibe</th><th>Qué hace y cómo</th><th>Devuelve / continúa</th></tr></thead><tbody>${p.nodes.map(n=>`<tr id="detail-${n.id}"><td><code>${esc(n.fn)}</code></td><td>${esc(n.input)}</td><td>${esc(n.operation)}</td><td>${esc(n.output)}</td></tr>`).join('')}</tbody></table></div><p class="meta"><a href="#mapa">Volver al recorrido general</a></p></section>`).join('');
writeFileSync(root+'flujo-tecnico.html',page('El recorrido completo de los datos','Referencia técnica de entradas, funciones y salidas. Para la exposición, consulta el flujo funcional resumido.',`<p><a href="flujo-funcional.html">Volver al flujo para la exposición</a></p>`+body,'arquitectura.html'));

const presentationFlow={
  id:'exposicion',title:'De los datos a una propuesta explicable',
  intro:'El usuario carga los archivos y solicita el análisis. El motor aplica las reglas de forma determinista y devuelve resultados con sus motivos. Las propuestas de nivel 2 agregan supuestos, riesgo y plazos.',
  steps:['Cargar','Comprobar','Analizar','Consultar','Proponer','Comparar'],focus:'e6',
  nodes:[
    N('e0',0,0,['Cartola · catálogo','acuerdos'],'Archivos JSON','seleccionar','','',''),
    N('e1',1,1,['Validar los datos'],'Formato y coherencia','leerArchivo / validarNegocio','','',''),
    N('e2',2,2,['Diagnosticar','la cartera'],'Costos y acceso','analizarCartola','','',''),
    N('e3',3,3,['Nivel 1'],'Series y ahorro','AnalysisView','','',''),
    N('e4',0,3,['Añadir supuestos','y, si aplica, meta'],'Retornos y pagos','generarCosto / generarMeta','','',''),
    N('e5',1,4,['Solicitar propuesta'],'Cálculo local','ejecutarPropuesta','','',''),
    N('e6',2,4,['Aplicar las reglas'],'Riesgo, costo y plazos','proponerCostos / proponerMeta','','',''),
    N('e7',3,5,['Nivel 2'],'Ahorro o cobertura','ProposalView / GoalView','','',''),
  ],
  edges:[['e0','e1'],['e1','e2'],['e2','e3'],['e1','e4'],['e4','e5'],['e5','e6','accent','ENTRADAS'],['e6','e7']],
};
function explanatoryDiagram(flow) { return diagram(flow)
  .replace(/<a href="#detail-[^"]+" aria-label="[^"]*">/g,'<g>')
  .replaceAll('</a>','</g>')
  .replace('Flecha azul: transformación focal · pulsa un nodo para consultar su detalle.','Azul: paso central del cálculo · las mismas entradas producen el mismo resultado.'); }
const presentationSvg=explanatoryDiagram(presentationFlow);
const costExplanation={id:'entender-costo',title:'Nivel 2: cómo se busca una mejora de costos',intro:'Se compara la cartera actual con alternativas de menor costo sin aumentar su volatilidad.',steps:['Medir','Explorar','Filtrar','Repartir','Comparar','Explicar'],focus:'k1',nodes:[
  N('k0',1,0,['Cartera actual'],'Costo y volatilidad','Base actual','','',''),
  N('k1',2,1,['Buscar alternativas'],'Series y equivalentes','Alternativas','','',''),
  N('k2',2,2,['Comprobar acceso'],'Solo elegibles','Acceso','','',''),
  N('k3',2,3,['Respetar límites'],'Fondo, AGF y perfil','Asignación','','',''),
  N('k4',2,4,['Comparar carteras'],'Menor costo, sin más riesgo','Comparación','','',''),
  N('k5',3,5,['Propuesta de costo'],'Ahorro y escenarios','Resultado','','',''),
],edges:[['k0','k1','accent','CARTERA'],['k1','k2'],['k2','k3'],['k3','k4'],['k4','k5']]};
const goalExplanation={id:'entender-meta',title:'Nivel 2: cómo se calcula una meta',intro:'El motor reserva dinero para pagos concretos y comprueba si esas reservas alcanzan en sus fechas.',steps:['Ordenar','Descontar','Reservar','Invertir','Simular','Concluir'],focus:'q1',nodes:[
  N('q0',1,0,['Fechas e importes'],'Pagos → tramos','Preparación','','',''),
  N('q1',2,1,['Valor presente'],'Cuánto reservar hoy','VP','','',''),
  N('q2',2,2,['Repartir capital'],'Primero pagos próximos','Reserva','','',''),
  N('q3',2,3,['Elegir inversiones'],'Categoría, costo y límites','Inversión','','',''),
  N('q4',2,4,['Restar costos','y efectuar pagos'],'Tres escenarios','Proyección','','',''),
  N('q5',3,5,['¿Alcanza?'],'Cobertura y pendientes','Conclusión','','',''),
],edges:[['q0','q1','accent','PAGOS'],['q1','q2'],['q2','q3'],['q3','q4'],['q4','q5']]};
const moneyFormatter=new Intl.NumberFormat('es-CL',{minimumFractionDigits:2,maximumFractionDigits:2});
const money=x=>moneyFormatter.format(x);
const sampleShort=300*.99, sampleLong=700*.99**5;
const sampleMissing=1000-sampleShort-sampleLong, sampleCoverage=(sampleShort+sampleLong)/1000*100;
const learningGuide=`
<nav aria-label="Entender los niveles"><a href="#explicacion-nivel1">Nivel 1</a><a href="#explicacion-costo">Nivel 2: costos</a><a href="#explicacion-meta">Nivel 2: meta</a><a href="#ejemplo-meta">Ejemplo de meta</a><a href="#escenarios">Escenarios y conclusión</a></nav>
<section id="explicacion-nivel1"><h2>Nivel 1 · ¿puedo pagar menos dentro del mismo fondo?</h2><p>Parte de lo que el cliente ya tiene. Identifica cada posición y calcula su costo anual: <code>monto × TAC / 100</code>. Después evalúa las otras series del mismo fondo y administradora. Si encuentra una serie elegible con menor TAC, calcula el ahorro; las oportunidades condicionales quedan separadas.</p><p><strong>Qué entrega:</strong> diagnóstico, serie actual y alternativa, costo antes/después, ahorro y motivos de acceso. Aquí no se cambian fondos ni se distribuye dinero para una meta.</p></section>
<section id="explicacion-costo"><h2>Nivel 2 · dos preguntas distintas. La primera: ¿puedo mejorar el costo de toda la cartera?</h2><p>Esta modalidad amplía el nivel 1: puede proponer otro fondo equivalente de la misma categoría. <strong>No necesita una meta.</strong> Recibe los tres archivos base y <code>supuestos.json</code> para medir el riesgo con el mismo método en ambas carteras.</p><div class="figure">${explanatoryDiagram(costExplanation)}</div>
<ol><li><strong>Mide la cartera actual.</strong> Suma costos y calcula su volatilidad ponderada simple. Por ejemplo, 50 % con volatilidad supuesta de 4 % y 50 % con 12 % dan 8 %. Este método no incorpora correlaciones.</li>
<li><strong>Explora alternativas.</strong> Considera retener posiciones, cambiar de serie y usar equivalentes de la misma categoría dentro de los acuerdos. Una alternativa más barata debe superar las mismas reglas de acceso del nivel 1.</li>
<li><strong>Arma carteras que respeten los límites.</strong> Puede repartir montos para cumplir mínimos, concentración por fondo/AGF y crecimiento del perfil. Si necesita reparar perfil o concentración y la primera búsqueda no obtiene candidato, puede ampliar categorías sin aumentar la volatilidad.</li>
<li><strong>Compara las carteras completas.</strong> Descarta las que cuestan más o aumentan la volatilidad. Entre las admisibles conserva la de menor costo encontrada; a igual costo, prefiere menos cambios. El retorno no dirige esta elección.</li>
<li><strong>Explica el resultado.</strong> Informa cambios, ahorro anual y proyección a cinco años. Puede concluir que no encontró mejora o candidato admisible. La búsqueda está limitada a 50.000 nodos y no certifica el mínimo global.</li></ol>
<p class="rule"><strong>Ejemplo didáctico, no resultado de los archivos del proyecto:</strong> sobre una posición de $10.000.000, una TAC de 2 % cuesta $200.000 al año; una alternativa elegible de 1,2 % cuesta $120.000. El ahorro es $80.000. Solo se acepta dentro de una cartera que también cumpla riesgo y límites.</p></section>
<section id="explicacion-meta"><h2>La segunda pregunta: ¿cómo financio pagos futuros sin exceder el riesgo permitido?</h2><p>Una meta es un <strong>calendario de pagos</strong> y un capital asignado para financiarlos. No consiste en elegir el fondo con mayor retorno. El motor intenta que el dinero necesario para cada pago esté invertido en categorías acordes a su plazo y disponible a tiempo.</p><p><strong>Recibe:</strong> cartola (cliente y perfil), catálogo (categorías, series, costos, mínimos y liquidez), acuerdos (acceso), supuestos (retornos, volatilidad, límites, tramos y UF) y meta (capital y desembolsos). El capital de la meta se declara explícitamente; no se deduce que haya que vender toda la cartola.</p>
<div class="figure">${explanatoryDiagram(goalExplanation)}</div>
<ol><li><strong>Ordena los pagos y los agrupa por plazo.</strong> Calcula cuántos meses faltan para cada desembolso y lo sitúa en un tramo de <code>supuestos.json</code>. Cada tramo tiene categorías permitidas. Los límites de meses y las categorías vienen de ese archivo.</li>
<li><strong>Calcula cuánto necesita reservar hoy.</strong> Convierte capital CLP a UF usando el valor UF declarado. Para cada pago calcula <code>VP = pago futuro / (1 + retorno real bruto supuesto)^años</code> y suma los VP del tramo. Si usa varias categorías, toma el promedio simple de sus retornos supuestos, una vez por categoría efectiva. Por ejemplo, 500 UF a cinco años con 2 % real bruto supuesto tienen VP aproximado de <strong>${money(500/1.02**5)} UF</strong>.</li>
<li><strong>Reparte el capital disponible.</strong> Reserva los VP por orden de pago. Si falta dinero, prioriza los pagos próximos y declara el déficit. Si sobra, lo destina al tramo ocupado más largo. Peso requerido del tramo = VP / capital asignado; el peso efectivo depende de cuánto se logró invertir.</li>
<li><strong>Busca dónde invertir cada reserva.</strong> Dentro de las categorías admitidas considera series elegibles de menor TAC y liquidez compatible con el primer pago del tramo. Verifica mínimos con el total nuevo invertido en el mismo fondo/serie entre tramos; también limita fondo, AGF y crecimiento. Si una parte no se puede invertir respetando las reglas, la declara como capital no asignable.</li>
<li><strong>Reduce el crecimiento cuando el primer pago está cerca.</strong> Tope efectivo = tope del perfil × <code>min(1, meses al primer pago / 24)</code>. Si el perfil admite 40 % y faltan 12 meses, el máximo baja a 20 %. La renta variable cuenta como 1, los balanceados como 0,5 y el resto como 0. Una brecha no autoriza a superar ese máximo.</li>
<li><strong>Simula y comprueba los pagos.</strong> Descuenta TAC del retorno supuesto, prepara rescates con antelación según liquidez y paga hasta donde alcance cada reserva. Solo puede transferir excedentes de tramos ya terminados, sin tomar dinero comprometido para pagos futuros.</li></ol>
<p class="rule"><strong>La asignación y el VP se comprueban juntos.</strong> Si cambia la combinación de categorías, cambia la tasa usada en el VP. El motor solo conserva combinaciones cuyas categorías estén realmente invertidas y cuyos importes finales cumplan las restricciones.</p></section>
<section id="ejemplo-meta"><h2>Una meta con números, paso a paso</h2><p><strong>Ejemplo didáctico simplificado:</strong> capital de 1.000 UF; un pago de 300 UF en un año y otro de 700 UF en cinco años. Suponemos dos tramos permitidos, retorno real bruto de 0 % y TAC de 1 % anual en ambos. Para aislar el cálculo asumimos acceso, liquidez inmediata y límites ya satisfechos. Usamos años exactos; la aplicación calcula años a partir de días / 365,25.</p>
<div class="table-scroll"><table aria-label="Reservas y pagos del ejemplo de meta"><thead><tr><th>Concepto</th><th>Pago próximo</th><th>Pago lejano</th></tr></thead><tbody>
<tr><td>Importe y plazo</td><td>300 UF dentro de un año.</td><td>700 UF dentro de cinco años.</td></tr>
<tr><td>VP con retorno bruto supuesto de 0 %</td><td>300 / (1 + 0)¹ = 300 UF.</td><td>700 / (1 + 0)⁵ = 700 UF.</td></tr>
<tr><td>Capital reservado y peso</td><td>300 UF, el 30 % del capital.</td><td>700 UF, el 70 % del capital.</td></tr>
<tr><td>Retorno neto supuesto</td><td>0 % bruto − 1 % TAC = −1 % anual.</td><td>0 % bruto − 1 % TAC = −1 % anual.</td></tr>
<tr><td>Saldo disponible en la fecha del pago</td><td>300 × 0,99 = ${money(sampleShort)} UF.</td><td>700 × 0,99⁵ = ${money(sampleLong)} UF.</td></tr>
<tr><td>Pendiente de pago</td><td>${money(300-sampleShort)} UF.</td><td>${money(700-sampleLong)} UF.</td></tr>
</tbody></table></div>
<p><strong>Qué concluye:</strong> los VP sumaban exactamente el capital, pero después de costos quedan <strong>${money(sampleMissing)} UF de pagos pendientes</strong>. La cobertura base es <strong>${money(sampleCoverage)} %</strong>: UF efectivamente pagadas / UF exigidas × 100. La conclusión es «no alcanza en el escenario base».</p>
<p>Si el capital fuera 900 UF, faltarían 100 UF ya en el VP: se reservarían primero 300 UF para el pago próximo y las 600 restantes para el lejano. Si fuera 1.100 UF, las 100 UF de excedente inicial irían al tramo largo, siempre sujetas a sus límites. En los dos casos todavía habría que simular los pagos netos antes de concluir.</p></section>
<section id="escenarios"><h2>Cómo decide si alcanza y qué significan los tres escenarios</h2><p>Sobre la <strong>misma propuesta inicial</strong>, cambia únicamente el retorno real bruto de cada categoría. No vuelve a elegir inversiones más arriesgadas para mejorar un escenario.</p>
<div class="table-scroll"><table aria-label="Escenarios del nivel dos"><thead><tr><th>Escenario</th><th>Ajuste al bruto supuesto</th><th>Neto en el ejemplo con bruto 0 % y TAC 1 %</th></tr></thead><tbody><tr><td>Adverso</td><td>−1,5 puntos porcentuales.</td><td>−2,5 % anual supuesto.</td></tr><tr><td>Base</td><td>Sin ajuste.</td><td>−1 % anual supuesto.</td></tr><tr><td>Favorable</td><td>+1,5 puntos porcentuales.</td><td>+0,5 % anual supuesto.</td></tr></tbody></table></div>
<p>En costos informa saldo final a cinco años. En meta informa cuánto se pagó, cuánto quedó pendiente, cobertura y saldo final o fecha de agotamiento. Los retornos, la volatilidad, el VP y los saldos futuros se identifican como <strong>supuestos</strong>.</p>
<div class="cards"><article class="card"><h3>Son tres comprobaciones diferentes</h3><p><strong>¿Cumple las reglas?</strong> La cartera es admisible si respeta acceso, perfil y límites.</p><p><strong>¿Cuánto exige reservar hoy?</strong> El VP permite comparar requerimiento inicial y capital.</p><p><strong>¿Paga todo a tiempo?</strong> La conclusión depende del escenario base neto después de costos: exige cartera admisible y todos los pagos completos en fecha.</p></article><article class="card"><h3>Tres cifras que no hay que confundir</h3><p><strong>Déficit de VP:</strong> diferencia inicial entre valores presentes y capital.</p><p><strong>Capital no asignable:</strong> dinero disponible que no pudo invertirse cumpliendo restricciones.</p><p><strong>Pagos pendientes:</strong> UF futuras que la simulación no consiguió pagar. No equivalen al capital adicional exacto necesario hoy.</p></article></div>
<p><strong>Costo acumulado:</strong> el motor suma, por instrumento e intervalo, <code>saldo medio × TAC × tiempo</code>, usando tasas fraccionarias y tiempo en años. Ese costo se informa por separado; no se resta dos veces, porque la trayectoria ya usa retorno neto.</p>
<p class="rule"><strong>Para explicarlo en la presentación:</strong> «En el nivel 1 busco una serie más barata de lo que ya tiene el cliente. En el nivel 2 puedo buscar fondos equivalentes sin aumentar el riesgo o repartir el capital para pagos futuros. En una meta calculo reservas por plazo, verifico dónde se pueden invertir y simulo los pagos después de costos. Si no alcanza, muestro la brecha; no la disimulo agregando riesgo».</p></section>`;
const presentationBody=`
<div class="figure">${presentationSvg}</div>
<div class="cards">
  <article class="card"><h2>Nivel 1 · entender y reducir costos</h2><p>Identifica las posiciones, calcula costo anual y TAC, y compara series del mismo fondo y administradora. Elige una serie más barata solo si es elegible. Explica por qué una alternativa queda bloqueada o condicionada.</p><p><strong>Ejemplo de función:</strong> <code>analizarCartola(cartola, catalogo, acuerdos)</code> devuelve el diagnóstico, los cambios de serie y el ahorro.</p></article>
  <article class="card"><h2>Nivel 2 · proponer con restricciones</h2><p><strong>Costos:</strong> busca una cartera más barata sin aumentar la volatilidad. <strong>Meta:</strong> distribuye el capital según las fechas de los pagos e informa si alcanza o cuánto queda pendiente. Proyecta tres escenarios con supuestos declarados.</p><p><strong>Ejemplos de funciones:</strong> <code>proponerCostos(entrada)</code> y <code>proponerMeta(entrada)</code>.</p></article>
</div>
${learningGuide}
<section id="demo"><h2>Qué demostrar al cambiar datos en vivo</h2><p>Modificar el JSON, volver a cargarlo y repetir el análisis. La aplicación invalida los resultados anteriores cuando se selecciona un archivo nuevo.</p>
<div class="table-scroll"><table aria-label="Cambios en vivo y respuesta esperada"><thead><tr><th>Cambio</th><th>Qué debe pasar</th><th>Qué explica</th></tr></thead><tbody>
<tr><td>Subir el mínimo de una serie</td><td>Si el ticket deja de alcanzar y supera las reglas anteriores, la serie queda condicional con patrimonio válido suficiente o bloqueada si no lo acredita. Se vuelve a evaluar la alternativa elegida.</td><td>El menor costo no basta: hay que poder acceder a la serie.</td></tr>
<tr><td>Cerrar una serie: <code>abierta: false</code></td><td>Dentro del universo habilitado, queda bloqueada para nuevas contrataciones. Puede elegirse otra serie o conservarse la actual sin mejora; tenerla no obliga a venderla.</td><td>Se distingue tenencia existente de acceso a una nueva inversión.</td></tr>
<tr><td>Cambiar la TAC</td><td>Se recalculan los costos y el ahorro; puede cambiar cuál serie elegible es la más barata.</td><td>La decisión responde al costo del cliente.</td></tr>
<tr><td>Cambiar solo la comisión de distribución</td><td>Con la misma habilitación y condiciones, las decisiones y cifras financieras permanecen iguales. Se cambia el valor de la comisión conservando la clave de la serie.</td><td>La remuneración del distribuidor no dirige la propuesta ni se suma a la TAC.</td></tr>
</tbody></table></div></section>
<details><summary>Apoyo para explicar las decisiones y las reglas discutibles</summary>
<div class="cards"><article class="card"><h3>Decisiones implementadas</h3><p><strong>Motor separado de la página:</strong> las funciones reciben datos y devuelven resultados; la interfaz los muestra. Así se pueden probar sin abrir el sitio.</p><p><strong>Resultados reproducibles:</strong> las fechas y parámetros vienen en los archivos. Se calcula antes de redondear y se conserva el motivo de las decisiones.</p><p><strong>Alcance acotado:</strong> archivos JSON y cálculo local; sin cuentas, base de datos ni IA dentro del cálculo. El nivel 2 usa una búsqueda limitada y no promete el óptimo global.</p></article>
<article class="card"><h3>Dos reglas que discutiría</h3><p><strong>Primera coincidencia en el acceso:</strong> hace la decisión determinista y fácil de auditar, pero el primer motivo puede ocultar otro requisito pendiente. Propondría mantener ese estado principal y añadir un diagnóstico de todas las condiciones antes de ejecutar.</p><p><strong>Volatilidad ponderada simple:</strong> permite explicar y comparar ambas carteras con el mismo método, pero no incorpora correlaciones. Para evolucionar el modelo, evaluaría datos de correlación y pruebas adicionales antes de sustituirlo.</p><p>Estas mejoras son propuestas de evolución; el comportamiento actual sigue las decisiones documentadas.</p></article></div>
<p>En el repositorio, mostrar <code>SPEC.md</code> y <code>specs/</code> para justificar decisiones, <code>src/domain/</code> para ubicar el motor y <code>npm test</code> para comprobar las regresiones.</p></details>
<p class="meta"><a href="flujo-tecnico.html">Consultar el recorrido técnico completo por funciones</a> · <a href="arquitectura.html">Ver arquitectura por capas</a></p>`;
writeFileSync(root+'flujo-funcional.html',page('Cómo responde el motor a los datos','Flujo para la exposición: qué ingresa, qué comprueba el motor y qué entrega en cada nivel. El resultado se puede explicar y volver a comprobar al cambiar los datos.',presentationBody,'arquitectura.html'));
// El verificador del plugin reúne los SVG de un HTML; se verifica cada lámina
// por separado para no confundir coordenadas de diagramas independientes.
if(process.argv.includes('--verify')) {
  const dir=mkdtempSync(tmpdir()+'/motor-diagramas-');
  for(const p of panels) writeFileSync(`${dir}/${p.id}.html`,page(p.title,p.intro,diagram(p),'arquitectura.html'));
  writeFileSync(`${dir}/exposicion.html`,page(presentationFlow.title,presentationFlow.intro,presentationSvg,'arquitectura.html'));
  writeFileSync(`${dir}/explicacion-costo.html`,page(costExplanation.title,costExplanation.intro,explanatoryDiagram(costExplanation),'arquitectura.html'));
  writeFileSync(`${dir}/explicacion-meta.html`,page(goalExplanation.title,goalExplanation.intro,explanatoryDiagram(goalExplanation),'arquitectura.html'));
  console.log(dir);
}
