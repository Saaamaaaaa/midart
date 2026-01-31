import { api } from "../lib/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const authService = {
  login: (data) => api.post(ENDPOINTS.auth.login, data),
  register: (data) => api.post(ENDPOINTS.auth.register, data),
  logout: () => api.post(ENDPOINTS.auth.logout),
  me: () => api.get(ENDPOINTS.auth.me),
};
