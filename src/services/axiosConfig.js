/* Archivo de configuración de axios
    Encargado de:
    - Crear una instancia de axios con la URL base
    - Agregar automáticamente el token JWT a cada petición
    - Manejar errores de autenticación (token expirado) */

import axios from "axios";

// URL base del backend
const API_URL = "http://localhost:8080/api";

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
    baseURL: API_URL,
});

/* Interceptor de REQUEST (antes de enviar cada petición) 
    Agrega automáticamente el token JWT al header Authorization */
axiosInstance.interceptors.request.use(
    (config) => {
        // Obtener el usuario de localStorage
        const user = localStorage.getItem("user");

        if (user) {
            // Parsear el JSON para obtener el token
            const { token } = JSON.parse(user);

            if (token) {
                // Agregar el header Authorization con el formato "Bearer <token>"
                config.headers.Authorization = `Bearer ${token}`
            }
        }

        return config;
    },
    (error) => {
        // Si hay un error en la configuración de la petición
        return Promise.reject(error);
    }
);

/* Interceptor de RESPONSE (después de recibir cada respuesta)
    Maneja errores de autenticación (401 = token inválido/expirado) */
axiosInstance.interceptors.response.use(
    (response) => {
        // Si la respuesta es exitosa, simplemente la retornamos
        return response;
    },
    (error) => {


        // Si el error es 401 (No autorizado)
        if (error.response && error.response.status === 401) {
            // Limpiar el locarStorage
            localStorage.removeItem("user");

            // Redirigir al login
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
);

// Exportar la instancia configurada
export default axiosInstance;