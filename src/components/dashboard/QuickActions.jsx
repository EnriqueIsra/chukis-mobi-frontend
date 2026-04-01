import { useNavigate } from 'react-router-dom'
import './quickActions.css'

export const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        { label: "Nueva Renta", icon: "bi-plus-lg", path: "/rentals" },
        { label: "Agregar Cliente", icon: "bi-person-plus", path: "/clients" },
        { label: "Nuevo Usuario", icon: "bi-person-gear", path: "/users" },
        { label: "Nuevo Producto", icon: "bi-box-seam", path: "/products" },
        { label: "Nuevo Proveedor", icon: "bi-truck", path: "/providers" },
        { label: "Nuevo Gasto", icon: "bi-cash-stack", path: "/expenses" },
        { label: "Pago a Trabajador", icon: "bi-cash-coin", path: "/nomina" },
    ];

    return (
        <div className='card shadow-sm mb-4'>
            <div className='card-body'>
                <h5 className='card-title mb-3'>
                    <i className='bi bi-lightning-charge me-2 text-warning'></i>
                    Acciones Rapidas
                </h5>
                <div className='d-flex flex-wrap gap-2'>
                    {actions.map((action) => (
                        <button
                            key={action.path}
                            className='btn quick-action-btn'
                            onClick={() => navigate(action.path)}
                        >
                            <i className={`bi ${action.icon} me-2`}></i>
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickActions;