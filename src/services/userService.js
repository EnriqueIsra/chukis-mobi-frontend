import axiosInstance from "./axiosConfig";


export const findAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/users");
    return response;
  } catch (error) {
    console.log(error);
  }
  return [];
};
export const createUser = async ({ username, telefono, role, password, imageUrl }) => {
  try {
    return await axiosInstance.post("/users", {
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
    return await axiosInstance.put(`/users/${id}`, {
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
    await axiosInstance.delete(`/users/${id}`);
  } catch (error) {
    console.log(error);
  }
};
