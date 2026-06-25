import { useEffect, useMemo, useState } from "react";
import { Check, Music2, Plus, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { mediaService } from "../../api";
import { playlistService } from "../../api/playlistService";

interface MediaItem {
  mediaItemId: number;
  title: string;
  artistName?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  hasVideo?: boolean;
  mediaType?: string;
}

interface AddSongsToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: number;
  playlistTitle: string;
  existingTrackIds?: number[];
  onChanged?: () => void;
}

const getApiErrorMessage = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.errors?.[0] ||
    error?.message ||
    "Thêm bài hát thất bại"
  );
};

const normalizeOneMedia = (item: any): MediaItem | null => {
  const mediaItemId = Number(
    item?.mediaItemId ??
      item?.MediaItemId ??
      item?.id ??
      item?.Id ??
      item?.mediaId ??
      item?.MediaId,
  );

  if (!mediaItemId || Number.isNaN(mediaItemId)) {
    console.warn("Media item thiếu mediaItemId:", item);
    return null;
  }

  return {
    mediaItemId,
    title: item?.title ?? item?.Title ?? "Không có tiêu đề",
    artistName:
      item?.artistName ??
      item?.ArtistName ??
      item?.artist ??
      item?.Artist ??
      "Unknown Artist",
    thumbnailUrl:
      item?.thumbnailUrl ??
      item?.ThumbnailUrl ??
      item?.coverUrl ??
      item?.CoverUrl ??
      item?.imageUrl ??
      item?.ImageUrl,
    durationSeconds:
      item?.durationSeconds ?? item?.DurationSeconds ?? item?.duration ?? 0,
    hasVideo:
      item?.hasVideo ??
      item?.HasVideo ??
      Boolean(item?.videoUrl || item?.VideoUrl || item?.videoFilePath),
    mediaType: item?.mediaType ?? item?.MediaType ?? "Audio",
  };
};

const normalizeMediaResponse = (payload: any): MediaItem[] => {
  const data = payload?.data?.data ?? payload?.data ?? payload;

  let items: any[] = [];

  if (Array.isArray(data)) items = data;
  else if (Array.isArray(data?.items)) items = data.items;
  else if (Array.isArray(data?.results)) items = data.results;
  else if (Array.isArray(data?.data)) items = data.data;

  return items
    .map(normalizeOneMedia)
    .filter((item): item is MediaItem => item !== null);
};

const AddSongsToPlaylistModal = ({
  isOpen,
  onClose,
  playlistId,
  playlistTitle,
  existingTrackIds = [],
  onChanged,
}: AddSongsToPlaylistModalProps) => {
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingIds, setAddingIds] = useState<number[]>([]);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  const existingIds = useMemo(
    () => new Set([...existingTrackIds, ...addedIds].map(Number)),
    [existingTrackIds, addedIds],
  );

  const fetchTrendingSongs = async () => {
    const data = await mediaService.getTrendingMedia(30);
    setSongs(normalizeMediaResponse(data));
  };

  useEffect(() => {
    if (!isOpen) return;

    setQuery("");
    setAddedIds([]);
    setLoading(true);

    fetchTrendingSongs()
      .catch((error) => {
        console.error("Lỗi tải bài hát:", error);
        setSongs([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        if (!query.trim()) {
          await fetchTrendingSongs();
        } else {
          const res = await mediaService.searchMedia(query.trim(), 1, 30);
          setSongs(normalizeMediaResponse(res));
        }
      } catch (error) {
        console.error("Lỗi tìm bài hát:", error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, isOpen]);

  const handleAddSong = async (song: MediaItem) => {
    if (!song.mediaItemId) {
      toast.error("Bài hát thiếu mediaItemId, không thể thêm");
      return;
    }

    if (existingIds.has(song.mediaItemId)) {
      toast("Bài hát đã có trong playlist");
      return;
    }

    setAddingIds((prev) => [...prev, song.mediaItemId]);

    try {
      await playlistService.addTrackToPlaylist(playlistId, song.mediaItemId);

      setAddedIds((prev) => [...prev, song.mediaItemId]);

      setSongs((prev) =>
        prev.map((item) =>
          item.mediaItemId === song.mediaItemId ? { ...item } : item,
        ),
      );

      toast.success(`Đã thêm "${song.title}"`);
      await onChanged?.();
    } catch (error: any) {
      console.error("Thêm bài hát vào playlist lỗi:", error);

      const message = getApiErrorMessage(error);

      if (
        String(message).toLowerCase().includes("đã có") ||
        String(message).toLowerCase().includes("already") ||
        String(message).toLowerCase().includes("duplicate")
      ) {
        setAddedIds((prev) => [...prev, song.mediaItemId]);
        toast("Bài hát đã có trong playlist");
        await onChanged?.();
      } else {
        toast.error(message);
      }
    } finally {
      setAddingIds((prev) => prev.filter((id) => id !== song.mediaItemId));
    }
  };

  const handleClose = () => {
    setQuery("");
    setSongs([]);
    setAddingIds([]);
    setAddedIds([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#181818] p-6 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-[#282828] hover:text-white"
        >
          <X size={22} />
        </button>

        <div className="mb-5 pr-10">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                Thêm bài hát vào playlist
              </h3>
              <p className="mt-1 text-sm text-gray-400">{playlistTitle}</p>
            </div>
          </div>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài hát, nghệ sĩ..."
            className="w-full rounded-2xl bg-[#282828] py-3 pl-12 pr-4 text-white outline-none ring-1 ring-transparent transition focus:ring-green-500"
            autoFocus
          />
        </div>

        <div className="max-h-[420px] overflow-y-auto pr-1">
          {loading ? (
            <p className="py-10 text-center text-gray-400">
              Đang tải bài hát...
            </p>
          ) : songs.length === 0 ? (
            <div className="rounded-2xl bg-[#222] p-8 text-center text-gray-400">
              Không tìm thấy bài hát phù hợp.
            </div>
          ) : (
            <div className="space-y-2">
              {songs.map((song) => {
                const isExisting = existingIds.has(song.mediaItemId);
                const isAdding = addingIds.includes(song.mediaItemId);

                return (
                  <div
                    key={song.mediaItemId}
                    className="flex items-center gap-3 rounded-2xl bg-[#202020] p-3 transition hover:bg-[#282828]"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#333]">
                      {song.thumbnailUrl ? (
                        <img
                          src={mediaService.getFullMediaUrl(song.thumbnailUrl)}
                          alt={song.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-500">
                          <Music2 size={22} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-white">
                          {song.title}
                        </p>
                        {song.hasVideo && (
                          <span className="rounded bg-purple-600 px-1.5 py-0.5 text-[10px] text-white">
                            Video
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-gray-400">
                        {song.artistName || "Unknown Artist"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddSong(song)}
                      disabled={isExisting || isAdding}
                      className={`flex min-w-[92px] items-center justify-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                        isExisting
                          ? "bg-[#333] text-gray-400"
                          : "bg-green-500 text-black hover:bg-green-400"
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      {isExisting ? (
                        <>
                          <Check size={16} />
                          Đã có
                        </>
                      ) : isAdding ? (
                        "Đang thêm..."
                      ) : (
                        <>
                          <Plus size={16} />
                          Thêm
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleClose}
            className="rounded-full bg-[#282828] px-5 py-2.5 font-semibold text-white transition hover:bg-[#3a3a3a]"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSongsToPlaylistModal;
