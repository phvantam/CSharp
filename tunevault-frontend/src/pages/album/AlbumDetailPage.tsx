import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  Share2,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  ListPlus,
} from "lucide-react";
import { albumService, mediaService } from "../../api";
import type { AlbumDto } from "../../api/types/album";
import type { MediaItemDto } from "../../api/types/media";
import { useAuthStore } from "../../stores/authStore";
import ShareModal from "../../components/share/ShareModal";
import AddToPlaylistModal from "../../components/playlist/AddToPlaylistModal";
import toast from "react-hot-toast";
import { useMediaActions } from "../../hooks/useMediaActions";
import { formatDuration } from "../../utils/format";

const AlbumDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    playSong,
    playAll,
    deleteSong,
    updateSong,
    isUpdating: isUpdatingSong,
  } = useMediaActions();
  const currentUser = useAuthStore((state) => state.user);

  const [album, setAlbum] = useState<AlbumDto | null>(null);
  const [songs, setSongs] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [playlistModal, setPlaylistModal] = useState<{
    isOpen: boolean;
    mediaItemId: number | null;
    title: string;
  }>({ isOpen: false, mediaItemId: null, title: "" });

  // Edit Album Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editArtistName, setEditArtistName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Add Song to Album Modal State
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [addSongTitle, setAddSongTitle] = useState("");
  const [addSongArtist, setAddSongArtist] = useState("");
  const [addSongFile, setAddSongFile] = useState<File | null>(null);
  const [addSongThumbnailFile, setAddSongThumbnailFile] = useState<File | null>(
    null,
  );
  const [addSongThumbnailPreview, setAddSongThumbnailPreview] = useState("");
  const [isAddingSong, setIsAddingSong] = useState(false);

  // Edit Song Modal State
  const [showEditSongModal, setShowEditSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState<MediaItemDto | null>(null);
  const [editSongTitle, setEditSongTitle] = useState("");
  const [editSongArtist, setEditSongArtist] = useState("");
  const [editSongThumbnailFile, setEditSongThumbnailFile] =
    useState<File | null>(null);
  const [editSongThumbnailPreview, setEditSongThumbnailPreview] = useState("");

  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    mediaItemId?: number;
    title: string;
  }>({ isOpen: false, title: "" });

  const fetchAlbumData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await albumService.getAlbumById(Number(id));
      setAlbum(data.album);

      const formattedSongs = data.songs.map((s: any) => ({
        ...s,
        audioUrl: mediaService.getStreamUrl(s.mediaItemId),
      }));
      setSongs(formattedSongs);

      setEditTitle(data.album.title);
      setEditArtistName(data.album.artistName || "");
      setEditDescription(data.album.description || "");
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải thông tin album");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbumData();
  }, [id]);

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    playAll(songs);
  };

  const handlePlayTrack = (track: MediaItemDto) => {
    playSong(track, songs);
  };

  const handleDeleteAlbum = async () => {
    if (!album) return;
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa album này? Tất cả bài hát sẽ không còn thuộc album này.",
      )
    )
      return;

    try {
      await albumService.deleteAlbum(album.albumId);
      toast.success("Xóa album thành công!");
      navigate("/library");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa album");
    }
  };

  const handleUpdateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!album || !editTitle.trim()) return;

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("artistName", editArtistName.trim());
      formData.append("description", editDescription.trim());
      if (editCoverFile) {
        formData.append("coverImage", editCoverFile);
      }

      const updated = await albumService.updateAlbum(album.albumId, formData);
      setAlbum(updated);
      setShowEditModal(false);
      setEditCoverFile(null);
      toast.success("Cập nhật album thành công!");
      fetchAlbumData();
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật album thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  // Add song to album handler
  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!album || !addSongFile || !addSongTitle.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin và chọn file nhạc");
      return;
    }

    setIsAddingSong(true);
    try {
      const formData = new FormData();
      formData.append("file", addSongFile);
      formData.append("title", addSongTitle.trim());
      formData.append(
        "artist",
        addSongArtist.trim() || album.artistName || "Unknown Artist",
      );
      formData.append("albumId", album.albumId.toString());
      if (addSongThumbnailFile) {
        formData.append("thumbnail", addSongThumbnailFile);
      }

      await mediaService.uploadMedia(formData);
      toast.success("Đăng tải nhạc lên album thành công!");

      // Reset form & close modal
      setShowAddSongModal(false);
      setAddSongTitle("");
      setAddSongArtist("");
      setAddSongFile(null);
      setAddSongThumbnailFile(null);
      setAddSongThumbnailPreview("");

      fetchAlbumData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Đăng tải nhạc thất bại");
    } finally {
      setIsAddingSong(false);
    }
  };

  // Delete song handler
  const handleDeleteSong = async (id: number) => {
    const deleted = await deleteSong(
      id,
      "Bạn có chắc chắn muốn xóa bài hát này?",
    );
    if (deleted) {
      fetchAlbumData();
    }
  };

  // Edit song modal openers
  const openEditSongModal = (song: MediaItemDto) => {
    setEditingSong(song);
    setEditSongTitle(song.title);
    setEditSongArtist(song.artistName || "");
    setEditSongThumbnailPreview(song.thumbnailUrl || "");
    setEditSongThumbnailFile(null);
    setShowEditSongModal(true);
  };

  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!album || !editingSong) return;
    const updated = await updateSong(editingSong.mediaItemId, {
      title: editSongTitle,
      artist: editSongArtist,
      albumId: album.albumId,
      thumbnail: editSongThumbnailFile,
    });
    if (updated) {
      setShowEditSongModal(false);
      fetchAlbumData();
    }
  };

  const handleEditSongThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ chấp nhận file ảnh");
        return;
      }
      setEditSongThumbnailFile(file);
      setEditSongThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSongThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ chấp nhận file ảnh");
        return;
      }
      setAddSongThumbnailFile(file);
      setAddSongThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const openShareModal = (track?: MediaItemDto) => {
    setShareModal({
      isOpen: true,
      mediaItemId: track?.mediaItemId,
      title: track ? track.title : album?.title || "",
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
          <div className="w-48 h-48 bg-[#282828] rounded-2xl shadow-2xl" />
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-[#282828] rounded w-1/4" />
            <div className="h-12 bg-[#282828] rounded w-3/4" />
            <div className="h-4 bg-[#282828] rounded w-1/2" />
          </div>
        </div>
        <div className="h-10 bg-[#282828] rounded w-1/3 mb-6" />
        <div className="space-y-3">
          <div className="h-12 bg-[#282828] rounded w-full" />
          <div className="h-12 bg-[#282828] rounded w-full" />
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-16 text-2xl text-gray-400">
        Không tìm thấy album
      </div>
    );
  }

  const isOwner = currentUser?.id === album.ownerUserId;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
        <div className="w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-[#282828] flex items-center justify-center">
          {album.coverImageUrl ? (
            <img
              src={album.coverImageUrl}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-7xl text-gray-600">💿</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white tracking-wider">
            ALBUM
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mt-2 mb-4 leading-tight">
            {album.title}
          </h1>
          <p className="text-sm font-semibold text-green-500 mb-2">
            Ca sĩ: {album.artistName || "Unknown Artist"}
          </p>
          <p className="text-gray-300 mb-4 max-w-2xl">
            {album.description || "Chưa có mô tả cho album này"}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium text-white">
              Đăng bởi: {album.creatorName || "TuneVault"}
            </span>
            <span>•</span>
            <span>{songs.length} bài hát</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="flex items-center gap-3 bg-green-500 hover:bg-green-400 active:bg-green-600 disabled:bg-gray-600 text-black px-8 py-3 rounded-full font-bold text-lg transition disabled:cursor-not-allowed"
        >
          <Play size={24} className="ml-1" /> Phát tất cả
        </button>

        {isOwner && (
          <>
            <button
              onClick={() => setShowAddSongModal(true)}
              className="flex items-center gap-2 bg-[#282828] text-green-500 hover:text-green-400 border border-[#3a3a3a] px-6 py-3 rounded-full font-bold transition"
            >
              + Thêm nhạc vào Album
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-3 rounded-full bg-[#282828] hover:bg-[#3a3a3a] text-gray-300 hover:text-white transition"
              title="Sửa album"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={handleDeleteAlbum}
              className="p-3 rounded-full bg-[#282828] hover:bg-red-950 text-gray-300 hover:text-red-500 transition"
              title="Xóa album"
            >
              <Trash2 size={20} />
            </button>
          </>
        )}
      </div>

      {/* Tracks List */}
      <div className="mt-4">
        <div className="grid grid-cols-12 text-gray-400 text-sm px-4 py-2 border-b border-[#282828] mb-2">
          <div className="col-span-1">#</div>
          <div className="col-span-11">BÀI HÁT / THỜI LƯỢNG</div>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Chưa có bài hát nào trong album này
          </div>
        ) : (
          songs.map((track, index) => {
            const isSongUploader = currentUser?.id === track.ownerUserId;
            return (
              <div
                key={track.mediaItemId}
                onClick={() => handlePlayTrack(track)}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#282828] cursor-pointer group transition-colors"
              >
                {/* Display format: (ảnh thumbnail / tên bài hát - ca sĩ / tên người đăng) */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="text-gray-400 font-mono w-6">{index + 1}</div>
                  <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-[#3a3a3a] flex items-center justify-center">
                    {track.thumbnailUrl ? (
                      <img
                        src={track.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-gray-500">♪</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate text-base">
                      {track.title} - {track.artistName || "Unknown Artist"}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      Người đăng: {track.ownerDisplayName || "Hệ thống"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                  <span className="text-sm hidden sm:block mr-2">
                    {formatDuration(track.durationSeconds)}
                  </span>

                  {track.hasVideo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/video/${track.mediaItemId}`);
                      }}
                      className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded-full text-white"
                    >
                      Xem Video
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openShareModal(track);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#3a3a3a] rounded-full hover:text-white transition"
                  >
                    <Share2 size={18} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaylistModal({
                        isOpen: true,
                        mediaItemId: track.mediaItemId,
                        title: track.title,
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#3a3a3a] rounded-full hover:text-white transition"
                    title="Thêm vào playlist"
                  >
                    <ListPlus size={18} />
                  </button>

                  {isSongUploader && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditSongModal(track);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#3a3a3a] hover:text-green-500 rounded-full transition"
                        title="Sửa nhạc"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSong(track.mediaItemId);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-950 hover:text-red-500 rounded-full transition"
                        title="Xóa nhạc"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
                    }}
                    className="p-2 hover:text-white hover:bg-[#3a3a3a] rounded-full"
                  >
                    <Play size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Album Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6 border border-[#282828] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Chỉnh sửa Album</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateAlbum} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên Album *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                  placeholder="Tên album"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên Nghệ Sĩ / Ca Sĩ
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
                  Mô tả
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                  placeholder="Mô tả về album này..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Ảnh bìa Album (Upload mới)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditCoverFile(e.target.files?.[0] || null)
                  }
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-400"
                />
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
                  disabled={isUpdating || !editTitle.trim()}
                  className="flex-1 py-3 rounded-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-semibold transition disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Song to Album Modal */}
      {showAddSongModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6 border border-[#282828] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Thêm nhạc vào Album
              </h3>
              <button
                onClick={() => setShowAddSongModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddSong} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên bài hát *
                </label>
                <input
                  type="text"
                  value={addSongTitle}
                  onChange={(e) => setAddSongTitle(e.target.value)}
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                  placeholder="Nhập tên bài hát"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên Ca Sĩ
                </label>
                <input
                  type="text"
                  value={addSongArtist}
                  onChange={(e) => setAddSongArtist(e.target.value)}
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                  placeholder={album.artistName || "Tên ca sĩ"}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  File âm thanh / Video *
                </label>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAddSongFile(file);
                    if (file && !addSongTitle) {
                      setAddSongTitle(file.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Ảnh đại diện bài hát (Thumbnail)
                </label>
                <div className="flex items-center gap-4">
                  {addSongThumbnailPreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#282828] flex-shrink-0 border border-[#3a3a3a]">
                      <img
                        src={addSongThumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAddSongThumbnailFile(null);
                          setAddSongThumbnailPreview("");
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
                        onChange={handleAddSongThumbnailChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="text-xs text-gray-400">
                    Chọn ảnh đại diện riêng cho bài hát (nếu có).
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddSongModal(false)}
                  className="flex-1 py-3 rounded-full bg-[#282828] hover:bg-[#3a3a3a] font-semibold transition text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={
                    isAddingSong || !addSongTitle.trim() || !addSongFile
                  }
                  className="flex-1 py-3 rounded-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-semibold transition"
                >
                  {isAddingSong ? "Đang tải lên..." : "Đăng nhạc"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Song Modal */}
      {showEditSongModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6 border border-[#282828] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Chỉnh sửa bài hát
              </h3>
              <button
                onClick={() => setShowEditSongModal(false)}
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
                  value={editSongTitle}
                  onChange={(e) => setEditSongTitle(e.target.value)}
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                  placeholder="Tên bài hát"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tên Ca Sĩ
                </label>
                <input
                  type="text"
                  value={editSongArtist}
                  onChange={(e) => setEditSongArtist(e.target.value)}
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                  placeholder="Tên ca sĩ"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Ảnh bìa bài hát / Thumbnail (Upload mới)
                </label>
                <div className="flex items-center gap-4">
                  {editSongThumbnailPreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#282828] flex-shrink-0 border border-[#3a3a3a]">
                      <img
                        src={editSongThumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditSongThumbnailFile(null);
                          setEditSongThumbnailPreview("");
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
                        onChange={handleEditSongThumbnailChange}
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
                  onClick={() => setShowEditSongModal(false)}
                  className="flex-1 py-3 rounded-full bg-[#282828] hover:bg-[#3a3a3a] font-semibold transition text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingSong || !editSongTitle.trim()}
                  className="flex-1 py-3 rounded-full bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-semibold transition"
                >
                  {isUpdatingSong ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </div>
  );
};

export default AlbumDetailPage;
