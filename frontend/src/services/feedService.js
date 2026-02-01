import { api } from "../lib/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const feedService = {
  // Accept optional config (e.g., { signal: AbortController.signal }) for request cancellation
  getFeed: (config = {}) => api.get(ENDPOINTS.feed.list, config),
};
