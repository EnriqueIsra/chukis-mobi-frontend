import axiosInstance from "./axiosConfig";

// Obtener todas las rentas
export const findAll = async () => {
  try {
    const response = await axiosInstance.get("/rentals");
    return response;
  } catch (error) {
    console.error(error);
  }
  return null;
};

// Crear renta (wizard completo)
export const createRental = async (rentalRequest) => {
  try {
    const response = await axiosInstance.post("/rentals", rentalRequest);
    return response;
  } catch (error) {
    console.error("Error creating rental:", error);
    throw error;
  }
};

// Actualizar renta existente
export const updateRental = async (id, rentalRequest) => {
  try {
    const response = await axiosInstance.put(`/rentals/${id}`, rentalRequest);
    return response;
  } catch (error) {
    console.error("Error updating rental:", error);
    throw error;
  }
};

/**
 * Eliminar renta (opcional por ahora)
 */
export const findInactive = async () => {
  try {
    const response = await axiosInstance.get("/rentals/inactive");
    return response;
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const deactivate = async (id, reason, userId) => {
  try {
    return await axiosInstance.patch(`/rentals/${id}/deactivate`, { reason, userId });
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

export const activate = async (id) => {
  try {
    return await axiosInstance.patch(`/rentals/${id}/activate`);
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

// Cambiar solo el status de la renta
export const updateRentalStatus = async (id, status) => {
  try {
    const response = await axiosInstance.put(
      `/rentals/${id}/status`,
      null,
      {
        params: { status },
      }
    );
    return response;
  } catch (error) {
    console.error("Error updating rental status:", error);
    throw error;
  }
};

// Obtener una renta por su ID (con items, client, user completos)
// Se usa para cargar los datos completos al abrir el modal de detalles
// GET /api/rentals/{id}
export const findById = async (id) => {
  try {
    const response = await axiosInstance.get(`/rentals/${id}`);
    return response
  } catch (error) {
    console.error("Error fetching rental: ", error)
    throw error;
  }
}

export const findWithContract = async () => {
  try {
    const response = await axiosInstance.get("/rentals/with-contract");
    return response;
  } catch (error) {
    console.error(error);
  }
  return null;
}

export const generateContract = async (id) => {
  try {
    return await axiosInstance.patch(`/rentals/${id}/generate-contract`);
  } catch (error) {
    console.error(error);
  }
  return undefined;
}