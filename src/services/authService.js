// Usamos nuestra instancia configurada de axios
import axiosInstance from "./axiosConfig";

/* 
  Servicio de autenticación
  El endpoint /auth/login está permitido sin token en SecurityConfig
  Retorna: {token, id, username, role, imageUrl, telefono} */
export const login = (username, password) => {
  return axiosInstance.post("/auth/login", {
    username,
    password
  });
};
