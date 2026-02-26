/* 
    ModuleHeader: Componente reutilizable para el header de cualquier módulo
    ----------------------------------
    Props:
        title       -> texto del título (ej: "Productos", "Clientes", "Rentas")
        children    -> los controles que van dentro del row (botones, inputs, toolbars) cada módulo pasa sus propios ncontroles como hijos
    ----------------------------------
    Uso: 
        <ModuleHeader title="Productos">
            <div className="col-12 col-lg-auto">
                <button>...</button>
            </div>
            <div className="col-12 col-lg">
                <input ... />
            </div>
        </ModuleHeader>
    
    El componente genera la estructura:
        .module-header
            h2.module-title -> {title}
            hr.module-title-divider .row    -> {children}   <- aquí cada módulo mete sus controles
*/
import "./moduleHeader.css";

export const ModuleHeader = ({ title, children }) => {
    return (
        <div className="module-header">
            <h2 className="module-title">{title}</h2>
            <hr className="module-title-divider" />
            <div className="row align-items-center g-2">
                {children}
            </div>
        </div>
    )
}