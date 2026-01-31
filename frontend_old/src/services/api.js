import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Get CSRF token from cookie
function getCSRFToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Add CSRF token to requests
api.interceptors.request.use((config) => {
  const csrfToken = getCSRFToken();
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  signup: (data) => api.post('/auth/register/', data), // ✅ FIXED
  getCurrentUser: () => api.get('/auth/me/'),          // ✅ FIXED
};

// Profile API
export const profileAPI = {
  // ✅ FIX: backend uses /profile/<username>/ not /profiles/<username>/
  get: (username) => api.get(`/profile/${username}/`),

  // ✅ FIX: backend uses /profile/update/ (or similar), not /profiles/me/
  update: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    return api.patch('/profile/update/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // If you don’t have search on backend yet, this can stay but will 404
  search: (query) => api.get(`/profiles/search/?q=${query}`),
};


// Feed API
export const feedAPI = {
  getFeed: () => api.get('/feed/'),
};

// Post API (Image posts)
export const postAPI = {
  list: (username) => api.get(`/posts/${username ? `?user=${username}` : ''}`),
  create: (formData) =>
    api.post('/posts/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/posts/${id}/`),
  like: (id) => api.post(`/posts/${id}/like/`),
  unlike: (id) => api.delete(`/posts/${id}/like/`),
  addComment: (id, content) => api.post(`/posts/${id}/comments/`, { content }),
  deleteComment: (postId, commentId) =>
    api.delete(`/posts/${postId}/comments/${commentId}/`),
};

// Verbal Post API
export const verbalPostAPI = {
  list: (username) => api.get(`/verbal-posts/${username ? `?user=${username}` : ''}`),
  create: (data) => api.post('/verbal-posts/', data),
  delete: (id) => api.delete(`/verbal-posts/${id}/`),
  like: (id) => api.post(`/verbal-posts/${id}/like/`),
  unlike: (id) => api.delete(`/verbal-posts/${id}/like/`),
  addComment: (id, content) => api.post(`/verbal-posts/${id}/comments/`, { content }),
  deleteComment: (postId, commentId) =>
    api.delete(`/verbal-posts/${postId}/comments/${commentId}/`),
};

// Project API
export const projectAPI = {
  list: (username) => api.get(`/projects/${username ? `?user=${username}` : ''}`),
  getById: (id) => api.get(`/projects/${id}/`),
  create: (formData) =>
    api.post('/projects/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, data) => api.patch(`/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/${id}/`),

  // Photos
  uploadPhoto: (id, formData) =>
    api.post(`/projects/${id}/photos/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deletePhoto: (projectId, photoId) => api.delete(`/projects/${projectId}/photos/${photoId}/`),

  // Collaborators
  addCollaborator: (id, username) => api.post(`/projects/${id}/collaborators/`, { username }),
  removeCollaborator: (id, userId) => api.delete(`/projects/${id}/collaborators/${userId}/`),

  // Manifestations
  addManifestation: (id, manifestationId) =>
    api.post(`/projects/${id}/manifestations/`, { manifestation_id: manifestationId }),
  removeManifestation: (id, manifestationId) =>
    api.delete(`/projects/${id}/manifestations/${manifestationId}/`),

  // Calendar
  getCalendarEntries: (id, year, month) =>
    api.get(`/projects/${id}/calendar/?year=${year}&month=${month}`),
  saveCalendarEntry: (id, date, content) => api.post(`/projects/${id}/calendar/`, { date, content }),
  deleteCalendarEntry: (id, date) => api.delete(`/projects/${id}/calendar/${date}/`),

  // Funding
  support: (id, data) => api.post(`/projects/${id}/support/`, data),
};

// Manifestation API
export const manifestationAPI = {
  list: () => api.get('/manifestations/'),
};

// Follow API
export const followAPI = {
  follow: (username) => api.post(`/profiles/${username}/follow/`),
  unfollow: (username) => api.delete(`/profiles/${username}/follow/`),
  getFollowers: (username) => api.get(`/profiles/${username}/followers/`),
  getFollowing: (username) => api.get(`/profiles/${username}/following/`),
};

// Message API
export const messageAPI = {
  getInbox: () => api.get('/messages/inbox/'),
  getOutbox: () => api.get('/messages/outbox/'),
  send: (data) => api.post('/messages/', data),
  reply: (id, data) => api.post(`/messages/${id}/reply/`, data),
  markAsRead: (id) => api.patch(`/messages/${id}/read/`),
};

export default api;
