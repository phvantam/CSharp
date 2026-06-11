import { useState } from "react";
import { Play, Heart, Plus, X } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";
import ShareModal from "../../components/share/ShareModal";
import { useNavigate } from "react-router-dom";

interface Playlist {
  playlistId: number;
  title: string;
  trackCount: number;
  coverImageUrl?: string;
  description?: string;
}

interface LikedSong {
  mediaItemId: number;
  title: string;
  artistName: string;
  durationSeconds: number;
  thumbnailUrl?: string;
  hasVideo?: boolean;
  audioUrl?: string;
}

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState<"playlists" | "liked">(
    "playlists",
  );
  const playTrack = usePlayerStore((state) => state.playTrack);
  const navigate = useNavigate();

  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    mediaItemId?: number;
    title: string;
  }>({ isOpen: false, title: "" });

  const [likedSongs, setLikedSongs] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");

  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      playlistId: 1,
      title: "V-Pop",
      trackCount: 12,
      coverImageUrl: "/image/vpop.jpg",
    },
    {
      playlistId: 2,
      title: "K-Pop",
      trackCount: 8,
      coverImageUrl: "/image/kpop.png",
    },
    {
      playlistId: 3,
      title: "Podcast",
      trackCount: 15,
      coverImageUrl: "/image/pc.jpg",
    },
  ]);

  const likedSongsData: LikedSong[] = [
    {
      mediaItemId: 1,
      title: "Nơi Này Có Anh",
      artistName: "Sơn Tùng M-TP",
      durationSeconds: 278,
      thumbnailUrl: "/image/noinaycoanh.png",
      hasVideo: true,
      audioUrl: "/audio/noinaycoanh.mp3",
    },
    {
      mediaItemId: 8,
      title: "Lạ Lùng",
      artistName: "Vũ.",
      durationSeconds: 260,
      thumbnailUrl: "/image/lalung.jpg",
      hasVideo: true,
      audioUrl: "/audio/lalung.mp3",
    },
    {
      mediaItemId: 3,
      title: "Mang Tiền Về Cho Mẹ",
      artistName: "Đen",
      durationSeconds: 407,
      thumbnailUrl: "/image/mangtienvechome.jpg",
      hasVideo: true,
      audioUrl: "/audio/mangtienvechome.mp3",
    },
    {
      mediaItemId: 10,
      title: "Sau Tất Cả",
      artistName: "ERIK",
      durationSeconds: 296,
      thumbnailUrl: "/image/sautatca.jpg",
      hasVideo: true,
      audioUrl: "/audio/sautatca.mp3",
    },
    {
      mediaItemId: 50,
      title: "MV Nơi Này Có Anh",
      artistName: "Sơn Tùng M-TP",
      durationSeconds: 278,
      thumbnailUrl: "/image/noinaycoanh.png",
      hasVideo: true,
      audioUrl: "/audio/noinaycoanh.mp3",
    },
  ];

  const handlePlaySong = (song: LikedSong) => {
    const track = {
      id: song.mediaItemId,
      title: song.title,
      artist: song.artistName,
      duration: song.durationSeconds,
      thumbnailUrl: song.thumbnailUrl,
      audioUrl: song.audioUrl || mediaService.getStreamUrl(song.mediaItemId),
    };
    playTrack(track);
  };

  const openShareModal = (song: LikedSong) => {
    setShareModal({
      isOpen: true,
      mediaItemId: song.mediaItemId,
      title: song.title,
    });
  };

  const toggleLike = (mediaItemId: number) => {
    setLikedSongs((prev) =>
      prev.includes(mediaItemId)
        ? prev.filter((id) => id !== mediaItemId)
        : [...prev, mediaItemId],
    );
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      playlistId: Date.now(),
      title: newPlaylistName.trim(),
      trackCount: 0,
      coverImageUrl: "/image/default-playlist.jpg",
      description: newPlaylistDesc.trim(),
    };

    setPlaylists([...playlists, newPlaylist]);
    setShowCreateModal(false);
    setNewPlaylistName("");
    setNewPlaylistDesc("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Thư viện của bạn</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-200"
        >
          <Plus size={18} /> Tạo playlist mới
        </button>
      </div>

      <div className="flex gap-8 border-b border-[#282828] mb-8">
        <button
          onClick={() => setActiveTab("playlists")}
          className={`pb-3 font-semibold text-lg transition-all ${activeTab === "playlists" ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-white"}`}
        >
          Playlists
        </button>
        <button
          onClick={() => setActiveTab("liked")}
          className={`pb-3 font-semibold text-lg flex items-center gap-2 transition-all ${activeTab === "liked" ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-white"}`}
        >
          <Heart size={18} /> Bài hát đã thích
        </button>
      </div>

      {/* Tab Playlists */}
      {activeTab === "playlists" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.playlistId}
              onClick={() => navigate(`/playlist/${playlist.playlistId}`)}
              className="group bg-[#181818] p-4 rounded-2xl hover:bg-[#282828] transition-all cursor-pointer"
            >
              <div className="relative mb-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-[#282828]">
                  {playlist.coverImageUrl ? (
                    <img
                      src={playlist.coverImageUrl}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-gray-700">
                      ♪
                    </div>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-lg truncate">{playlist.title}</h3>
              <p className="text-sm text-gray-400">
                {playlist.trackCount} bài hát
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Liked Songs */}
      {activeTab === "liked" && (
        <div className="space-y-1">
          {likedSongsData.map((song, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-[#282828] cursor-pointer group transition-colors"
            >
              <div
                className="flex items-center gap-4"
                onClick={() => handlePlaySong(song)}
              >
                <div className="w-10 text-gray-400 group-hover:text-white font-mono">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-gray-400">{song.artistName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-400">
                <button
                  onClick={() => openShareModal(song)}
                  className="px-3 py-1.5 text-sm bg-[#282828] hover:bg-[#3a3a3a] rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  Chia sẻ
                </button>

                <button
                  onClick={() => toggleLike(song.mediaItemId)}
                  className="p-2 hover:bg-[#3a3a3a] rounded-full"
                >
                  <Heart
                    size={18}
                    className={
                      likedSongs.includes(song.mediaItemId)
                        ? "text-red-500 fill-red-500"
                        : "text-gray-400"
                    }
                  />
                </button>

                {song.hasVideo ? (
                  <button
                    onClick={() => navigate(`/video/${song.mediaItemId}`)}
                    className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded-full"
                  >
                    Xem
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlaySong(song)}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-500 rounded-full"
                  >
                    Phát
                  </button>
                )}

                <button
                  onClick={() => handlePlaySong(song)}
                  className="p-2 hover:text-white hover:bg-[#3a3a3a] rounded-full"
                >
                  <Play size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, title: "" })}
        mediaItemId={shareModal.mediaItemId}
        title={shareModal.title}
      />

      {/* Modal Tạo Playlist Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Tạo playlist mới</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên playlist *
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Tên playlist của bạn"
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Mô tả ngắn về playlist..."
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 rounded-full bg-[#282828] hover:bg-[#3a3a3a] font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
                className="flex-1 py-3 rounded-full bg-green-500 hover:bg-green-400 text-black font-semibold disabled:opacity-50"
              >
                Tạo playlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
