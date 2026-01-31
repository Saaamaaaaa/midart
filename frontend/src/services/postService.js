import { api } from "../lib/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const postService = {
  createImagePost: (formData) =>
    api.post(ENDPOINTS.posts.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  createVerbalise: (content) =>
    api.post(ENDPOINTS.verbalise.create, { content }),

  toggleLike: (item) => {
    if (item.post_type === "image") return api.post(ENDPOINTS.posts.like(item.id));
    return api.post(ENDPOINTS.verbalise.like(item.id));
  },
};
