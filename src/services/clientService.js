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

export const findInactive = async () => {
  try {
    const response = await axiosInstance.get("/clients/inactive");
    return response;
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const deactivate = async (id, reason, userId) => {
  try {
    return await axiosInstance.patch(`/clients/${id}/deactivate`, { reason, userId });
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

export const activate = async (id) => {
  try {
    return await axiosInstance.patch(`/clients/${id}/activate`);
  } catch (error) {
    console.error(error);
  }
  return undefined;
};
