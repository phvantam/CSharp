import { useState, useEffect } from "react";
import {
  Play,
  Heart,
  Plus,
  X,
  Image as ImageIcon,
  ListPlus,
} from "lucide-react";
import { playlistService, albumService, mediaService } from "../../api";
import type { PlaylistDto } from "../../api/types/playlist";
import type { AlbumDto } from "../../api/types/album";
import type { MediaItemDto } from "../../api/types/media";
import ShareModal from "../../components/share/ShareModal";
import AddToPlaylistModal from "../../components/playlist/AddToPlaylistModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";
import { useMediaActions } from "../../hooks/useMediaActions";
import { formatDuration } from "../../utils/format";

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState<"playlists" | "albums" | "liked">(
    "playlists",
  );
  const { playSong, playAll, toggleLike } = useMediaActions();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [likedSongs, setLikedSongs] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Share Modal State
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    mediaItemId?: number;
    title: string;
  }>({ isOpen: false, title: "" });

  const [playlistModal, setPlaylistModal] = useState<{
    isOpen: boolean;
    mediaItemId: number | null;
    title: string;
  }>({ isOpen: false, mediaItemId: null, title: "" });

  // Create Playlist Modal State
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  // Create Album Modal State
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumArtistName, setNewAlbumArtistName] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [newAlbumCoverFile, setNewAlbumCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  const fetchLibraryData = async () => {
    setLoading(true);
    try {
      const [playlistsData, albumsData, likedData] = await Promise.all([
        playlistService.getMyPlaylists(),
        albumService.getAlbums(),
        mediaService.getFavorites(),
      ]);
      setPlaylists(playlistsData);

      // Filter albums to only show those owned by the logged-in user
      const ownedAlbums = albumsData.filter(
        (a) => a.ownerUserId === currentUser?.id,
      );
      setAlbums(ownedAlbums);

      setLikedSongs(likedData);
    } catch (err) {
      console.error("Error loading library data:", err);
      toast.error("Không thể tải dữ liệu thư viện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const handlePlaySong = (song: MediaItemDto) => {
    playSong(song, likedSongs);
  };

  const handlePlayAllLiked = () => {
    playAll(likedSongs);
  };

  const openShareModal = (song: MediaItemDto) => {
    setShareModal({
      isOpen: true,
      mediaItemId: song.mediaItemId,
      title: song.title,
    });
  };

  const handleToggleLike = async (mediaItemId: number) => {
    const isLiked = await toggleLike(mediaItemId);
    if (isLiked !== null) {
      // Refresh favorites
      const likedData = await mediaService.getFavorites();
      setLikedSongs(likedData);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    setIsCreatingPlaylist(true);
    try {
      await playlistService.createPlaylist({
        title: newPlaylistName.trim(),
        visibility: "Public",
      });
      toast.success("Tạo playlist thành công!");
      setShowPlaylistModal(false);
      setNewPlaylistName("");
      setNewPlaylistDesc("");

      // Refresh playlists
      const playlistsData = await playlistService.getMyPlaylists();
      setPlaylists(playlistsData);
    } catch (err) {
      console.error(err);
      toast.error("Tạo playlist thất bại");
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ chấp nhận file ảnh");
        return;
      }
      setNewAlbumCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;

    setIsCreatingAlbum(true);
    try {
      const formData = new FormData();
      formData.append("title", newAlbumTitle.trim());
      formData.append("artistName", newAlbumArtistName.trim());
      formData.append("description", newAlbumDesc.trim());
      if (newAlbumCoverFile) {
        formData.append("coverImage", newAlbumCoverFile);
      }

      await albumService.createAlbum(formData);
      toast.success("Tạo album mới thành công!");

      // Reset & close
      setShowAlbumModal(false);
      setNewAlbumTitle("");
      setNewAlbumArtistName("");
      setNewAlbumDesc("");
      setNewAlbumCoverFile(null);
      setCoverPreviewUrl("");

      // Refresh albums
      const albumsData = await albumService.getAlbums();
      setAlbums(albumsData);
    } catch (err) {
      console.error(err);
      toast.error("Tạo album thất bại");
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold">Thư viện của bạn</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPlaylistModal(true)}
            className="flex items-center gap-2 bg-[#282828] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-[#3a3a3a] border border-[#3a3a3a] transition"
          >
            <Plus size={18} /> Tạo playlist
          </button>
          <button
            onClick={() => setShowAlbumModal(true)}
            className="flex items-center gap-2 bg-green-500 text-black px-5 py-2.5 rounded-full font-semibold hover:bg-green-400 transition"
          >
            <Plus size={18} /> Tạo album mới
          </button>
        </div>
      </div>

      <div className="flex gap-8 border-b border-[#282828] mb-8">
        <button
          onClick={() => setActiveTab("playlists")}
          className={`pb-3 font-semibold text-lg transition-all ${
            activeTab === "playlists"
              ? "text-white border-b-2 border-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Playlists
        </button>
        <button
          onClick={() => setActiveTab("albums")}
          className={`pb-3 font-semibold text-lg transition-all ${
            activeTab === "albums"
              ? "text-white border-b-2 border-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Albums
        </button>
        <button
          onClick={() => setActiveTab("liked")}
          className={`pb-3 font-semibold text-lg flex items-center gap-2 transition-all ${
            activeTab === "liked"
              ? "text-white border-b-2 border-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Heart size={18} /> Bài hát đã thích
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#181818] p-4 rounded-2xl">
              <div className="aspect-square bg-[#282828] rounded-xl mb-4" />
              <div className="h-4 bg-[#282828] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#282828] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Tab Playlists */}
          {activeTab === "playlists" &&
            (playlists.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                Bạn chưa tạo playlist nào. Hãy nhấn "Tạo playlist" ở góc trên.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.playlistId}
                    onClick={() => navigate(`/playlist/${playlist.playlistId}`)}
                    className="group bg-[#181818] p-4 rounded-2xl hover:bg-[#282828] transition-all cursor-pointer"
                  >
                    <div className="relative mb-4">
                      <div className="aspect-square rounded-xl overflow-hidden bg-[#282828] flex items-center justify-center shadow-md">
                        <div className="w-full h-full flex items-center justify-center text-6xl text-gray-600 bg-gradient-to-br from-indigo-900/30 to-purple-900/30">
                          🎶
                        </div>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg truncate text-white">
                      {playlist.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {playlist.trackCount || 0} bài hát
                    </p>
                  </div>
                ))}
              </div>
            ))}

          {/* Tab Albums */}
          {activeTab === "albums" &&
            (albums.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                Bạn chưa tạo album nào. Hãy nhấn "Tạo album mới" ở góc trên.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {albums.map((album) => (
                  <div
                    key={album.albumId}
                    onClick={() => navigate(`/album/${album.albumId}`)}
                    className="group bg-[#181818] p-4 rounded-2xl hover:bg-[#282828] transition-all cursor-pointer"
                  >
                    <div className="relative mb-4">
                      <div className="aspect-square rounded-xl overflow-hidden bg-[#282828] flex items-center justify-center shadow-lg">
                        {album.coverImageUrl ? (
                          <img
                            src={album.coverImageUrl}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-600 bg-gradient-to-br from-emerald-950 to-teal-900/30">
                            💿
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg truncate text-white">
                      {album.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      Ca sĩ: {album.artistName || "Unknown Artist"}
                    </p>
                  </div>
                ))}
              </div>
            ))}

          {/* Tab Liked Songs */}
          {activeTab === "liked" &&
            (likedSongs.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                Chưa có bài hát yêu thích nào. Hãy nhấn thả tim trên bài hát bạn
                thích.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-start mb-2">
                  <button
                    onClick={handlePlayAllLiked}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-400 active:bg-green-600 text-black px-6 py-2.5 rounded-full font-bold transition shadow-md hover:scale-105"
                  >
                    <Play size={20} className="fill-black ml-0.5" /> Phát tất cả
                  </button>
                </div>
                <div className="space-y-1">
                  {likedSongs.map((song, index) => (
                    <div
                      key={song.mediaItemId}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-[#282828] cursor-pointer group transition-colors"
                    >
                      {/* Format: (ảnh thumbnail / tên bài hát - ca sĩ / tên người đăng) */}
                      <div
                        className="flex items-center gap-4 flex-1 min-w-0"
                        onClick={() => handlePlaySong(song)}
                      >
                        <div className="w-6 text-gray-400 group-hover:text-white font-mono text-center">
                          {index + 1}
                        </div>
                        <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-[#3a3a3a] flex items-center justify-center">
                          {song.thumbnailUrl ? (
                            <img
                              src={song.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl text-gray-500">♪</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white truncate text-base">
                            {song.title} - {song.artistName || "Unknown Artist"}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            Người đăng: {song.ownerDisplayName || "Hệ thống"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-400">
                        <span className="text-sm hidden sm:block mr-2">
                          {formatDuration(song.durationSeconds)}
                        </span>

                        <button
                          onClick={() => openShareModal(song)}
                          className="px-3 py-1.5 text-xs bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          Chia sẻ
                        </button>

                        <button
                          onClick={() => handleToggleLike(song.mediaItemId)}
                          className="p-2 hover:bg-[#3a3a3a] rounded-full text-red-500 hover:text-red-400 transition"
                          title="Xóa khỏi yêu thích"
                        >
                          <Heart size={18} className="fill-red-500" />
                        </button>

                        <button
                          onClick={() =>
                            setPlaylistModal({
                              isOpen: true,
                              mediaItemId: song.mediaItemId,
                              title: song.title,
                            })
                          }
                          className="p-2 hover:bg-[#3a3a3a] rounded-full hover:text-white transition opacity-0 group-hover:opacity-100"
                          title="Thêm vào playlist"
                        >
                          <ListPlus size={18} />
                        </button>

                        {song.hasVideo && (
                          <button
                            onClick={() =>
                              navigate(`/video/${song.mediaItemId}`)
                            }
                            className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded-full text-white"
                          >
                            Video
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
              </div>
            ))}
        </>
      )}

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, title: "" })}
        mediaItemId={shareModal.mediaItemId}
        title={shareModal.title}
      />

      <AddToPlaylistModal
        isOpen={playlistModal.isOpen}
        onClose={() =>
          setPlaylistModal({ isOpen: false, mediaItemId: null, title: "" })
        }
        mediaItemId={playlistModal.mediaItemId}
        trackTitle={playlistModal.title}
      />

      {/* Modal Tạo Playlist Mới */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6 border border-[#282828] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Tạo playlist mới</h3>
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="text-gray-400 hover:text-white"
              >
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
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                  required
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
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="flex-1 py-3 rounded-full bg-[#282828] hover:bg-[#3a3a3a] font-semibold text-white transition"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={isCreatingPlaylist || !newPlaylistName.trim()}
                className="flex-1 py-3 rounded-full bg-green-500 hover:bg-green-400 text-black font-semibold disabled:bg-gray-600 transition"
              >
                {isCreatingPlaylist ? "Đang tạo..." : "Tạo playlist"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo Album Mới */}
      {showAlbumModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6 border border-[#282828] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Tạo Album Mới</h3>
              <button
                onClick={() => setShowAlbumModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên Album *
                </label>
                <input
                  type="text"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  placeholder="Nhập tên album"
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Nghệ Sĩ / Ca Sĩ
                </label>
                <input
                  type="text"
                  value={newAlbumArtistName}
                  onChange={(e) => setNewAlbumArtistName(e.target.value)}
                  placeholder="Tên ca sĩ của album"
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Mô tả album
                </label>
                <textarea
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  placeholder="Nhập mô tả..."
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl h-20 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Ảnh bìa Album (Thumbnail)
                </label>
                <div className="flex items-center gap-4">
                  {coverPreviewUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#282828] flex-shrink-0 border border-[#3a3a3a]">
                      <img
                        src={coverPreviewUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setNewAlbumCoverFile(null);
                          setCoverPreviewUrl("");
                        }}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 rounded-full text-white hover:bg-red-500"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 rounded-xl border border-dashed border-[#3a3a3a] hover:border-green-500 flex flex-col items-center justify-center cursor-pointer transition text-gray-500 hover:text-green-500">
                      <ImageIcon size={18} />
                      <span className="text-[9px] mt-0.5 font-medium">
                        Chọn file
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="text-xs text-gray-400">
                    Tải lên hình ảnh đại diện cho Album (JPG/PNG).
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAlbumModal(false)}
                  className="flex-1 py-3 rounded-full bg-[#282828] hover:bg-[#3a3a3a] font-semibold text-white transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAlbum || !newAlbumTitle.trim()}
                  className="flex-1 py-3 rounded-full bg-green-500 hover:bg-green-400 text-black font-semibold disabled:bg-gray-600 transition"
                >
                  {isCreatingAlbum ? "Đang tạo..." : "Tạo Album"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
