import axiosInstance from "./axiosInstance";
import type { MediaItemDto } from "./types/media";

const normalizeMedia = (item: any): MediaItemDto => ({
  ...item,
  mediaItemId: item.mediaItemId ?? item.id ?? item.MediaItemId,
  artistId: item.artistId ?? item.ArtistId,
  title: item.title ?? item.Title ?? "Không có tiêu đề",
  artistName:
    item.artistName ??
    item.ArtistName ??
    item.artist ??
    item.Artist ??
    "Unknown Artist",
  durationSeconds: item.durationSeconds ?? item.DurationSeconds ?? item.duration ?? 0,
  thumbnailUrl: item.thumbnailUrl ?? item.ThumbnailUrl ?? item.coverUrl,
  visibility: item.visibility ?? item.Visibility ?? "Public",
  mediaType: item.mediaType ?? item.MediaType ?? "Audio",
  filePath: item.filePath ?? item.FilePath,
  audioUrl: item.audioUrl ?? item.AudioUrl ?? item.audioFilePath ?? item.AudioFilePath,
  videoUrl: item.videoUrl ?? item.VideoUrl ?? item.videoFilePath ?? item.VideoFilePath,
  hasVideo:
    item.hasVideo ??
    item.HasVideo ??
    Boolean(item.videoUrl || item.VideoUrl || item.videoFilePath || item.VideoFilePath),
});

export const favoriteService = {
  async getMyFavorites(): Promise<MediaItemDto[]> {
    const res = await axiosInstance.get("/favorite");
    const data = res.data.data || res.data || [];
    return Array.isArray(data) ? data.map(normalizeMedia) : [];
  },

  async addToFavorite(mediaItemId: number) {
    const res = await axiosInstance.post(`/favorite/${mediaItemId}`);
    return res.data;
  },

  async removeFromFavorite(mediaItemId: number) {
    const res = await axiosInstance.delete(`/favorite/${mediaItemId}`);
    return res.data;
  },
};
