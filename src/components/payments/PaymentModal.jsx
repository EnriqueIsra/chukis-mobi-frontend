import { useState, useEffect } from "react";
import { createPayment, getPaymentsByRentalId } from "../../services/paymentService";
import Swal from "sweetalert2";
import "./paymentModal.css";

/* 
    Modal para registrar pagos/anticipos de una renta
    Props:
    - rental: Objeto con datos de la renta (id, total, status, etc.)
    - onClose: Función para cerrar el modal
    - onPaymentCreated: Callback cuando se crea un pago exitosamente
*/
const PaymentModal = ({ rental, onClose, onPaymentCreated }) => {
    // Estado del formulario
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    // Estado para historial de pagos
    const [payments, setPayments] = useState([])
    const [loadingPayments, setLoadingPayments] = useState(true)

    // Bandera para mostrar advertencia cuando el usuario ingresa más del máximo
    const [showAmountWarning, setShowAmountWarning] = useState(false)

    // Calcular totales
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const pending = rental.total - totalPaid

    // Cargar el hostorial de pagos al abrir el modal
    useEffect(() => {
        loadPayments()
    }, [rental.id])

    // Función para cargar pagos
    const loadPayments = async () => {
        setLoadingPayments(true)
        try {
            const response = await getPaymentsByRentalId(rental.id)
            setPayments(response.data || [])
        } catch (error) {
            console.error("Error loading payments: ", error)
        } finally {
            setLoadingPayments(false)
        }
    }

    // Validar monto en tiempo real 
    // Si el usuario ingresa más del pendiente:
    // 1.- Auto-corregir el valor al máximo (pending)
    // 2.- Muestra texto rojo de advertencia
    // 3.- Oculta la advertencia después de 3 segundos.
    const handleAmountChange = (e) => {
        const value = Number(e.target.value)
        if (value > pending) {
            setAmount(pending.toString())
            setShowAmountWarning(true)
            setTimeout(() => setShowAmountWarning(false), 3000)
        } else {
            setAmount(e.target.value)
            setShowAmountWarning(false)
        }
    }

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validar monto
        const amountNum = Number(amount)
        if (!amountNum || amountNum <= 0) {
            Swal.fire("Error", "Ingresa un monto válido", "error")
            return
        }

        setLoading(true)
        try {
            // Crear el pago
            await createPayment({
                rentalId: rental.id,
                amount: amountNum,
                notes: notes.trim() || null
            })

            // Mostrar éxito
            Swal.fire({
                title: "Pago registrado",
                text: `Se registró un pago de $${amountNum.toLocaleString()}`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            })

            // Limpiar formulario
            setAmount("")
            setNotes("")

            // Recargar historial para que el nuevo pago aparezca de inmediato
            await loadPayments()

            // Notificar al padre para que recargue sus datos (stats, etc.)
            if (onPaymentCreated) {
                onPaymentCreated()
            }
        } catch (error) {
            Swal.fire("Error", "No se pudo registrar el pago", "error")
        } finally {
            setLoading(false)
        }
    }

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop fade show" onClick={onClose}></div>

            {/* Modal */}
            <div className="modal d-block" tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title">
                                <i className="bi bi-cash-coin me-2"></i>
                                Pagos - Renta #{rental.id}
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onClose}
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body">
                            {/* Resumen de la renta */}
                            <div className="payment-summary mb-4">
                                <div className="row text-center">
                                    <div className="col-4">
                                        <div className="summary-item">
                                            <span className="summary-label">Total Renta</span>
                                            <span className="summary-value">
                                                ${rental.total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="summary-item paid">
                                            <span className="summary-label">Pagado</span>
                                            <span className="summary-value text-success">
                                                ${totalPaid.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="summary-item pending">
                                            <span className="summary-label">Pendiente</span>
                                            <span className={`summary-value ${pending > 0 ? "text-danger" : "text-success"}`}>
                                                ${pending.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                {/* Formulario de nuevo pago */}
                                <div className="col-md-5">
                                    <h6 className="mb-3">
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Registrar pago
                                    </h6>

                                    {pending <= 0 ? (
                                        <div className="alert alert-success">
                                            <i className="bi bi-check-circle me-2"></i>
                                            Esta renta ya esta pagada al 100%
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit}>
                                            {/* Monto */}
                                            <div className="mb-3">
                                                <label className="form-label">Monto *</label>
                                                <div className="input-group">
                                                    <span className="input-group-text">$</span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={amount}
                                                        onChange={handleAmountChange}
                                                        placeholder="0"
                                                        min="1"
                                                        max={pending}
                                                        required
                                                    />
                                                </div>
                                                <small className="text-muted">
                                                    Máximo: ${pending.toLocaleString()}
                                                </small>
                                                {showAmountWarning && (
                                                    <small className="text-danger d-block mt-1">
                                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                                        No puedes ingresar más de ${pending.toLocaleString()}
                                                    </small>
                                                )}
                                            </div>

                                            {/* Notas */}
                                            <div className="mb-3">
                                                <label className="form-label">Notas (opcional)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Ej: Anticipo, Efectivo, Transferencia..."
                                                    maxLength={255}
                                                />
                                            </div>

                                            {/* Botón */}
                                            <button
                                                type="submit"
                                                className="btn btn-success w-100"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-check-lg me-2"></i>
                                                        Registrar pago
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>

                                {/* Historial de pagos */}
                                <div className="col-md-7">
                                    <h6 className="mb-3">
                                        <i className="bi bi-clock-history me-2"></i>
                                        Historial de pagos
                                    </h6>

                                    {loadingPayments ? (
                                        <div className="text-center py-4">
                                            <span className="spinner-border text-success"></span>
                                        </div>
                                    ) : payments.length === 0 ? (
                                        <div className="text-center text-muted py-4">
                                            <i className="bi bi-inbox fs-1"></i>
                                            <p>No hay pagos registrados</p>
                                        </div>
                                    ) : (
                                        <div className="payment-history">
                                            {payments.map((payment) => (
                                                <div key={payment.id} className="payment-item">
                                                    <div className="payment-info">
                                                        <span className="payment-amount">
                                                            ${payment.amount.toLocaleString()}
                                                        </span>
                                                        <span className="payment-date">
                                                            {formatDate(payment.paymentDate)}
                                                        </span>
                                                    </div>
                                                    {payment.notes && (
                                                        <span className="payment-notes">
                                                            {payment.notes}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PaymentModal