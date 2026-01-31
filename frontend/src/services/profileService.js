import { api } from "../lib/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const profileService = {
  getByUsername: (username) => api.get(ENDPOINTS.profile.byUsername(username)),

  updateCurrent: (formData) =>
    api.patch(ENDPOINTS.profile.update, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  follow: (username) => api.post(ENDPOINTS.profile.follow(username)),
  unfollow: (username) => api.post(ENDPOINTS.profile.unfollow(username)),

  getFollowers: (username) => api.get(ENDPOINTS.profile.followers(username)),
  getFollowing: (username) => api.get(ENDPOINTS.profile.following(username)),

  getPosts: (username) => api.get(ENDPOINTS.profile.posts(username)),
  getProjects: (username) => api.get(ENDPOINTS.profile.projects(username)),
};
