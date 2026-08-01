import axios from 'axios';

/**
 * Configured Axios instance for making API calls to the Spring Boot backend.
 * Reads the base URL from Vite environment variables.
 */
const api = axios.create({
  // Vite uses import.meta.env instead of process.env
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;