import axios from "axios";

const baseUrl = "http://localhost:8080/api/users";

export const findAllUsers = async () => {
  try {
    const response = await axios.get(baseUrl);
    return response;
  } catch (error) {
    console.log(error);
  }
  return [];
};
export const createUser = async ({ username, telefono, role, password, imageUrl }) => {
  try {
    return await axios.post(baseUrl, {
      username,
      telefono, 
      role,
      password,
      imageUrl
    });
  } catch (error) {
    console.log(error);
  }
  return undefined;
};
export const updateUser = async ({ id, username, telefono, role, password, imageUrl }) => {
  try {
    return await axios.put(`${baseUrl}/${id}`, {
      username,
      telefono, 
      role,
      password,
      imageUrl
    });
  } catch (error) {
    console.log(error);
  }
  return undefined;
};
export const removeUser = async (id) => {
  try {
    await axios.delete(`${baseUrl}/${id}`);
  } catch (error) {
    console.log(error);
  }
};
