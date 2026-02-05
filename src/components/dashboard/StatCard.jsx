import './statCard.css'
/* 
    Componente StatCard - Tarjeta de estadística para el dashboard
    Muestra un icono, valor y título con diseño de gradiante

    Props:
    - title: Texto descriptivo de la métrica
    - value: Valor numérico o texto a mostrar
    - icon: Clase de Bootstrap Icon (ej: "bi-box-seam")
    - color: Color del valor (primary, success, warning, info, danger)
    - onClick: Función opcional al hacer clic
*/
export const StatCard = ({ title, value, icon, color, onClick }) => {
    return (
        <div className="col-12 col-sm-6 col-lg-4 mb-4">
            <div
                className={`card stat-card h-100 shadow-sm ${onClick ? 'clickable' : ''}`}
                onClick={onClick}
            >
                {/* Header con gradiente e icono */}
                <div className='stat-card-header'>
                    <div className="stat-icon-wrapper">
                        <i className={`bi ${icon}`}></i>
                    </div>
                </div>
                {/* Body con valor y título */}
                <div className="card-body text-center">
                    <h3 className={`stat-value text-${color}`}>{value}</h3>
                    <p className="stat-title mb-0">{title}</p>
                </div>
            </div>
        </div>
    );
};
export default StatCard;