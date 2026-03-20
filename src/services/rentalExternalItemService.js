/* Este archivo hace las llamadas HTTP al backend, Mismo patrón que el productService.js pero con los endpoints de gastos, incluyendo las funciones de desactivar/activar */
import axiosInstance from "./axiosConfig"

export const findAll = async () => {
    try {
        const response = await axiosInstance.get("/rental-external-items");
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const findInactive = async () => {
    try {
        const response = await axiosInstance.get("/rental-external-items/inactive");
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const findByRental = async (rentalId) => {
    try {
        const response = await axiosInstance.get(`/rental-external-items/by-rental/${rentalId}`)
        return response
    } catch (error) {
        console.error(error)
    }
    return null
}

export const getProfitability = async (rentalId) => {
    try {
        const response = await axiosInstance.get(`/rental-external-items/profitability/${rentalId}`)
        return response
    } catch (error) {
        console.error(error)
    }
    return null
}

export const create = async ({ rentalId, providerId, description, quantity, unitCost, notes }) => {
    try {
        return await axiosInstance.post("/rental-external-items", {
            rentalId,
            providerId,
            description, 
            quantity, 
            unitCost, 
            notes
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

export const update = async ({ id, rentalId, providerId, description, quantity, unitCost, notes }) => {
    try {
        return await axiosInstance.put(`/rental-external-items/${id}`, {
            rentalId,
            providerId,
            description, 
            quantity, 
            unitCost, 
            notes
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

// Borrado lógico - envpia el motivo y quién desactiva
export const deactivate = async (id, reason, userId) => {
    try {
        return await axiosInstance.patch(`/rental-external-items/${id}/deactivate`, {
            reason,
            userId
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

// Reactivar un gasto desactivado
export const activate = async (id) => {
    try {
        return await axiosInstance.patch(`/rental-external-items/${id}/activate`)
    } catch (error) {
        console.error(error);
    }
    return undefined;
}