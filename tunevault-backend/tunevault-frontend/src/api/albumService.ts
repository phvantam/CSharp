import axiosInstance from "./axiosInstance";
import type { AlbumDto } from "./types/album";
import type { MediaItemDto } from "./types/media";

export interface AlbumDetailResponse {
  album: AlbumDto;
  songs: MediaItemDto[];
}

export const albumService = {
  async getAlbums(): Promise<AlbumDto[]> {
    const res = await axiosInstance.get<{ data: AlbumDto[] }>("/albums");
    return res.data.data || [];
  },

  async getAlbumById(id: number): Promise<AlbumDetailResponse> {
    const res = await axiosInstance.get<{ data: AlbumDetailResponse }>(`/albums/${id}`);
    return res.data.data;
  },

  async createAlbum(formData: FormData): Promise<AlbumDto> {
    const res = await axiosInstance.post<{ data: AlbumDto }>("/albums", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  async updateAlbum(id: number, formData: FormData): Promise<AlbumDto> {
    const res = await axiosInstance.put<{ data: AlbumDto }>(`/albums/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  async deleteAlbum(id: number): Promise<void> {
    await axiosInstance.delete(`/albums/${id}`);
  },

  async searchAlbums(query: string): Promise<AlbumDto[]> {
    const res = await axiosInstance.get<{ data: AlbumDto[] }>("/albums/search", {
      params: { q: query },
    });
    return res.data.data || [];
  },
};
