import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Disc3,
  Edit3,
  ImagePlus,
  Move,
  Plus,
  Play,
  Save,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { artistService } from "../../api/artistService";
import { albumService } from "../../api/albumService";
import { mediaService } from "../../api";
import type {
  ArtistDetailDto,
  ArtistManagerDto,
  ArtistManagerRole,
  MediaItemDto,
} from "../../api/types/media";
import { formatCount, formatDuration } from "../../utils/formatCount";
import { usePlayerStore } from "../../stores/playerStore";
import SongMenu from "../../components/media/SongMenu";

const toImageUrl = (url?: string | null) => {
  if (!url) return "";
  return mediaService.getFullMediaUrl(url);
};

const toAudioUrl = (song: MediaItemDto) => {
  const raw =
    song.audioUrl ||
    song.filePath ||
    mediaService.getStreamUrl(song.mediaItemId);
  return raw?.startsWith("http") ? raw : mediaService.getFullMediaUrl(raw);
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

const managerRoleOptions: ArtistManagerRole[] = ["Owner", "Editor", "Viewer"];

type CropTargetType = "avatar" | "cover";

const loadImageForCanvas = (imageUrl: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imageUrl;
  });
};

const createAdjustedImageFile = async ({
  imageUrl,
  fileName,
  variant,
  zoom,
  positionX,
  positionY,
  viewportWidth,
  viewportHeight,
}: {
  imageUrl: string;
  fileName: string;
  variant: CropTargetType;
  zoom: number;
  positionX: number;
  positionY: number;
  viewportWidth: number;
  viewportHeight: number;
}) => {
  const image = await loadImageForCanvas(imageUrl);

  const outputWidth = variant === "avatar" ? 900 : 1600;
  const outputHeight = variant === "avatar" ? 900 : 500;

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Không thể xử lý ảnh.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const baseScale = Math.max(
    outputWidth / image.naturalWidth,
    outputHeight / image.naturalHeight,
  );

  const scale = baseScale * zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;

  const scaleX = viewportWidth > 0 ? outputWidth / viewportWidth : 1;
  const scaleY = viewportHeight > 0 ? outputHeight / viewportHeight : 1;

  const drawX = (outputWidth - drawWidth) / 2 + positionX * scaleX;
  const drawY = (outputHeight - drawHeight) / 2 + positionY * scaleY;

  if (variant === "avatar") {
    context.save();
    context.beginPath();
    context.arc(
      outputWidth / 2,
      outputHeight / 2,
      outputWidth / 2,
      0,
      Math.PI * 2,
    );
    context.clip();
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    context.restore();
  } else {
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Không thể tạo ảnh đã chỉnh."));
          return;
        }

        resolve(result);
      },
      "image/jpeg",
      0.92,
    );
  });

  const safeName = fileName.replace(/\.[^/.]+$/, "");
  const outputName = `${safeName}-${variant}-cropped.jpg`;

  return new File([blob], outputName, { type: "image/jpeg" });
};

