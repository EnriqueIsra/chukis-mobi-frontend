import axiosInstance from "./axiosConfig"

// Rentas que tienen subcontrato
export const findRentalsWithSubcontract = async () => {
    try {
        return await axiosInstance.get("/rentals/with-subcontract");
    } catch (error) {
        console.error(error);
    }
    return null;
}

// Items externos de una renta específica
export const findByRental = async (rentalId) => {
    try {
        return await axiosInstance.get(`/rental-external-items/by-rental/${rentalId}`);
    } catch (error) {
        console.error(error);
    }
    return null;
}

// Rentabilidad de una renta
export const getProfitability = async (rentalId) => {
    try {
        return await axiosInstance.get(`/rental-external-items/profitability/${rentalId}`);
    } catch (error) {
        console.error(error);
    }
    return null;
}

// Crear item externo (nuevo payload: rentalItemId en vez de rentalId)
export const create = async ({ rentalItemId, providerId, quantity, unitCost, notes }) => {
    try {
        return await axiosInstance.post("/rental-external-items", {
            rentalItemId,
            providerId,
            quantity,
            unitCost,
            notes
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

// Actualizar item externo
export const update = async ({ id, rentalItemId, providerId, quantity, unitCost, notes }) => {
    try {
        return await axiosInstance.put(`/rental-external-items/${id}`, {
            rentalItemId,
            providerId,
            quantity,
            unitCost,
            notes
        });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

// Borrado lógico
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

// Reactivar
export const activate = async (id) => {
    try {
        return await axiosInstance.patch(`/rental-external-items/${id}/activate`);
    } catch (error) {
        console.error(error);
    }
    return undefined;
}
