import axiosInstance from "./axiosInstance";
import type { MediaItemDto } from "./types/media";

export const mediaService = {
  // Lấy danh sách trending
  async getTrendingMedia(limit = 10): Promise<MediaItemDto[]> {
    try {
      const res = await axiosInstance.get("/media/trending", {
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
    return `${import.meta.env.VITE_API_URL}/media/${id}/stream`;
  },

  // Upload media
  async uploadMedia(formData: FormData) {
    const res = await axiosInstance.post("/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Tìm kiếm media
  async searchMedia(query: string, page = 1, pageSize = 20) {
    const res = await axiosInstance.get("/media/search", {
      params: { q: query, page, pageSize },
    });
    return res.data;
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
