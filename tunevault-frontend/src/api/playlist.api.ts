import axiosInstance from './axiosInstance';
import type { Playlist, CreatePlaylistRequest, UpdatePlaylistRequest, AddTrackRequest } from '../types/playlist.types';
import type { ApiResponse } from '../types/common.types';

export const playlistApi = {
  create: (data: CreatePlaylistRequest) =>
    axiosInstance.post<ApiResponse<Playlist>>('/playlists', data),

  getById: (id: string) =>
    axiosInstance.get<ApiResponse<Playlist>>(`/playlists/${id}`),

  getMine: () =>
    axiosInstance.get<ApiResponse<Playlist[]>>('/playlists/mine'),

  update: (id: string, data: UpdatePlaylistRequest) =>
    axiosInstance.put<ApiResponse<Playlist>>(`/playlists/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete(`/playlists/${id}`),

  addTrack: (id: string, data: AddTrackRequest) =>
    axiosInstance.post<ApiResponse<Playlist>>(`/playlists/${id}/tracks`, data),

  removeTrack: (id: string, mediaItemId: string) =>
    axiosInstance.delete(`/playlists/${id}/tracks/${mediaItemId}`),
};
