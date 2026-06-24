import { useState, useEffect } from "react";
import {
  Search,
  Heart,
  Share2,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  ListPlus,
} from "lucide-react";
import { mediaService, albumService, playlistService } from "../../api";
import type { MediaItemDto } from "../../api/types/media";
import type { AlbumDto } from "../../api/types/album";
import type { PlaylistDto } from "../../api/types/playlist";
import ShareModal from "../../components/share/ShareModal";
import AddToPlaylistModal from "../../components/playlist/AddToPlaylistModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";
import { useMediaActions } from "../../hooks/useMediaActions";
import { formatDuration } from "../../utils/format";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<MediaItemDto[]>([]);
  const [playlistResults, setPlaylistResults] = useState<PlaylistDto[]>([]);
  const [albumResults, setAlbumResults] = useState<AlbumDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    const fetchAlbumsAndFavorites = async () => {
      try {
        const [albumsData, favoritesData] = await Promise.all([
          albumService.getAlbums(),
          mediaService.getFavorites(),
        ]);
        setAlbums(albumsData);
        setLikedSongIds(favoritesData.map((f) => f.mediaItemId));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAlbumsAndFavorites();
  }, []);

  const handleSearch = async (searchTerm: string, active = true) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setPlaylistResults([]);
      setAlbumResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [searchResults, playlistData, albumData] = await Promise.all([
        mediaService.searchMedia(searchTerm),
        playlistService.searchPlaylists(searchTerm),
        albumService.searchAlbums(searchTerm),
      ]);
      if (active) {
        setResults(searchResults);
        setPlaylistResults(playlistData);
        setAlbumResults(albumData);
      }
    } catch (err) {
      console.error(err);
      if (active) {
        setResults([]);
        setPlaylistResults([]);
        setAlbumResults([]);
      }
    } finally {
      if (active) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;
    setQuery(queryParam);
    handleSearch(queryParam, active);
    return () => {
      active = false;
    };
  }, [queryParam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSearchParams({ q: value }, { replace: true });
  };

  const handlePlay = (media: MediaItemDto) => {
    playSong(media, results);
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
      handleSearch(query);
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
      handleSearch(query);
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
    <div className="max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">Tìm kiếm</h1>

      <div className="relative mb-10 max-w-2xl">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="search"
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onDrop={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          onPaste={(e) => {
            const hasFiles = e.clipboardData?.files?.length > 0;
            if (hasFiles) e.preventDefault();
          }}
          placeholder="Bạn muốn nghe gì?"
          className="w-full bg-[#282828] text-white pl-14 pr-6 py-4 text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 animate-pulse bg-[#181818] rounded-xl"
            >
              <div className="w-12 h-12 bg-[#282828] rounded" />
              <div className="flex-1">
                <div className="h-4 bg-[#282828] rounded w-2/3 mb-2" />
                <div className="h-3 bg-[#282828] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (results.length > 0 || playlistResults.length > 0 || albumResults.length > 0) && (
        <div className="space-y-10">
          {results.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-300">
                Bài hát
              </h2>
              <div className="space-y-2">
                {results.map((song, index) => {
                  const isOwner = currentUser?.id === song.ownerUserId;
                  return (
                    <div
                      key={song.mediaItemId}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-[#282828] group transition-colors bg-[#181818]"
                      onClick={() => handlePlay(song)}
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {albumResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-300">
                Albums
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {albumResults.map((album) => (
                  <div
                    key={album.albumId}
                    onClick={() => navigate(`/album/${album.albumId}`)}
                    className="group bg-[#181818] p-4 rounded-2xl hover:bg-[#282828] transition-all cursor-pointer"
                  >
                    <div className="relative mb-4">
                      <div className="aspect-square rounded-xl overflow-hidden bg-[#282828] flex items-center justify-center shadow-md">
                        {album.coverImageUrl ? (
                          <img
                            src={album.coverImageUrl}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-600 bg-gradient-to-br from-green-900/30 to-emerald-900/30">
                            💿
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg truncate text-white">
                      {album.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      {album.artistName || "Nghệ sĩ"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {playlistResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-300">
                Playlists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {playlistResults.map((playlist) => (
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
            </div>
          )}
        </div>
      )}

      {!isLoading &&
        query &&
        results.length === 0 &&
        playlistResults.length === 0 &&
        albumResults.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-400">Không tìm thấy kết quả</p>
          </div>
        )}

      {!query && (
        <div className="text-gray-400 text-lg">
          Hãy nhập tên bài hát hoặc nghệ sĩ để tìm kiếm...
        </div>
      )}

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

export default SearchPage;
