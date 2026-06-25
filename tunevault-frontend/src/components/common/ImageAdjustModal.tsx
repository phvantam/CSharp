import { useRef, useState, type PointerEvent } from "react";
import { Move, Save, X } from "lucide-react";
import toast from "react-hot-toast";

export type ImageCropVariant = "square" | "banner" | "avatar";

const loadImageForCanvas = (imageUrl: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imageUrl;
  });
};

const getOutputSize = (variant: ImageCropVariant) => {
  if (variant === "banner") {
    return { width: 1600, height: 500 };
  }

  return { width: 1200, height: 1200 };
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
  variant: ImageCropVariant;
  zoom: number;
  positionX: number;
  positionY: number;
  viewportWidth: number;
  viewportHeight: number;
}) => {
  const image = await loadImageForCanvas(imageUrl);
  const { width: outputWidth, height: outputHeight } = getOutputSize(variant);

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

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

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

  const safeName = fileName.replace(/\.[^/.]+$/, "") || "image";
  return new File([blob], `${safeName}-cropped.jpg`, { type: "image/jpeg" });
};

const ImageAdjustModal = ({
  imageUrl,
  fileName,
  variant = "square",
  title,
  description,
  onClose,
  onApply,
}: {
  imageUrl: string;
  fileName: string;
  variant?: ImageCropVariant;
  title?: string;
  description?: string;
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

  const [zoom, setZoom] = useState(1.08);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const isBanner = variant === "banner";
  const isAvatar = variant === "avatar";

  const resetPosition = () => {
    setZoom(1.08);
    setPositionX(0);
    setPositionY(0);
  };

  const clampPosition = (value: number) => {
    return Math.max(-260, Math.min(260, value));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
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

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = event.clientX - dragStartRef.current.pointerX;
    const deltaY = event.clientY - dragStartRef.current.pointerY;

    setPositionX(clampPosition(dragStartRef.current.imageX + deltaX));
    setPositionY(clampPosition(dragStartRef.current.imageY + deltaY));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Trình duyệt có thể tự release pointer.
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
              {title || "Chỉnh ảnh"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {description ||
                "Kéo trực tiếp ảnh để căn vị trí, dùng thanh phóng to để khớp với khung trước khi lưu."}
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
          className={`relative mx-auto touch-none select-none overflow-hidden border-2 border-green-500/40 bg-black shadow-2xl ${
            isDragging ? "cursor-move" : "cursor-move"
          } ${
            isBanner
              ? "aspect-[16/5] w-full rounded-3xl"
              : isAvatar
                ? "aspect-square w-full max-w-[360px] rounded-full"
                : "aspect-square w-full max-w-[430px] rounded-3xl"
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

        <div className="mt-6 rounded-2xl bg-[#202020] p-4">
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

export default ImageAdjustModal;
