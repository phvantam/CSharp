import axiosInstance from "./axiosInstance";
import type { ShareMediaRequest } from "./types/share";

interface BackendShareDto {
  mediaShareId: number;
  senderDisplayName?: string;
  receiverDisplayName?: string;
  mediaItemId?: number;
  playlistId?: number;
  media?: {
    title?: string;
    artistName?: string;
    hasVideo?: boolean;
  };
  playlist?: {
    title?: string;
  };
  message?: string;
  createdAt: string;
}

export interface SharedItemDto {
  id: number;
  senderName: string;
  mediaItemId?: number;
  playlistId?: number;
  title: string;
  artistName?: string;
  message?: string;
  sharedAt: string;
  type: "Media" | "Playlist";
  hasVideo?: boolean;
}

const mapShare = (share: BackendShareDto): SharedItemDto => ({
  id: share.mediaShareId,
  senderName: share.senderDisplayName || "Unknown user",
  mediaItemId: share.mediaItemId,
  playlistId: share.playlistId,
  title: share.media?.title || share.playlist?.title || "Shared item",
  artistName: share.media?.artistName,
  message: share.message,
  sharedAt: share.createdAt,
  type: share.mediaItemId ? "Media" : "Playlist",
  hasVideo: share.media?.hasVideo,
});

export const shareService = {
  async share(data: ShareMediaRequest) {
    const res = await axiosInstance.post<{ data: any }>("/shares", data);
    return res.data.data;
  },

  async getSharedWithMe(): Promise<SharedItemDto[]> {
    const res = await axiosInstance.get<{ data: BackendShareDto[] }>("/shares/inbox");
    return (res.data.data || []).map(mapShare);
  },

  async getSharedByMe(): Promise<SharedItemDto[]> {
    const res = await axiosInstance.get<{ data: BackendShareDto[] }>("/shares/sent");
    return (res.data.data || []).map(mapShare);
  },
};

