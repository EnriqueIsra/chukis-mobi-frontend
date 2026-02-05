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