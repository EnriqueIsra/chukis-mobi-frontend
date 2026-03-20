/* Este archivo hace las llamadas HTTP al backend, Mismo patrón que el productService.js pero con los endpoints de gastos, incluyendo las funciones de desactivar/activar */
import axiosInstance from "./axiosConfig"

export const findAll = async () => {
    try {
        const response = await axiosInstance.get("/providers");
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const findInactive = async () => {
    try {
        const response = await axiosInstance.get("/providers/inactive");
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const create = async ( { name, phone, notes } ) => {
    try {
        return await axiosInstance.post("/providers", {
            name,
            phone, 
            notes
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

export const update = async ( { id, name, phone, notes } ) => {
    try {
        return await axiosInstance.put(`/providers/${id}`, {
            name,
            phone, 
            notes
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

// Borrado lógico - envpia el motivo y quién desactiva
export const deactivate = async ( id, reason, userId ) => {
    try {
        return await axiosInstance.patch(`/providers/${id}/deactivate`, {
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
        return await axiosInstance.patch(`/providers/${id}/activate`)
    } catch (error) {
        console.error(error);
    }
    return undefined;
}