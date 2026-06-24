import { useState, useEffect } from "react";
import {
  User,
  Camera,
  Edit3,
  Save,
  X,
  Share2,
  Heart,
  Play,
  Trash2,
  Edit2,
  Image as ImageIcon,
  ListPlus,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { mediaService, albumService } from "../../api";
import type { MediaItemDto } from "../../api/types/media";
import type { AlbumDto } from "../../api/types/album";
import toast from "react-hot-toast";
import ShareModal from "../../components/share/ShareModal";
import AddToPlaylistModal from "../../components/playlist/AddToPlaylistModal";
import { useNavigate } from "react-router-dom";
import { useMediaActions } from "../../hooks/useMediaActions";
import { formatDuration } from "../../utils/format";

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const {
    playSong,
    toggleLike,
    deleteSong,
    updateSong,
    isUpdating: isUpdatingSong,
  } = useMediaActions();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: user?.bio || "",
  });

  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [playlistModal, setPlaylistModal] = useState<{
    isOpen: boolean;
    mediaItemId: number | null;
    title: string;
  }>({ isOpen: false, mediaItemId: null, title: "" });

  // Real data state
  const [likedSongs, setLikedSongs] = useState<MediaItemDto[]>([]);
  const [uploadedSongs, setUploadedSongs] = useState<MediaItemDto[]>([]);
  const [uploadedAlbums, setUploadedAlbums] = useState<AlbumDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]); // for edit song modal dropdown
  const [activeTab, setActiveTab] = useState<"liked" | "songs" | "albums">(
    "liked",
  );

  // Edit Song Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState<MediaItemDto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtistName, setEditArtistName] = useState("");
  const [editAlbumId, setEditAlbumId] = useState("");
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState("");

  const fetchProfileData = async () => {
    if (!user) return;
    try {
      const [favoritesData, mediaData, albumsData] = await Promise.all([
        mediaService.getFavorites(),
        mediaService.searchMedia(""), // get all songs
        albumService.getAlbums(),
      ]);

      setLikedSongs(favoritesData);
      setAlbums(albumsData);

      // Filter user uploaded items
      setUploadedSongs(mediaData.filter((m) => m.ownerUserId === user.id));
      setUploadedAlbums(albumsData.filter((a) => a.ownerUserId === user.id));
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải thông tin trang cá nhân");
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-400">
          Vui lòng đăng nhập để xem hồ sơ cá nhân.
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!formData.displayName.trim()) {
      toast.error("Tên hiển thị không được để trống");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      updateUser({
        displayName: formData.displayName,
        bio: formData.bio,
      });

      toast.success("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
    } catch {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user.displayName,
      bio: user.bio || "",
    });
    setIsEditing(false);
  };

  const handlePlaySong = (song: MediaItemDto, list: MediaItemDto[]) => {
    playSong(song, list);
  };

  const handleToggleLike = async (mediaItemId: number) => {
    const isLiked = await toggleLike(mediaItemId);
    if (isLiked !== null) {
      fetchProfileData();
    }
  };

  const handleDeleteSong = async (id: number) => {
    const deleted = await deleteSong(
      id,
      "Bạn có chắc chắn muốn xóa bài hát này khỏi hệ thống?",
    );
    if (deleted) {
      fetchProfileData();
    }
  };

  const openEditModal = (song: MediaItemDto) => {
    setEditingSong(song);
    setEditTitle(song.title);
    setEditArtistName(song.artistName || "");
    setEditAlbumId(song.albumId?.toString() || "");
    setEditThumbnailPreview(song.thumbnailUrl || "");
    setEditThumbnailFile(null);
    setShowEditModal(true);
  };

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;
    const updated = await updateSong(editingSong.mediaItemId, {
      title: editTitle,
      artist: editArtistName,
      albumId: editAlbumId,
      thumbnail: editThumbnailFile,
    });
    if (updated) {
      setShowEditModal(false);
      fetchProfileData();
    }
  };

  const handleEditThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ chấp nhận file ảnh");
        return;
      }
      setEditThumbnailFile(file);
      setEditThumbnailPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Hồ sơ cá nhân</h1>
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#282828] hover:bg-[#3a3a3a] text-sm transition"
        >
          <Share2 size={18} /> Chia sẻ hồ sơ
        </button>
      </div>

      <div className="bg-[#181818] rounded-3xl p-8 md:p-10 border border-[#282828] mb-10 shadow-2xl">
        {/* Avatar + Thông tin cơ bản */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-[#282828] flex items-center justify-center overflow-hidden border-4 border-[#181818]">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={52} className="text-gray-500" />
              )}
            </div>
            <button
              className="absolute bottom-2 right-2 bg-[#282828] p-2.5 rounded-full hover:bg-[#3a3a3a] transition"
              title="Thay đổi ảnh đại diện"
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-bold">{user.displayName}</h2>
            <p className="text-gray-400 mt-1">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Thành viên từ{" "}
              {new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Form thông tin */}
        <div className="space-y-6">
          {/* Tên hiển thị */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Tên người dùng
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                className="w-full bg-[#282828] px-5 py-3 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
              />
            ) : (
              <p className="text-2xl font-semibold">{user.displayName}</p>
            )}
          </div>

          {/* Giới thiệu */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Giới thiệu
            </label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
                className="w-full bg-[#282828] px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none border border-[#3a3a3a] text-white"
                placeholder="Viết vài dòng giới thiệu về bạn..."
              />
            ) : (
              <p className="text-gray-300 whitespace-pre-line min-h-[60px]">
                {user.bio || "Chưa có giới thiệu."}
              </p>
            )}
          </div>
        </div>

        {/* Nút hành động */}
        <div className="mt-8 flex flex-wrap gap-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-8 py-3 rounded-full font-semibold transition disabled:opacity-70"
              >
                <Save size={18} /> {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-[#282828] hover:bg-[#3a3a3a] px-8 py-3 rounded-full font-semibold transition text-white"
              >
                <X size={18} /> Hủy
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
            >
              <Edit3 size={18} /> Chỉnh sửa hồ sơ
            </button>
          )}
        </div>
      </div>

      {/* Tabs list: Liked Songs / Uploaded Songs / Uploaded Albums */}
      <div className="flex gap-6 border-b border-[#282828] mb-6">
        <button
          onClick={() => setActiveTab("liked")}
          className={`pb-3 font-semibold text-lg transition-all ${
            activeTab === "liked"
              ? "text-white border-b-2 border-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Bài hát đã thích ({likedSongs.length})
        </button>
        <button
          onClick={() => setActiveTab("songs")}
          className={`pb-3 font-semibold text-lg transition-all ${
            activeTab === "songs"
              ? "text-white border-b-2 border-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Nhạc đã đăng ({uploadedSongs.length})
        </button>
        <button
          onClick={() => setActiveTab("albums")}
          className={`pb-3 font-semibold text-lg transition-all ${
            activeTab === "albums"
              ? "text-white border-b-2 border-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Album đã đăng ({uploadedAlbums.length})
        </button>
      </div>

      {/* Render tab contents */}
      <div className="bg-[#181818] rounded-2xl p-4 border border-[#282828]">
        {activeTab === "liked" &&
          (likedSongs.length === 0 ? (
            <p className="text-gray-400 py-6 text-center">
              Bạn chưa thích bài hát nào.
            </p>
          ) : (
            <div className="space-y-1">
              {likedSongs.map((song, index) => (
                <div
                  key={song.mediaItemId}
                  onClick={() => handlePlaySong(song, likedSongs)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#282828] cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-gray-400 font-mono w-6 text-center">
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
                    <span className="text-sm hidden sm:block mr-1">
                      {formatDuration(song.durationSeconds)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(song.mediaItemId);
                      }}
                      className="p-2 hover:bg-[#3a3a3a] rounded-full text-red-500 transition"
                      title="Xóa khỏi yêu thích"
                    >
                      <Heart size={18} className="fill-red-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaylistModal({
                          isOpen: true,
                          mediaItemId: song.mediaItemId,
                          title: song.title,
                        });
                      }}
                      className="p-2 hover:bg-[#3a3a3a] rounded-full hover:text-white transition"
                      title="Thêm vào playlist"
                    >
                      <ListPlus size={18} />
                    </button>
                    <button
                      onClick={() => handlePlaySong(song, likedSongs)}
                      className="p-2 hover:text-white hover:bg-[#3a3a3a] rounded-full"
                    >
                      <Play size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {activeTab === "songs" &&
          (uploadedSongs.length === 0 ? (
            <p className="text-gray-400 py-6 text-center">
              Bạn chưa đăng tải bài hát nào.
            </p>
          ) : (
            <div className="space-y-1">
              {uploadedSongs.map((song, index) => (
                <div
                  key={song.mediaItemId}
                  onClick={() => handlePlaySong(song, uploadedSongs)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#282828] cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-gray-400 font-mono w-6 text-center">
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
                        Người đăng: Bạn
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm hidden sm:block mr-2">
                      {formatDuration(song.durationSeconds)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(song);
                      }}
                      className="p-2 hover:bg-[#3a3a3a] hover:text-green-500 rounded-full transition"
                      title="Sửa bài hát"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSong(song.mediaItemId);
                      }}
                      className="p-2 hover:bg-red-950 hover:text-red-500 rounded-full transition"
                      title="Xóa bài hát"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaylistModal({
                          isOpen: true,
                          mediaItemId: song.mediaItemId,
                          title: song.title,
                        });
                      }}
                      className="p-2 hover:bg-[#3a3a3a] rounded-full hover:text-white transition"
                      title="Thêm vào playlist"
                    >
                      <ListPlus size={18} />
                    </button>
                    <button
                      onClick={() => handlePlaySong(song, uploadedSongs)}
                      className="p-2 hover:text-white hover:bg-[#3a3a3a] rounded-full"
                    >
                      <Play size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {activeTab === "albums" &&
          (uploadedAlbums.length === 0 ? (
            <p className="text-gray-400 py-6 text-center">
              Bạn chưa đăng tải album nào.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-2">
              {uploadedAlbums.map((album) => (
                <div
                  key={album.albumId}
                  onClick={() => navigate(`/album/${album.albumId}`)}
                  className="group bg-[#282828] p-4 rounded-2xl hover:bg-[#323232] transition cursor-pointer"
                >
                  <div className="relative mb-4">
                    <div className="aspect-square rounded-xl overflow-hidden bg-[#181818] flex items-center justify-center shadow-lg">
                      {album.coverImageUrl ? (
                        <img
                          src={album.coverImageUrl}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl text-gray-700 bg-gradient-to-br from-emerald-950 to-teal-900/30">
                          💿
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-base truncate text-white">
                    {album.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    Ca sĩ: {album.artistName || "Unknown Artist"}
                  </p>
                </div>
              ))}
            </div>
          ))}
      </div>

      {/* Edit Song Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6 border border-[#282828] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Chỉnh sửa bài hát
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateSong} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên bài hát *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                  placeholder="Tên bài hát"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên Ca Sĩ / Nghệ Sĩ
                </label>
                <input
                  type="text"
                  value={editArtistName}
                  onChange={(e) => setEditArtistName(e.target.value)}
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                  placeholder="Tên ca sĩ"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Album
                </label>
                <select
                  value={editAlbumId}
                  onChange={(e) => setEditAlbumId(e.target.value)}
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                >
                  <option value="">--- Chọn Album (Không bắt buộc) ---</option>
                  {albums.map((album) => (
                    <option key={album.albumId} value={album.albumId}>
                      {album.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Ảnh bìa bài hát / Thumbnail (Upload mới)
                </label>
                <div className="flex items-center gap-4">
                  {editThumbnailPreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#282828] flex-shrink-0 border border-[#3a3a3a]">
                      <img
                        src={editThumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditThumbnailFile(null);
                          setEditThumbnailPreview("");
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
                        Chọn ảnh
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="text-xs text-gray-400">
                    Chọn ảnh đại diện mới cho bài hát (nếu có).
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-full bg-[#282828] hover:bg-[#3a3a3a] font-semibold transition text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingSong || !editTitle.trim()}
                  className="flex-1 py-3 rounded-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-semibold transition"
                >
                  {isUpdatingSong ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={`${user.displayName}'s Profile`}
      />

      <AddToPlaylistModal
        isOpen={playlistModal.isOpen}
        onClose={() =>
          setPlaylistModal({ isOpen: false, mediaItemId: null, title: "" })
        }
        mediaItemId={playlistModal.mediaItemId}
        trackTitle={playlistModal.title}
      />
    </div>
  );
};

export default ProfilePage;
