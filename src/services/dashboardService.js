import axiosInstance from "./axiosConfig"
/* 
    Servicio para el dashboard
    Consume el endpoint de estadísticas del backend    
*/

// Obtener estadísticas del dashboard
export const getStats = async () => {
    try {
        const response = await axiosInstance.get("/dashboard/stats");
        return response;
    } catch (error) {
        console.error("Error fetching dashboard stats: ", error);
        throw error;
    }
}

// =================
// Obtiene las rentas pendientes de entregar en un día específico
// Parámetro days:
//  0 = entregas de hoy
//  1 = entregas de mañana
// GET /api/dashboard/deliveries?days=0
// GET /api/dashboard/deliveries?days=1
// La sintaxis { params: { days } } le dice a Axios que agregue ?days=valor a la URL automáticamente
// Es equivalente a hacer: axiosInstance.get("/dashboard/deliveries?days=0") pero más limpio y seguro.
// =================
export const getDeliveries = async (days = 0) => {
    try {
        const response = await axiosInstance.get("/dashboard/deliveries", {
            params: { days }
        });
        return response
    } catch (error) {
        console.error("Error fetching deliveries: ", error)
        throw error
    }
}

// =================
// Obtiene los ingresos diarios del mes actual para la gráfica de barras apiladas
// GET /api/dashboard/income/monthly
// No necesita parámetros porque el backend siempre calcula el mes en curso
// Retorna un array donde cada elemento tiene:
//  { date: "2026-02-12", cobrado: 500, anticipos: 200, porCobrar: 300}
// =================
export const getMonthlyIncome = async () => {
    try {
        const response = await axiosInstance.get("/dashboard/income/monthly")
        return response
    } catch (error) {
        console.error("Error fetching monthly income: ", error)
        throw error
    }
}

// =================
// Obtiene todas las rentas pendientes de entregar (status CREATED) 
// GET /api/dashboard/pending-rentals
// Se usa en el dropdown expandible de la StatCard "Rentas por entregar"
// Retorna un array donde cada elemento tiene:
// { id, clientName, clientPhone, address, startDate, endDate, status, productSummary, total, totalPaid, pending }
// =================
export const getPendingRentals = async () => { 
    try {
        const response = await axiosInstance.get("/dashboard/pending-rentals")
        return response
    } catch (error) {
        console.error("Error fetching pending rentals: ", error)
        throw error
    }
}