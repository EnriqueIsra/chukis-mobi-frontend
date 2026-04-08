import axiosInstance from "./axiosConfig"

export const findAll = async () => {
    try {
        const response = await axiosInstance.get("/quotations");
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const findInactive = async () => {
    try {
        const response = await axiosInstance.get("/quotations/inactive");
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const findById = async (id) => {
    try {
        const response = await axiosInstance.get(`/quotations/${id}`);
        return response;
    } catch (error) {
        console.error(error);
    }
    return null;
}

export const create = async (data) => {
    try {
        return await axiosInstance.post("/quotations", data);
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

export const update = async (id, data) => {
    try {
        return await axiosInstance.put(`/quotations/${id}`, data);
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

export const deactivate = async (id, reason, userId) => {
    try {
        return await axiosInstance.patch(`/quotations/${id}/deactivate`, { reason, userId });
    } catch (error) {
        console.error(error);
    }
    return undefined;
}

export const activate = async (id) => {
    try {
        return await axiosInstance.patch(`/quotations/${id}/activate`);
    } catch (error) {
        console.error(error);
    }
    return undefined;
}
