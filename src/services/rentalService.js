import axios from "axios";

const baseUrl = "http://localhost:8080/api/rentals";


// Obtener todas las rentas
export const findAll = async () => {
  try {
    const response = await axios.get(baseUrl);
    return response;
  } catch (error) {
    console.error(error);
  }
  return null;
};

// Crear renta (wizard completo)
export const createRental = async (rentalRequest) => {
  try {
    const response = await axios.post(baseUrl, rentalRequest);
    return response;
  } catch (error) {
    console.error("Error creating rental:", error);
    throw error;
  }
};

/**
 * Eliminar renta (opcional por ahora)
 */
export const remove = async (id) => {
  try {
    await axios.delete(`${baseUrl}/${id}`);
  } catch (error) {
    console.error("Error deleting rental:", error);
    throw error;
  }
};
