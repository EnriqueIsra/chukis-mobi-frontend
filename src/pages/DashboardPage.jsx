import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { StatCard } from '../components/dashboard/StatCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { getStats } from '../services/dashboardService'

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

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchStats();
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
      {/* Header con el titulo y botón actualizar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={fetchStats}
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
    </>
  )
};
