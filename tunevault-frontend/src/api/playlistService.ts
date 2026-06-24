import axiosInstance from "./axiosInstance";
import type { PlaylistDto } from "./types/playlist";

export const playlistService = {
  async getMyPlaylists(): Promise<PlaylistDto[]> {
    const res = await axiosInstance.get<PlaylistDto[]>("/playlists");
    return res.data;
  },

  async getPlaylistById(id: number): Promise<PlaylistDto> {
    const res = await axiosInstance.get<PlaylistDto>(`/playlists/${id}`);
    return res.data;
  },

  async createPlaylist(data: Partial<PlaylistDto>): Promise<PlaylistDto> {
    const res = await axiosInstance.post<PlaylistDto>("/playlists", data);
    return res.data;
  },
};
