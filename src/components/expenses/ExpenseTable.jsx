import PropTypes from "prop-types";
import Swal from "sweetalert2";

const CATEGORY_LABELS = {
    GASOLINA: "Gasolina",
    MANTENIMIENTO_VEHICULAR: "Mant. Vehicular",
    LIMPIEZA_MANTENIMIENTO_MOBILIARIO: "Mant. Mobiliario",
    INVERSION_INVENTARIO: "Inversión Inventario",
    OTROS: "Otros",
};

export const ExpenseTable = ({
    expenses,
    onEdit,
    onDeactivate,
    onActivate,
    showInactive,
    currentUser,
}) => {
    const handleDeactivate = async (expense) => {
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
            confirmButtonColor: "#d33",
        });
        if (result.isConfirmed) {
            onDeactivate(expense.id, result.value);
        }
    };

    return (
        <div className="table-responsive">
            <table className="table table-bordered table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>Categoría</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th>Registrado por</th>
                        {showInactive && <th>Motivo desactivación</th>}
                        {currentUser?.role === "ADMIN" && <th>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr
                            key={expense.id}
                            className={!expense.active ? "table-secondary" : ""}
                        >
                            <td>{CATEGORY_LABELS[expense.category] || expense.category}</td>
                            <td>${expense.amount.toLocaleString()}</td>
                            <td className="text-capitalize">{new Date(expense.expenseDate).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                            <td>{expense.description || "—"}</td>
                            <td>{expense.username}</td>
                            {showInactive && <td>{expense.desactivationReason || "—"}</td>}
                            {currentUser?.role === "ADMIN" && (
                                <td>
                                    <div className="d-flex gap-1 flex-wrap">
                                    {expense.active ? (
                                        <>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => onEdit(expense)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                                <span className="d-none d-md-inline"> Editar</span>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeactivate(expense)}
                                            >
                                                <i className="bi bi-trash"></i>
                                                <span className="d-none d-md-inline"> Desactivar</span>
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
                                            <span className="d-none d-md-inline"> Reactivar</span>
                                        </button>
                                    )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    {expenses.length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center text-muted py-4">
                                No hay gastos registrados
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

ExpenseTable.propTypes = {
    expenses: PropTypes.array.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDeactivate: PropTypes.func.isRequired,
    onActivate: PropTypes.func.isRequired,
    showInactive: PropTypes.bool.isRequired,
    currentUser: PropTypes.object,
};
