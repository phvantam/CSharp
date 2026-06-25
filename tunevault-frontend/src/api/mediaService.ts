import axiosInstance from "./axiosInstance";
import type { MediaItemDto } from "./types/media";

export const mediaService = {
  // ==================== HELPER: Lấy full URL cho media ====================
  getFullMediaUrl(relativePath: string | undefined | null): string {
    if (!relativePath) return "";
    if (relativePath.startsWith("http") || relativePath.startsWith("blob:")) {
      return relativePath;
    }

    // Backend static files: /media/image/..., /media/audio/..., /media/video/...
    if (relativePath.startsWith("/media/")) {
      const apiOrigin = (
        import.meta.env.VITE_API_URL || "http://localhost:5090/api"
      ).replace(/\/api\/?$/, "");
      return `${apiOrigin}${relativePath}`;
    }

    // Frontend public files: /image/..., /audio/...
    return relativePath;
  },

  // ==================== TRENDING ====================
  async getTrendingMedia(limit = 12): Promise<MediaItemDto[]> {
    try {
      const res = await axiosInstance.get("/media/trending", {
        params: { limit },
      });
      return res.data.data || [];
    } catch (error) {
      console.log("Using mock data for trending");
      return [...mockMedia];
    }
  },

  // ==================== NEW RELEASES ====================
  async getNewReleases(limit = 6): Promise<MediaItemDto[]> {
    try {
      const res = await axiosInstance.get("/media/new-releases", {
        params: { limit },
      });
      return res.data.data || [];
    } catch (error) {
      console.error("Lỗi lấy New Releases:", error);
      return [];
    }
  },

  // ==================== MY UPLOADS ====================
  async getUserMedia(page = 1, pageSize = 20): Promise<MediaItemDto[]> {
    try {
      const res = await axiosInstance.get("/media/my-uploads", {
        params: { page, pageSize },
      });
      return res.data.data || [];
    } catch (error) {
      console.error("Lỗi lấy bài hát của tôi:", error);
      return [];
    }
  },

  // ==================== GET BY ID ====================
  async getMediaById(mediaItemId: number): Promise<MediaItemDto | null> {
    try {
      const res = await axiosInstance.get(`/media/${mediaItemId}`);
      return res.data.data || res.data || null;
    } catch (error) {
      console.error("Lỗi lấy media theo id:", error);
      return null;
    }
  },

  // ==================== UPDATE MEDIA ====================
  async updateMedia(
    mediaItemId: number,
    data: {
      title?: string;
      description?: string;
      artist?: string;
      album?: string;
      genre?: string;
      releaseDate?: string | null;
      lyrics?: string;
      visibility?: string;
      isPublic?: boolean;
      thumbnailFile?: File | null;
    },
  ) {
    const formData = new FormData();

    if (data.title !== undefined) formData.append("title", data.title);
    if (data.description !== undefined)
      formData.append("description", data.description || "");
    if (data.artist !== undefined) formData.append("artist", data.artist);
    if (data.album !== undefined) formData.append("album", data.album);
    if (data.genre !== undefined) formData.append("genre", data.genre || "");
    if (data.releaseDate !== undefined && data.releaseDate)
      formData.append("releaseDate", data.releaseDate);
    if (data.lyrics !== undefined) formData.append("lyrics", data.lyrics);
    if (data.visibility !== undefined)
      formData.append("visibility", data.visibility);
    if (data.isPublic !== undefined)
      formData.append("isPublic", String(data.isPublic));
    if (data.thumbnailFile)
      formData.append("thumbnailFile", data.thumbnailFile);

    const res = await axiosInstance.put(`/media/${mediaItemId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  // ==================== DELETE MEDIA ====================
  async deleteMedia(mediaItemId: number) {
    const res = await axiosInstance.delete(`/media/${mediaItemId}`);
    return res.data;
  },

  // ==================== SEARCH ARTISTS ====================
  async searchArtists(keyword: string, limit = 8) {
    try {
      const res = await axiosInstance.get("/media/artists/search", {
        params: { keyword, limit },
      });
      return res.data.data || [];
    } catch (error) {
      console.error("Search artists error:", error);
      return [];
    }
  },

  // ==================== STREAM URL ====================
  getStreamUrl(id: number): string {
    const apiOrigin = (
      import.meta.env.VITE_API_URL || "http://localhost:5090/api"
    ).replace(/\/api\/?$/, "");

    return `${apiOrigin}/api/media/stream/${id}`;
  },

  // ==================== UPLOAD ====================
  async uploadMedia(formData: FormData) {
    const res = await axiosInstance.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // ==================== UPLOAD MULTI ====================
  async uploadMultiMedia(formData: FormData) {
    const res = await axiosInstance.post("/media/upload-multi", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // ==================== SEARCH ====================
  async searchMedia(query: string, page = 1, pageSize = 20) {
    const res = await axiosInstance.get("/media/search", {
      params: { keyword: query, page, pageSize },
    });
    return res.data;
  },
};

// ==================== MOCK DATA (chỉ dùng khi BE lỗi) ====================
const mockMedia: MediaItemDto[] = [
  {
    mediaItemId: 1,
    artistId: 1,
    title: "Nơi Này Có Anh",
    artistName: "Sơn Tùng M-TP",
    durationSeconds: 278,
    thumbnailUrl: "/image/noinaycoanh.png",
    visibility: "Public",
    mediaType: "Audio",
  },
  {
    mediaItemId: 8,
    artistId: 8,
    title: "Lạ Lùng",
    artistName: "Vũ.",
    durationSeconds: 260,
    thumbnailUrl: "/image/lalung.jpg",
    visibility: "Public",
    mediaType: "Audio",
  },
];
