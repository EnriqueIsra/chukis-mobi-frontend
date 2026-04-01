// ===============================
// Imports del chart.js
// Chart.js es modular: solo importamos lo que usamos
// - Chart: el objeto principal de la librería
// - CategoryScale: eje X con categorías (los días: "1 Feb", "2 Feb"...)
// - LinearScale: eje Y con números (el dinero: $0, $500, $1000)
// - BarElement: el tipo de gráfica que queremos (barras)
// - Title: título arriba de la gráfica
// - Tooltip: el cuadrito que aparece al pasar el mouse sobre una barra
// - Legend: La leyenda que muestra qué significa cada color
// Chart.register(): Activa todos estos módulos
// Sin esto, Chart.js no sabe cómo dibujar barras.
// ===============================
import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js"

// ===============================
// Bar: componente de React que renderiza una gráfica de barras
// Es el puente entre Chart.js (librería pura) y React.
// ===============================
import { Bar } from "react-chartjs-2"

// Estilos del componente
import "./incomeChart.css"

// Registramos los módulos de Chart.js
// Esto se ejecuta una sola vez cuando el archivo se importa
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// ===============================
// Función auxiliar para formatear la fecha del eje X
// Recibe: "2026-02-12" (string del backend)
// Retorna: "12 Feb" (formato corto para que quepa en la gráfica).
// ===============================
const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short"
    })
}

// ===============================
// Componete IncomeChart
// Props:
// - incomeData: array de DailyIncomeDTO del backend
// Cada elemento: { date, cobrado, anticipos, porCobrar }
// - loading: boolean que indica si se están cargando los datos.
// ===============================
const IncomeChart = ({ incomeData, loading, selectedYear, selectedMonth, onMonthChange }) => {

    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1

    const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth

    const getMonthName = (year, month) => {
        const date = new Date(year, month - 1)
        return date.toLocaleDateString("es-MX", { month: "long", year: "numeric" })
    }

    const handlePrev = () => {
        if (selectedMonth === 1) {
            onMonthChange(selectedYear - 1, 12)
        } else {
            onMonthChange(selectedYear, selectedMonth - 1)
        }
    }

    const handleNext = () => {
        if (isCurrentMonth) return
        if (selectedMonth === 12) {
            onMonthChange(selectedYear + 1, 1)
        } else {
            onMonthChange(selectedYear, selectedMonth + 1)
        }
    }

    const handleReset = () => {
        onMonthChange(currentYear, currentMonth)
    }
    // ===============================
    // Preparamos los datos para Chart.js
    // labels: array con las etiquetas del eje X (los días)
    // Ejemplo: ["10 Feb", "11 Feb", "12 Feb"]
    // .map() transforma cada fecha al formato corto.
    // ===============================
    const labels = incomeData.map((item) => formatDateLabel(item.date))

    // ===============================
    // chartData: objeto con la estructura que Chart.js necesita
    // datasets: array de conjuntos de datos (uno por cada color)
    // Cada dataset es una "capa" de la barra apilada:
    // 1.- Cobrado (verde): dinero de rentas 100% pagadas
    // 2.- Anticipos (amarillo): pagos parciales recibidos
    // 3.- Por Cobrar (rojo): dinero que falta
    // Para cada dataset:
    // - label: nombre que aparece en la leyenda
    // - data: array de valores numéricos (uno por cada día)
    // - backgroundColor: color de las barras
    // - borderRadius: redondea las esquinas de las barras.
    // ===============================
    const chartData = {
        labels,
        datasets: [
            {
                label: "Cobrado",
                data: incomeData.map((item) => item.cobrado),
                backgroundColor: "rgba(40, 167, 69, 0.8)",
                borderRadius: 4
            },
            {
                label: "Anticipos",
                data: incomeData.map((item) => item.anticipos),
                backgroundColor: "rgba(255, 197, 7, 0.8)",
                borderRadius: 4
            },
            {
                label: "Por Cobrar",
                data: incomeData.map((item) => item.porCobrar),
                backgroundColor: "rgba(220, 53, 69, 0.8)",
                borderRadius: 4
            }
        ]
    }

    // ===============================
    // chartOptions: configuración de comportamiento de la gráfica
    // responsive: se adapta al tamaño del contenedor
    // mantainAspectRatio: false = podemos controlar la altura con CSS
    // plugins.legend: configuración de la leyenda
    // - position: "top" = leyenda arriba de la gráfica
    // plugins.tooltip: el cuadrito al pasar el mouse
    // - callbacks.label: personaliza el texto del tooltip
    // Muestra "$1,500" en vez de solo "1500"
    // scales.x.stacked + scales.y.stacked = true:
    //      ESTO ES LO CLAVE. Hace que las barras se apilen en vez de ponerse lado a lado.
    //      Sin esto, veríamos 3 barras separadas por día.
    //      Con esto, vemos 1 barra con 3 segmentos de color
    // scales.y.ticks.callback: formatea los números de eje Y
    //      Muestra "$1,000" en ves de "1000".
    // ===============================
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top"
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.y || 0
                        return `${context.dataset.label}: $${value.toLocaleString("es-MX")}`
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true
            },
            y: {
                stacked: true,
                ticks: {
                    callback: (value) => `$${value.toLocaleString("es-MX")}`
                }
            }
        }
    }
    return (
        <div className="card shadow-sm income-chart-card">
            <div className="card-body">
                {/* Título con selector de mes */}
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <h5 className="card-title mb-0">
                        <i className="bi bi-bar-chart-fill me-2 text-success"></i>
                        Ingresos del Mes
                    </h5>
                    <div className="d-flex align-items-center gap-1">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handlePrev}
                            title="Mes anterior"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <button
                            className={`btn btn-sm ${isCurrentMonth ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={handleReset}
                            title={isCurrentMonth ? "Mes actual" : "Ir al mes actual"}
                        >
                            <span className="text-capitalize">{getMonthName(selectedYear, selectedMonth)}</span>
                        </button>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleNext}
                            disabled={isCurrentMonth}
                            title="Mes siguiente"
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>

                {/* Spinner mientras carga */}
                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>

                /* Si no hay datos, mensaje vacío */
                ) : incomeData.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <i className="bi bi-graph-up display-6 d-block mb-2"></i>
                        <p className="mb-0">No hay ingresos registrados este mes</p>
                    </div>

                /* Si hay datos, renderizamos la gráfica */
                ) : (
                    <div className="chart-container">
                        {/* Componente <Bar> de react-chartjs-2
                            - data: los datos preparados (labels + datasets)
                            - options: la configuración de la gráfica
                            React se encarga de actualizar la gráfica automáticamente cuando los datos cambian*/}
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                )}
            </div>
        </div>
    )
}
export default IncomeChart