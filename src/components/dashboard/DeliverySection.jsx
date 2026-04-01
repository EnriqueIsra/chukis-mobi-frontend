// Este componente muestra las listas de "Entregas de hoy" y "Entregas de mañana"
// Importamos los hooks de React
// useState: para manejar qué pestaña está activa (hoy/mañana)
import { useState } from "react";

// Importamos los estilos del componente
import "./deliverySection.css";

// =================
// Función auxiliar para formatear hora
// Recibe: "2026-02-12T13:30:00"
// Retorna: "10:30"
// Solo necesitamos la hora porque ya sabemos que es hoy/mañana
// =================
const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit"
    })
}

// =================
// Funcion auxiliar para formatear dinero
// Recibe: 1500
// Retorna: "$1,500"
// Usamos Intl.NumberFormat para formato MXN sin decimales.
// =================
const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value || 0)
}

// =================
// Componente DeliverySection
// Props:
// - todayDeliveries: array de rentas para entregar HOY
// - tomorrowDeliveries: array de rentas para entregar MAÑANA
// - loading: boolean que indica si se están cargando los datos
// Cada elemento del array tiene la estructura de RentalDetailDTO:
// { id, clientName, clientPhone, address, startDate, endDate, status, productSummary, total, totalPaid, pending }.
// =================
const DeliverySection = ({ todayDeliveries, tomorrowDeliveries, loading, onRentalClick }) => {

    // Estado para la pestaña activa: "today" o "tomorrow"
    // Por defecto muestra las entregas de hoy
    const [activeTab, setActiveTab] = useState("today");

    // Seleccionamos qué lista mostrar según la pestaña activa
    const deliveries = activeTab === "today" ? todayDeliveries : tomorrowDeliveries;

    // =================
    // Función que calcula el portentaje pagado
    // Se usa para la barra de progreso
    // Ejemplo: total=1000, totalPaid=300 -> 30%
    // Math.min(..., 100) evita que pase del 100%.
    // =================
    const getPaymentPercentage = (total, totalPaid) => {
        if (!total || total === 0) return 0;
        return Math.min(Math.round((totalPaid / total) * 100), 100);
    }

    // =================
    // Función que retorna el color de la barra de progreso según el porcentaje pagado:
    // 100% = verde (pagado completo)
    // 50-99% = amarillo (va a más de la mitad)
    // 0% = rojo (sin pago).
    // =================
    const getProgressColor = (percentage) => {
        if(percentage >= 100) return "bg-success"
        if(percentage >= 50) return "bg-warning"
        if(percentage > 0) return "bg-orange"
        return "bg-danger"
    }

    return (
        <div className="card shadow-sm delivery-section">
            <div className="card-body">

                {/* Título de la sección con ícono de camión */}
                <h5 className="card-title mb-3">
                    <i className="bi bi-truck me-2 text-primary"></i>
                    Próximas Entregas
                </h5>

                {/* Pestañas (tabs) para alternar entre hoy y mañana
                    nav-pills: estilo de Bootstrap con fondo coloreado
                    nav.fill: las pestañas ocupan todo el ancho disponible
                    className dinámico:
                    - Si activeTab === "today", la pestaña Hoy tiene clase "active"
                    - Al hacer clic, setActiveTab cambia el estado
                    Los badges muestran el conteo de entregas:
                    - todayDeliveries.length = cuántas entregas hay hoy */}
                <ul className="nav nav-pills nav-fill mb-3">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "today" ? "active" : ""}`}
                            onClick={() => setActiveTab("today")}
                        >
                            <i className="bi bi-calendar-check me-1"></i>
                            Hoy
                            <span className="badge bg-light text-dark ms-2">
                                {todayDeliveries.length}
                            </span>
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "tomorrow" ? "active" : ""}`}
                            onClick={() => setActiveTab("tomorrow")}
                        >
                            <i className="bi bi-calendar-plus me-1"></i>
                            Mañana
                            <span className="badge bg-light text-dark ms-2">
                                {tomorrowDeliveries.length}
                            </span>
                        </button>
                    </li>
                </ul>

                {/* Contenido: lista de entregas o estados vacío/cargando */}
                {/* Spinner mientras carga */}
                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                /* Si no hay entregas, mostramos mensaje vacío */
                ) : deliveries.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <i className="bi bi-check-circle display-6 d-block mb-2"></i>
                        <p className="mb-0">
                            No hay entregas pendientes para {activeTab === "today" ? "hoy" : "mañana"}
                        </p>
                    </div>
                /* Si hay entregas, las mostramos como lista */    
                ) : (
                    <div className="delivery-list">
                        {/* Recorremos cada entrega y creamos una tarjeta
                            .map() itera sobre el array de deliveries
                            key={delivery.id} es requerido por React para identificar cada elemento de la lsita */}
                        {deliveries.map((delivery) => {
                            // Calculamos porcentaje para la barra de progreso
                            const percentage = getPaymentPercentage(delivery.total, delivery.totalPaid)
                            const progressColor = getProgressColor(percentage)

                            return (
                                <div
                                    key={delivery.id}
                                    className="delivery-item"
                                    style={{ cursor: onRentalClick ? "pointer" : "default" }}
                                    onClick={() => onRentalClick && onRentalClick(delivery.id)}
                                >
                                    {/* ----- Fila superior: cliente + hora ----- */}
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <div>
                                            {/* Nombre del cliente en negrita */}
                                            <span className="fw-semibold">
                                                <i className="bi bi-person-fill text-primary me-1"></i>
                                                {delivery.clientName}
                                            </span>
                                            {/* Teléfono al lado */}
                                            <small className="text-muted ms-2">
                                                <i className="bi bi-telephone me-1"></i>
                                                {delivery.clientPhone}
                                            </small>
                                        </div>
                                        {/* Hora de entrega con badge */}
                                        <span className="badge bg-primary">
                                            <i className="bi bi-clock me-1"></i>
                                            {formatDate(delivery.startDate)}
                                        </span>
                                    </div>
                                    {/* ----- Dirección ----- */}
                                    <div className="mb-1">
                                        <small className="text-muted">
                                            <i className="bi bi-geo-alt me-1"></i>
                                            {delivery.address}
                                        </small>
                                    </div>

                                    {/* ----- Resumen de productos ----- */}
                                    <div className="mb-2">
                                        <small className="text-secondary">
                                            <i className="bi bi-box-seam me-1"></i>
                                            {delivery.productSummary}
                                        </small>
                                    </div>

                                    {/* ----- Sección de pagos ----- */}
                                    <div className="delivery-payment">
                                        {/* Fila con Total | Pagado | Pendiente */}
                                        <div className="d-flex justify-content-between mb-1">
                                            <small>Total: <strong>{formatCurrency(delivery.total)}</strong></small>
                                            <small>Pagado: <strong className="text-success">{formatCurrency(delivery.totalPaid)}</strong></small>
                                            <small>Pendiente: <strong className="text-danger">{formatCurrency(delivery.pending)}</strong></small>
                                        </div>
                                        {/* Barra de progreso de Bootstrap
                                            - El div externo es el contenedor (fondo gris)
                                            - El div interno es la barra que se llena
                                            - style={{ width: `${percentage}%` }} controla cuánto se llena
                                            - progressColor cambia el color según el porcentaje
                                            - aria-* son atributos de accesibilidad */}
                                        <div className="progress" style={{ height: "6px" }}>
                                            <div
                                                className={`progress-bar ${progressColor}`}
                                                role="progressbar"
                                                style={{ width: `${percentage}%` }}
                                                aria-valuenow={percentage}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )

}

export default DeliverySection