import { useState, useEffect } from "react";
import {
  Play,
  Heart,
  Plus,
  X,
  Edit3,
  Trash2,
  ListMusic,
  ImagePlus,
} from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";
import { playlistService } from "../../api/playlistService";
import { favoriteService } from "../../api/favoriteService";
import ConfirmModal from "../../components/common/ConfirmModal";
import SongMenu from "../../components/media/SongMenu";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { formatCount, formatDuration } from "../../utils/formatCount";
import ImageAdjustModal from "../../components/common/ImageAdjustModal";

interface Playlist {
  playlistId: number;
  title: string;
  trackCount: number;
  coverImageUrl?: string | null;
  description?: string;
  visibility?: "Public" | "Private" | string;
}

interface MediaItem {
  mediaItemId: number;
  title: string;

  ownerUserId?: string;
  ownerDisplayName?: string;

  artistId?: number;
  artistName?: string;
  artists?: {
    artistId?: number;
    id?: number;
    name?: string;
    artistName?: string;
    position?: number;
    role?: string;
  }[];

  albumId?: number;
  albumTitle?: string;

  durationSeconds?: number;
  playCount?: number;
  likeCount?: number;

  thumbnailUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  filePath?: string;
  hasVideo?: boolean;
  mediaType: string;
  visibility?: "Public" | "Private" | "Unlisted" | string;
  genre?: string;
  lyrics?: string;
}

interface Artist {
  artistId: number;
  name: string;
}

const GENRES = [
  "V-Pop",
  "Ballad",
  "Rap / Hip-hop",
  "R&B",
  "EDM / Dance",
  "Rock",
  "Indie",
  "Acoustic",
  "Lofi / Chill",
  "OST",
  "Remix",
  "Nhạc trẻ",
];

const PlaylistCoverFallback = ({ title }: { title: string }) => {
  const firstLetter = title?.trim()?.charAt(0)?.toUpperCase() || "♪";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-500/30 via-[#282828] to-purple-600/30">
      <div className="w-16 h-16 rounded-2xl bg-black/30 flex items-center justify-center mb-3">
        <ListMusic size={34} className="text-green-400" />
      </div>
      <span className="text-4xl font-black text-white/80">{firstLetter}</span>
    </div>
  );
};

const splitArtistNames = (artistName?: string) => {
  if (!artistName) return [];

  return artistName
    .split(/\s*(?:,|&| x | X | ft\.? | feat\.? | featuring )\s*/i)
    .map((name) => name.trim())
    .filter(Boolean);
};

const getSongArtists = (song: MediaItem) => {
  if (song.artists && song.artists.length > 0) {
    return [...song.artists]
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((artist) => ({
        artistId: artist.artistId || artist.id || 0,
        name: artist.name || artist.artistName || "Unknown Artist",
      }));
  }

  const names = splitArtistNames(song.artistName);

  if (names.length > 1) {
    return names.map((name, index) => ({
      artistId: index === 0 ? song.artistId || 0 : 0,
      name,
    }));
  }

  return [
    {
      artistId: song.artistId || 0,
      name: song.artistName || "Unknown Artist",
    },
  ];
};

