import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Edit3,
  ImagePlus,
  ListMusic,
  Plus,
  Play,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { albumService } from "../../api/albumService";
import { mediaService } from "../../api";
import type { AlbumDetailDto, MediaItemDto } from "../../api/types/media";
import { formatCount, formatDuration } from "../../utils/formatCount";
import { usePlayerStore } from "../../stores/playerStore";
import SongMenu from "../../components/media/SongMenu";
import ImageAdjustModal from "../../components/common/ImageAdjustModal";

const ALBUM_TYPES = ["Single", "EP", "Album", "Compilation"];

const toImageUrl = (url?: string | null) => {
  if (!url) return "";
  return mediaService.getFullMediaUrl(url);
};

const toAudioUrl = (song: MediaItemDto) => {
  const raw =
    song.audioUrl ||
    (song as any).audioFilePath ||
    song.filePath ||
    mediaService.getStreamUrl(song.mediaItemId);

  return raw?.startsWith("http") ? raw : mediaService.getFullMediaUrl(raw);
};

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const playSong = (
  song: MediaItemDto,
  playTrack: (track: any, queue?: any[]) => void,
  queue?: MediaItemDto[],
) => {
  const tracks = (queue || [song]).map((item) => ({
    id: item.mediaItemId,
    title: item.title,
    artist: item.artistName || "Unknown Artist",
    duration: item.durationSeconds || 0,
    thumbnailUrl: toImageUrl(item.thumbnailUrl),
    audioUrl: toAudioUrl(item),
    hasVideo: item.hasVideo,
    videoUrl: item.videoUrl,
    lyrics: item.lyrics,
  }));

  const current =
    tracks.find((item) => item.id === song.mediaItemId) || tracks[0];

  playTrack(current, tracks);
};

const AlbumCover = ({ album }: { album: AlbumDetailDto }) => {
  const [imageError, setImageError] = useState(false);
  const coverUrl = toImageUrl(album.coverImageUrl);

  if (!coverUrl || imageError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#3a3a3a] via-[#252525] to-[#151515]">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-black/30">
          <ListMusic size={44} className="text-green-400" />
        </div>

        <p className="px-6 text-center text-2xl font-black text-white">
          {album.title}
        </p>

        <p className="mt-2 text-sm font-semibold text-gray-300">
          {album.artistName}
        </p>
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={album.title}
      className="h-full w-full object-cover"
      onError={() => setImageError(true)}
    />
  );
};

const TrackCover = ({ song }: { song: MediaItemDto }) => {
  const [imageError, setImageError] = useState(false);

  if (!song.thumbnailUrl || imageError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#2a2a2a]">
        <ListMusic size={22} className="text-green-400" />
      </div>
    );
  }

  return (
    <img
      src={toImageUrl(song.thumbnailUrl)}
      alt={song.title}
      className="h-full w-full object-cover"
      onError={() => setImageError(true)}
    />
  );
};

const AlbumCoverPicker = ({
  file,
  previewUrl,
  onChange,
}: {
  file: File | null;
  previewUrl: string;
  onChange: (file: File | null) => void;
}) => {
  return (
    <label className="group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#333] bg-[#111] p-5 text-center transition hover:border-green-500/70 hover:bg-green-500/5">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="hidden"
      />

      {previewUrl ? (
        <>
          <img
            src={previewUrl}
            alt="Album cover preview"
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          {file && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-3 top-3 z-20 rounded-full bg-black/60 p-2 text-white shadow-lg transition hover:bg-red-500"
              title="Xóa ảnh đã chọn"
            >
              <X size={18} />
            </button>
          )}
        </>
      ) : (
        <div className="relative z-10 mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#282828] text-gray-300 transition group-hover:bg-green-500/15 group-hover:text-green-400">
          <ImagePlus size={27} />
        </div>
      )}

      <div className="relative z-10">
        <p className="font-semibold text-gray-100">
          {previewUrl ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
        </p>
        <p className="mt-1 max-w-[250px] truncate text-sm text-gray-400">
          {file?.name || "JPG, PNG, WEBP hoặc GIF"}
        </p>
      </div>
    </label>
  );
};

