import { api } from "../lib/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const feedService = {
  getFeed: () => api.get(ENDPOINTS.feed.list),
};
