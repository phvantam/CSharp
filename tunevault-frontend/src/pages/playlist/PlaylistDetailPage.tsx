import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Film,
  Play,
  Heart,
  Share2,
  ListMusic,
  Trash2,
  Plus,
} from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";
import { playlistService } from "../../api/playlistService";
import ShareModal from "../../components/share/ShareModal";
import AddSongsToPlaylistModal from "../../components/playlist/AddSongsToPlaylistModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import toast from "react-hot-toast";

interface Track {
  mediaItemId: number;
  title: string;
  artistId?: number;
  artistName?: string;
  albumId?: number;
  albumTitle?: string;
  durationSeconds?: number;
  hasVideo?: boolean;
  audioUrl?: string;
  videoUrl?: string;
  filePath?: string;
  thumbnailUrl?: string;
  mediaType?: string;
}

interface PlaylistDetail {
  playlistId: number;
  title: string;
  name?: string;
  description?: string;
  coverImageUrl?: string | null;
  ownerName?: string;
  creator?: string;
  trackCount?: number;
  tracks: Track[];
}

const PlaylistCoverFallback = ({ title }: { title: string }) => {
  const firstLetter = title?.trim()?.charAt(0)?.toUpperCase() || "♪";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-500/30 via-[#282828] to-purple-600/30">
      <div className="w-16 h-16 rounded-2xl bg-black/30 flex items-center justify-center mb-3">
        <ListMusic size={34} className="text-green-400" />
      </div>
      <span className="text-5xl font-black text-white/80">{firstLetter}</span>
    </div>
  );
};

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playTrack = usePlayerStore((state) => state.playTrack);

  const playlistId = Number(id);
  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    mediaItemId?: number;
    playlistId?: number;
    title: string;
  }>({ isOpen: false, title: "" });

  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [durationMap, setDurationMap] = useState<Record<number, number>>({});
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null);
  const [deleteTrackLoading, setDeleteTrackLoading] = useState(false);

  const fetchPlaylist = async () => {
    if (!playlistId) return;

    setLoading(true);
    try {
      const data = await playlistService.getPlaylistById(playlistId);

      if (!data) {
        setPlaylist(null);
        return;
      }

      setPlaylist({
        playlistId: data.playlistId,
        title: data.title || data.name || "Playlist không tên",
        name: data.name,
        description: data.description,
        coverImageUrl: data.coverImageUrl || null,
        ownerName: data.ownerName,
        creator: data.creator,
        trackCount: data.trackCount ?? data.tracks?.length ?? 0,
        tracks: (data.tracks || []).map((track: any) => ({
          ...track,
          mediaItemId: track.mediaItemId ?? track.id,
          title: track.title ?? track.name ?? "Không có tiêu đề",
          artistId: track.artistId,
          artistName: track.artistName ?? track.artist ?? "Unknown Artist",
          albumId: track.albumId,
          albumTitle: track.albumTitle,
          durationSeconds: track.durationSeconds ?? track.duration ?? 0,
          audioUrl: track.audioUrl ?? track.audioFilePath ?? track.filePath,
          videoUrl: track.videoUrl ?? track.videoFilePath,
          thumbnailUrl: track.thumbnailUrl,
          hasVideo:
            track.hasVideo ?? Boolean(track.videoUrl ?? track.videoFilePath),
        })),
      });
    } catch (error) {
      console.error("Lỗi tải playlist:", error);
      toast.error("Không thể tải playlist");
      setPlaylist(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const getPlayableMediaUrl = (track: Track) => {
    const rawUrl =
      track.audioUrl ||
      track.filePath ||
      track.videoUrl ||
      mediaService.getStreamUrl(track.mediaItemId);

    if (!rawUrl) return "";

    return rawUrl.startsWith("http")
      ? rawUrl
      : mediaService.getFullMediaUrl(rawUrl);
  };

  const loadDurationFromFile = (track: Track) => {
    return new Promise<number | null>((resolve) => {
      const url = getPlayableMediaUrl(track);

      if (!url) {
        resolve(null);
        return;
      }

      const element =
        track.hasVideo || track.mediaType === "Video"
          ? document.createElement("video")
          : document.createElement("audio");

      const cleanup = () => {
        element.removeAttribute("src");
        element.load();
      };

      element.preload = "metadata";
      element.src = url;

      element.onloadedmetadata = () => {
        const duration = Math.round(element.duration || 0);
        cleanup();
        resolve(duration > 0 ? duration : null);
      };

      element.onerror = () => {
        cleanup();
        resolve(null);
      };
    });
  };

  useEffect(() => {
    if (!playlist?.tracks?.length) return;

    let cancelled = false;

    const updateMissingDurations = async () => {
      for (const track of playlist.tracks) {
        if ((track.durationSeconds ?? 0) > 0) continue;
        if (durationMap[track.mediaItemId]) continue;

        const duration = await loadDurationFromFile(track);

        if (!cancelled && duration) {
          setDurationMap((prev) => ({
            ...prev,
            [track.mediaItemId]: duration,
          }));
        }
      }
    };

    updateMissingDurations();

    return () => {
      cancelled = true;
    };
  }, [playlist?.playlistId, playlist?.tracks]);

  const toTrack = (track: Track) => {
    const duration =
      durationMap[track.mediaItemId] || track.durationSeconds || 0;

    return {
      id: track.mediaItemId,
      title: track.title,
      artist: track.artistName || "Unknown Artist",
      duration,
      thumbnailUrl: mediaService.getFullMediaUrl(track.thumbnailUrl),
      audioUrl: getPlayableMediaUrl(track),
    };
  };

  const handlePlayAll = () => {
    if (!playlist || playlist.tracks.length === 0) return;

    const queue = playlist.tracks.map(toTrack);
    playTrack(queue[0], queue);
  };

  const handlePlayTrack = (track: Track) => {
    if (!playlist) return;

    const formattedTrack = toTrack(track);
    const queue = playlist.tracks.map(toTrack);

    playTrack(formattedTrack, queue);
  };

  const toggleLikePlaylist = () => {
    setIsLiked(!isLiked);
  };

  const openSharePlaylistModal = () => {
    if (!playlist) return;

    setShareModal({
      isOpen: true,
      playlistId: playlist.playlistId,
      title: playlist.title,
    });
  };

  const openShareTrackModal = (track: Track) => {
    setShareModal({
      isOpen: true,
      mediaItemId: track.mediaItemId,
      title: track.title,
    });
  };

  const removeTrack = (track: Track) => {
    setDeletingTrack(track);
  };

  const confirmRemoveTrack = async () => {
    if (!playlist || !deletingTrack) return;

    setDeleteTrackLoading(true);

    try {
      await playlistService.removeTrackFromPlaylist(
        playlist.playlistId,
        deletingTrack.mediaItemId,
      );

      toast.success("Đã xóa bài hát khỏi playlist");
      setDeletingTrack(null);
      await fetchPlaylist();
    } catch (error) {
      console.error("Xóa bài hát khỏi playlist lỗi:", error);
      toast.error("Xóa bài hát thất bại");
    } finally {
      setDeleteTrackLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "--:--";

    const total = Math.round(seconds);
    const min = Math.floor(total / 60);
    const sec = total % 60;

    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const getTrackDuration = (track: Track) => {
    return durationMap[track.mediaItemId] || track.durationSeconds || 0;
  };

  if (loading) {
    return (
      <p className="text-center py-16 text-gray-400">Đang tải playlist...</p>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-xl">Không tìm thấy playlist</p>
        <button
          onClick={() => navigate("/library")}
          className="mt-4 rounded-full bg-green-500 px-5 py-2 font-semibold text-black"
        >
          Quay lại thư viện
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
        <div className="w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-[#282828]">
          {playlist.coverImageUrl ? (
            <img
              src={mediaService.getFullMediaUrl(playlist.coverImageUrl)}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <PlaylistCoverFallback title={playlist.title} />
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-white tracking-wider">
            PLAYLIST
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mt-2 mb-4 leading-tight">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="text-gray-300 mb-4 max-w-2xl">
              {playlist.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium text-white">
              {playlist.ownerName || playlist.creator || "TuneVault"}
            </span>
            <span>•</span>
            <span>{playlist.tracks.length} bài hát</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handlePlayAll}
          disabled={playlist.tracks.length === 0}
          className="flex items-center gap-3 bg-green-500 hover:bg-green-400 active:bg-green-600 text-black px-8 py-3 rounded-full font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={24} className="ml-1" /> Phát tất cả
        </button>

        <button
          onClick={() => setShowAddSongModal(true)}
          className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200"
        >
          <Plus size={22} /> Thêm bài hát
        </button>

        <button
          onClick={toggleLikePlaylist}
          className={`p-3 rounded-full transition ${
            isLiked ? "text-red-500" : "text-gray-400 hover:text-white"
          }`}
        >
          <Heart size={24} className={isLiked ? "fill-current" : ""} />
        </button>

        <button
          onClick={openSharePlaylistModal}
          className="p-3 rounded-full text-gray-400 hover:text-white transition"
        >
          <Share2 size={24} />
        </button>
      </div>

      {/* Tracks List */}
      <div className="mt-4">
        <div className="grid grid-cols-12 text-gray-400 text-sm px-4 py-2 border-b border-[#282828] mb-2">
          <div className="col-span-1">STT</div>
          <div className="col-span-6">TÊN BÀI HÁT</div>
          <div className="col-span-3 hidden md:block">NGHỆ SĨ</div>
          <div className="col-span-2 text-right">THỜI LƯỢNG</div>
        </div>

        {playlist.tracks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ListMusic size={44} className="mx-auto mb-4 opacity-50" />
            <p className="mb-4 text-lg">Playlist này chưa có bài hát nào.</p>
            <button
              onClick={() => setShowAddSongModal(true)}
              className="rounded-full bg-green-500 px-6 py-3 font-semibold text-black hover:bg-green-400"
            >
              Thêm bài hát đầu tiên
            </button>
          </div>
        ) : (
          playlist.tracks.map((track, index) => (
            <div
              key={`${track.mediaItemId}-${index}`}
              onClick={() => handlePlayTrack(track)}
              className="grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-[#282828] cursor-pointer group transition-colors"
            >
              <div className="col-span-1 text-gray-400 group-hover:text-white font-mono">
                {index + 1}
              </div>

              <div className="col-span-6 min-w-0 pr-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Link
                    to={`/media/${track.mediaItemId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="truncate font-medium text-white hover:text-green-400 hover:underline"
                  >
                    {track.title}
                  </Link>

                  {track.hasVideo && (
                    <span className="shrink-0 rounded bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-300">
                      Video
                    </span>
                  )}
                </div>

                {track.albumId && (
                  <Link
                    to={`/album/${track.albumId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 block truncate text-xs text-gray-500 hover:text-green-400 hover:underline"
                  >
                    {track.albumTitle || "Album"}
                  </Link>
                )}
              </div>

              <div className="col-span-3 hidden truncate text-gray-400 md:block">
                {track.artistId ? (
                  <Link
                    to={`/artist/${track.artistId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-green-400 hover:underline"
                  >
                    {track.artistName || "Unknown Artist"}
                  </Link>
                ) : (
                  <span>{track.artistName || "Unknown Artist"}</span>
                )}
              </div>

              <div className="col-span-2 flex justify-end items-center gap-3 text-gray-400">
                <span>{formatDuration(getTrackDuration(track))}</span>

                {track.hasVideo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/video/${track.mediaItemId}`);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-black transition hover:bg-green-400"
                    title="Xem MV"
                  >
                    <Film size={13} />
                    MV
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openShareTrackModal(track);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-white"
                  title="Chia sẻ bài hát"
                >
                  <Share2 size={16} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrack(track);
                  }}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-red-400 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                  title="Xóa khỏi playlist"
                >
                  <Trash2 size={14} />
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, title: "" })}
        mediaItemId={shareModal.mediaItemId}
        playlistId={shareModal.playlistId}
        title={shareModal.title}
      />

      <AddSongsToPlaylistModal
        isOpen={showAddSongModal}
        onClose={() => setShowAddSongModal(false)}
        playlistId={playlist.playlistId}
        playlistTitle={playlist.title}
        existingTrackIds={playlist.tracks.map((track) => track.mediaItemId)}
        onChanged={fetchPlaylist}
      />

      <ConfirmModal
        isOpen={Boolean(deletingTrack)}
        title="Xóa bài hát khỏi playlist?"
        message={
          deletingTrack
            ? `"${deletingTrack.title}" sẽ bị gỡ khỏi playlist, file nhạc gốc vẫn được giữ nguyên.`
            : ""
        }
        confirmText="Xóa bài hát"
        cancelText="Giữ lại"
        variant="danger"
        loading={deleteTrackLoading}
        onConfirm={confirmRemoveTrack}
        onClose={() => setDeletingTrack(null)}
      />
    </div>
  );
};

export default PlaylistDetailPage;
