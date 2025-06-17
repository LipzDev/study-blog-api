import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação se existir
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("@BlogAuth:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };
export default api;
