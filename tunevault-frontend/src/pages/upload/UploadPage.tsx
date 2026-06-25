import { useEffect, useState } from "react";
import {
  Upload,
  Music,
  Film,
  Image as ImageIcon,
  X,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import ImageAdjustModal from "../../components/common/ImageAdjustModal";

const GENRES = [
  "V-Pop",
  "Ballad",
  "Rap",
  "R&B",
  "EDM/Dance",
  "Rock",
  "Indie",
  "Acoustic",
  "Lofi/Chill",
  "OST",
  "Remix",
];

const UploadPage = () => {
  const [title, setTitle] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [thumbnailCropTarget, setThumbnailCropTarget] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }

      if (thumbnailCropTarget?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailCropTarget.previewUrl);
      }
    };
  }, [thumbnailPreviewUrl, thumbnailCropTarget]);

  const getNameWithoutExtension = (file: File) => {
    return file.name.replace(/\.[^/.]+$/, "");
  };

  const handleFileSelect = (
    file: File,
    type: "audio" | "video" | "thumbnail",
  ) => {
    if (type === "thumbnail") {
      if (!file.type.startsWith("image/")) {
        toast.error("Thumbnail chỉ được chọn file ảnh");
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("Ảnh bìa tối đa 10MB");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setThumbnailCropTarget({ file, previewUrl });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File quá lớn (tối đa 200MB)");
      return;
    }

    if (type === "audio" && !file.type.startsWith("audio/")) {
      toast.error("File audio không hợp lệ");
      return;
    }

    if (type === "video" && !file.type.startsWith("video/")) {
      toast.error("File video không hợp lệ");
      return;
    }

    const autoName = getNameWithoutExtension(file);

    if (type === "audio") {
      setAudioFile(file);
      if (!title.trim()) setTitle(autoName);
    }

    if (type === "video") {
      setVideoFile(file);
      if (!title.trim()) setTitle(autoName);
      if (!videoTitle.trim()) setVideoTitle(autoName);
    }
  };

  const removeFile = (type: "audio" | "video" | "thumbnail") => {
    if (type === "audio") setAudioFile(null);

    if (type === "video") {
      setVideoFile(null);
      setVideoTitle("");
    }

    if (type === "thumbnail") {
      if (thumbnailPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }

      setThumbnailFile(null);
      setThumbnailPreviewUrl("");
    }
  };

  const closeThumbnailCrop = () => {
    if (thumbnailCropTarget?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailCropTarget.previewUrl);
    }

    setThumbnailCropTarget(null);
  };

  const applyThumbnailCrop = (file: File, previewUrl: string) => {
    if (thumbnailPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }

    if (thumbnailCropTarget?.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailCropTarget.previewUrl);
    }

    setThumbnailFile(file);
    setThumbnailPreviewUrl(previewUrl);
    setThumbnailCropTarget(null);
  };

  const resetForm = () => {
    setTitle("");
    setVideoTitle("");
    setArtist("");
    setGenre("");
    setAudioFile(null);
    setVideoFile(null);
    setThumbnailFile(null);

    if (thumbnailPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }

    setThumbnailPreviewUrl("");
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên media");
      return;
    }

    if (!audioFile && !videoFile) {
      toast.error("Vui lòng chọn ít nhất 1 file Audio hoặc Video");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("artist", artist.trim());
      if (genre.trim()) formData.append("genre", genre.trim());

      if (videoFile) {
        formData.append("videoTitle", videoTitle.trim() || title.trim());
      }

      if (thumbnailFile) formData.append("thumbnailFile", thumbnailFile);
      if (audioFile) formData.append("audioFile", audioFile);
      if (videoFile) formData.append("videoFile", videoFile);

      await axiosInstance.post("/media/upload-multi", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setProgress(percent);
          }
        },
      });

      toast.success("Upload media thành công!");
      resetForm();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Upload thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (file?: File | null) => {
    if (!file) return "";
    const mb = file.size / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const FileBox = ({
    type,
    file,
    icon,
    title,
    subtitle,
    accept,
    previewUrl,
  }: {
    type: "audio" | "video" | "thumbnail";
    file: File | null;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accept: string;
    previewUrl?: string;
  }) => {
    if (file && type === "thumbnail") {
      return (
        <label className="group relative flex min-h-[190px] cursor-pointer overflow-hidden rounded-2xl border border-green-500/30 bg-[#111]">
          <input
            type="file"
            accept={accept}
            onChange={(e) =>
              e.target.files?.[0] && handleFileSelect(e.target.files[0], type)
            }
            className="hidden"
          />

          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file.name}
              className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <ImageIcon size={42} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

          <div className="relative z-10 mt-auto flex w-full items-end justify-between gap-3 p-4">
            <div className="min-w-0 text-left">
              <p className="truncate font-bold text-white">{file.name}</p>
              <p className="mt-1 text-sm text-gray-300">
                {formatSize(file)} · Bấm để đổi ảnh
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                removeFile(type);
              }}
              className="shrink-0 rounded-full bg-black/45 p-2 text-gray-200 transition hover:bg-red-500 hover:text-white"
              title="Xóa ảnh"
            >
              <X size={18} />
            </button>
          </div>
        </label>
      );
    }

    if (file) {
      return (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
              <CheckCircle2 size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{file.name}</p>
              <p className="mt-1 text-sm text-gray-400">{formatSize(file)}</p>

              {type === "video" && (
                <p className="mt-2 truncate text-sm text-purple-300">
                  Tên video: {videoTitle.trim() || title || "Chưa đặt"}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeFile(type)}
              className="rounded-full p-2 text-gray-400 transition hover:bg-red-500/15 hover:text-red-400"
              title="Xóa file"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <label className="group flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#333] bg-[#111] p-5 text-center transition hover:border-green-500/70 hover:bg-green-500/5">
        <input
          type="file"
          accept={accept}
          onChange={(e) =>
            e.target.files?.[0] && handleFileSelect(e.target.files[0], type)
          }
          className="hidden"
        />

        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#282828] text-gray-300 transition group-hover:bg-green-500/15 group-hover:text-green-400">
          {icon}
        </div>

        <p className="font-semibold text-gray-200">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </label>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/15 text-green-400">
          <Upload size={30} />
        </div>

        <div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Upload Media
          </h1>
          <p className="mt-1 text-sm text-gray-400">Tải lên audio - video</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#242424] bg-[#181818] shadow-2xl">
        <div className="border-b border-[#242424] bg-[#151515] px-6 py-5 sm:px-8">
          <h2 className="text-xl font-bold text-white">THÔNG TIN BÀI HÁT</h2>
          <p className="mt-1 text-sm text-gray-400"></p>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Hàng 1: Tên bài hát + Thể loại */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Tên bài hát <span className="text-green-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl bg-[#282828] px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ví dụ: Không Thể Say"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Thể loại
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-2xl bg-[#282828] px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Chọn thể loại</option>
                {GENRES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Hàng 2: Tên video + Nghệ sĩ */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Tên video
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full rounded-2xl bg-[#282828] px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Có thể để trống. Nếu có MV, trang video sẽ dùng tên này."
              />
              <p className="mt-2 text-xs text-gray-500">
                Ví dụ: MV Không Thể Say Official. Nếu để trống, video sẽ dùng
                tên media phía trên.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Nghệ sĩ
                <span className="ml-1 text-xs font-normal text-gray-500">
                  (nhiều nghệ sĩ cách nhau bằng dấu phẩy)
                </span>
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full rounded-2xl bg-[#282828] px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ví dụ: Tóc Tiên, MAIQUINN, Mượii, DTAP"
              />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_1.4fr]">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
                <ImageIcon size={17} />
                Ảnh bìa
                <span className="rounded-full bg-[#282828] px-2 py-0.5 text-xs text-gray-400">
                  Tùy chọn
                </span>
              </div>

              <FileBox
                type="thumbnail"
                file={thumbnailFile}
                icon={<ImageIcon size={27} />}
                title="Chọn ảnh bìa"
                subtitle="Chỉ nhận file ảnh"
                accept="image/*"
                previewUrl={thumbnailPreviewUrl}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Music size={17} />
                  File Audio
                  <span className="rounded-full bg-[#282828] px-2 py-0.5 text-xs text-gray-400">
                    Tùy chọn
                  </span>
                </div>

                <FileBox
                  type="audio"
                  file={audioFile}
                  icon={<Music size={28} />}
                  title="Chọn file audio"
                  subtitle="MP3, WAV, M4A..."
                  accept="audio/*"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
                  <Film size={17} />
                  File Video
                  <span className="rounded-full bg-[#282828] px-2 py-0.5 text-xs text-gray-400">
                    Tùy chọn
                  </span>
                </div>

                <FileBox
                  type="video"
                  file={videoFile}
                  icon={<Film size={28} />}
                  title="Chọn file video"
                  subtitle="MP4, MOV, WEBM..."
                  accept="video/*"
                />
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="rounded-2xl bg-[#111] p-4">
              <div className="mb-2 flex justify-between text-sm text-gray-300">
                <span>Đang upload...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#282828]">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={
              isUploading || !title.trim() || (!audioFile && !videoFile)
            }
            className="flex w-full items-center justify-center gap-3 rounded-full bg-green-500 px-6 py-4 text-lg font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            <Upload size={22} />
            {isUploading ? `Đang upload ${progress}%` : "Upload Media"}
          </button>
        </div>
      </div>

      {thumbnailCropTarget && (
        <ImageAdjustModal
          imageUrl={thumbnailCropTarget.previewUrl}
          fileName={thumbnailCropTarget.file.name}
          variant="square"
          title="Chỉnh ảnh bìa media"
          description="Kéo trực tiếp ảnh để căn vị trí ảnh bìa trước khi upload."
          onClose={closeThumbnailCrop}
          onApply={applyThumbnailCrop}
        />
      )}
    </div>
  );
};

export default UploadPage;
