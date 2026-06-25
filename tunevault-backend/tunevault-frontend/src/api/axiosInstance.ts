import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const resolveUploadsUrls = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    const base = API_URL.replace(/\/api$/, "");
    if (obj.startsWith("/uploads/")) {
      return `${base}${obj}`;
    }
    if (obj.startsWith("/api/")) {
      return `${base}${obj}`;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(resolveUploadsUrls);
  }

  if (typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = resolveUploadsUrls(obj[key]);
      }
    }
    return newObj;
  }

  return obj;
};

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = resolveUploadsUrls(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
