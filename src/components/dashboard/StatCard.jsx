import { useState } from 'react';
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

    Props nuevas (modo expandible)
    - expandible: boolean - si es true, la tarjeta se expande al hacer clic
    - children: contenido JSX que se muestra cuando la tarjeta está expandida
*/
export const StatCard = ({ title, value, icon, color, onClick, expandible, children }) => {

    // Estado para controlar si el panel expandible está abierto o cerrado. Solo se usa cuando expandible = true
    const [isExpanded, setIsExpanded] = useState(false)

    // Handler del clic en la tarjeta
    // Si es expandible: alterna el estado abierto/cerrado (toggle)
    // Si no es expandible: ejecuta el onClick del padre (ej: navegar a /rentals).
    const handleClick = () => {
        if (expandible) {
            setIsExpanded(!isExpanded)
        } else if (onClick) {
            onClick()
        }
    } 

    return (
        <div className={`col-12 col-sm-6 col-lg-4 mb-4 ${expandible ? 'stat-card-col' : ''}`}>
            <div
                className={`card stat-card h-100 shadow-sm ${onClick || expandible ? 'clickable' : ''}`}
                onClick={handleClick}
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
                    <p className="stat-title mb-0">
                        {title}
                        {/* Flecha chevron: solo visible si la tarjeta es expandible */}
                        {/* Rota 180° cuando está expandida */}
                        {expandible && (
                            <i className={`bi bi-chevron-down ms-2 stat-chevron ${isExpanded ? 'rotated' : ''}`}></i>
                        )}
                        </p>
                </div>
            </div>

            {/* Panel expandible: se muestra debajo de la tarjeta */}
            {/* Solo se renderiza cuando expandible = true y isExpanded = true */}
            {/* El contenido (children) viene del componente padre (DashboardPage) */}
            {expandible && isExpanded && (
                <div className='stat-card-expand'>
                    {children}
                </div>
            )}
        </div>
    );
};
export default StatCard;