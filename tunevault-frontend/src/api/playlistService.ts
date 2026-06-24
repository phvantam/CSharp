import axiosInstance from "./axiosInstance";
import type { PlaylistDto } from "./types/playlist";
import type { MediaItemDto } from "./types/media";

export interface PlaylistDetailResponse extends PlaylistDto {
  creator?: string;
  tracks: {
    playlistTrackId: number;
    playlistId: number;
    mediaItemId: number;
    addedAt: string;
    mediaItem: MediaItemDto;
  }[];
}

export const playlistService = {
  async getMyPlaylists(): Promise<PlaylistDto[]> {
    const res = await axiosInstance.get<{ data: PlaylistDto[] }>("/playlists");
    return res.data.data || [];
  },

  async getPlaylistById(id: number): Promise<PlaylistDetailResponse> {
    const res = await axiosInstance.get<{ data: PlaylistDetailResponse }>(
      `/playlists/${id}`,
    );
    return res.data.data;
  },

  async createPlaylist(data: Partial<PlaylistDto>): Promise<PlaylistDto> {
    const res = await axiosInstance.post<{ data: PlaylistDto }>(
      "/playlists",
      data,
    );
    return res.data.data;
  },

  async updatePlaylist(
    id: number,
    data: Partial<PlaylistDto>,
  ): Promise<PlaylistDto> {
    const res = await axiosInstance.put<{ data: PlaylistDto }>(
      `/playlists/${id}`,
      data,
    );
    return res.data.data;
  },

  async deletePlaylist(id: number): Promise<void> {
    await axiosInstance.delete(`/playlists/${id}`);
  },

  async addTrackToPlaylist(
    playlistId: number,
    mediaItemId: number,
  ): Promise<void> {
    await axiosInstance.post(`/playlists/${playlistId}/tracks`, {
      mediaItemId,
    });
  },

  async removeTrackFromPlaylist(
    playlistId: number,
    mediaItemId: number,
  ): Promise<void> {
    await axiosInstance.delete(
      `/playlists/${playlistId}/tracks/${mediaItemId}`,
    );
  },

  async searchPlaylists(query: string): Promise<PlaylistDto[]> {
    const res = await axiosInstance.get<{ data: PlaylistDto[] }>(
      "/playlists/search",
      {
        params: { q: query },
      },
    );
    return res.data.data || [];
  },
};
