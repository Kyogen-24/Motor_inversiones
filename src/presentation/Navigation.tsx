import { useEffect, useRef } from 'react';
import { ArrowUpRight, BookOpen, ChartNoAxesCombined, Database, Layers3, X } from 'lucide-react';

export type Vista = 'analisis' | 'datos' | 'reglas';
interface Props {
  readonly vista: Vista;
  readonly abierto: boolean;
  readonly navegar: (vista: Vista) => void;
  readonly alCerrar: () => void;
}
export default function Navigation({ vista, abierto, navegar, alCerrar }: Props) {
  const menu = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialogo = menu.current!;
    const media = window.matchMedia('(max-width: 760px)');
    function sincronizar() {
      dialogo.close();
      if (!media.matches) dialogo.show();
      else if (abierto) dialogo.showModal();
    }
    sincronizar();
    media.addEventListener('change', sincronizar);
    return () => { media.removeEventListener('change', sincronizar); dialogo.close(); };
  }, [abierto]);
  const activo = (destino: Vista) => vista === destino ? 'is-active' : '';
  return (
    <dialog ref={menu} aria-label="Navegación del Motor_inversiones" onCancel={e => { e.preventDefault(); alCerrar(); }} className="ts-sidebar">
      <button className="ts-brand" onClick={() => navegar('analisis')} aria-label="Motor_inversiones, inicio">Motor_inversiones</button>
      <button className="ts-mobile-close ts-icon-button" aria-label="Cerrar navegación" onClick={alCerrar}><X size={18} /></button>
      <div className="ts-workspace"><span className="ts-workspace-avatar">V</span><div>Espacio de análisis<span>Análisis de inversiones</span></div></div>
      <div className="ts-nav-label">ESPACIO DE TRABAJO</div>
      <nav aria-label="Navegación principal">
        <button className={`ts-nav-item ${activo('analisis')}`} aria-current={vista === 'analisis' ? 'page' : undefined} onClick={() => navegar('analisis')}><ChartNoAxesCombined size={17} aria-hidden="true" />Análisis de cartola</button>
        <button className={`ts-nav-item ${activo('datos')}`} aria-current={vista === 'datos' ? 'page' : undefined} onClick={() => navegar('datos')}><Database size={17} aria-hidden="true" />Archivos de entrada</button>
        <button className={`ts-nav-item ${activo('reglas')}`} aria-current={vista === 'reglas' ? 'page' : undefined} onClick={() => navegar('reglas')}><BookOpen size={17} aria-hidden="true" />Cómo se calcula</button>
      </nav>
      <div className="ts-sidebar-note"><Layers3 size={18} aria-hidden="true" /><h3>Evidencia para decidir</h3><p>El motor compara costos.<br />Una persona revisa y decide.</p><button onClick={() => navegar('reglas')}>Conocer las reglas<ArrowUpRight size={13} aria-hidden="true" /></button></div>
    </dialog>
  );
}
