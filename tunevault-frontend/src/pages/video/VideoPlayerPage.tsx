import { useParams, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Maximize,
  RotateCcw,
  RotateCw,
  Repeat,
  PictureInPicture2,
} from "lucide-react";

// Mock video database
const videoDatabase: Record<number, any> = {
  1: {
    id: 1,
    title: "MV Nơi Này Có Anh",
    artist: "Sơn Tùng M-TP",
    videoUrl: "/videos/noinaycoanh.mp4",
    thumbnail: "/image/noinaycoanh.png",
  },
  2: {
    id: 2,
    title: "MV See Tình",
    artist: "Hoàng Thùy Linh",
    videoUrl: "/videos/seetinh.mp4",
    thumbnail: "/image/seetinh.jpg",
  },
  3: {
    id: 3,
    title: "MV Mang Tiền Về Cho Mẹ",
    artist: "Đen",
    videoUrl: "/videos/mangtienvechome.mp4",
    thumbnail: "/image/mangtienvechome.jpg",
  },
  8: {
    id: 8,
    title: "MV Lạ Lùng",
    artist: "Vũ.",
    videoUrl: "/videos/lalung.mp4",
    thumbnail: "/image/lalung.jpg",
  },
  10: {
    id: 10,
    title: "MV Sau Tất Cả",
    artist: "ERIK",
    videoUrl: "/videos/sautatca.mp4",
    thumbnail: "/image/sautatca.jpg",
  },
  15: {
    id: 15,
    title: "MV Có Hẹn Với Thanh Xuân",
    artist: "MONSTAR, GREY D",
    videoUrl: "/videos/cohenvoithanhxuan.mp4",
    thumbnail: "/image/cohenvoithanhxuan.jpg",
  },
  16: {
    id: 16,
    title: "MV Come My Way",
    artist: "Sơn Tùng MTP",
    videoUrl: "/videos/comemyway.mp4",
    thumbnail: "/image/comemyway.jpg",
  },
  17: {
    id: 17,
    title: "MV Em Thua Cô Ta",
    artist: "Min Quỳnh Anh",
    videoUrl: "/videos/emthuacota.mp4",
    thumbnail: "/image/emthuacota.jpg",
  },
  18: {
    id: 18,
    title: "MV Không Thể Say",
    artist: "HIEUTHUHAI",
    videoUrl: "/videos/khongthesay.mp4",
    thumbnail: "/image/khongthesay.jpg",
  },
  19: {
    id: 19,
    title: "MV Waiting For You",
    artist: "MONO",
    videoUrl: "/videos/waitingforyou.mp4",
    thumbnail: "/image/waitingforyou.jpg",
  },
  20: {
    id: 20,
    title: "MV Có Chàng Trai Viết Lên Cây",
    artist: "Phan Mạnh Quỳnh",
    videoUrl: "/videos/cochangtrai.mp4",
    thumbnail: "/image/cochangtrai.jpg",
  },
  21: {
    id: 21,
    title: "MV Thiệp Hồng Sai Tên",
    artist: "Nguyễn Thành Đạt",
    videoUrl: "/videos/thiephongsaiten.mp4",
    thumbnail: "/image/thiephongsaiten.jpg",
  },
  50: {
    id: 50,
    title: "MV Nơi Này Có Anh",
    artist: "Sơn Tùng M-TP",
    videoUrl: "/videos/noinaycoanh.mp4",
    thumbnail: "/image/noinaycoanh.png",
  },
};

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const videoId = Number(id);
  const video = videoDatabase[videoId] || {
    id: videoId,
    title: "Video không tồn tại",
    artist: "",
    videoUrl: "",
    thumbnail: "",
  };

  // Xử lý metadata và time update
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video.videoUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (videoElement.duration) {
        const currentProgress =
          (videoElement.currentTime / videoElement.duration) * 100;
        setProgress(currentProgress);
        setCurrentTime(videoElement.currentTime);
      }
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoId]);

  // Cập nhật loop
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) videoElement.loop = isLooping;
  }, [isLooping]);

  // Auto hide controls
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      if (e.key === " " || e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "ArrowLeft") skip(-10);
      if (e.key === "ArrowRight") skip(10);
      if (e.key.toLowerCase() === "f") toggleFullscreen();
      if (e.key.toLowerCase() === "m") handleMute();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const newProgress = parseFloat(e.target.value);
    videoElement.currentTime = (newProgress / 100) * videoElement.duration;
    setProgress(newProgress);
  };

  const skip = (seconds: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    videoElement.currentTime = Math.max(
      0,
      Math.min(videoElement.duration, videoElement.currentTime + seconds),
    );
  };

  const changePlaybackRate = (rate: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    videoElement.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume / 100;
  };

  const handleMute = () => {
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  };

  const toggleLoop = () => setIsLooping(!isLooping);

  const toggleFullscreen = () => {
    const videoElement = videoRef.current;
    if (videoElement?.requestFullscreen) videoElement.requestFullscreen();
  };

  const togglePictureInPicture = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoElement.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP Error:", err);
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (!video.videoUrl) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl text-red-400 mb-4">Video không tồn tại</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-full text-white"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white"
      >
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div
        className="relative bg-black rounded-2xl overflow-hidden shadow-2xl group"
        onMouseMove={resetControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
            <div className="text-white">Đang tải video...</div>
          </div>
        )}

        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnail}
          className="w-full aspect-video bg-black"
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <span className="text-white text-xs w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="flex-1 accent-green-500 cursor-pointer"
            />
            <span className="text-white text-xs w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => skip(-10)}
                className="text-white hover:text-green-400 transition"
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={togglePlay}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition"
              >
                {isPlaying ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} className="ml-0.5" />
                )}
              </button>
              <button
                onClick={() => skip(10)}
                className="text-white hover:text-green-400 transition"
              >
                <RotateCw size={20} />
              </button>
              <div className="text-white ml-2">
                <div className="font-semibold">{video.title}</div>
                <div className="text-sm text-gray-400">{video.artist}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className="bg-[#282828] text-white text-sm px-2 py-1 rounded border border-[#3a3a3a]"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              <button
                onClick={toggleLoop}
                className={`transition ${isLooping ? "text-green-500" : "text-white hover:text-green-400"}`}
                title="Lặp lại"
              >
                <Repeat size={20} />
              </button>

              <button
                onClick={togglePictureInPicture}
                className="hover:text-green-400 transition"
                title="Picture in Picture"
              >
                <PictureInPicture2 size={20} />
              </button>

              <div className="flex items-center gap-2">
                <Volume2
                  size={20}
                  onClick={handleMute}
                  className="cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-green-500"
                />
              </div>

              <button
                onClick={toggleFullscreen}
                className="hover:text-green-400 transition"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-500 mt-3 text-sm">
        Space/K = Phát/Tạm dừng • ← → = Tua • F = Toàn màn hình • M = Tắt tiếng
      </p>
    </div>
  );
};

export default VideoPlayerPage;
