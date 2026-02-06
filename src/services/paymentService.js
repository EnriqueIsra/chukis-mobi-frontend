import axiosInstance from "./axiosConfig";

// Obtener todos los pagos de una renta específica
// Retorna el historial de pagos ordenado por fecha
export const getPaymentsByRentalId = async (rentalId) => {
    try {
        const response = await axiosInstance.get(`/payments/rental/${rentalId}`);
        return response;
    } catch (error) {
        console.error("Error fetching payments: ", error);
        throw error;
    }
}

// Obtener resumen de pagos de una renta
// Retorna: total, totalPaid, pending, status
export const getPaymentSummary = async (rentalId) => {
    try {
        const response = await axiosInstance.get(`/payments/rental/${rentalId}/summary`)
        return response
    } catch (error) {
        console.error("Error fetching payment sumary: ", error)
        throw error
    }
}

// Crear un nuevo pago/anticipo
// paymentData: { rentalId, amount, paymentDate (opcional), notes (opcional) }
export const createPayment = async (paymentData) => {
    try {
        const response = await axiosInstance.post("/payments", paymentData)
        return response
    } catch (error) {
        console.error("Error creating payment: ", error)
    }
}

// Eliminar un pago por su ID
// Uso: Corregir pagos registrados por error
export const deletePayment = async (paymentId) => {
    try {
        await axiosInstance.delete(`/payments/${paymentId}`)
    } catch (error) {
        console.error("Error deleting payment: ", error);
        throw error 
    }
}