/* Este archivo hace las llamadas HTTP al backend, Mismo patrón que el productService.js pero con los endpoints de gastos, incluyendo las funciones de desactivar/activar */
import axiosInstance from "./axiosConfig"

export const findAll = async () => {
    try {
        const response = await axiosInstance.get("/worker-payments");
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const findInactive = async () => {
    try {
        const response = await axiosInstance.get("/worker-payments/inactive");
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const findByWorker = async (workerId) => {
    try {
        const response = await axiosInstance.get(`/worker-payments/by-worker/${workerId}`);
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const getMonthlySummary = async (year, month) => {
    try {
        const response = await axiosInstance.get("/worker-payments/monthly-summary", {
            params: { year, month }
        });
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const create = async ( { workerId, amount, paymentDate, notes, registeredById } ) => {
    try {
        return await axiosInstance.post("/worker-payments", {
            workerId,
            amount,
            paymentDate,
            notes,
            registeredById
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

export const update = async ( { id, workerId, amount, paymentDate, notes, registeredById } ) => {
    try {
        return await axiosInstance.put(`/worker-payments/${id}`, {
            workerId,
            amount,
            paymentDate,
            notes,
            registeredById
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

// Borrado lógico - envia el motivo y quién desactiva
export const deactivate = async ( id, reason, userId ) => {
    try {
        return await axiosInstance.patch(`/worker-payments/${id}/deactivate`, {
            reason,
            userId
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

// Reactivar un gasto desactivado
export const activate = async ( id ) => {
    try {
        return await axiosInstance.patch(`/worker-payments/${id}/activate`)
    } catch (error) {
        console.error(error);
    }
    return undefined;
}