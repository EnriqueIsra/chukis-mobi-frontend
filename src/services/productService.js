import axiosInstance from "./axiosConfig";

export const findAll = async () => {
  try {
    const response = await axiosInstance.get("/products");
    return response;
  } catch (error) {
    console.log(error);
  }
  return [];
};
export const create = async ({ name, description, price, color, stock, imageUrl }) => {
  try {
    return await axiosInstance.post("/products", {
      name,
      description,
      price,
      color,
      stock,
      imageUrl
    });
  } catch (error) {
    console.log(error);
  }
  return undefined;
};
export const update = async ({ id, name, description, price, color, stock, imageUrl }) => {
  try {
    return await axiosInstance.put(`/products/${id}`, {
      name,
      description,
      price,
      color,
      stock, 
      imageUrl
    });
  } catch (error) {
    console.log(error);
  }
  return undefined;
};
export const findInactive = async () => {
  try {
    const response = await axiosInstance.get("/products/inactive");
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
};

export const deactivate = async (id, reason, userId) => {
  try {
    return await axiosInstance.patch(`/products/${id}/deactivate`, { reason, userId });
  } catch (error) {
    console.log(error);
  }
  return undefined;
};

export const activate = async (id) => {
  try {
    return await axiosInstance.patch(`/products/${id}/activate`);
  } catch (error) {
    console.log(error);
  }
  return undefined;
};

// Obtener disponibilidad de productos por fechas
export const getAvailability = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get(`/products/availability`, {
      params: { startDate, endDate }
    });
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
};
