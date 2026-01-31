// src/config/endpoints.js

export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

export const ENDPOINTS = {
  auth: {
    register: "/auth/register/",
    login: "/auth/login/",
    logout: "/auth/logout/",
    me: "/auth/me/",
  },

  feed: {
    list: "/feed/",
  },

  posts: {
    create: "/posts/",
    like: (id) => `/posts/${id}/like/`,
  },

  verbalise: {
    create: "/verbalise/",
    like: (id) => `/verbalise/${id}/like/`,
  },

  profile: {
    byUsername: (username) => `/profiles/${username}/`,
    update: "/profile/update/",

    follow: (username) => `/profiles/${username}/follow/`,
    unfollow: (username) => `/profiles/${username}/unfollow/`,
    followers: (username) => `/profiles/${username}/followers/`,
    following: (username) => `/profiles/${username}/following/`,

    posts: (username) => `/profiles/${username}/posts/`,
    projects: (username) => `/profiles/${username}/projects/`,
  },

  projects: {
    create: "/projects/",
    detail: (id) => `/projects/${id}/`,
  },
};
