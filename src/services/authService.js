import axios from "axios";

const BASE_URL = "http://localhost:8080/api/auth";

export const login = (username, password) => {
  return axios.post(`${BASE_URL}/login`, {
    username,
    password
  });
};