const EditAlbumModal = ({
  album,
  onClose,
  onSaved,
}: {
  album: AlbumDetailDto;
  onClose: () => void;
  onSaved: (album: AlbumDetailDto) => void;
}) => {
  const [title, setTitle] = useState(album.title || "");
  const [artist, setArtist] = useState(album.artistName || "");
  const [description, setDescription] = useState(album.description || "");
  const [releaseDate, setReleaseDate] = useState(
    toDateInputValue(album.releaseDate),
  );
  const [albumType, setAlbumType] = useState(album.albumType || "Album");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(
    toImageUrl(album.coverImageUrl),
  );
  const [coverCropTarget, setCoverCropTarget] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrl);
      }

      if (coverCropTarget?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverCropTarget.previewUrl);
      }
    };
  }, [coverPreviewUrl, coverCropTarget]);

  const handleCoverChange = (file: File | null) => {
    if (!file) {
      if (coverPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrl);
      }

      setCoverFile(null);
      setCoverPreviewUrl(toImageUrl(album.coverImageUrl));
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCoverCropTarget({ file, previewUrl });
  };

  const closeCoverCrop = () => {
    if (coverCropTarget?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverCropTarget.previewUrl);
    }

    setCoverCropTarget(null);
  };

  const applyCoverCrop = (file: File, previewUrl: string) => {
    if (coverPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    if (coverCropTarget?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverCropTarget.previewUrl);
    }

    setCoverFile(file);
    setCoverPreviewUrl(previewUrl);
    setCoverCropTarget(null);
  };

  const save = async () => {
    if (!title.trim()) {
      toast.error("Tên album không được để trống");
      return;
    }

    setSaving(true);

    try {
      const updated = await albumService.updateAlbum(album.albumId, {
        artist: artist.trim(),
        title: title.trim(),
        description,
        releaseDate,
        albumType,
        coverImageFile: coverFile,
      });

      onSaved(updated);
      toast.success("Đã cập nhật album");
      onClose();
    } catch (error: any) {
      console.error("Update album error:", error);
      toast.error(error.response?.data?.message || "Cập nhật album thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-[#333] bg-[#181818] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Chỉnh sửa album</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-[#282828] hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Tên album
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ví dụ: HIEUTHUHAI Collection"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Nghệ sĩ album
            </label>
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full rounded-2xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ví dụ: ĐÀO TỬ A1J"
            />
            <p className="mt-1 text-xs text-gray-500">
              Nếu nhập nghệ sĩ chưa có, hệ thống sẽ tự tạo nghệ sĩ mới.
            </p>
          </div>

          <AlbumCoverPicker
            file={coverFile}
            previewUrl={coverPreviewUrl}
            onChange={handleCoverChange}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Loại album
              </label>
              <select
                value={albumType}
                onChange={(e) => setAlbumType(e.target.value)}
                className="w-full rounded-2xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
              >
                {ALBUM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Ngày phát hành
              </label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full rounded-2xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-28 w-full rounded-2xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Mô tả ngắn về album..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full bg-[#282828] px-5 py-3 font-semibold text-white transition hover:bg-[#333]"
          >
            Hủy
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 font-bold text-black transition hover:bg-green-400 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {coverCropTarget && (
        <ImageAdjustModal
          imageUrl={coverCropTarget.previewUrl}
          fileName={coverCropTarget.file.name}
          variant="square"
          title="Chỉnh ảnh bìa album"
          description="Kéo trực tiếp ảnh để căn vị trí ảnh bìa album trước khi lưu."
          onClose={closeCoverCrop}
          onApply={applyCoverCrop}
        />
      )}
    </div>
  );
};

const AddTrackModal = ({
  album,
  tracks,
  onClose,
  onAdded,
}: {
  album: AlbumDetailDto;
  tracks: MediaItemDto[];
  onClose: () => void;
  onAdded: () => void;
}) => {
  const [songs, setSongs] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);

    mediaService
      .getUserMedia(1, 100)
      .then((data: MediaItemDto[]) => setSongs(data || []))
      .catch((error: any) => {
        console.error("Load user media error:", error);
        toast.error("Không tải được bài hát của bạn");
      })
      .finally(() => setLoading(false));
  }, []);

  const existingIds = useMemo(
    () => new Set(tracks.map((track) => track.mediaItemId)),
    [tracks],
  );

  const candidateSongs = songs.filter(
    (song) =>
      song.artistId === album.artistId && !existingIds.has(song.mediaItemId),
  );

  const addTrack = async (song: MediaItemDto) => {
    setAddingId(song.mediaItemId);

    try {
      await albumService.addTrackToAlbum(album.albumId, song.mediaItemId);
      toast.success(`Đã thêm "${song.title}" vào album`);
      onAdded();
    } catch (error: any) {
      console.error("Add track to album error:", error);
      toast.error(error.response?.data?.message || "Thêm bài hát thất bại");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-[#333] bg-[#181818] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              Thêm bài hát vào album
            </h2>
            <p className="text-sm text-gray-400">
              Chỉ hiển thị bài hát cùng nghệ sĩ {album.artistName}.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-[#282828] hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-[#202020] p-8 text-center text-gray-400">
            Đang tải bài hát...
          </div>
        ) : candidateSongs.length === 0 ? (
          <div className="rounded-2xl bg-[#202020] p-8 text-center text-gray-400">
            Không còn bài hát phù hợp để thêm vào album này.
          </div>
        ) : (
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {candidateSongs.map((song) => (
              <div
                key={song.mediaItemId}
                className="flex items-center gap-3 rounded-2xl bg-[#202020] p-3"
              >
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#282828]">
                  <TrackCover song={song} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white">{song.title}</p>
                  <p className="truncate text-sm text-gray-400">
                    {formatCount(song.playCount)} lượt nghe ·{" "}
                    {formatDuration(song.durationSeconds)}
                  </p>
                </div>

                <button
                  onClick={() => addTrack(song)}
                  disabled={addingId === song.mediaItemId}
                  className="rounded-full bg-green-500 px-4 py-2 font-bold text-black transition hover:bg-green-400 disabled:opacity-60"
                >
                  {addingId === song.mediaItemId ? "Đang thêm..." : "Thêm"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AlbumDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playTrack = usePlayerStore((state) => state.playTrack);

  const [album, setAlbum] = useState<AlbumDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAlbum = async () => {
    const albumId = Number(id);

    if (!albumId) {
      navigate("/home");
      return;
    }

    setLoading(true);

    try {
      const data = await albumService.getAlbumById(albumId);
      setAlbum(data);
    } catch (error) {
      console.error("Load album error:", error);
      setAlbum(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbum();
  }, [id]);

  if (loading)
    return <div className="p-8 text-gray-400">Đang tải album...</div>;

  if (!album) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>
        <h1 className="text-3xl font-bold text-white">Không tìm thấy album</h1>
      </div>
    );
  }

  const tracks = album.tracks || [];

  const handlePlayAlbum = () => {
    if (tracks.length === 0) return;
    playSong(tracks[0], playTrack, tracks);
  };

  const removeTrack = async (song: MediaItemDto) => {
    if (!window.confirm(`Xóa "${song.title}" khỏi album này?`)) return;

    setRemovingId(song.mediaItemId);

    try {
      await albumService.removeTrackFromAlbum(album.albumId, song.mediaItemId);
      setAlbum({
        ...album,
        tracks: tracks.filter(
          (track) => track.mediaItemId !== song.mediaItemId,
        ),
        trackCount: Math.max(0, album.trackCount - 1),
      });
      toast.success("Đã xóa bài hát khỏi album");
    } catch (error: any) {
      console.error("Remove track error:", error);
      toast.error(error.response?.data?.message || "Xóa bài hát thất bại");
    } finally {
      setRemovingId(null);
    }
  };

  const deleteAlbum = async () => {
    if (
      !window.confirm(`Xóa album "${album.title}"? Bài hát sẽ không bị xóa.`)
    ) {
      return;
    }

    setDeleting(true);

    try {
      await albumService.deleteAlbum(album.albumId);
      toast.success("Đã xóa album");
      navigate(`/artist/${album.artistId}`);
    } catch (error: any) {
      console.error("Delete album error:", error);
      toast.error(error.response?.data?.message || "Xóa album thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const releaseYear = album.releaseDate
    ? new Date(album.releaseDate).getFullYear()
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"
      >
        <ArrowLeft size={20} /> Quay lại
      </button>

      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#333] via-[#1d1d1d] to-[#111] p-6 shadow-2xl md:p-10">
        <div className="flex flex-col gap-7 md:flex-row md:items-end">
          <div className="aspect-square w-full max-w-[270px] overflow-hidden rounded-3xl bg-[#282828] shadow-2xl">
            <AlbumCover album={album} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.35em] text-gray-300">
              {album.albumType || "Album"}
            </p>

            <h1 className="break-words text-5xl font-black text-white md:text-7xl">
              {album.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-gray-300">
              <Link
                to={`/artist/${album.artistId}`}
                className="font-bold text-white hover:text-green-400 hover:underline"
              >
                {album.artistName}
              </Link>
              {releaseYear && <span>• {releaseYear}</span>}
              <span>• {album.trackCount} bài hát</span>
              <span>• {formatCount(album.totalPlayCount)} lượt nghe</span>
              <span>• {formatCount(album.totalLikeCount)} thích</span>
            </div>

            {album.description && (
              <p className="mt-4 max-w-2xl text-gray-400">
                {album.description}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={handlePlayAlbum}
                disabled={tracks.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:opacity-50"
              >
                <Play size={20} className="opacity-90" fill="currentColor" />
                Phát album
              </button>

              {album.canEdit && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-black transition hover:bg-gray-200"
                >
                  <Edit3 size={18} />
                  Chỉnh sửa
                </button>
              )}

              {album.canManageTracks && (
                <button
                  onClick={() => setShowAddTrackModal(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#282828] px-5 py-3 font-bold text-white transition hover:bg-[#333]"
                >
                  <Plus size={18} />
                  Thêm bài hát
                </button>
              )}

              {album.canDelete && (
                <button
                  onClick={deleteAlbum}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-5 py-3 font-bold text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-60"
                >
                  <Trash2 size={18} />
                  {deleting ? "Đang xóa..." : "Xóa album"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-3xl font-black text-white">Danh sách bài hát</h2>
          {album.canManageTracks && (
            <button
              onClick={() => setShowAddTrackModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 font-bold text-black transition hover:bg-green-400"
            >
              <Plus size={17} /> Thêm
            </button>
          )}
        </div>

        {tracks.length === 0 ? (
          <div className="rounded-3xl bg-[#181818] p-8 text-center text-gray-400">
            Album chưa có bài hát nào.
          </div>
        ) : (
          <div className="space-y-2">
            {tracks.map((song, index) => (
              <div
                key={song.mediaItemId}
                className="group flex items-center gap-4 rounded-2xl bg-[#181818] p-3 transition hover:bg-[#242424]"
              >
                <span className="w-6 text-center text-sm text-gray-500">
                  {index + 1}
                </span>

                <button
                  onClick={() => playSong(song, playTrack, tracks)}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#282828]"
                >
                  <TrackCover song={song} />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <Play size={22} />
                  </span>
                </button>

                <div className="min-w-0 flex-1">
                  <Link
                    to={`/media/${song.mediaItemId}`}
                    className="block truncate font-bold text-white hover:text-green-400 hover:underline"
                  >
                    {song.title}
                  </Link>
                  <p className="truncate text-sm text-gray-400">
                    {formatCount(song.playCount)} lượt nghe ·{" "}
                    {formatCount(song.likeCount)} thích ·{" "}
                    {formatDuration(song.durationSeconds)}
                  </p>
                </div>

                <SongMenu media={song} />

                {album.canManageTracks && (
                  <button
                    onClick={() => removeTrack(song)}
                    disabled={removingId === song.mediaItemId}
                    className="rounded-full p-2 text-gray-400 transition hover:bg-red-500/15 hover:text-red-400 disabled:opacity-60"
                    title="Xóa khỏi album"
                  >
                    <X size={19} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {showEditModal && (
        <EditAlbumModal
          album={album}
          onClose={() => setShowEditModal(false)}
          onSaved={setAlbum}
        />
      )}

      {showAddTrackModal && (
        <AddTrackModal
          album={album}
          tracks={tracks}
          onClose={() => setShowAddTrackModal(false)}
          onAdded={loadAlbum}
        />
      )}
    </div>
  );
};

export default AlbumDetailPage;
