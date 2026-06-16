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
export const getAvailability = async (startDate, endDate, excludeRentalId = null) => {
  try {
    const params = { startDate, endDate };
    if (excludeRentalId) {
      params.excludeRentalId = excludeRentalId;
    }

    const response = await axiosInstance.get(`/products/availability`, {
      params
    });
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
};

// === GALERÍA DE IMÁGENES === 

// Obtener todas las imágenes adicionales de un producto
// Retorna un array de objetos: { id, imageUrl, displayOrder }
export const getImages = async (productId) => {
  try {
    const response = await axiosInstance.get(`/products/${productId}/images`);
    return response;
  } catch (error) {
    console.error(error);
  }
  return null;
};

// Agregar una imagen a la galería de un producto
// Primero se sube el archivo con uploadFile (fileService), y luego se envía la URL aqui
export const addImage = async (productId, imageUrl) => {
  try {
    return await axiosInstance.post(`/products/${productId}/images`, { imageUrl });
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

// Eliminar una imagen de la galería
export const deleteImage = async (imageId) => {
  try {
    return await axiosInstance.delete(`/products/images/${imageId}`);
  } catch (error) {
    console.error(error);
  }
  return undefined;
};
