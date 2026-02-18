import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { StatCard } from '../components/dashboard/StatCard';
import { QuickActions } from '../components/dashboard/QuickActions';
// Importamos la funcion existente + las 2 nuevas del dashboardService
import { getStats, getDeliveries, getMonthlyIncome, getPendingRentals } from '../services/dashboardService'
// Importamos funciones del rentalService para las acciones del modal
import { findById, remove, updateRentalStatus } from "../services/rentalService";

// Importamos los componentes que creamos
// DeliverySection: lista de entregas hoy/mañana
// IncomeChart: gráfica de barras apiladas
import DeliverySection from "../components/dashboard/DeliverySection"
import IncomeChart from "../components/dashboard/IncomeChart"

// Componentes para el modal de detalles, pagos y wizard de edición
import RentalDetailModal from "../components/rentals/RentalDetailModal";
import PaymentModal from "../components/payments/PaymentModal";
import { RentalWizard } from "../components/rentals/wizard/RentalWizard";

/*  
  Página principal del dashboard
  Muestra estadísticas y acciones rápidas
*/
export const DashboardPage = () => {
  const navigate = useNavigate();

  // Obtenemos el usuario logueado para pasarlo al RentalWizard
  const loggedUser = JSON.parse(localStorage.getItem("user"))
  const userId = loggedUser?.id

  // Estado para las estadísticas
  const [stats, setStats] = useState({
    rentasPorEntregar: 0,
    rentasPorRecoger: 0,
    ingresosDelMes: 0
  });

  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Estado para las entregas de hoy. Array vacío por defecto, se llena con RentalDetailDTO
  const [todayDeliveries, setTodayDeliveries] = useState([])

  // Estado para las entregas de mañana
  const [tomorrowDeliveries, setTomorrowDeliveries] = useState([])

  // Estado para los ingresos del mes (gráfica). Array de DailyIncomeDTO: { date, cobrado, anticipos, porCobrar }
  const [incomeData, setIncomeData] = useState([])

  // Loading separado para entregas y gráfica 
  // Así cada sección puede cargar independientemente sin bloquear las demás.
  const [loadingDeliveries, setLoadingDeliveries] = useState(true)
  const [loadingIncome, setLoadingIncome] = useState(true)

  // Lista de renas pendientes (RentalDetailDTO) para el dropdown de la StatCard
  const [pendingRentals, setPendingRentals] = useState([])
  const [loadingPending, setLoadingPending] = useState(false)

  // Renta seleccionada para el modal de detalles (RentalResponse completo con items)
  // null = modal cerrado, objeto = modal abierto
  const [selectedRental, setSelectedRental] = useState(null)

  // Renta seleccionada para el modal de pagos
  const [paymentRental, setPaymentRental] = useState(null)

  // Estado para el wizard de edición
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [rentalToEdit, setRentalToEdit] = useState(null)

  // Función para obtener estadísticas del backend
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getStats();
      if (response && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las estadísticas'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar las entregas de hoy y mañana
  // Hacemos 2 llamadas en paralelo con Promise.all:
  //    - getDeliveries(0) -> entregas de hoy
  //    - getDeliveries(1) -> entregas de mañana
  // Promise.all ejecuta ambas al mismo tiempo, no espera a que termine una para empezar la otra.
  // Esto es más rápido que hacer una después de la otra.
  const fetchDeliveries = async () => {
    setLoadingDeliveries(true)
    try {
      const [todayRes, tomorrowRes] = await Promise.all([
        getDeliveries(0),
        getDeliveries(1)
      ])
      setTodayDeliveries(todayRes.data || [])
      setTomorrowDeliveries(tomorrowRes.data || [])
    } catch (error) {
      console.error("Error fetching deliveries: ", error)
    } finally {
      setLoadingDeliveries(false);
    }
  }

  // Función para cargar los ingresos del mes
  const fetchIncome = async () => {
    setLoadingIncome(true)
    try {
      const response = await getMonthlyIncome();
      setIncomeData(response.data || [])
    } catch (error) {
      console.error("Error fetching income: ", error)
    } finally {
      setLoadingIncome(false)
    }
  }

  // Función que carga las rentas pendientes de entregar (status CREATED)
  // Se llama al montar el componente y al actualizar
  const fetchPendingRentals = async () => {
    setLoadingPending(true)
    try {
      const response = await getPendingRentals()
      setPendingRentals(response.data || [])
    } catch (error) {
      console.error("Error fetching pending rentals: ", error)
    } finally {
      setLoadingPending(false)
    }
  }

  // Función que recarga TODOS los datos 
  // Se ejecuta al montar el componente y al hacer clic en "Actualizar"
  const fetchAllData = () => {
    fetchStats()
    fetchDeliveries()
    fetchIncome()
    fetchPendingRentals()
  }

  // useEffect: se ejecuta una vez al montar el componente
  // Ahora llama a fetchAllData() en vez de solo fetchStats()
  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers
  // Clic en una renta del dropdown -> busca la renta completa (con items) y abre el modal
  // Necesitamos el RentalResponse completo porque el modal muetra la tabla de productos
  const handleRentalClick = async (rentalId) => {
    try {
      const response = await findById(rentalId)
      if (response && response.data) {
        setSelectedRental(response.data)
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los detalles de la renta', 'error')
    }
  }

  // Editar renta -> cierra el modal de detalles y abre el wizard
  const handleEditRental = (rental) => {
    setRentalToEdit(rental)
    setIsWizardOpen(true)
  }

  // Cambiar el estado -> muestra Swal con las opciones según el status actual
  // CREATED solo puede ir a DELIVERED
  // DELIVERED solo puede ir a PICKED_UP
  const handleChangeStatus = (rental) => {
    Swal.fire({
      title: 'Cambiar status de la renta',
      html: `
        <div class="d-flex flex-column gap-2">
          ${rental.status === 'CREATED' ? `
            <button id="btn-delivered" class="btn btn-warning">
              <i class="bi bi-truck me-1"></i> Marcar como Entregada
            </button>
          ` : ''}
          ${rental.status === 'DELIVERED' ? `
            <button id="btn-pickedup" class="btn btn-success">
              <i class="bi bi-check-circle me-1"></i> Marcar como Recogida
            </button>
          ` : ''}      
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cerrar',
      didOpen: () => {
        document.getElementById('btn-delivered')?.addEventListener('click', async () => {
          await changeStatus(rental.id, 'DELIVERED')
        })
        document.getElementById('btn-pickedup')?.addEventListener('click', async () => {
          await changeStatus(rental.id, 'PICKED_UP')
        })
      }
    })
  }

  // Ejecuta el cambio de status en el backend
  const changeStatus = async (id, status) => {
    try {
      await updateRentalStatus(id, status)
      Swal.fire('Actualizado', 'El estado fue actualizado correctamente', 'success')
      fetchAllData()
    } catch (error) {
      Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
    }
  }

  // Cancelar renta -> confirmación y cambia status a CANCELLED
  const handleCancelRental = async (rental) => {
    const result = await Swal.fire({
      title: '¿Cancelar renta?',
      text: 'La renta será marcada como cancelada',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver'
    })
    if (result.isConfirmed) {
      try {
        await updateRentalStatus(rental.id, 'CANCELLED')
        Swal.fire('Cancelada', 'La renta fue cancelada con éxito', 'success')
        fetchAllData()
      } catch (error) {
        Swal.fire('Error', 'No se pudo cancelar la renta', 'error')
      }
    }
  }

  // Eliminar renta -> confirmación y elimina del backend
  const handleDeleteRental = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar renta?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })
    if (result.isConfirmed) {
      try {
        await remove(id)
        Swal.fire('Eliminada', 'La renta ha sido eliminada de la base de datos', 'success')
        fetchAllData()
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la renta', 'error')
      }
    }
  }

  // Abrir modal de pagos
  const handlePayment = (rental) => {
    setPaymentRental(rental)
  }

  // Funciones auxiliares
  // Formatear número como moneda MXN
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // Formatear solo la hora: "2026-02-18T10:00:00" -> "10:00 a.m."
  // Se usa en el badge de hora del dropdown
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A'
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString('es-MX', {
      hour: "2-digit",
      minute: "2-digit"
    }
    )
  }

  // Obtener nombre del mes actual en español
  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString('es-MX', { month: 'long' });
  }

  // Navegar a rentas al hacer clic en una tarjeta
  const handleStatClick = () => {
    navigate('/rentals')
  };

  return (
    <>
      {/* Header con el titulo y botón actualizar, onClick ahora llama a fetchAllData para recargar todo, no solo las stats */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={fetchAllData}
          disabled={loading}
        >
          <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
          {' '}Actualizar
        </button>
      </div>

      {/* Acciones rápidas */}
      <QuickActions />

      {/* Tarjetas de estadísticas */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {/* Modificación: StatCard expandible con lista de rentas pendientes */}
          {/* Cambiamos onClick por expandible para que despliegue la lista */}
          <StatCard
            title="Rentas por entregar"
            value={stats.rentasPorEntregar}
            icon="bi-box-seam"
            color="info"
            expandible
          >
            {/* Contenido del panel expandible (children de StatCard) */}
            {/* Se muestra cuando el usuario hace clic en la tarjeta */}
            {loadingPending ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary"></div>
              </div>
            ) : pendingRentals.length === 0 ? (
              <div className="text-center text-muted py-3">
                <i className="bi bi-check-circle display-6 d-block mb-2"></i>
                <p className="mb-0">No hay rentas pendientes</p>
              </div>
            ) : (
              /* Lista de rentas pendientes - misma estructura visual que DeliverySection */
              pendingRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="delivery-item"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); handleRentalClick(rental.id) }}
                >
                  {/* Fila superior: cliente + hora */}
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div>
                      <span className="fw-semibold">
                        <i className="bi bi-person-fill text-primary me-1"></i>
                        {rental.clientName}
                      </span>
                      <small className="text-muted ms-2">
                        <i className="bi bi-telephone me-1"></i>
                        {rental.clientPhone}
                      </small>
                    </div>
                    <span className="badge bg-primary">
                      <i className="bi bi-clock me-1"></i>
                      {formatTime(rental.startDate)}
                    </span>
                  </div>
                  {/* Dirección */}
                  <div className="mb-1">
                    <small className="text-muted">
                      <i className="bi bi-geo-alt me-1"></i>
                      {rental.address}
                    </small>
                  </div>
                  {/* Resumen de productos */}
                  <div className="mb-2">
                    <small className="text-secondary">
                      <i className="bi bi-box-seam me-1"></i>
                      {rental.productSummary}
                    </small>
                  </div>
                  {/* Total / Pagado / Pendiente */}
                  <div className="delivery-payment">
                    <div className="d-flex justify-content-between mb-1">
                      <small>Total: <strong>{formatCurrency(rental.total)}</strong></small>
                      <small>Pagado: <strong className="text-success">{formatCurrency(rental.totalPaid)}</strong></small>
                      <small>Pendiente: <strong className="text-danger">{formatCurrency(rental.pending)}</strong></small>
                    </div>
                  </div>
                </div>
              ))
            )}
          </StatCard>
          <StatCard
            title="Rentas por recoger"
            value={stats.rentasPorRecoger}
            icon={"bi-truck"}
            color="warning"
            onClick={handleStatClick}
          />
          <StatCard
            title={`Ingresos de ${getCurrentMonthName()}`}
            value={formatCurrency(stats.ingresosDelMes)}
            icon="bi-cash-stack"
            color="success"
          />
        </div>
      )}
      {/* Sección inferior con 2 columnas
        row: fila de Bootstrap
        col-lg-6: cada columna ocupa la mitad en pantallas grandes
        col-12: en pantallas chicas, cada una ocupa todo el ancho
        Columna izquierda: DeliverySection (entregas)
        Columna derecha: IncomeChart (gráfica) 
        mt-4 margin-top para separar de las tarjetas
        mb-4 margin-bottom para separar del final de la página*/}
      <div className="row mt-4 mb-4">
        {/* Columna izquierda: Entregas de hoy/mañana */}
        <div className="col-12 col-lg-6 mb-3">
          <DeliverySection
            todayDeliveries={todayDeliveries}
            tomorrowDeliveries={tomorrowDeliveries}
            loading={loadingDeliveries}
          />
        </div>
        {/* Columna derecha: Gráfica de ingresos */}
        <div className="col-12 col-lg-6 mb-3">
          <IncomeChart
            incomeData={incomeData}
            loading={loadingIncome}
          />
        </div>
      </div>

      {/* Modal de detalles de renta */}
      {/* Se muestra cuando selectedRental tiene valor (no es null) */}
      {selectedRental && (
        <RentalDetailModal
          rental={selectedRental}
          onClose={() => setSelectedRental(null)}
          onEdit={handleEditRental}
          onChangeStatus={handleChangeStatus}
          onCancel={handleCancelRental}
          onDelete={handleDeleteRental}
          onPayment={handlePayment}
        />
      )}

      {/* Modal de pagos */}
      {paymentRental && (
        <PaymentModal
          rental={paymentRental}
          onClose={() => setPaymentRental(null)}
          onPaymentCreated={fetchAllData}
        />
      )}

      {/* Wizard de edición: */}
      {isWizardOpen && (
        <RentalWizard
          onClose={() => { setIsWizardOpen(false); setRentalToEdit(null) }}
          onSuccess={fetchAllData}
          userId={userId}
          rentalToEdit={rentalToEdit}
        />
      )}
    </>
  )
};
