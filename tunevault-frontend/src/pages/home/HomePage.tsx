import { useEffect, useState } from "react";
import {
  Heart,
  Share2,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Play,
  ListPlus,
} from "lucide-react";
import { mediaService, albumService } from "../../api";
import type { MediaItemDto } from "../../api/types/media";
import type { AlbumDto } from "../../api/types/album";
import ShareModal from "../../components/share/ShareModal";
import AddToPlaylistModal from "../../components/playlist/AddToPlaylistModal";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";
import { useMediaActions } from "../../hooks/useMediaActions";
import { formatDuration } from "../../utils/format";

const HomePage = () => {
  const [trending, setTrending] = useState<MediaItemDto[]>([]);
  const [newSongs, setNewSongs] = useState<MediaItemDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    playSong,
    toggleLike,
    deleteSong,
    updateSong,
    isUpdating: isUpdatingSong,
  } = useMediaActions();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

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

  const [likedSongIds, setLikedSongIds] = useState<number[]>([]);

  // Edit Song Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState<MediaItemDto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtistName, setEditArtistName] = useState("");
  const [editAlbumId, setEditAlbumId] = useState("");
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState("");

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [mediaData, albumsData, favoritesData, allSongsData] =
        await Promise.all([
          mediaService.getTrendingMedia(),
          albumService.getAlbums(),
          mediaService.getFavorites(),
          mediaService.searchMedia(""), // get all songs to sort for new music
        ]);
      setTrending(mediaData);
      setAlbums(albumsData);
      setLikedSongIds(favoritesData.map((f) => f.mediaItemId));

      // Nhạc mới: sort by mediaItemId descending
      const sortedNew = [...allSongsData]
        .sort((a, b) => b.mediaItemId - a.mediaItemId)
        .slice(0, 6);
      setNewSongs(sortedNew);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách bài hát");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handlePlay = (media: MediaItemDto, currentList: MediaItemDto[]) => {
    playSong(media, currentList);
  };

  const openShareModal = (media: MediaItemDto) => {
    setShareModal({
      isOpen: true,
      mediaItemId: media.mediaItemId,
      title: media.title,
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
      "Bạn có chắc chắn muốn xóa bài hát này?",
    );
    if (deleted) {
      fetchHomeData();
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
      fetchHomeData();
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

  const getRecommendedSongs = (): MediaItemDto[] => {
    if (likedSongIds.length === 0) {
      return [...trending].sort(() => 0.5 - Math.random()).slice(0, 6);
    }
    // Simple similarity sorting based on liked artists
    const likedArtists = trending
      .filter((song) => likedSongIds.includes(song.mediaItemId))
      .map((song) => song.artistName);

    let recommendations = trending.filter(
      (song) => !likedSongIds.includes(song.mediaItemId),
    );

    recommendations = recommendations.sort((a, b) => {
      const aScore = likedArtists.includes(a.artistName) ? 2 : 0;
      const bScore = likedArtists.includes(b.artistName) ? 2 : 0;
      return bScore - aScore;
    });

    return recommendations.slice(0, 6);
  };

  const renderTrackList = (list: MediaItemDto[]) => {
    return (
      <div className="space-y-2">
        {list.map((song, index) => {
          const isOwner = currentUser?.id === song.ownerUserId;
          return (
            <div
              key={song.mediaItemId}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-[#282828] cursor-pointer group transition-colors bg-[#181818]"
              onClick={() => handlePlay(song, list)}
            >
              {/* Format: (ảnh thumbnail / tên bài hát - ca sĩ / tên người đăng) */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
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

                {song.hasVideo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/video/${song.mediaItemId}`);
                    }}
                    className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded-full text-white"
                  >
                    Video
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openShareModal(song);
                  }}
                  className="p-2 hover:bg-[#3a3a3a] rounded-full hover:text-white transition"
                  title="Chia sẻ"
                >
                  <Share2 size={18} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLike(song.mediaItemId);
                  }}
                  className="p-2 hover:bg-[#3a3a3a] rounded-full transition"
                >
                  <Heart
                    size={18}
                    className={
                      likedSongIds.includes(song.mediaItemId)
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
                      mediaItemId: song.mediaItemId,
                      title: song.title,
                    });
                  }}
                  className="p-2 hover:bg-[#3a3a3a] rounded-full hover:text-white transition"
                  title="Thêm vào playlist"
                >
                  <ListPlus size={18} />
                </button>

                {isOwner && (
                  <>
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
                  </>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlay(song, list);
                  }}
                  className="p-2 hover:text-white hover:bg-[#3a3a3a] rounded-full"
                >
                  <Play size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="animate-pulse h-10 bg-[#282828] rounded w-1/4 mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-[#181818] h-20 rounded-xl w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  const recommendedSongs = getRecommendedSongs();

  return (
    <div className="space-y-12">
      {/* 1. Trending Section */}
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">TRENDING</h1>
          <p className="text-gray-400 text-sm mt-1">
            Những bài hát đang được nghe nhiều nhất
          </p>
        </div>
        {trending.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">
            Chưa có bài hát thịnh hành.
          </p>
        ) : (
          renderTrackList(trending)
        )}
      </div>

      {/* 2. Recommended Music Section (Under Trending) */}
      {recommendedSongs.length > 0 && (
        <div>
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight">NHẠC ĐỀ XUẤT</h2>
            <p className="text-gray-400 text-sm mt-1">
              Gợi ý dành riêng cho bạn dựa trên sở thích
            </p>
          </div>
          {renderTrackList(recommendedSongs)}
        </div>
      )}

      {/* 3. New Music Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">
            NHẠC MỚI CẬP NHẬT
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Những tác phẩm mới nhất vừa được đăng tải
          </p>
        </div>
        {newSongs.length === 0 ? (
          <p className="text-gray-500 py-4 text-center">
            Chưa có nhạc mới cập nhật.
          </p>
        ) : (
          renderTrackList(newSongs)
        )}
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

export default HomePage;
