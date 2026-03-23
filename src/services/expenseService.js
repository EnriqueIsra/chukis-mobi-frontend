/* Este archivo hace las llamadas HTTP al backend, Mismo patrón que el productService.js pero con los endpoints de gastos, incluyendo las funciones de desactivar/activar */
import axiosInstance from "./axiosConfig"

export const findAll = async () => {
    try {
        const response = await axiosInstance.get("/expenses");
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const findInactive = async () => {
    try {
        const response = await axiosInstance.get("/expenses/inactive");
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const create = async ( { amount, expenseDate, category, description, imageUrl, userId } ) => {
    try {
        return await axiosInstance.post("/expenses", {
            amount,
            expenseDate,
            category,
            description,
            imageUrl,
            userId
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

export const update = async ( { id, amount, expenseDate, category, description, imageUrl } ) => {
    try {
        return await axiosInstance.put(`/expenses/${id}`, {
            amount,
            expenseDate,
            category,
            description,
            imageUrl
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

// Borrado lógico - envpia el motivo y quién desactiva
export const deactivate = async ( id, reason, userId ) => {
    try {
        return await axiosInstance.patch(`/expenses/${id}/deactivate`, {
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
        return await axiosInstance.patch(`/expenses/${id}/activate`)
    } catch (error) {
        console.error(error);
    }
    return undefined;
}