const ImageAdjustModal = ({
  imageUrl,
  fileName,
  variant,
  onClose,
  onApply,
}: {
  imageUrl: string;
  fileName: string;
  variant: CropTargetType;
  onClose: () => void;
  onApply: (file: File, previewUrl: string) => void;
}) => {
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    imageX: 0,
    imageY: 0,
  });

  const [zoom, setZoom] = useState(1.15);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const isAvatar = variant === "avatar";

  const resetPosition = () => {
    setZoom(1.15);
    setPositionX(0);
    setPositionY(0);
  };

  const clampPosition = (value: number) => {
    return Math.max(-220, Math.min(220, value));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      imageX: positionX,
      imageY: positionY,
    };

    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = event.clientX - dragStartRef.current.pointerX;
    const deltaY = event.clientY - dragStartRef.current.pointerY;

    setPositionX(clampPosition(dragStartRef.current.imageX + deltaX));
    setPositionY(clampPosition(dragStartRef.current.imageY + deltaY));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Bỏ qua nếu pointer đã được release bởi trình duyệt.
    }
  };

  const applyCrop = async () => {
    setIsApplying(true);

    try {
      const cropBox = cropBoxRef.current;

      const croppedFile = await createAdjustedImageFile({
        imageUrl,
        fileName,
        variant,
        zoom,
        positionX,
        positionY,
        viewportWidth: cropBox?.clientWidth || 1,
        viewportHeight: cropBox?.clientHeight || 1,
      });

      const previewUrl = URL.createObjectURL(croppedFile);
      onApply(croppedFile, previewUrl);
    } catch (error) {
      console.error("Crop image error:", error);
      toast.error("Không thể chỉnh ảnh này.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#333] bg-[#181818] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">
              {isAvatar ? "Chỉnh ảnh đại diện" : "Chỉnh ảnh bìa"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Kéo trực tiếp ảnh để căn vị trí, dùng thanh phóng to để khớp với
              khung trước khi lưu.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-[#282828] hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div
          ref={cropBoxRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative mx-auto touch-none select-none overflow-hidden border-2 border-green-500/40 bg-black shadow-2xl ${"cursor-move"} ${
            isAvatar
              ? "aspect-square w-full max-w-[360px] rounded-full"
              : "aspect-[16/5] w-full rounded-3xl"
          }`}
          title="Kéo trực tiếp ảnh để căn vị trí"
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="pointer-events-none h-full w-full object-cover"
            style={{
              transform: `translate(${positionX}px, ${positionY}px) scale(${zoom})`,
              transformOrigin: "center",
            }}
          />

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:33.333%_33.333%]" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-white/15" />

          <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
            <Move size={16} />
            Kéo ảnh
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl bg-[#202020] p-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-300">Phóng to</span>
              <span className="text-gray-500">{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={resetPosition}
            className="rounded-full bg-[#282828] px-5 py-3 font-semibold text-white transition hover:bg-[#333]"
          >
            Reset ảnh
          </button>

          <button
            onClick={onClose}
            className="rounded-full bg-[#282828] px-5 py-3 font-semibold text-white transition hover:bg-[#333]"
          >
            Hủy
          </button>

          <button
            onClick={applyCrop}
            disabled={isApplying}
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 font-bold text-black transition hover:bg-green-400 disabled:opacity-60"
          >
            <Save size={18} />
            {isApplying ? "Đang xử lý..." : "Áp dụng ảnh"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ArtistImagePreviewBox = ({
  title,
  subtitle,
  file,
  previewUrl,
  variant,
  onChange,
}: {
  title: string;
  subtitle: string;
  file: File | null;
  previewUrl?: string;
  variant: "avatar" | "cover";
  onChange: (file: File | null) => void;
}) => {
  const hasSelectedFile = Boolean(file);
  const hasPreview = Boolean(previewUrl);

  return (
    <label className="group relative flex min-h-[170px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#333] bg-[#111] p-5 text-center transition hover:border-green-500/70 hover:bg-green-500/5">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="hidden"
      />

      {hasPreview ? (
        <>
          {variant === "cover" ? (
            <img
              src={previewUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="relative z-10 mb-3 h-24 w-24 overflow-hidden rounded-full border-4 border-[#333] bg-[#282828] shadow-xl">
              <img
                src={previewUrl}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {variant === "cover" && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
          )}

          {hasSelectedFile && (
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
          <Camera size={26} />
        </div>
      )}

      <div className="relative z-10">
        <p className="font-semibold text-gray-100">{title}</p>
        <p className="mt-1 max-w-[220px] truncate text-sm text-gray-400">
          {file?.name || subtitle}
        </p>
      </div>
    </label>
  );
};

const EditArtistModal = ({
  artist,
  onClose,
  onSaved,
}: {
  artist: ArtistDetailDto;
  onClose: () => void;
  onSaved: (artist: ArtistDetailDto) => void;
}) => {
  const [name, setName] = useState(artist.name || "");
  const [bio, setBio] = useState(artist.bio || "");
  const [country, setCountry] = useState(artist.country || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(
    toImageUrl(artist.avatarUrl || artist.imageUrl),
  );
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    toImageUrl(artist.imageUrl),
  );
  const [cropTarget, setCropTarget] = useState<{
    type: CropTargetType;
    file: File;
    previewUrl: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      if (cropTarget?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(cropTarget.previewUrl);
      }
    };
  }, [avatarPreviewUrl, imagePreviewUrl, cropTarget]);

  const handleAvatarFileChange = (file: File | null) => {
    if (!file) {
      setAvatarFile(null);

      if (avatarPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      setAvatarPreviewUrl(toImageUrl(artist.avatarUrl || artist.imageUrl));
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCropTarget({ type: "avatar", file, previewUrl });
  };

  const handleImageFileChange = (file: File | null) => {
    if (!file) {
      setImageFile(null);

      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      setImagePreviewUrl(toImageUrl(artist.imageUrl));
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCropTarget({ type: "cover", file, previewUrl });
  };

  const handleApplyCroppedImage = (file: File, previewUrl: string) => {
    if (!cropTarget) return;

    if (cropTarget.type === "avatar") {
      if (avatarPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      setAvatarFile(file);
      setAvatarPreviewUrl(previewUrl);
    } else {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      setImageFile(file);
      setImagePreviewUrl(previewUrl);
    }

    if (cropTarget.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(cropTarget.previewUrl);
    }

    setCropTarget(null);
  };

  const closeCropModal = () => {
    if (cropTarget?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(cropTarget.previewUrl);
    }

    setCropTarget(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Tên nghệ sĩ không được để trống");
      return;
    }

    setIsSaving(true);

    try {
      const updated = await artistService.updateArtist(artist.artistId, {
        name: name.trim(),
        bio,
        country,
        avatarFile,
        imageFile,
      });

      onSaved(updated);
      toast.success("Đã cập nhật nghệ sĩ");
      onClose();
    } catch (error) {
      console.error("Update artist error:", error);
      toast.error("Cập nhật nghệ sĩ thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#333] bg-[#181818] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Chỉnh sửa nghệ sĩ</h2>
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
              Tên nghệ sĩ
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Camera size={17} />
                Avatar nghệ sĩ
              </div>
              <ArtistImagePreviewBox
                title="Chọn ảnh đại diện"
                subtitle="Ảnh tròn trên hồ sơ artist"
                file={avatarFile}
                previewUrl={avatarPreviewUrl}
                variant="avatar"
                onChange={handleAvatarFileChange}
              />
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Camera size={17} />
                Ảnh bìa
              </div>
              <ArtistImagePreviewBox
                title="Chọn ảnh bìa"
                subtitle="Ảnh nền / banner của artist"
                file={imageFile}
                previewUrl={imagePreviewUrl}
                variant="cover"
                onChange={handleImageFileChange}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Quốc gia
            </label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-2xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ví dụ: Việt Nam"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-300">
              Tiểu sử / Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-28 w-full rounded-2xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Giới thiệu ngắn về nghệ sĩ..."
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
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 font-bold text-black transition hover:bg-green-400 disabled:opacity-60"
          >
            <Save size={18} />
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {cropTarget && (
        <ImageAdjustModal
          imageUrl={cropTarget.previewUrl}
          fileName={cropTarget.file.name}
          variant={cropTarget.type}
          onClose={closeCropModal}
          onApply={handleApplyCroppedImage}
        />
      )}
    </div>
  );
};

const ArtistManagersModal = ({
  artist,
  onClose,
}: {
  artist: ArtistDetailDto;
  onClose: () => void;
}) => {
  const [managers, setManagers] = useState<ArtistManagerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<ArtistManagerRole>("Editor");

  const loadManagers = async () => {
    setLoading(true);
    try {
      const data = await artistService.getArtistManagers(artist.artistId);
      setManagers(data);
    } catch (error) {
      console.error("Load artist managers error:", error);
      toast.error("Không tải được danh sách quản lý");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, [artist.artistId]);

  const addManager = async () => {
    if (!newUserId.trim()) {
      toast.error("Nhập UserId cần thêm");
      return;
    }

    try {
      await artistService.addArtistManager(artist.artistId, {
        userId: newUserId.trim(),
        role: newRole,
      });
      setNewUserId("");
      setNewRole("Editor");
      toast.success("Đã thêm người quản lý");
      loadManagers();
    } catch (error) {
      console.error("Add artist manager error:", error);
      toast.error("Thêm người quản lý thất bại");
    }
  };

  const updateRole = async (userId: string, role: ArtistManagerRole) => {
    try {
      await artistService.updateArtistManagerRole(
        artist.artistId,
        userId,
        role,
      );
      toast.success("Đã đổi quyền");
      loadManagers();
    } catch (error) {
      console.error("Update role error:", error);
      toast.error("Đổi quyền thất bại");
    }
  };

  const removeManager = async (userId: string) => {
    if (!window.confirm("Xóa người quản lý này khỏi artist?")) return;

    try {
      await artistService.removeArtistManager(artist.artistId, userId);
      toast.success("Đã xóa người quản lý");
      loadManagers();
    } catch (error) {
      console.error("Remove manager error:", error);
      toast.error("Xóa người quản lý thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#333] bg-[#181818] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              Quản lý thành viên
            </h2>
            <p className="text-sm text-gray-400">Artist: {artist.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-[#282828] hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mb-5 grid gap-3 rounded-2xl bg-[#202020] p-4 md:grid-cols-[1fr_160px_auto]">
          <input
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            className="rounded-xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Nhập UserId từ bảng AspNetUsers"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as ArtistManagerRole)}
            className="rounded-xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
          >
            {managerRoleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            onClick={addManager}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-bold text-black transition hover:bg-green-400"
          >
            <UserPlus size={18} /> Thêm
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-gray-400">Đang tải...</div>
        ) : managers.length === 0 ? (
          <div className="rounded-2xl bg-[#202020] p-6 text-gray-400">
            Artist này chưa có người quản lý.
          </div>
        ) : (
          <div className="space-y-3">
            {managers.map((manager) => (
              <div
                key={manager.artistManagerId}
                className="flex flex-col gap-3 rounded-2xl bg-[#202020] p-4 md:flex-row md:items-center"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Shield size={17} className="text-green-400" />
                    {manager.displayName || manager.email || manager.userId}
                  </div>
                  <p className="truncate text-sm text-gray-500">
                    {manager.email}
                  </p>
                  <p className="truncate text-xs text-gray-600">
                    {manager.userId}
                  </p>
                </div>

                <select
                  value={manager.role}
                  onChange={(e) =>
                    updateRole(
                      manager.userId,
                      e.target.value as ArtistManagerRole,
                    )
                  }
                  className="rounded-xl bg-[#282828] px-4 py-2 text-white outline-none focus:ring-2 focus:ring-green-500"
                >
                  {managerRoleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => removeManager(manager.userId)}
                  className="inline-flex items-center justify-center rounded-xl bg-red-500/10 p-3 text-red-400 transition hover:bg-red-500 hover:text-white"
                  title="Xóa"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AlbumCover = ({ album }: { album: any }) => {
  const [isBroken, setIsBroken] = useState(false);
  const rawCover =
    album.coverImageUrl ||
    album.coverUrl ||
    album.imageUrl ||
    album.thumbnailUrl;
  const coverUrl = rawCover ? toImageUrl(rawCover) : "";

  if (!coverUrl || isBroken) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Disc3 size={60} className="text-gray-600" />
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={album.title}
      onError={() => setIsBroken(true)}
      className="h-full w-full object-cover"
    />
  );
};

const CreateAlbumModal = ({
  artist,
  onClose,
  onCreated,
}: {
  artist: ArtistDetailDto;
  onClose: () => void;
  onCreated: (album: any) => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [albumType, setAlbumType] = useState("Album");
  const [releaseDate, setReleaseDate] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [coverPreviewUrl]);

  const handleCoverChange = (file: File | null) => {
    if (file && !file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (coverPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreviewUrl);
    }

    setCoverFile(file);
    setCoverPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  const save = async () => {
    if (!title.trim()) {
      toast.error("Tên album không được để trống");
      return;
    }

    setSaving(true);

    try {
      const album = await albumService.createAlbum({
        artistId: artist.artistId,
        title: title.trim(),
        description,
        releaseDate,
        albumType,
        coverImageFile: coverFile,
      });

      onCreated(album);
      toast.success("Tạo album thành công");
      onClose();
    } catch (error: any) {
      console.error("Create album error:", error);
      toast.error(error.response?.data?.message || "Tạo album thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#333] bg-[#181818] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Tạo album mới</h2>
            <p className="text-sm text-gray-400">Nghệ sĩ: {artist.name}</p>
          </div>

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
              placeholder="Ví dụ: Album mới"
            />
          </div>

          <label className="group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#333] bg-[#111] p-5 text-center transition hover:border-green-500/70 hover:bg-green-500/5">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleCoverChange(e.target.files?.[0] || null)}
              className="hidden"
            />

            {coverPreviewUrl ? (
              <>
                <img
                  src={coverPreviewUrl}
                  alt="Album cover preview"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCoverChange(null);
                  }}
                  className="absolute right-3 top-3 z-20 rounded-full bg-black/60 p-2 text-white shadow-lg transition hover:bg-red-500"
                  title="Xóa ảnh đã chọn"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <div className="relative z-10 mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#282828] text-gray-300 transition group-hover:bg-green-500/15 group-hover:text-green-400">
                <ImagePlus size={27} />
              </div>
            )}

            <div className="relative z-10">
              <p className="font-semibold text-gray-100">
                {coverPreviewUrl ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
              </p>
              <p className="mt-1 max-w-[250px] truncate text-sm text-gray-400">
                {coverFile?.name || "JPG, PNG, WEBP hoặc GIF"}
              </p>
            </div>
          </label>

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
                <option value="Single">Single</option>
                <option value="EP">EP</option>
                <option value="Album">Album</option>
                <option value="Compilation">Compilation</option>
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
              className="min-h-24 w-full rounded-2xl bg-[#282828] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500"
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
            {saving ? "Đang tạo..." : "Tạo album"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ArtistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playTrack = usePlayerStore((state) => state.playTrack);

  const [artist, setArtist] = useState<ArtistDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManagersModal, setShowManagersModal] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const artistId = Number(id);

    if (!artistId) {
      navigate("/home");
      return;
    }

    setLoading(true);

    artistService
      .getArtistById(artistId)
      .then(setArtist)
      .catch((error) => {
        console.error("Lỗi tải nghệ sĩ:", error);
        setArtist(null);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const toggleArtistFollow = async () => {
    if (!artist || followLoading) return;

    setFollowLoading(true);

    try {
      if (artist.isFollowing) {
        await artistService.unfollowArtist(artist.artistId);
        setArtist({
          ...artist,
          isFollowing: false,
          followerCount: Math.max(0, artist.followerCount - 1),
        });
        toast.success("Đã bỏ quan tâm nghệ sĩ");
      } else {
        await artistService.followArtist(artist.artistId);
        setArtist({
          ...artist,
          isFollowing: true,
          followerCount: artist.followerCount + 1,
        });
        toast.success("Đã quan tâm nghệ sĩ");
      }
    } catch (error) {
      console.error("Follow artist error:", error);
      toast.error("Thao tác quan tâm nghệ sĩ thất bại");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading)
    return <div className="p-8 text-gray-400">Đang tải nghệ sĩ...</div>;

  if (!artist) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold">Không tìm thấy nghệ sĩ</h1>
      </div>
    );
  }

  const songs = artist.topSongs || [];
  const coverUrl = toImageUrl(artist.imageUrl);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"
      >
        <ArrowLeft size={20} />
        Quay lại
      </button>

      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700/60 via-[#241633] to-[#121212] p-6 shadow-2xl md:p-10">
        {coverUrl && (
          <>
            <img
              src={coverUrl}
              alt={artist.name}
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/70" />
          </>
        )}

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="h-40 w-40 shrink-0 overflow-hidden rounded-full bg-[#282828] shadow-xl md:h-48 md:w-48">
            {artist.avatarUrl || artist.imageUrl ? (
              <img
                src={toImageUrl(artist.avatarUrl || artist.imageUrl)}
                alt={artist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UserRound size={80} className="text-gray-500" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.35em] text-gray-300">
              Hồ sơ nghệ sĩ
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <h1 className="break-words text-5xl font-black text-white md:text-7xl">
                {artist.name}
              </h1>
              <button
                onClick={() => songs[0] && playSong(songs[0], playTrack, songs)}
                disabled={songs.length === 0}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-black transition hover:scale-105 disabled:opacity-50"
                title="Phát bài nổi bật"
              >
                <Play size={32} fill="currentColor" />
              </button>

              <button
                onClick={toggleArtistFollow}
                disabled={followLoading}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-bold transition disabled:opacity-60 ${
                  artist.isFollowing
                    ? "bg-[#282828] text-white hover:bg-[#333]"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {artist.isFollowing ? (
                  <UserCheck size={18} />
                ) : (
                  <UserPlus size={18} />
                )}
                {artist.isFollowing ? "Đang quan tâm" : "Quan tâm"}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-gray-300">
              <span>{formatCount(artist.followerCount)} người quan tâm</span>
              <span>{artist.songCount} bài hát</span>
              <span>{artist.albumCount} album</span>
              <span>{formatCount(artist.totalPlayCount)} lượt nghe</span>
              {artist.country && <span>{artist.country}</span>}
            </div>

            {artist.myArtistRole && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1 text-sm font-semibold text-green-300">
                <Shield size={15} /> Quyền của bạn: {artist.myArtistRole}
              </div>
            )}

            {artist.bio && (
              <p className="mt-4 max-w-2xl text-gray-300">{artist.bio}</p>
            )}
          </div>

          {(artist.canEdit || artist.canManageManagers) && (
            <div className="flex shrink-0 flex-col gap-3 self-start md:self-center">
              {artist.canEdit && (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-black transition hover:bg-gray-200"
                  >
                    <Edit3 size={18} /> Chỉnh sửa
                  </button>

                  <button
                    onClick={() => setShowCreateAlbumModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-3 font-bold text-black transition hover:bg-green-400"
                  >
                    <Plus size={18} /> Tạo album
                  </button>
                </>
              )}
              {artist.canManageManagers && (
                <button
                  onClick={() => setShowManagersModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#282828] px-5 py-3 font-bold text-white transition hover:bg-[#333]"
                >
                  <Users size={18} /> Quản lý
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-3xl font-black">Bài hát nổi bật</h2>

        <div className="grid gap-3 lg:grid-cols-2">
          {songs.map((song: MediaItemDto, index) => (
            <div
              key={song.mediaItemId}
              className="flex items-center gap-4 rounded-2xl bg-[#181818] p-3 transition hover:bg-[#242424]"
            >
              <span className="w-6 text-center text-gray-500">{index + 1}</span>

              <button
                onClick={() => playSong(song, playTrack, songs)}
                className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#282828]"
              >
                {song.thumbnailUrl && (
                  <img
                    src={toImageUrl(song.thumbnailUrl)}
                    alt={song.title}
                    className="h-full w-full object-cover"
                  />
                )}
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
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-3xl font-black">Album</h2>

        {artist.albums.length === 0 ? (
          <div className="rounded-3xl bg-[#181818] p-8 text-gray-400">
            Chưa có album công khai.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {artist.albums.map((album) => (
              <Link
                key={album.albumId}
                to={`/album/${album.albumId}`}
                className="rounded-3xl bg-[#181818] p-4 transition hover:bg-[#242424]"
              >
                <div className="aspect-square overflow-hidden rounded-2xl bg-[#282828]">
                  <AlbumCover album={album} />
                </div>
                <h3 className="mt-3 line-clamp-1 font-bold text-white">
                  {album.title}
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {album.trackCount} bài hát ·{" "}
                  {formatCount(album.totalPlayCount)} lượt nghe
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {showEditModal && (
        <EditArtistModal
          artist={artist}
          onClose={() => setShowEditModal(false)}
          onSaved={setArtist}
        />
      )}

      {showCreateAlbumModal && (
        <CreateAlbumModal
          artist={artist}
          onClose={() => setShowCreateAlbumModal(false)}
          onCreated={(album) =>
            setArtist((prev) =>
              prev
                ? {
                    ...prev,
                    albums: [album, ...(prev.albums || [])],
                    albumCount: prev.albumCount + 1,
                  }
                : prev,
            )
          }
        />
      )}

      {showManagersModal && (
        <ArtistManagersModal
          artist={artist}
          onClose={() => setShowManagersModal(false)}
        />
      )}
    </div>
  );
};

export default ArtistDetailPage;
