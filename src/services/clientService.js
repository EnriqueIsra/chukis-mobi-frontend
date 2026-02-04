import axiosInstance from "./axiosConfig";

export const findAll = async () => {
  try {
    const response = await axiosInstance.get("/clients");
    return response;
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const create = async ({ nombre, telefono, direccion, email }) => {
  try {
    return await axiosInstance.post("/clients", {
      nombre,
      telefono,
      direccion,
      email,
    });
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const update = async ({ id, nombre, telefono, direccion, email }) => {
  try {
    return await axiosInstance.put(`/clients/${id}`, {
      nombre,
      telefono,
      direccion,
      email,
    });
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const remove = async (id) => {
  try {
    await axiosInstance.delete(`/clients/${id}`);
  } catch (error) {
    console.error(error);
  }
};
