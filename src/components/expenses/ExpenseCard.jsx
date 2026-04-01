import PropTypes from "prop-types";
import Swal from "sweetalert2";
import "./expenseCard.css";

const CATEGORY_CONFIG = {
    GASOLINA: { icon: "bi-fuel-pump", color: "#ff6b35", label: "Gasolina" },
    MANTENIMIENTO_VEHICULAR: { icon: "bi-wrench", color: "#ffc107", label: "Mant. Vehicular" },
    LIMPIEZA_MANTENIMIENTO_MOBILIARIO: { icon: "bi-spray", color: "#0dcaf0", label: "Mant. Mobiliario" },
    INVERSION_INVENTARIO: { icon: "bi-cart-plus", color: "#198754", label: "Inversión Inventario" },
    OTROS: { icon: "bi-three-dots", color: "#6c757d", label: "Otros" }
};

export const ExpenseCard = ({ expense, onEdit, onDeactivate, onActivate, currentUser }) => {

    const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.OTROS;

    const handleDeactivate = async () => {
        const result = await Swal.fire({
            title: "¿Desactivar gasto?",
            input: "textarea",
            inputLabel: "Motivo de desactivación",
            inputPlaceholder: "Escribe el motivo...",
            inputValidator: (value) => {
                if (!value) return "El motivo es obligatorio";
            },
            showCancelButton: true,
            confirmButtonText: "Desactivar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33"
        });
        if (result.isConfirmed) {
            onDeactivate(expense.id, result.value);
        }
    };

    return (
        <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-3">
            <div className="card expense-card h-100 shadow-sm position-relative">

                {/* Hover actions — solo ADMIN */}
                {currentUser?.role === "ADMIN" && (
                    <div className="card-actions" style={!expense.active ? { opacity: 1, pointerEvents: "auto" } : {}}>
                        {expense.active ? (
                            <>
                                <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => onEdit(expense)}
                                    title="Editar"
                                >
                                    <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={handleDeactivate}
                                    title="Desactivar"
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn btn-sm btn-outline-success"
                                title="Reactivar"
                                onClick={async () => {
                                    const r = await Swal.fire({
                                        title: "¿Reactivar gasto?",
                                        icon: "question",
                                        showCancelButton: true,
                                        confirmButtonText: "Reactivar",
                                        cancelButtonText: "Cancelar",
                                        confirmButtonColor: "#198754"
                                    });
                                    if (r.isConfirmed) onActivate(expense.id);
                                }}
                            >
                                <i className="bi bi-arrow-counterclockwise"></i>
                            </button>
                        )}
                    </div>
                )}

                {/* Contenido con opacidad si está desactivado */}
                <div style={!expense.active ? { opacity: 0.5 } : {}}>
                {/* Barra de color por categoría */}
                <div style={{ height: "5px", backgroundColor: config.color }}></div>

                {/* Imagen del recibo (si existe) */}
                {expense.imageUrl && (
                    <img
                        src={expense.imageUrl}
                        className="card-img-top"
                        style={{ height: "150px", objectFit: "cover" }}
                        alt="Recibo"
                    />
                )}

                {/* Body */}
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge" style={{ backgroundColor: config.color }}>
                            <i className={`bi ${config.icon} me-1`}></i>
                            {config.label}
                        </span>
                        <span className="fw-bold fs-5">${expense.amount.toLocaleString()}</span>
                    </div>

                    {expense.description && (
                        <p className="text-muted small mb-2">{expense.description}</p>
                    )}

                    <small className="text-muted text-capitalize">
                        <i className="bi bi-calendar me-1"></i>
                        {new Date(expense.expenseDate).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </small>
                </div>

                </div>
                {/* Footer */}
                <div className="card-footer bg-white">
                    <small className="text-muted">
                        <i className="bi bi-person me-1"></i>
                        {expense.username}
                    </small>
                    {!expense.active && expense.desactivationReason && (
                        <small className="text-danger d-block mt-1">
                            <i className="bi bi-exclamation-circle me-1"></i>
                            {expense.desactivationReason}
                        </small>
                    )}
                </div>
            </div>
        </div>
    );
};

ExpenseCard.propTypes = {
    expense: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDeactivate: PropTypes.func.isRequired,
    onActivate: PropTypes.func.isRequired,
    currentUser: PropTypes.object
};
