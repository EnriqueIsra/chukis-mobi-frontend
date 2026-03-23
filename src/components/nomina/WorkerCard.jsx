import PropTypes from "prop-types";
import Swal from "sweetalert2";
import "./workerCard.css";

export const WorkerCard = ({ summary, onEdit, onDeactivate, onActivate, showInactive, currentUser }) => {

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

    const handleActivate = async (payment) => {
        const result = await Swal.fire({
            title: "¿Reactivar pago?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Reactivar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#198754"
        });
        if (result.isConfirmed) {
            onActivate(payment.id);
        }
    };

    return (
        <div className="worker-card">
            <div className="worker-card-header">
                {summary.workerImageUrl ? (
                    <img
                        src={summary.workerImageUrl}
                        alt={summary.workerUsername}
                        className="worker-card-avatar"
                    />
                ) : (
                    <div className="worker-card-avatar-placeholder">
                        <i className="bi bi-person-fill"></i>
                    </div>
                )}
                <div>
                    <h5 className="worker-card-name">{summary.workerUsername}</h5>
                    <span className="worker-card-total">
                        Total: ${summary.totalAmount.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="worker-card-payments">
                {summary.payments.length === 0 ? (
                    <p className="text-muted text-center">Sin pagos este mes</p>
                ) : (
                    summary.payments.map((payment) => (
                        <div key={payment.id} className={`worker-card-payment-item ${!payment.active ? "worker-card-payment-inactive" : ""}`}>
                            <div className="worker-card-payment-info">
                                <span className="worker-card-payment-date">
                                    {new Date(payment.paymentDate).toLocaleDateString("es-MX")}
                                </span>
                                <span className="worker-card-payment-amount">
                                    ${payment.amount.toLocaleString()}
                                </span>
                            </div>
                            {payment.notes && (
                                <span className="worker-card-payment-notes">{payment.notes}</span>
                            )}
                            {showInactive && payment.desactivationReason && (
                                <span className="worker-card-payment-notes text-danger">
                                    Motivo: {payment.desactivationReason}
                                </span>
                            )}
                            {currentUser?.role === "ADMIN" && (
                                <div className="worker-card-payment-actions">
                                    {payment.active ? (
                                        <>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => onEdit(payment)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeactivate(payment)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="btn btn-sm btn-outline-success"
                                            onClick={() => handleActivate(payment)}
                                        >
                                            <i className="bi bi-arrow-counterclockwise"></i>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

WorkerCard.propTypes = {
    summary: PropTypes.object.isRequired,
    onEdit: PropTypes.func,
    onDeactivate: PropTypes.func,
    onActivate: PropTypes.func,
    showInactive: PropTypes.bool,
    currentUser: PropTypes.object
};
