import axiosInstance from "./axiosInstance";
import type { MediaItemDto } from "./types/media";

type ApiResponse<T> = {
  data?: T;
  success?: boolean;
  message?: string;
};

const unwrap = <T>(payload: ApiResponse<T> | T): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as ApiResponse<T>).data !== undefined
  ) {
    return (payload as ApiResponse<T>).data as T;
  }

  return payload as T;
};

export const playHistoryService = {
  // Backend hiện có: POST /api/media/{id}/play
  async recordPlay(mediaItemId: number) {
    if (!mediaItemId) return false;

    try {
      const res = await axiosInstance.post<ApiResponse<boolean>>(
        `/media/${mediaItemId}/play`,
      );

      return Boolean(unwrap<boolean>(res.data));
    } catch (error) {
      // Không chặn phát nhạc nếu ghi lịch sử lỗi
      console.warn("[PlayHistory] Không thể ghi lịch sử phát:", error);
      return false;
    }
  },

  // Backend hiện có: GET /api/history?page=1&pageSize=20
  async getRecentHistory(page = 1, pageSize = 30) {
    const res = await axiosInstance.get<ApiResponse<MediaItemDto[]>>(
      "/history",
      {
        params: { page, pageSize },
      },
    );

    return unwrap<MediaItemDto[]>(res.data) || [];
  },
};
