import { useState, useEffect } from "react";
import { Upload, Music, Video, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { albumService } from "../../api";
import type { AlbumDto } from "../../api/types/album";

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [visibility, setVisibility] = useState<"Public" | "Private">("Public");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await albumService.getAlbums();
        setAlbums(data);
      } catch (err) {
        console.error("Error loading albums:", err);
      }
    };
    fetchAlbums();
  }, []);

  const handleFile = (selectedFile: File) => {
    if (
      !selectedFile.type.startsWith("audio/") &&
      !selectedFile.type.startsWith("video/")
    ) {
      toast.error("Chỉ hỗ trợ file audio và video");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File quá lớn (tối đa 50MB)");
      return;
    }

    setFile(selectedFile);

    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Chỉ hỗ trợ file ảnh");
        return;
      }
      setThumbnailFile(selectedFile);
      setThumbnailPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setTitle("");
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  // ==================== KẾT NỐI API THẬT ====================
  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast.error("Vui lòng chọn file và nhập tên bài hát");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      // Backend expects either "video" or "file" key
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("artist", artist.trim());
      formData.append("visibility", visibility);
      if (selectedAlbumId) {
        formData.append("albumId", selectedAlbumId);
      }
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      await axiosInstance.post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setProgress(percentCompleted);
          }
        },
      });

      toast.success("Upload thành công!");

      // Reset form
      setFile(null);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setTitle("");
      setArtist("");
      setSelectedAlbumId("");
      setProgress(0);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message || "Upload thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        <Upload className="text-green-500" /> Upload Media
      </h1>

      <div className="bg-[#181818] rounded-2xl p-8">
        {/* Upload Area */}
        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl h-72 cursor-pointer transition-all ${
              isDragging
                ? "border-green-500 bg-[#282828]"
                : "border-[#282828] hover:border-green-500"
            }`}
          >
            <label className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
              <Upload size={52} className="text-gray-400 mb-4" />
              <p className="text-xl font-medium">Kéo thả file vào đây</p>
              <p className="text-gray-400 mt-1">hoặc click để chọn file</p>
              <p className="text-sm text-gray-500 mt-2">
                MP3, MP4, WAV • Tối đa 50MB
              </p>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          /* File Info */
          <div className="bg-[#282828] rounded-xl p-5 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {file.type.startsWith("audio") ? (
                  <Music size={40} className="text-green-400" />
                ) : (
                  <Video size={40} className="text-purple-400" />
                )}
                <div>
                  <p className="font-semibold text-lg">{file.name}</p>
                  <p className="text-sm text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="text-red-400 hover:text-red-500"
              >
                <X size={22} />
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {file && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Tên bài hát / Video *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                placeholder="Nhập tên bài hát"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Nghệ sĩ
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
                placeholder="Tên nghệ sĩ"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Chọn Album
              </label>
              <select
                value={selectedAlbumId}
                onChange={(e) => setSelectedAlbumId(e.target.value)}
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
              <label className="block text-sm text-gray-400 mb-1.5">
                Ảnh bìa bài hát / Thumbnail
              </label>
              <div className="flex items-center gap-4">
                {thumbnailPreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#282828] flex-shrink-0 border border-[#3a3a3a]">
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white hover:bg-red-500 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border border-dashed border-[#3a3a3a] hover:border-green-500 flex flex-col items-center justify-center cursor-pointer transition text-gray-500 hover:text-green-500 flex-shrink-0">
                    <ImageIcon size={20} />
                    <span className="text-[10px] mt-1 text-center font-medium">Chọn ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                )}
                <div className="text-xs text-gray-400">
                  Hỗ trợ định dạng JPG, PNG, WEBP. Ảnh này sẽ dùng làm hình đại diện cho bài hát khi hiển thị trong danh sách.
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Quyền riêng tư
              </label>
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as "Public" | "Private")
                }
                className="w-full bg-[#282828] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 border border-[#3a3a3a] text-white"
              >
                <option value="Public">Công khai</option>
                <option value="Private">Riêng tư</option>
              </select>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-2">
                  <span>Đang tải lên...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-[#282828] rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={isUploading || !title.trim()}
              className="w-full py-3.5 mt-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-semibold rounded-full transition disabled:cursor-not-allowed"
            >
              {isUploading ? "Đang upload..." : "Upload Media"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
