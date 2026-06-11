import axiosInstance from "./axiosInstance";
import type { ShareMediaRequest } from "./types/share";

export const shareService = {
  async share(data: ShareMediaRequest) {
    const res = await axiosInstance.post("/share", data);
    return res.data;
  },

  async getSharedWithMe() {
    const res = await axiosInstance.get("/share/with-me");
    return res.data;
  },

  async getSharedByMe() {
    const res = await axiosInstance.get("/share/by-me");
    return res.data;
  },
};
