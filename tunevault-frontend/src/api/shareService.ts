import axiosInstance from "./axiosInstance";
import type { ShareMediaRequest } from "./types/share";

export interface ShareResponse {
  shareId: number;
  senderUserId: string;
  receiverUserId: string;
  mediaItemId?: number | null;
  playlistId?: number | null;
  message?: string | null;
  sharedAt: string;
  shareType: "Media" | "Playlist" | string;
  isDuplicate: boolean;
}

const unwrap = (res: any) => res?.data?.data ?? res?.data;

export const shareService = {
  async share(data: ShareMediaRequest): Promise<ShareResponse> {
    const res = await axiosInstance.post("/share", data);
    return unwrap(res);
  },

  async sharePlaylist(data: {
    playlistId: number;
    receiverUserId: string;
    receiverUsername?: string;
    message?: string;
  }): Promise<ShareResponse> {
    const res = await axiosInstance.post("/share/playlist", data);
    return unwrap(res);
  },

  async getSharedWithMe() {
    const res = await axiosInstance.get("/share/received");
    return res.data.data || [];
  },

  async getSharedByMe() {
    const res = await axiosInstance.get("/share/sent");
    return res.data.data || [];
  },

  async searchUsers(keyword: string) {
    try {
      const res = await axiosInstance.get("/user/search", {
        params: { keyword },
      });
      return res.data.data || res.data || [];
    } catch (error) {
      console.error("Search users error:", error);
      return [];
    }
  },
};
