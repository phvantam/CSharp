import { useEffect, useState } from "react";
import {
  Clock3,
  Film,
  Play,
  Video,
  Music2,
  RefreshCw,
  History,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";
import { playHistoryService } from "../../api/playHistoryService";
import type { MediaItemDto } from "../../api/types/media";

const formatDuration = (seconds?: number | null) => {
  const value = Number(seconds || 0);
  if (!value) return "Chưa cập nhật";

  const min = Math.floor(value / 60);
  const sec = Math.floor(value % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

const toMediaUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  return mediaService.getFullMediaUrl(url);
};

const RecentlyPlayedPage = () => {
  const [items, setItems] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  const playTrack = usePlayerStore((state) => state.playTrack);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);

    try {
      const data = await playHistoryService.getRecentHistory(1, 50);
      setItems(data || []);
    } catch (error) {
      console.error("Lỗi tải lịch sử nghe/xem:", error);
      toast.error("Không thể tải lịch sử gần đây");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePlay = (song: MediaItemDto) => {
    const rawAudioUrl =
      song.audioUrl ||
      song.filePath ||
      mediaService.getStreamUrl(song.mediaItemId);

    playTrack({
      id: song.mediaItemId,
      title: song.title,
      artist: song.artistName || "Unknown Artist",
      duration: song.durationSeconds || 0,
      thumbnailUrl: toMediaUrl(song.thumbnailUrl),
      audioUrl: rawAudioUrl?.startsWith("http")
        ? rawAudioUrl
        : mediaService.getFullMediaUrl(rawAudioUrl),
      hasVideo: song.hasVideo || song.mediaType === "Video",
      videoUrl: song.videoUrl,
      lyrics: song.lyrics,
    });
  };

  const handleWatchVideo = (song: MediaItemDto) => {
    navigate(`/video/${song.mediaItemId}`);
  };

  const renderCover = (song: MediaItemDto) => {
    const hasVideo = song.hasVideo || song.mediaType === "Video";
    const cover = toMediaUrl(song.thumbnailUrl);

    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#282828] text-gray-400">
        {cover ? (
          <img
            src={cover}
            alt={song.title}
            className="h-full w-full object-cover"
          />
        ) : hasVideo ? (
          <Video size={22} />
        ) : (
          <Music2 size={22} />
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
            <History size={26} />
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Lịch sử nghe gần đây
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Những bài hát và video bạn vừa phát gần đây.
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#282828] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a] disabled:opacity-60 sm:w-auto"
        >
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-[#282828] bg-[#181818] p-10 text-center text-gray-400">
          Đang tải lịch sử...
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-[#282828] bg-[#181818] px-6 text-center">
          <Clock3 size={64} className="mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold text-white">
            Chưa có lịch sử nghe
          </h2>
          <p className="mt-2 max-w-md text-gray-400">
            Khi bạn bấm phát nhạc hoặc xem video, nội dung sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile / tablet: card list */}
          <div className="space-y-3 lg:hidden">
            {items.map((song, index) => {
              const hasVideo = song.hasVideo || song.mediaType === "Video";

              return (
                <div
                  key={`${song.mediaItemId}-${index}`}
                  className="rounded-2xl border border-[#282828] bg-[#181818] p-4"
                >
                  <div className="flex gap-3">
                    {renderCover(song)}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`/media/${song.mediaItemId}`}
                            className="block truncate font-bold text-white hover:text-green-400 hover:underline"
                          >
                            {song.title}
                          </Link>

                          {song.artistId ? (
                            <Link
                              to={`/artist/${song.artistId}`}
                              className="block truncate text-sm text-gray-400 hover:text-green-400 hover:underline"
                            >
                              {song.artistName || "Unknown Artist"}
                            </Link>
                          ) : (
                            <p className="truncate text-sm text-gray-400">
                              {song.artistName || "Unknown Artist"}
                            </p>
                          )}
                        </div>

                        <span className="text-sm text-gray-500">
                          #{index + 1}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            hasVideo
                              ? "bg-green-500/20 text-green-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {hasVideo ? "Video" : "Audio"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDuration(song.durationSeconds)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handlePlay(song)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-green-400"
                    >
                      <Play size={16} />
                      Phát
                    </button>

                    {hasVideo && (
                      <button
                        onClick={() => handleWatchVideo(song)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-green-400"
                        title="Xem MV"
                      >
                        <Film size={16} />
                        MV
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-3xl border border-[#282828] bg-[#181818] lg:block">
            <div className="grid grid-cols-[64px_minmax(280px,1.4fr)_minmax(180px,0.8fr)_120px_180px] border-b border-[#282828] px-5 py-4 text-sm uppercase tracking-wide text-gray-400">
              <div>STT</div>
              <div>Tên bài hát</div>
              <div>Nghệ sĩ</div>
              <div>Thời lượng</div>
              <div className="text-right">Hành động</div>
            </div>

            <div className="divide-y divide-[#242424]">
              {items.map((song, index) => {
                const hasVideo = song.hasVideo || song.mediaType === "Video";

                return (
                  <div
                    key={`${song.mediaItemId}-${index}`}
                    className="grid grid-cols-[64px_minmax(280px,1.4fr)_minmax(180px,0.8fr)_120px_180px] items-center px-5 py-4 transition hover:bg-[#242424]"
                  >
                    <div className="text-gray-400">{index + 1}</div>

                    <div className="flex min-w-0 items-center gap-4">
                      {renderCover(song)}

                      <div className="min-w-0">
                        <Link
                          to={`/media/${song.mediaItemId}`}
                          className="block truncate font-bold text-white hover:text-green-400 hover:underline"
                        >
                          {song.title}
                        </Link>

                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                              hasVideo
                                ? "bg-green-500/20 text-green-300"
                                : "bg-green-500/20 text-green-300"
                            }`}
                          >
                            {hasVideo ? "Video" : "Audio"}
                          </span>
                          <span className="text-xs text-gray-500">Gần đây</span>
                        </div>
                      </div>
                    </div>

                    <div className="truncate text-gray-300">
                      {song.artistId ? (
                        <Link
                          to={`/artist/${song.artistId}`}
                          className="hover:text-green-400 hover:underline"
                        >
                          {song.artistName || "Unknown Artist"}
                        </Link>
                      ) : (
                        <span>{song.artistName || "Unknown Artist"}</span>
                      )}
                    </div>

                    <div className="text-gray-400">
                      {formatDuration(song.durationSeconds)}
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handlePlay(song)}
                        className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-green-400"
                      >
                        <Play size={16} />
                        Phát
                      </button>

                      {hasVideo && (
                        <button
                          onClick={() => handleWatchVideo(song)}
                          className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-green-400"
                          title="Xem MV"
                        >
                          <Film size={16} />
                          MV
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentlyPlayedPage;
