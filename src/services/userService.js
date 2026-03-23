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
export const findInactiveUsers = async () => {
  try {
    const response = await axiosInstance.get("/users/inactive");
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
};

export const deactivateUser = async (id, reason, userId) => {
  try {
    return await axiosInstance.patch(`/users/${id}/deactivate`, { reason, userId });
  } catch (error) {
    console.log(error);
  }
  return undefined;
};

export const activateUser = async (id) => {
  try {
    return await axiosInstance.patch(`/users/${id}/activate`);
  } catch (error) {
    console.log(error);
  }
  return undefined;
};
