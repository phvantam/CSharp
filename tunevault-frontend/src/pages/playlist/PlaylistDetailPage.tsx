import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  Heart,
  Share2,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  ListPlus,
} from "lucide-react";
import { playlistService, mediaService, albumService } from "../../api";
import ShareModal from "../../components/share/ShareModal";
import AddToPlaylistModal from "../../components/playlist/AddToPlaylistModal";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";
import type { AlbumDto } from "../../api/types/album";
import { useMediaActions } from "../../hooks/useMediaActions";
import { formatDuration } from "../../utils/format";

interface PlaylistDetailTrack {
  mediaItemId: number;
  title: string;
  artistName: string;
  durationSeconds: number;
  hasVideo?: boolean;
  audioUrl?: string;
  thumbnailUrl?: string;
  ownerUserId?: string;
  ownerDisplayName?: string;
}

interface PlaylistDetail {
  playlistId: number;
  ownerUserId: string;
  title: string;
  visibility: string;
  isCollaborative: boolean;
  creator: string;
  tracks: PlaylistDetailTrack[];
}

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    playSong,
    playAll,
    toggleLike,
    deleteSong,
    updateSong,
    isUpdating: isUpdatingSong,
  } = useMediaActions();
  const currentUser = useAuthStore((state) => state.user);

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedSongIds, setLikedSongIds] = useState<number[]>([]);

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

  // Edit Song Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState<PlaylistDetailTrack | null>(
    null,
  );
  const [editTitle, setEditTitle] = useState("");
  const [editArtistName, setEditArtistName] = useState("");
  const [editAlbumId, setEditAlbumId] = useState("");
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState("");

  const fetchPlaylistData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await playlistService.getPlaylistById(Number(id));
      const formattedTracks = data.tracks.map((t: any) => ({
        ...t,
        audioUrl: mediaService.getStreamUrl(t.mediaItemId),
      }));
      setPlaylist({
        ...data,
        tracks: formattedTracks,
      } as any);

      const [albumsData, favoritesData] = await Promise.all([
        albumService.getAlbums(),
        mediaService.getFavorites(),
      ]);
      setAlbums(albumsData);
      setLikedSongIds(favoritesData.map((f) => f.mediaItemId));
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải thông tin playlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylistData();
  }, [id]);

  const handlePlayAll = () => {
    if (!playlist || playlist.tracks.length === 0) return;
    playAll(playlist.tracks);
  };

  const handlePlayTrack = (track: PlaylistDetailTrack) => {
    if (!playlist) return;
    playSong(track, playlist.tracks);
  };

  const handleDeletePlaylist = async () => {
    if (!playlist) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa playlist này?")) return;

    try {
      await playlistService.deletePlaylist(playlist.playlistId);
      toast.success("Xóa playlist thành công!");
      navigate("/library");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa playlist");
    }
  };

  const handleRemoveTrack = async (mediaItemId: number) => {
    if (!playlist) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài hát này khỏi playlist?"))
      return;

    try {
      await playlistService.removeTrackFromPlaylist(
        playlist.playlistId,
        mediaItemId,
      );
      toast.success("Đã xóa khỏi playlist!");
      fetchPlaylistData();
    } catch (err) {
      console.error(err);
      toast.error("Thao tác thất bại");
    }
  };

  const openShareModal = (track?: PlaylistDetailTrack) => {
    setShareModal({
      isOpen: true,
      mediaItemId: track?.mediaItemId,
      title: track ? track.title : playlist?.title || "",
    });
  };

  const handleToggleLike = async (mediaItemId: number) => {
    const isLiked = await toggleLike(mediaItemId);
    if (isLiked !== null) {
      if (isLiked) {
        setLikedSongIds((prev) => [...prev, mediaItemId]);
      } else {
        setLikedSongIds((prev) => prev.filter((id) => id !== mediaItemId));
      }
    }
  };

  const handleDeleteSong = async (id: number) => {
    const deleted = await deleteSong(
      id,
      "Bạn có chắc chắn muốn xóa bài hát này khỏi hệ thống?",
    );
    if (deleted) {
      fetchPlaylistData();
    }
  };

  const openEditModal = (song: PlaylistDetailTrack) => {
    setEditingSong(song);
    setEditTitle(song.title);
    setEditArtistName(song.artistName || "");
    // Default album mapping
    setEditAlbumId("");
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
      fetchPlaylistData();
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
        <div className="h-12 bg-[#282828] rounded w-full mb-3" />
        <div className="h-12 bg-[#282828] rounded w-full mb-3" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-16 text-2xl text-gray-400">
        Không tìm thấy playlist
      </div>
    );
  }

  const isPlaylistOwner = currentUser?.id === playlist.ownerUserId;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 mb-10">
        <div className="w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-[#282828] flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center text-8xl text-gray-600 bg-gradient-to-br from-indigo-950 to-purple-950">
            🎶
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white tracking-wider">
            PLAYLIST
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mt-2 mb-4 leading-tight">
            {playlist.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium text-white">
              Tạo bởi: {playlist.creator}
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
          className="flex items-center gap-3 bg-green-500 hover:bg-green-400 active:bg-green-600 text-black px-8 py-3 rounded-full font-bold text-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <Play size={24} className="ml-1" /> Phát tất cả
        </button>

        <button
          onClick={() => openShareModal()}
          className="p-3 rounded-full bg-[#282828] hover:bg-[#3a3a3a] text-gray-300 hover:text-white transition"
          title="Chia sẻ playlist"
        >
          <Share2 size={20} />
        </button>

        {isPlaylistOwner && (
          <button
            onClick={handleDeletePlaylist}
            className="p-3 rounded-full bg-[#282828] hover:bg-red-950 text-gray-300 hover:text-red-500 transition"
            title="Xóa playlist"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Tracks List */}
      <div className="mt-4">
        <div className="grid grid-cols-12 text-gray-400 text-sm px-4 py-2 border-b border-[#282828] mb-2">
          <div className="col-span-1">#</div>
          <div className="col-span-11">BÀI HÁT / THỜI LƯỢNG</div>
        </div>

        {playlist.tracks.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Chưa có bài hát nào trong playlist này
          </div>
        ) : (
          playlist.tracks.map((track, index) => {
            const isSongOwner = currentUser?.id === track.ownerUserId;
            return (
              <div
                key={track.mediaItemId}
                onClick={() => handlePlayTrack(track)}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#282828] cursor-pointer group transition-colors"
              >
                {/* Format: (ảnh thumbnail / tên bài hát - ca sĩ / tên người đăng) */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="text-gray-400 font-mono w-6 text-center">
                    {index + 1}
                  </div>
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
                      Video
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTrack(track);
                    }}
                    className="p-2 hover:text-white hover:bg-[#3a3a3a] rounded-full transition"
                    title="Phát bài hát"
                  >
                    <Play size={18} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openShareModal(track);
                    }}
                    className="p-2 hover:bg-[#3a3a3a] rounded-full hover:text-white transition"
                    title="Chia sẻ"
                  >
                    <Share2 size={18} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLike(track.mediaItemId);
                    }}
                    className="p-2 hover:bg-[#3a3a3a] rounded-full transition"
                  >
                    <Heart
                      size={18}
                      className={
                        likedSongIds.includes(track.mediaItemId)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-400"
                      }
                    />
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
                    className="p-2 hover:bg-[#3a3a3a] rounded-full hover:text-white transition"
                    title="Thêm vào playlist"
                  >
                    <ListPlus size={18} />
                  </button>

                  {isSongOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(track);
                      }}
                      className="p-2 hover:bg-[#3a3a3a] hover:text-green-500 rounded-full transition"
                      title="Sửa bài hát"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}

                  {(isPlaylistOwner || isSongOwner) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPlaylistOwner) {
                          handleRemoveTrack(track.mediaItemId);
                        } else {
                          handleDeleteSong(track.mediaItemId);
                        }
                      }}
                      className="p-2 hover:bg-red-950 hover:text-red-500 rounded-full transition"
                      title={
                        isPlaylistOwner ? "Xóa khỏi playlist" : "Xóa bài hát"
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Song Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6 border border-[#282828] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Chỉnh sửa bài hát</h3>
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

export default PlaylistDetailPage;
