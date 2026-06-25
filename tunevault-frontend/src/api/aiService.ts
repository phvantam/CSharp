import axiosInstance from "./axiosInstance";

interface AIChatResponse {
  reply?: string;
  data?: {
    reply?: string;
  };
}

export const aiService = {
  async chat(message: string): Promise<string> {
    const res = await axiosInstance.post<AIChatResponse | { reply?: string }>(
      "/ai/chat",
      { message },
    );

    const payload: any = res.data;

    return (
      payload?.reply ||
      payload?.data?.reply ||
      payload?.data ||
      ""
    ).toString();
  },

  async getRecommendations(userId?: string): Promise<string[]> {
    const res = await axiosInstance.get("/ai/recommendations", {
      params: userId ? { userId } : undefined,
    });

    const payload: any = res.data;
    return payload?.data || payload || [];
  },
};
