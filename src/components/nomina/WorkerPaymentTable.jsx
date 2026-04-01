import PropTypes from "prop-types";
import Swal from "sweetalert2";

export const WorkerPaymentTable = ({ payments, onEdit, onDeactivate, onActivate, showInactive, currentUser }) => {

    const handleDeactivate = async (payment) => {
        const result = await Swal.fire({
            title: "¿Desactivar pago?",
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
            onDeactivate(payment.id, result.value);
        }
    };

    return (
        <div className="table-responsive">
            <table className="table table-bordered table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>Trabajador</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Registrado por</th>
                        <th>Notas</th>
                        {showInactive && <th>Motivo desactivación</th>}
                        {currentUser?.role === "ADMIN" && <th>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id} className={!payment.active ? "table-secondary" : ""}>
                            <td>{payment.workerUsername}</td>
                            <td>${payment.amount.toLocaleString()}</td>
                            <td className="text-capitalize">{new Date(payment.paymentDate).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                            <td>{payment.registeredByUsername}</td>
                            <td>{payment.notes || "—"}</td>
                            {showInactive && <td>{payment.desactivationReason || "—"}</td>}
                            {currentUser?.role === "ADMIN" && (
                                <td>
                                    <div className="d-flex gap-1 flex-wrap">
                                    {payment.active ? (
                                        <>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => onEdit(payment)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                                <span className="d-none d-md-inline"> Editar</span>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeactivate(payment)}
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
                                                    title: "¿Reactivar pago?",
                                                    icon: "question",
                                                    showCancelButton: true,
                                                    confirmButtonText: "Reactivar",
                                                    cancelButtonText: "Cancelar",
                                                    confirmButtonColor: "#198754"
                                                });
                                                if (r.isConfirmed) onActivate(payment.id);
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
                    {payments.length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center text-muted py-4">
                                No hay pagos registrados
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

WorkerPaymentTable.propTypes = {
    payments: PropTypes.array.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDeactivate: PropTypes.func.isRequired,
    onActivate: PropTypes.func.isRequired,
    showInactive: PropTypes.bool.isRequired,
    currentUser: PropTypes.object
};
