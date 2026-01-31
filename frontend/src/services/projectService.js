import { api } from "../lib/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const projectService = {
  createProject: (formData) =>
    api.post(ENDPOINTS.projects.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getProject: (id) => api.get(ENDPOINTS.projects.detail(id)),
};
