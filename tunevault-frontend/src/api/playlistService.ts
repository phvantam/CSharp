import axiosInstance from "./axiosInstance";
import type { PlaylistDto } from "./types/playlist";

const normalizePlaylist = (p: any): PlaylistDto => ({
  playlistId: p.playlistId ?? p.id ?? p.PlaylistId,
  title: p.title || p.name || p.Title || p.Name || "Playlist không tên",
  name: p.name || p.title || p.Name || p.Title,
  description: p.description ?? p.Description,
  visibility: p.visibility || p.Visibility || "Private",
  isPublic: (p.visibility || p.Visibility) === "Public",
  trackCount: p.trackCount ?? p.TrackCount ?? 0,
  coverImageUrl: p.coverImageUrl || p.CoverImageUrl || null,
  createdAt: p.createdAt || p.CreatedAt,
  ownerUserId: p.ownerUserId || p.OwnerUserId,
  ownerName: p.ownerName || p.OwnerName,
});

const unwrap = (res: any) => res.data?.data ?? res.data;

export const playlistService = {
  // Lấy danh sách playlist của tôi: gồm cả Public và Private
  async getMyPlaylists(): Promise<PlaylistDto[]> {
    const res = await axiosInstance.get("/playlist/my-playlists");
    const data = unwrap(res) || [];
    return Array.isArray(data) ? data.map(normalizePlaylist) : [];
  },

  // Lấy playlist public của một user để hiển thị trên hồ sơ công khai
  async getPublicPlaylistsByUser(userId: string): Promise<PlaylistDto[]> {
    const res = await axiosInstance.get(`/playlist/user/${userId}/public`);
    const data = unwrap(res) || [];
    return Array.isArray(data) ? data.map(normalizePlaylist) : [];
  },

  // Lấy chi tiết 1 playlist
  async getPlaylistById(id: number) {
    const res = await axiosInstance.get(`/playlist/${id}`);
    const data = unwrap(res);
    if (!data) return null;

    return {
      ...data,
      playlistId: data.playlistId ?? data.id,
      title: data.title || data.name,
      name: data.name || data.title,
      visibility: data.visibility || "Private",
      coverImageUrl: data.coverImageUrl || null,
      tracks: data.tracks || [],
    };
  },

  // Tạo playlist mới, có thể kèm ảnh bìa từ máy
  async createPlaylist(data: {
    title: string;
    description?: string;
    isPublic?: boolean;
    visibility?: "Public" | "Private";
    coverImageFile?: File | null;
  }) {
    const visibility =
      data.visibility || (data.isPublic ? "Public" : "Private");
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("isPublic", String(visibility === "Public"));

    if (data.coverImageFile) {
      formData.append("coverImageFile", data.coverImageFile);
    }

    const res = await axiosInstance.post("/playlist", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return unwrap(res);
  },

  // Cập nhật playlist: tên, mô tả, công khai/riêng tư, ảnh bìa
  async updatePlaylist(
    id: number,
    data: {
      title?: string;
      name?: string;
      description?: string;
      visibility?: "Public" | "Private";
      coverImageFile?: File | null;
    },
  ) {
    const formData = new FormData();

    formData.append("title", data.title || data.name || "");
    formData.append("name", data.name || data.title || "");
    formData.append("description", data.description || "");

    if (data.visibility) {
      formData.append("visibility", data.visibility);
      formData.append("isPublic", String(data.visibility === "Public"));
    }

    if (data.coverImageFile) {
      formData.append("coverImageFile", data.coverImageFile);
    }

    const res = await axiosInstance.put(`/playlist/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return unwrap(res);
  },

  async deletePlaylist(id: number) {
    const res = await axiosInstance.delete(`/playlist/${id}`);
    return res.data;
  },

  async addTrackToPlaylist(playlistId: number, mediaItemId: number) {
    const res = await axiosInstance.post(
      `/playlist/${playlistId}/songs/${mediaItemId}`,
    );
    return res.data;
  },

  async removeTrackFromPlaylist(playlistId: number, mediaItemId: number) {
    const res = await axiosInstance.delete(
      `/playlist/${playlistId}/songs/${mediaItemId}`,
    );
    return res.data;
  },
};
