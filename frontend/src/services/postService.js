import { api } from "../lib/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const postService = {
  // Note: Don't manually set Content-Type for FormData - Axios will set it
  // automatically with the correct boundary parameter
  createImagePost: (formData) =>
    api.post(ENDPOINTS.posts.create, formData),

  createVerbalise: (content) =>
    api.post(ENDPOINTS.verbalise.create, { content }),

  toggleLike: (item) => {
    if (item.post_type === "image") return api.post(ENDPOINTS.posts.like(item.id));
    return api.post(ENDPOINTS.verbalise.like(item.id));
  },
};
