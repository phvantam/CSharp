import axiosInstance from "./axiosInstance";

export const playHistoryService = {
  async recordPlay(mediaItemId: number) {
    try {
      await axiosInstance.post("/play-history/record", { mediaItemId });
      console.log(`[PlayHistory] Đã ghi nhận phát bài ID: ${mediaItemId}`);
    } catch (error) {
      console.log("[Dev] Ghi PlayHistory (mock)");
    }
  },
};
