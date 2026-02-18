import { useState, useEffect } from "react";
// Importamos el servicio de pagos para cargar el historial y calcular cuánto se ha pagado de esta renta
import { getPaymentsByRentalId } from "../../services/paymentService";
import "./rentalDetailModal.css"

// Configuración de colores y etiquetas para cada status
// Misma configuración que usamos en CalendarPage y RentalTable
// bg: color de fondo del badge
// text: color del texto del badge.
const statusConfig = {
    CREATED: { label: 'Creada', bg: '#0dcaf0', text: '#000', },
    DELIVERED: { label: 'Entregada', bg: '#ffc107', text: '#000', },
    PICKED_UP: { label: 'Recogida', bg: '#198754', text: '#fff', },
    CANCELLED: { label: 'Cancelada', bg: '#dc3545', text: '#fff', },
}

// Formatear fecha y hora: "2024-01-15T10:00:00" -> "15/01/2024 10:00"
const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A'
    const date = new Date(dateTimeStr)
    return date.toLocaleString('es-MX', {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}

/* 
    Modal reutilizable para ver detalles completos de una renta
    Se usa en 3 lugares: DashboardPage, RentalsPage, CalendarPage
    Props:
    - rental:           objeto de renta (RentalResponse del backend con items, client, user)
    - onClose:          Función para cerrar el modal
    - onEdit:           función al dar clic en "Editar" (abre el wizard de edición)
    - onChangeStatus:   función al dar clic en "Estado" (muestra opciones de cambio)
    - onCancel:         función al dar clic en "Cancelar" (marca como CANCELLED)
    - onDelete:         función al dar clic en "Eliminar" (elimina la renta)
    - onPayment:        función al dar clic en "Pagos" (abre PaymentModal)
*/
const RentalDetailModal = ({
    rental,
    onClose,
    onEdit,
    onChangeStatus,
    onCancel,
    onDelete,
    onPayment
}) => {
    // Estado para los pagos de esta renta. Se cargan automáticamente al abrir el modal
    const [payments, setPayments] = useState([])
    const [loadingPayments, setLoadingPayments] = useState(true)

    // Calculamos los totales de pagos
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const pending = rental.total - totalPaid

    // Obtenemos la configuración visual del status actual
    const status = statusConfig[rental.status] || statusConfig.CREATED

    // useEffect: al montar el componente (o cambiar de renta), cargamos los pagos
    useEffect(() => {
        loadPayments()
    }, [rental.id])

    // Función para cargar los pagos de esta renta desde el backend
    // GET /api/payments/rental/{rentalId}
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

    return (
        <>
            {/* Backdrop oscuro - al dar clic fuera del modal, se cierra */}
            <div className="modal-backdrop fade show" onClick={onClose}></div>

            {/* Modal principal */}
            <div className="modal d-block" tabIndex="-1">
                {/* modal-dialog-scrollable: permite scroll dentro del body si el contenido es largo */}
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">

                        {/* ----- Header ----- */}
                        {/* Gradiante morado como las StatCards del dashboard */}
                        <div className="modal-header rental-detail-header">
                            <h5 className="modal-title text-white">
                                <i className="bi bi-calendar-event me-2"></i>
                                Renta #{rental.id}
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onClose}
                            ></button>
                        </div>

                        {/* ----- Body ----- */}
                        <div className="modal-body">

                            {/* --- Barra de botones de acción --- */}
                            {/* Mismos botones que el modal del calendario + botón de Pagos */}
                            <div className="rental-detail-actions mb-3">

                                {/* Editar - siempre visible */}
                                {/* onClose() primero cierra este modal, luego onEdit() abre el wizard */}
                                <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => { onClose(); onEdit(rental) }}
                                    title="Editar"
                                >
                                    <i className="bi bi-pencil"></i>
                                    Editar
                                </button>

                                {/* Estado - visible si la renta es CREATED o DELIVERED */}
                                {(rental.status === 'CREATED' || rental.status === 'DELIVERED') && (
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => { onClose(); onChangeStatus(rental) }}
                                        title="Cambiar estado"
                                    >
                                        <i className="bi bi-arrow-repeat"></i>
                                        Estado
                                    </button>
                                )}

                                {/* Pagos - visible si la renta NO está cancelada */}
                                {rental.status !== 'CANCELLED' && (
                                    <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() => { onClose(); onPayment(rental) }}
                                        title="Registrar pago"
                                    >
                                        <i className="bi bi-cash-coin"></i>
                                        Pagos
                                    </button>
                                )}

                                {/* Cancelar - visible si la renta NO está cancelada */}
                                {rental.status !== 'CANCELLED' && (
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => { onClose(); onCancel(rental) }}
                                        title="Cancelar renta"
                                    >
                                        <i className="bi bi-x-circle"></i>
                                        Cancelar
                                    </button>
                                )}

                                {/* Eliminar - siempre visible */}
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => { onClose(); onDelete(rental.id) }}
                                    title="Eliminar"
                                >
                                    <i className="bi bi-trash"></i>
                                    Eliminar
                                </button>
                            </div>
                            {/* --- Badge de status --- */}
                            {/* Muestra el estado actual con su color correspondiente */}
                            <div className="text-center mb-3">
                                <span
                                    className="badge"
                                    style={{
                                        backgroundColor: status.bg,
                                        color: status.text,
                                        fontSize: '0.9rem',
                                        padding: '8px 16px'
                                    }}
                                >
                                    {status.label}
                                </span>
                            </div>

                            {/* --- Información de la renta --- */}
                            {/* Grid de 2 columnas: etiqueta (col-4) + valor (col-8) */}
                            <div className="rental-detail-info">
                                <div className="row mb-2">
                                    <div className="col-4 text-muted">Cliente:</div>
                                    <div className="col-8 fw-semibold">
                                        {rental.client?.name || 'Sin cliente'}
                                    </div>
                                </div>
                                <div className="row mb-2">
                                    <div className="col-4 text-muted">Teléfono:</div>
                                    <div className="col-8">
                                        {rental.client?.phone || 'Sin teléfono'}
                                    </div>
                                </div>
                                <div className="row mb-2">
                                    <div className="col-4 text-muted">Inicio:</div>
                                    <div className="col-8">
                                        <i className="bi bi-calendar me-1 text-primary"></i>
                                        {formatDateTime(rental.startDate)}
                                    </div>
                                </div>
                                <div className="row mb-2">
                                    <div className="col-4 text-muted">Fin:</div>
                                    <div className="col-8">
                                        <i className="bi bi-calendar-check me-1 text-success"></i>
                                        {formatDateTime(rental.endDate)}
                                    </div>
                                </div>
                                <div className="row mb-2">
                                    <div className="col-4 text-muted">Dirección:</div>
                                    <div className="col-8">{rental.address}</div>
                                </div>
                                <div className="row mb-2">
                                    <div className="col-4 text-muted">Creado por:</div>
                                    <div className="col-8">
                                        {rental.user?.username || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* --- Tabla de productos */}
                            <h6 className="mb-2">
                                <i className="bi bi-box-seam me-1"></i>
                                Productos
                            </h6>
                            <table className="table table-sm table-bordered mb-3">
                                <thead className="table-light">
                                    <tr>
                                        <th>Productos</th>
                                        <th className="text-center">Cantidad</th>
                                        <th className="text-end">Precio</th>
                                        <th className="text-end">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Recorremos los items de la renta */}
                                    {/* Cada item tiene: productName, quantity, unitPrice */}
                                    {rental.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.productName}</td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end">{item.unitPrice}</td>
                                            <td className="text-end">{item.quantity * item.unitPrice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* --- Sección de pagos: Total + Pagado + Por cobrar */}
                            {/* Se carga automáticamente consultando el historial de pagos */}
                            <div className="rental-detail-payment">
                                <div className="row text-center">
                                    {/* Total de la renta (precio acordado) */}
                                    <div className="col-4">
                                        <span className="payment-label">Total</span>
                                        <span className="payment-value text-dark">${rental.total?.toLocaleString()}</span>
                                    </div>
                                    {/* Lo que ya se ha pagado */}
                                    <div className="col-4">
                                        <span className="payment-label">Pagado</span>
                                        <span className="payment-value text-success">
                                            {loadingPayments ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                `$${totalPaid.toLocaleString()}`
                                            )}
                                        </span>
                                    </div>
                                    {/* Lo que falta por cobrar */}
                                    <div className="col-4">
                                        <span className="payment-label">Por cobrar</span>
                                        <span className={`payment-value ${pending > 0 ? 'text-danger' : 'text-success'}`}>
                                            {loadingPayments ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                `$${pending.toLocaleString()}`
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        {/* ----- Footer ----- */}
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
export default RentalDetailModal