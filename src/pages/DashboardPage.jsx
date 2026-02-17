import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { StatCard } from '../components/dashboard/StatCard';
import { QuickActions } from '../components/dashboard/QuickActions';
// importamos la funcion existente + las 2 nuevas del dashboardService
import { getStats, getDeliveries, getMonthlyIncome } from '../services/dashboardService'

// Importamos los componentes que creamos
// DeliverySection: lista de entregas hoy/mañana
// IncomeChart: gráfica de barras apiladas
import DeliverySection from "../components/dashboard/DeliverySection"
import IncomeChart from "../components/dashboard/IncomeChart"

/*  
  Página principal del dashboard
  Muestra estadísticas y acciones rápidas
*/
export const DashboardPage = () => {
  const navigate = useNavigate();

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

  // Función que recarga TODOS los datos 
  // Se ejecuta al montar el componente y al hacer clic en "Actualizar"
  const fetchAllData = () => {
    fetchStats()
    fetchDeliveries()
    fetchIncome()
  }

  // useEffect: se ejecuta una vez al montar el componente
  // Ahora llama a fetchAllData() en vez de solo fetchStats()
  useEffect(() => {
    fetchAllData();
  }, []);

  // Formatear número como moneda MXN
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

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
          <StatCard
            title="Rentas por entregar"
            value={stats.rentasPorEntregar}
            icon="bi-box-seam"
            color="info"
            onClick={handleStatClick}
          />
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
    </>
  )
};
