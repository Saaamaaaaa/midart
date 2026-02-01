import axios from "axios";
import { API_BASE } from "../config/endpoints";

// Django CSRF cookie helper
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // IMPORTANT for Django session auth
  headers: { "Content-Type": "application/json" },
});

// Attach CSRF token automatically (for POST/PATCH/DELETE)
api.interceptors.request.use((config) => {
  const csrf = getCookie("csrftoken");
  if (csrf) config.headers["X-CSRFToken"] = csrf;
  return config;
});

// Handle 401 responses (session expired) - redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or not authenticated
      // Redirect to login page (avoid redirect loop if already on login)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
