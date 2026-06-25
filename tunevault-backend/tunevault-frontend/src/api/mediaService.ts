import axiosInstance from "./axiosInstance";
import type { MediaItemDto } from "./types/media";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const mediaService = {
  // Lấy danh sách trending
  async getTrendingMedia(limit = 10): Promise<MediaItemDto[]> {
    try {
      const res = await axiosInstance.get<{ data: MediaItemDto[] }>("/media/trending", {
        params: { limit },
      });
      return res.data.data || [];
    } catch (error) {
      console.log("Using mock data for trending media");
      return getMockMedia();
    }
  },

  // Lấy URL stream (hỗ trợ cả local audio cho demo)
  getStreamUrl(id: number): string {
    // Map ID với file audio local (dùng để demo khi chưa có backend)
    const localAudioMap: Record<number, string> = {
      1: "/audio/noinaycoanh.mp3",
      2: "/audio/seetinh.mp3",
      3: "/audio/mangtienvechome.mp3",
      8: "/audio/lalung.mp3",
      10: "/audio/sautatca.mp3",
      15: "/audio/cohenvoithanhxuan.mp3",
      16: "/audio/comemyway.mp3",
      17: "/audio/emthuacota.mp3",
      18: "/audio/khongthesay.mp3",
      19: "/audio/waitingforyou.mp3",
      20: "/audio/cochangtraivietlencay.mp3",
      21: "/audio/thiephongsaiten.mp3",
      50: "/audio/noinaycoanh.mp3",
      51: "/audio/lalung.mp3",
    };

    if (localAudioMap[id]) {
      return localAudioMap[id];
    }

    // Nếu không có trong map → gọi API thật
    return `${API_URL}/media/${id}/stream`;
  },

  // Upload media
  async uploadMedia(formData: FormData) {
    const res = await axiosInstance.post<{ data: MediaItemDto }>("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  // Tìm kiếm media
  async searchMedia(query: string, page = 1, pageSize = 20): Promise<MediaItemDto[]> {
    const res = await axiosInstance.get<{ data: { items: MediaItemDto[] } }>("/media/search", {
      params: { q: query, page, pageSize },
    });
    return res.data.data.items || [];
  },

  async updateMedia(id: number, formData: FormData): Promise<MediaItemDto> {
    const res = await axiosInstance.put<{ data: MediaItemDto }>(`/media/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  async deleteMedia(id: number): Promise<void> {
    await axiosInstance.delete(`/media/${id}`);
  },

  // Yêu thích
  async toggleFavorite(mediaItemId: number): Promise<{ isFavorited: boolean }> {
    const res = await axiosInstance.post<{ data: { isFavorited: boolean } }>(`/favorites/${mediaItemId}`);
    return res.data.data;
  },

  async getFavorites(): Promise<MediaItemDto[]> {
    const res = await axiosInstance.get<{ data: MediaItemDto[] }>("/favorites");
    return res.data.data || [];
  },
};

// ==================== DỮ LIỆU MẪU ====================
const getMockMedia = (): MediaItemDto[] => [
  {
    mediaItemId: 1,
    title: "Nơi Này Có Anh",
    artistId: 1,
    artistName: "Sơn Tùng M-TP",
    durationSeconds: 278,
    thumbnailUrl: "/image/noinaycoanh.png",
    visibility: "Public",
    mediaType: "Audio",
  },
  {
    mediaItemId: 8,
    title: "Lạ Lùng",
    artistId: 8,
    artistName: "Vũ.",
    durationSeconds: 260,
    thumbnailUrl: "/image/lalung.jpg",
    visibility: "Public",
    mediaType: "Audio",
  },
  {
    mediaItemId: 3,
    title: "Mang Tiền Về Cho Mẹ",
    artistId: 3,
    artistName: "Đen",
    durationSeconds: 407,
    thumbnailUrl: "/image/mangtienvechome.jpg",
    visibility: "Public",
    mediaType: "Audio",
  },
];
