import { useState } from "react";
import toast from "react-hot-toast";
import { usePlayerStore } from "../stores/playerStore";
import type { Track } from "../stores/playerStore";
import { mediaService } from "../api";
import type { MediaItemDto } from "../api/types/media";

export interface MediaItemLike {
  mediaItemId: number;
  title: string;
  artistName?: string;
  artist?: string;
  durationSeconds?: number;
  duration?: number;
  thumbnailUrl?: string;
  audioUrl?: string;
}

export const useMediaActions = () => {
  const playTrack = usePlayerStore((state) => state.playTrack);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper: map a media DTO to the player's Track format
  const formatTrack = (song: MediaItemLike): Track => {
    return {
      id: song.mediaItemId,
      title: song.title,
      artist: song.artistName || song.artist || "Unknown Artist",
      duration: song.durationSeconds ?? song.duration ?? 0,
      thumbnailUrl: song.thumbnailUrl,
      audioUrl: song.audioUrl || mediaService.getStreamUrl(song.mediaItemId),
    };
  };

  // Play a single track with a list representing the queue
  const playSong = (song: MediaItemLike, queueSongs: MediaItemLike[] = []) => {
    const track = formatTrack(song);
    const queue = queueSongs.length > 0 ? queueSongs.map(formatTrack) : [track];
    playTrack(track, queue);
  };

  // Play all tracks starting with the first one
  const playAll = (songs: MediaItemLike[]) => {
    if (!songs || songs.length === 0) return;
    const firstTrack = formatTrack(songs[0]);
    const queue = songs.map(formatTrack);
    playTrack(firstTrack, queue);
  };

  // Toggle favorite/like status
  const toggleLike = async (mediaItemId: number): Promise<boolean | null> => {
    try {
      const result = await mediaService.toggleFavorite(mediaItemId);
      if (result.isFavorited) {
        toast.success("Đã thêm vào danh sách yêu thích");
      } else {
        toast.success("Đã xóa khỏi danh sách yêu thích");
      }
      return result.isFavorited;
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Thao tác thất bại");
      return null;
    }
  };

  // Delete a song from the system
  const deleteSong = async (
    mediaItemId: number,
    confirmMessage: string = "Bạn có chắc chắn muốn xóa bài hát này khỏi hệ thống?",
  ): Promise<boolean> => {
    if (!window.confirm(confirmMessage)) return false;
    setIsDeleting(true);
    try {
      await mediaService.deleteMedia(mediaItemId);
      toast.success("Xóa bài hát thành công!");
      return true;
    } catch (err) {
      console.error("Error deleting media:", err);
      toast.error("Không thể xóa bài hát");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Update a song's metadata
  const updateSong = async (
    mediaItemId: number,
    data: {
      title: string;
      artist?: string;
      albumId?: string | number;
      thumbnail?: File | null;
    },
  ): Promise<MediaItemDto | null> => {
    if (!data.title.trim()) {
      toast.error("Tên bài hát không được để trống");
      return null;
    }
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title.trim());
      if (data.artist !== undefined) {
        formData.append("artist", data.artist.trim());
      }
      if (data.albumId !== undefined) {
        formData.append("albumId", String(data.albumId));
      }
      if (data.thumbnail) {
        formData.append("thumbnail", data.thumbnail);
      }

      const updated = await mediaService.updateMedia(mediaItemId, formData);
      toast.success("Cập nhật bài hát thành công!");
      return updated;
    } catch (err) {
      console.error("Error updating media:", err);
      toast.error("Cập nhật bài hát thất bại");
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    formatTrack,
    playSong,
    playAll,
    toggleLike,
    deleteSong,
    updateSong,
    isUpdating,
    isDeleting,
  };
};
