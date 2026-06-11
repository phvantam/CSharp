import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Play, Heart, Share2 } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";
import ShareModal from "../../components/share/ShareModal";

interface Track {
  mediaItemId: number;
  title: string;
  artistName: string;
  durationSeconds: number;
  hasVideo?: boolean;
  audioUrl?: string;
}

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playTrack = usePlayerStore((state) => state.playTrack);

  const [isLiked, setIsLiked] = useState(false);
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    mediaItemId?: number;
    title: string;
  }>({ isOpen: false, title: "" });

  // Mock playlist data
  const playlist = {
    playlistId: Number(id),
    title: "V-Pop",
    description:
      "Tuyển tập những bản ballad nhẹ nhàng, phù hợp để học bài và nghỉ ngơi.",
    coverImageUrl: "/images/playlists/vpop.jpg",
    creator: "TuneVault",
    trackCount: 12,
    tracks: [
      {
        mediaItemId: 8,
        title: "Lạ Lùng",
        artistName: "Vũ.",
        durationSeconds: 260,
        hasVideo: true,
        audioUrl: "/audio/lalung.mp3",
      },
      {
        mediaItemId: 10,
        title: "Sau Tất Cả",
        artistName: "ERIK",
        durationSeconds: 296,
        hasVideo: false,
        audioUrl: "/audio/sautatca.mp3",
      },
      {
        mediaItemId: 1,
        title: "Nơi Này Có Anh",
        artistName: "Sơn Tùng M-TP",
        durationSeconds: 278,
        hasVideo: true,
        audioUrl: "/audio/noinaycoanh.mp3",
      },
      {
        mediaItemId: 3,
        title: "Mang Tiền Về Cho Mẹ",
        artistName: "Đen",
        durationSeconds: 407,
        hasVideo: false,
        audioUrl: "/audio/mangtienvechome.mp3",
      },
      {
        mediaItemId: 18,
        title: "Không Thể Say",
        artistName: "HIEUTHUHAI",
        durationSeconds: 255,
        hasVideo: true,
        audioUrl: "/audio/khongthesay.mp3",
      },
    ] as Track[],
  };

  const handlePlayAll = () => {
    if (playlist.tracks.length === 0) return;

    const firstTrack = playlist.tracks[0];
    const track = {
      id: firstTrack.mediaItemId,
      title: firstTrack.title,
      artist: firstTrack.artistName,
      duration: firstTrack.durationSeconds,
      audioUrl:
        firstTrack.audioUrl ||
        mediaService.getStreamUrl(firstTrack.mediaItemId),
    };

    const queue = playlist.tracks.map((t) => ({
      id: t.mediaItemId,
      title: t.title,
      artist: t.artistName,
      duration: t.durationSeconds,
      audioUrl: t.audioUrl || mediaService.getStreamUrl(t.mediaItemId),
    }));

    playTrack(track, queue);
  };

  const handlePlayTrack = (track: Track) => {
    const formattedTrack = {
      id: track.mediaItemId,
      title: track.title,
      artist: track.artistName,
      duration: track.durationSeconds,
      audioUrl: track.audioUrl || mediaService.getStreamUrl(track.mediaItemId),
    };

    const queue = playlist.tracks.map((t) => ({
      id: t.mediaItemId,
      title: t.title,
      artist: t.artistName,
      duration: t.durationSeconds,
      audioUrl: t.audioUrl || mediaService.getStreamUrl(t.mediaItemId),
    }));

    playTrack(formattedTrack, queue);
  };

  const toggleLikePlaylist = () => {
    setIsLiked(!isLiked);
  };

  const openShareModal = (track?: Track) => {
    setShareModal({
      isOpen: true,
      mediaItemId: track?.mediaItemId,
      title: track ? track.title : playlist.title,
    });
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
        <div className="w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={playlist.coverImageUrl}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white tracking-wider">
            PLAYLIST
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mt-2 mb-4 leading-tight">
            {playlist.title}
          </h1>
          <p className="text-gray-300 mb-4 max-w-2xl">{playlist.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium text-white">{playlist.creator}</span>
            <span>•</span>
            <span>{playlist.trackCount} bài hát</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handlePlayAll}
          className="flex items-center gap-3 bg-green-500 hover:bg-green-400 active:bg-green-600 text-black px-8 py-3 rounded-full font-bold text-lg transition"
        >
          <Play size={24} className="ml-1" /> Phát tất cả
        </button>

        <button
          onClick={toggleLikePlaylist}
          className={`p-3 rounded-full transition ${isLiked ? "text-red-500" : "text-gray-400 hover:text-white"}`}
        >
          <Heart size={24} className={isLiked ? "fill-current" : ""} />
        </button>

        <button
          onClick={() => openShareModal()}
          className="p-3 rounded-full text-gray-400 hover:text-white transition"
        >
          <Share2 size={24} />
        </button>
      </div>

      {/* Tracks List */}
      <div className="mt-4">
        <div className="grid grid-cols-12 text-gray-400 text-sm px-4 py-2 border-b border-[#282828] mb-2">
          <div className="col-span-1">#</div>
          <div className="col-span-6">TIÊU ĐỀ</div>
          <div className="col-span-3 hidden md:block">NGHỆ SĨ</div>
          <div className="col-span-2 text-right">THỜI LƯỢNG</div>
        </div>

        {playlist.tracks.map((track, index) => (
          <div
            key={index}
            onClick={() => handlePlayTrack(track)}
            className="grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-[#282828] cursor-pointer group transition-colors"
          >
            <div className="col-span-1 text-gray-400 group-hover:text-white font-mono">
              {index + 1}
            </div>

            <div className="col-span-6 font-medium truncate pr-4 flex items-center gap-3">
              {track.title}
              {track.hasVideo && (
                <span className="text-[10px] px-2 py-0.5 bg-purple-600 text-white rounded">
                  Video
                </span>
              )}
            </div>

            <div className="col-span-3 hidden md:block text-gray-400 truncate">
              {track.artistName}
            </div>

            <div className="col-span-2 flex justify-end items-center gap-3 text-gray-400">
              <span>{formatDuration(track.durationSeconds)}</span>

              {/* Nút Xem Video */}
              {track.hasVideo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/video/${track.mediaItemId}`);
                  }}
                  className="text-xs px-2 py-0.5 bg-purple-600 hover:bg-purple-500 rounded text-white"
                >
                  Xem Video
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openShareModal(track);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-white"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, title: "" })}
        mediaItemId={shareModal.mediaItemId}
        title={shareModal.title}
      />
    </div>
  );
};

export default PlaylistDetailPage;
