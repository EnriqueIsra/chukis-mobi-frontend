import axios from "axios";

const baseUrl = "http://localhost:8080/api/clients";

export const findAll = async () => {
  try {
    const response = await axios.get(baseUrl);
    return response.data;
  } catch (error) {
    console.error(error);
  }
  return null;
};

export const create = async ({ nombre, telefono, direccion, email }) => {
  try {
    return await axios.post(baseUrl, {
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
    return await axios.put(`${baseUrl}/${id}`, {
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
    await axios.delete(`${baseUrl}/${id}`);
  } catch (error) {
    console.error(error);
  }
};