const MediaMetaLinks = ({ song }: { song: MediaItem }) => {
  const artists = getSongArtists(song);

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400">
      <span className="flex flex-wrap items-center gap-x-1">
        {artists.map((artist, index) => (
          <span
            key={`${artist.artistId}-${artist.name}-${index}`}
            className="inline-flex items-center"
          >
            {index > 0 && <span className="mr-1 text-gray-500">,</span>}

            {artist.artistId ? (
              <Link
                to={`/artist/${artist.artistId}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-white hover:underline"
              >
                {artist.name}
              </Link>
            ) : (
              <span>{artist.name}</span>
            )}
          </span>
        ))}
      </span>

      {song.albumId && (
        <>
          <span>•</span>
          <Link
            to={`/album/${song.albumId}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-white hover:underline"
          >
            {song.albumTitle || "Album"}
          </Link>
        </>
      )}
    </div>
  );
};

const MediaStats = ({ song }: { song: MediaItem }) => {
  return (
    <p className="mt-1 text-xs text-gray-500">
      {formatCount(song.playCount)} lượt nghe · {formatCount(song.likeCount)}{" "}
      thích
      {song.durationSeconds ? ` · ${formatDuration(song.durationSeconds)}` : ""}
    </p>
  );
};

const LibraryPage = () => {
  const [activeTab, setActiveTab] = useState<
    "playlists" | "liked" | "my-uploads"
  >("playlists");

  const playTrack = usePlayerStore((state) => state.playTrack);
  const navigate = useNavigate();
  // ==================== FAVORITES ====================
  const [likedSongs, setLikedSongs] = useState<MediaItem[]>([]);
  const [loadingLikedSongs, setLoadingLikedSongs] = useState(false);
  const [removingFavorite, setRemovingFavorite] = useState<MediaItem | null>(
    null,
  );
  const [removeFavoriteLoading, setRemoveFavoriteLoading] = useState(false);

  const fetchLikedSongs = async () => {
    setLoadingLikedSongs(true);

    try {
      const data = await favoriteService.getMyFavorites();
      setLikedSongs(data as MediaItem[]);
    } catch (error) {
      console.error("Lỗi tải bài hát đã thích:", error);
      toast.error("Không thể tải bài hát đã thích");
      setLikedSongs([]);
    } finally {
      setLoadingLikedSongs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "liked") {
      fetchLikedSongs();
    }
  }, [activeTab]);

  // ==================== PLAYLISTS ====================
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [newPlaylistVisibility, setNewPlaylistVisibility] = useState<
    "Public" | "Private"
  >("Public");
  const [newPlaylistCoverFile, setNewPlaylistCoverFile] = useState<File | null>(
    null,
  );
  const [newPlaylistCoverPreview, setNewPlaylistCoverPreview] = useState("");

  const [showEditPlaylistModal, setShowEditPlaylistModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [editPlaylistName, setEditPlaylistName] = useState("");
  const [editPlaylistDesc, setEditPlaylistDesc] = useState("");
  const [editPlaylistVisibility, setEditPlaylistVisibility] = useState<
    "Public" | "Private"
  >("Public");
  const [editPlaylistCoverFile, setEditPlaylistCoverFile] =
    useState<File | null>(null);
  const [editPlaylistCoverPreview, setEditPlaylistCoverPreview] = useState("");
  const [isPlaylistSaving, setIsPlaylistSaving] = useState(false);
  const [deletingPlaylist, setDeletingPlaylist] = useState<Playlist | null>(
    null,
  );
  const [deletePlaylistLoading, setDeletePlaylistLoading] = useState(false);
  const [deletingMedia, setDeletingMedia] = useState<MediaItem | null>(null);
  const [deleteMediaLoading, setDeleteMediaLoading] = useState(false);

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);

    try {
      const data = await playlistService.getMyPlaylists();

      setPlaylists(
        data.map((p: any) => ({
          playlistId: p.playlistId,
          title: p.title || p.name || "Playlist không tên",
          description: p.description,
          visibility: p.visibility || p.Visibility || "Private",
          trackCount: p.trackCount ?? 0,
          coverImageUrl: p.coverImageUrl || null,
        })),
      );
    } catch (error) {
      console.error("Lỗi tải playlist:", error);
      toast.error("Không thể tải playlist");
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  useEffect(() => {
    if (activeTab === "playlists") fetchPlaylists();
  }, [activeTab]);

  const handleSelectPlaylistCover = (file?: File | null) => {
    if (newPlaylistCoverPreview) {
      URL.revokeObjectURL(newPlaylistCoverPreview);
    }

    if (!file) {
      setNewPlaylistCoverFile(null);
      setNewPlaylistCoverPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    setNewPlaylistCoverFile(file);
    setNewPlaylistCoverPreview(URL.createObjectURL(file));
  };

  const handleSelectEditPlaylistCover = (file?: File | null) => {
    if (editPlaylistCoverPreview) {
      URL.revokeObjectURL(editPlaylistCoverPreview);
    }

    if (!file) {
      setEditPlaylistCoverFile(null);
      setEditPlaylistCoverPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh bìa tối đa 5MB");
      return;
    }

    setEditPlaylistCoverFile(file);
    setEditPlaylistCoverPreview(URL.createObjectURL(file));
  };

  const resetCreatePlaylistForm = () => {
    if (newPlaylistCoverPreview) {
      URL.revokeObjectURL(newPlaylistCoverPreview);
    }

    setShowCreateModal(false);
    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setNewPlaylistVisibility("Public");
    setNewPlaylistCoverFile(null);
    setNewPlaylistCoverPreview("");
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error("Tên playlist không được để trống");
      return;
    }

    try {
      await playlistService.createPlaylist({
        title: newPlaylistName.trim(),
        description: newPlaylistDesc.trim(),
        isPublic: newPlaylistVisibility === "Public",
        coverImageFile: newPlaylistCoverFile,
      });

      toast.success("Tạo playlist thành công!");
      resetCreatePlaylistForm();
      await fetchPlaylists();
    } catch (error) {
      console.error("Lỗi tạo playlist:", error);
      toast.error("Tạo playlist thất bại");
    }
  };

  const openEditPlaylistModal = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setEditPlaylistName(playlist.title);
    setEditPlaylistDesc(playlist.description || "");
    setEditPlaylistVisibility(
      playlist.visibility === "Public" ? "Public" : "Private",
    );
    setEditPlaylistCoverFile(null);
    setEditPlaylistCoverPreview("");
    setShowEditPlaylistModal(true);
  };

  const closeEditPlaylistModal = () => {
    setShowEditPlaylistModal(false);
    setEditingPlaylist(null);
    setEditPlaylistName("");
    setEditPlaylistDesc("");
    setEditPlaylistVisibility("Public");

    if (editPlaylistCoverPreview) {
      URL.revokeObjectURL(editPlaylistCoverPreview);
    }

    setEditPlaylistCoverFile(null);
    setEditPlaylistCoverPreview("");
  };

  const savePlaylistEdit = async () => {
    if (!editingPlaylist) return;

    if (!editPlaylistName.trim()) {
      toast.error("Tên playlist không được để trống");
      return;
    }

    setIsPlaylistSaving(true);

    try {
      await playlistService.updatePlaylist(editingPlaylist.playlistId, {
        title: editPlaylistName.trim(),
        description: editPlaylistDesc.trim(),
        visibility: editPlaylistVisibility,
        coverImageFile: editPlaylistCoverFile,
      });

      toast.success("Cập nhật playlist thành công");
      closeEditPlaylistModal();
      await fetchPlaylists();
    } catch (error) {
      console.error("Lỗi cập nhật playlist:", error);
      toast.error("Cập nhật playlist thất bại");
    } finally {
      setIsPlaylistSaving(false);
    }
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    setDeletingPlaylist(playlist);
  };

  const confirmDeletePlaylist = async () => {
    if (!deletingPlaylist) return;

    setDeletePlaylistLoading(true);

    try {
      await playlistService.deletePlaylist(deletingPlaylist.playlistId);

      setPlaylists((prev) =>
        prev.filter((item) => item.playlistId !== deletingPlaylist.playlistId),
      );

      toast.success("Xóa playlist thành công");
      setDeletingPlaylist(null);
    } catch (error) {
      console.error("Lỗi xóa playlist:", error);
      toast.error("Xóa playlist thất bại");
    } finally {
      setDeletePlaylistLoading(false);
    }
  };

  // ==================== MY UPLOADS ====================
  const [myUploads, setMyUploads] = useState<MediaItem[]>([]);
  const [loadingMyUploads, setLoadingMyUploads] = useState(false);

  const fetchMyUploads = async () => {
    setLoadingMyUploads(true);
    try {
      const data = await mediaService.getUserMedia(1, 100);
      setMyUploads(data);
    } catch {
      toast.error("Không thể tải danh sách bài hát");
    } finally {
      setLoadingMyUploads(false);
    }
  };

  useEffect(() => {
    if (activeTab === "my-uploads") fetchMyUploads();
  }, [activeTab]);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    artist: "",
    genre: "",
    description: "",
    visibility: "Public",
  });
  const [artistSuggestions, setArtistSuggestions] = useState<Artist[]>([]);
  const [editMediaCoverFile, setEditMediaCoverFile] = useState<File | null>(
    null,
  );
  const [editMediaCoverPreview, setEditMediaCoverPreview] = useState("");
  const [editMediaCoverCropTarget, setEditMediaCoverCropTarget] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = (media: MediaItem) => {
    setEditingMedia(media);
    setEditForm({
      title: media.title,
      artist: getSongArtists(media)
        .map((artist) => artist.name)
        .join(", "),
      genre: media.genre || "",
      description: "",
      visibility: media.visibility === "Private" ? "Private" : "Public",
    });
    setArtistSuggestions([]);
    setEditMediaCoverFile(null);
    setEditMediaCoverPreview(
      media.thumbnailUrl
        ? mediaService.getFullMediaUrl(media.thumbnailUrl)
        : "",
    );
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingMedia(null);
    setEditForm({
      title: "",
      artist: "",
      genre: "",
      description: "",
      visibility: "Public",
    });
    setArtistSuggestions([]);

    if (editMediaCoverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(editMediaCoverPreview);
    }

    if (editMediaCoverCropTarget?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(editMediaCoverCropTarget.previewUrl);
    }

    setEditMediaCoverFile(null);
    setEditMediaCoverPreview("");
    setEditMediaCoverCropTarget(null);
  };

  const handleSelectEditMediaCover = (file?: File | null) => {
    if (!file) {
      if (editMediaCoverPreview.startsWith("blob:")) {
        URL.revokeObjectURL(editMediaCoverPreview);
      }

      setEditMediaCoverFile(null);
      setEditMediaCoverPreview(
        editingMedia?.thumbnailUrl
          ? mediaService.getFullMediaUrl(editingMedia.thumbnailUrl)
          : "",
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ảnh bìa tối đa 10MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setEditMediaCoverCropTarget({ file, previewUrl });
  };

  const closeEditMediaCoverCrop = () => {
    if (editMediaCoverCropTarget?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(editMediaCoverCropTarget.previewUrl);
    }

    setEditMediaCoverCropTarget(null);
  };

  const applyEditMediaCoverCrop = (file: File, previewUrl: string) => {
    if (editMediaCoverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(editMediaCoverPreview);
    }

    if (editMediaCoverCropTarget?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(editMediaCoverCropTarget.previewUrl);
    }

    setEditMediaCoverFile(file);
    setEditMediaCoverPreview(previewUrl);
    setEditMediaCoverCropTarget(null);
  };

  const handleArtistSearch = async (keyword: string) => {
    setEditForm({ ...editForm, artist: keyword });
    if (keyword.length < 2) {
      setArtistSuggestions([]);
      return;
    }
    try {
      const results = await mediaService.searchArtists(keyword, 8);
      setArtistSuggestions(results);
    } catch {
      setArtistSuggestions([]);
    }
  };

  const selectArtist = (artist: Artist) => {
    setEditForm({ ...editForm, artist: artist.name });
    setArtistSuggestions([]);
  };

  const saveMediaEdit = async () => {
    if (!editingMedia) return;
    if (!editForm.title.trim()) {
      toast.error("Tên bài hát không được để trống");
      return;
    }

    setIsSaving(true);
    try {
      await mediaService.updateMedia(editingMedia.mediaItemId, {
        title: editForm.title.trim(),
        artist: editForm.artist.trim(),
        genre: editForm.genre,
        visibility: editForm.visibility,
        isPublic: editForm.visibility === "Public",
        thumbnailFile: editMediaCoverFile,
      });

      setMyUploads((prev) =>
        prev.map((item) =>
          item.mediaItemId === editingMedia.mediaItemId
            ? {
                ...item,
                title: editForm.title.trim(),
                artistName: editForm.artist.trim() || item.artistName,
                artists: splitArtistNames(editForm.artist).map(
                  (name, index) => ({
                    artistId: index === 0 ? item.artistId || 0 : 0,
                    name,
                    position: index,
                  }),
                ),
                genre: editForm.genre || item.genre,
              }
            : item,
        ),
      );

      await fetchMyUploads();
      toast.success("Cập nhật thành công");
      closeEditModal();
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (song: MediaItem) => {
    setDeletingMedia(song);
  };

  const confirmDeleteMedia = async () => {
    if (!deletingMedia) return;

    setDeleteMediaLoading(true);

    try {
      await mediaService.deleteMedia(deletingMedia.mediaItemId);

      setMyUploads((prev) =>
        prev.filter((item) => item.mediaItemId !== deletingMedia.mediaItemId),
      );

      toast.success("Xóa thành công");
      setDeletingMedia(null);
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeleteMediaLoading(false);
    }
  };

  const handlePlaySong = (song: MediaItem) => {
    const rawAudioUrl =
      song.audioUrl ||
      song.filePath ||
      mediaService.getStreamUrl(song.mediaItemId);

    const track = {
      id: song.mediaItemId,
      title: song.title,
      artist: getSongArtists(song)
        .map((artist) => artist.name)
        .join(", "),
      duration: song.durationSeconds ?? 0,
      thumbnailUrl: mediaService.getFullMediaUrl(song.thumbnailUrl),
      audioUrl: rawAudioUrl?.startsWith("http")
        ? rawAudioUrl
        : mediaService.getFullMediaUrl(rawAudioUrl),
      hasVideo: song.hasVideo || song.mediaType === "Video",
      videoUrl: song.videoUrl,
      lyrics: song.lyrics,
    };

    playTrack(track);
  };
  const requestRemoveFavorite = (song: MediaItem) => {
    setRemovingFavorite(song);
  };

  const confirmRemoveFavorite = async () => {
    if (!removingFavorite) return;

    setRemoveFavoriteLoading(true);

    try {
      await favoriteService.removeFromFavorite(removingFavorite.mediaItemId);

      setLikedSongs((prev) =>
        prev.filter(
          (item) => item.mediaItemId !== removingFavorite.mediaItemId,
        ),
      );

      toast.success("Đã bỏ khỏi bài hát đã thích");
      setRemovingFavorite(null);
    } catch (error) {
      console.error("Bỏ yêu thích lỗi:", error);
      toast.error("Bỏ yêu thích thất bại");
    } finally {
      setRemoveFavoriteLoading(false);
    }
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

      {/* Tabs */}
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
        <button
          onClick={() => setActiveTab("my-uploads")}
          className={`pb-3 font-semibold text-lg transition-all ${activeTab === "my-uploads" ? "text-white border-b-2 border-white" : "text-gray-400 hover:text-white"}`}
        >
          Bài hát của tôi
        </button>
      </div>

      {/* Tab Playlists */}
      {activeTab === "playlists" && (
        <>
          {loadingPlaylists ? (
            <p className="text-center py-8 text-gray-400">
              Đang tải playlist...
            </p>
          ) : playlists.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ListMusic size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl">Bạn chưa có playlist nào.</p>
              <p className="text-sm mt-2">Bấm “Tạo playlist mới” để bắt đầu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist.playlistId}
                  onClick={() => navigate(`/playlist/${playlist.playlistId}`)}
                  className="group relative bg-[#181818] p-4 rounded-2xl hover:bg-[#282828] transition-all cursor-pointer"
                >
                  <div className="absolute right-3 top-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPlaylistModal(playlist);
                      }}
                      className="p-2 rounded-full bg-black/60 text-white hover:bg-green-500 hover:text-black"
                      title="Sửa playlist"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist);
                      }}
                      className="p-2 rounded-full bg-black/60 text-red-400 hover:bg-red-500 hover:text-white"
                      title="Xóa playlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="aspect-square rounded-xl overflow-hidden bg-[#282828] mb-4">
                    {playlist.coverImageUrl ? (
                      <img
                        src={mediaService.getFullMediaUrl(
                          playlist.coverImageUrl,
                        )}
                        alt={playlist.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <PlaylistCoverFallback title={playlist.title} />
                    )}
                  </div>

                  <h3 className="font-bold text-lg truncate">
                    {playlist.title}
                  </h3>

                  {playlist.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {playlist.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-sm text-gray-400">
                      {playlist.trackCount ?? 0} bài hát
                    </p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        playlist.visibility === "Public"
                          ? "bg-green-500/15 text-green-400"
                          : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {playlist.visibility === "Public"
                        ? "Công khai"
                        : "Riêng tư"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab Bài hát của tôi */}
      {activeTab === "my-uploads" && (
        <div className="space-y-1">
          {loadingMyUploads ? (
            <p className="text-center py-8 text-gray-400">Đang tải...</p>
          ) : myUploads.length === 0 ? (
            <p className="text-center py-8 text-gray-400">
              Bạn chưa upload bài hát nào.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-12 border-b border-[#282828] px-4 py-2 text-sm text-gray-400">
                <div className="col-span-1">STT</div>
                <div className="col-span-6">TÊN BÀI HÁT</div>
                <div className="col-span-3 hidden md:block">
                  NGHỆ SĨ / ALBUM
                </div>
                <div className="col-span-5 text-right md:col-span-2">
                  THAO TÁC
                </div>
              </div>

              {myUploads.map((song, index) => (
                <div
                  key={song.mediaItemId}
                  className="group grid grid-cols-12 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-[#282828]"
                >
                  <div className="col-span-1 text-sm text-gray-400">
                    {index + 1}
                  </div>

                  <div
                    className="col-span-7 flex min-w-0 cursor-pointer items-center gap-4 md:col-span-6"
                    onClick={() => handlePlaySong(song)}
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-[#282828]">
                      {song.thumbnailUrl ? (
                        <img
                          src={mediaService.getFullMediaUrl(song.thumbnailUrl)}
                          alt={song.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-500">
                          ♪
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <Link
                        to={`/media/${song.mediaItemId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate font-medium hover:underline"
                      >
                        {song.title}
                      </Link>

                      <div className="md:hidden">
                        <MediaMetaLinks song={song} />
                        <MediaStats song={song} />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 hidden min-w-0 md:block">
                    <MediaMetaLinks song={song} />
                    <MediaStats song={song} />
                  </div>

                  <div className="col-span-4 flex justify-end gap-2 opacity-0 transition group-hover:opacity-100 md:col-span-2">
                    <button
                      onClick={() => openEditModal(song)}
                      className="rounded-full p-2 hover:bg-[#3a3a3a]"
                      title="Sửa"
                    >
                      <Edit3 size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(song)}
                      className="rounded-full p-2 text-red-500 hover:bg-red-600/20"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>

                    <SongMenu media={song as any} />

                    {song.hasVideo || song.mediaType === "Video" ? (
                      <button
                        onClick={() => navigate(`/video/${song.mediaItemId}`)}
                        className="rounded-full bg-green-500 px-3 py-1 text-xs text-black hover:bg-green-400"
                      >
                        Xem
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs hover:bg-green-500"
                      >
                        <Play size={14} /> Phát
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Tab Liked */}
      {activeTab === "liked" && (
        <div className="space-y-1">
          {loadingLikedSongs ? (
            <p className="text-center py-8 text-gray-400">
              Đang tải bài hát đã thích...
            </p>
          ) : likedSongs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Heart size={52} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl font-semibold text-white">
                Chưa có bài hát đã thích
              </p>
              <p className="mt-2 text-sm">
                Bấm biểu tượng trái tim ở bài hát để lưu vào đây.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 px-4 py-2 text-sm text-gray-400 border-b border-[#282828]">
                <div className="col-span-1">STT</div>
                <div className="col-span-5">TÊN BÀI HÁT</div>
                <div className="col-span-3 hidden md:block">NGHỆ SĨ</div>
                <div className="col-span-3 text-right">THAO TÁC</div>
              </div>

              {likedSongs.map((song, index) => (
                <div
                  key={song.mediaItemId}
                  className="grid grid-cols-12 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-[#282828] group"
                >
                  <div className="col-span-1 text-sm text-gray-400">
                    {index + 1}
                  </div>

                  <div
                    onClick={() => handlePlaySong(song)}
                    className="col-span-7 md:col-span-5 flex min-w-0 cursor-pointer items-center gap-4"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-[#282828]">
                      {song.thumbnailUrl ? (
                        <img
                          src={mediaService.getFullMediaUrl(song.thumbnailUrl)}
                          alt={song.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-500">
                          ♪
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <Link
                        to={`/media/${song.mediaItemId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="truncate font-semibold text-white hover:underline block"
                      >
                        {song.title}
                      </Link>
                      <div className="md:hidden">
                        <MediaMetaLinks song={song} />
                        <MediaStats song={song} />
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 hidden md:block truncate text-gray-400">
                    <MediaMetaLinks song={song} />
                    <MediaStats song={song} />
                  </div>

                  <div className="col-span-4 md:col-span-3 flex justify-end gap-2">
                    {song.hasVideo || song.mediaType === "Video" ? (
                      <button
                        onClick={() => navigate(`/video/${song.mediaItemId}`)}
                        className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-black hover:bg-green-400"
                      >
                        Xem
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold hover:bg-green-500"
                      >
                        Phát
                      </button>
                    )}

                    <SongMenu media={song as any} />

                    <button
                      onClick={() => requestRemoveFavorite(song)}
                      className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/20"
                    >
                      Bỏ thích
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
      <ConfirmModal
        isOpen={Boolean(removingFavorite)}
        title="Bỏ khỏi bài hát đã thích?"
        message={
          removingFavorite
            ? `"${removingFavorite.title}" sẽ được gỡ khỏi danh sách yêu thích của bạn.`
            : ""
        }
        confirmText="Bỏ thích"
        cancelText="Giữ lại"
        variant="danger"
        loading={removeFavoriteLoading}
        onConfirm={confirmRemoveFavorite}
        onClose={() => setRemovingFavorite(null)}
      />

      {/* Edit Modal */}
      {showEditModal && editingMedia && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#181818] p-6">
            <button onClick={closeEditModal} className="absolute top-4 right-4">
              <X size={22} />
            </button>
            <h3 className="text-xl font-semibold mb-6">Chỉnh sửa bài hát</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  Tên bài hát
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Ảnh bìa media
                </label>

                <label className="group relative flex min-h-[170px] cursor-pointer overflow-hidden rounded-2xl border border-dashed border-[#555] bg-[#111] transition hover:border-green-500">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleSelectEditMediaCover(e.target.files?.[0])
                    }
                    className="hidden"
                  />

                  {editMediaCoverPreview ? (
                    <img
                      src={editMediaCoverPreview}
                      alt="Media cover preview"
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <ImagePlus size={42} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

                  <div className="relative z-10 mt-auto flex w-full items-end justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-bold text-white">
                        {editMediaCoverPreview ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
                      </p>
                      <p className="mt-1 truncate text-sm text-gray-300">
                        {editMediaCoverFile?.name ||
                          "Kéo ảnh để căn vị trí trước khi lưu"}
                      </p>
                    </div>

                    {editMediaCoverFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectEditMediaCover(null);
                        }}
                        className="shrink-0 rounded-full bg-black/50 p-2 text-gray-200 transition hover:bg-red-500 hover:text-white"
                        title="Bỏ ảnh đã chọn"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </label>
              </div>

              <div className="relative">
                <label className="text-sm text-gray-400 block mb-1">
                  Nghệ sĩ
                </label>
                <input
                  type="text"
                  value={editForm.artist}
                  onChange={(e) => handleArtistSearch(e.target.value)}
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl"
                  placeholder="Tìm hoặc nhập tên nghệ sĩ"
                />
                {artistSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-[#282828] border border-[#3a3a3a] rounded-xl max-h-48 overflow-auto">
                    {artistSuggestions.map((artist) => (
                      <div
                        key={artist.artistId}
                        onClick={() => selectArtist(artist)}
                        className="px-4 py-2 hover:bg-[#3a3a3a] cursor-pointer"
                      >
                        {artist.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  Thể loại
                </label>
                <select
                  value={editForm.genre}
                  onChange={(e) =>
                    setEditForm({ ...editForm, genre: e.target.value })
                  }
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl"
                >
                  <option value="">Chưa phân loại</option>
                  {GENRES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  Trạng thái hiển thị
                </label>
                <select
                  value={editForm.visibility}
                  onChange={(e) =>
                    setEditForm({ ...editForm, visibility: e.target.value })
                  }
                  className="w-full bg-[#282828] px-4 py-3 rounded-xl"
                >
                  <option value="Public">Công khai - hiện ở HomePage</option>
                  <option value="Private">Riêng tư - chỉ mình tôi thấy</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={closeEditModal}
                className="flex-1 py-3 rounded-full bg-[#282828] hover:bg-[#3a3a3a]"
              >
                Hủy
              </button>
              <button
                onClick={saveMediaEdit}
                disabled={isSaving}
                className="flex-1 py-3 rounded-full bg-green-500 hover:bg-green-400 text-black font-semibold disabled:opacity-70"
              >
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editMediaCoverCropTarget && (
        <ImageAdjustModal
          imageUrl={editMediaCoverCropTarget.previewUrl}
          fileName={editMediaCoverCropTarget.file.name}
          variant="square"
          title="Chỉnh ảnh bìa media"
          description="Kéo trực tiếp ảnh để căn vị trí ảnh bìa trước khi lưu."
          onClose={closeEditMediaCoverCrop}
          onApply={applyEditMediaCoverCrop}
        />
      )}

      {/* Edit Playlist Modal */}
      {showEditPlaylistModal && editingPlaylist && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#181818] p-6">
            <button
              onClick={closeEditPlaylistModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={22} />
            </button>

            <h3 className="text-xl font-semibold mb-4">Sửa playlist</h3>

            <input
              type="text"
              value={editPlaylistName}
              onChange={(e) => setEditPlaylistName(e.target.value)}
              placeholder="Tên playlist"
              className="w-full bg-[#282828] px-4 py-3 rounded-xl mb-3"
            />

            <textarea
              value={editPlaylistDesc}
              onChange={(e) => setEditPlaylistDesc(e.target.value)}
              placeholder="Mô tả"
              className="w-full bg-[#282828] px-4 py-3 rounded-xl h-24 mb-3"
            />

            <select
              value={editPlaylistVisibility}
              onChange={(e) =>
                setEditPlaylistVisibility(
                  e.target.value as "Public" | "Private",
                )
              }
              className="mb-4 w-full rounded-xl bg-[#282828] px-4 py-3 text-white outline-none"
            >
              <option value="Public">Công khai</option>
              <option value="Private">Riêng tư</option>
            </select>

            <div className="mb-6">
              <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#555] bg-[#222] px-4 py-3 text-sm text-gray-300 transition hover:border-green-500 hover:text-white">
                <ImagePlus size={18} />
                Thay đổi ảnh bìa
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleSelectEditPlaylistCover(e.target.files?.[0])
                  }
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#282828]">
                  {editPlaylistCoverPreview ? (
                    <img
                      src={editPlaylistCoverPreview}
                      alt="Playlist cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : editingPlaylist.coverImageUrl ? (
                    <img
                      src={mediaService.getFullMediaUrl(
                        editingPlaylist.coverImageUrl,
                      )}
                      alt={editingPlaylist.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PlaylistCoverFallback
                      title={editPlaylistName || "Playlist"}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-400">
                    Chọn ảnh mới nếu bạn muốn thay ảnh bìa playlist.
                  </p>

                  {editPlaylistCoverFile && (
                    <button
                      type="button"
                      onClick={() => handleSelectEditPlaylistCover(null)}
                      className="mt-2 text-sm text-red-400 hover:text-red-300"
                    >
                      Bỏ ảnh vừa chọn
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeEditPlaylistModal}
                className="flex-1 py-3 rounded-full bg-[#282828] hover:bg-[#3a3a3a]"
              >
                Hủy
              </button>
              <button
                onClick={savePlaylistEdit}
                disabled={isPlaylistSaving}
                className="flex-1 py-3 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400 disabled:opacity-70"
              >
                {isPlaylistSaving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingPlaylist)}
        title="Xóa playlist?"
        message={
          deletingPlaylist
            ? `Playlist "${deletingPlaylist.title}" sẽ bị xóa khỏi thư viện. Các bài hát chỉ bị gỡ khỏi playlist, không xóa file nhạc.`
            : ""
        }
        confirmText="Xóa playlist"
        cancelText="Giữ lại"
        variant="danger"
        loading={deletePlaylistLoading}
        onConfirm={confirmDeletePlaylist}
        onClose={() => setDeletingPlaylist(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deletingMedia)}
        title="Xóa bài hát?"
        message={
          deletingMedia
            ? `"${deletingMedia.title}" sẽ bị xóa khỏi hệ thống của bạn.`
            : ""
        }
        confirmText="Xóa bài hát"
        cancelText="Hủy"
        variant="danger"
        loading={deleteMediaLoading}
        onConfirm={confirmDeleteMedia}
        onClose={() => setDeletingMedia(null)}
      />

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Tạo playlist mới</h3>

            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Tên playlist"
              className="w-full bg-[#282828] px-4 py-3 rounded-xl mb-3"
            />

            <textarea
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              placeholder="Mô tả"
              className="w-full bg-[#282828] px-4 py-3 rounded-xl h-20 mb-3"
            />

            <select
              value={newPlaylistVisibility}
              onChange={(e) =>
                setNewPlaylistVisibility(e.target.value as "Public" | "Private")
              }
              className="mb-4 w-full rounded-xl bg-[#282828] px-4 py-3 text-white outline-none"
            >
              <option value="Public">Công khai</option>
              <option value="Private">Riêng tư</option>
            </select>

            <div className="mb-6">
              <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#555] bg-[#222] px-4 py-3 text-sm text-gray-300 transition hover:border-green-500 hover:text-white">
                <ImagePlus size={18} />
                Chọn ảnh bìa
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleSelectPlaylistCover(e.target.files?.[0])
                  }
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#282828] shrink-0">
                  {newPlaylistCoverPreview ? (
                    <img
                      src={newPlaylistCoverPreview}
                      alt="Playlist cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlaylistCoverFallback
                      title={newPlaylistName || "Playlist"}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-400">
                    Không chọn ảnh bìa thì TuneVault sẽ dùng ảnh bìa mặc định.
                  </p>

                  {newPlaylistCoverFile && (
                    <button
                      onClick={() => handleSelectPlaylistCover(null)}
                      className="mt-2 text-sm text-red-400 hover:text-red-300"
                    >
                      Bỏ ảnh đã chọn
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetCreatePlaylistForm}
                className="flex-1 py-3 rounded-full bg-[#282828]"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 py-3 rounded-full bg-green-500 text-black font-semibold hover:bg-green-400"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
