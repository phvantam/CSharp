import axiosInstance from './axiosInstance';
import type { MediaItem, UploadMediaRequest, SearchMediaQuery, PlayHistory } from '../types/media.types';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';

export const mediaApi = {
  // Upload
  upload: (data: UploadMediaRequest, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', data.file);
    form.append('title', data.title);
    form.append('artist', data.artist);
    if (data.album)       form.append('album', data.album);
    if (data.genre)       form.append('genre', data.genre);
    if (data.description) form.append('description', data.description);
    if (data.cover)       form.append('cover', data.cover);
    form.append('isPublic', String(data.isPublic));

    return axiosInstance.post<ApiResponse<MediaItem>>('/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
  },

  // Stream URL (dùng trong <audio src> / <video src>)
  getStreamUrl: (id: string) => `${axiosInstance.defaults.baseURL}/media/${id}/stream`,

  // CRUD
  getById: (id: string) =>
    axiosInstance.get<ApiResponse<MediaItem>>(`/media/${id}`),

  getMyMedia: (page = 1, pageSize = 20) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<MediaItem>>>('/media/mine', { params: { page, pageSize } }),

  getTrending: (limit = 10) =>
    axiosInstance.get<ApiResponse<MediaItem[]>>('/media/trending', { params: { limit } }),

  search: (query: SearchMediaQuery) =>
    axiosInstance.get<ApiResponse<PaginatedResponse<MediaItem>>>('/media/search', { params: query }),

  delete: (id: string) =>
    axiosInstance.delete(`/media/${id}`),

  // Like / Favorite
  toggleLike: (id: string) =>
    axiosInstance.post<ApiResponse<{ isLiked: boolean; likeCount: number }>>(`/media/${id}/like`),

  getFavorites: () =>
    axiosInstance.get<ApiResponse<MediaItem[]>>('/media/favorites'),

  // Play history
  recordPlay: (id: string) =>
    axiosInstance.post(`/media/${id}/play`),

  getHistory: () =>
    axiosInstance.get<ApiResponse<PlayHistory[]>>('/media/history'),
};
