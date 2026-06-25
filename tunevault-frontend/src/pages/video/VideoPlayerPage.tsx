import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import axiosInstance from "../../api/axiosInstance";
import { usePlayerStore } from "../../stores/playerStore";

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5090/api"
).replace(/\/api\/?$/, "");

const toStaticUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;

  // File upload/seed từ backend thường có dạng /media/...
  if (url.startsWith("/media/")) {
    return `${API_ORIGIN}${url}`;
  }

  return url;
};

type VideoMedia = {
  id: number;
  title: string;
  artist: string;
  videoUrl: string;
  thumbnail: string;
};

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseTrack = usePlayerStore((state) => state.pauseTrack);

  const [video, setVideo] = useState<VideoMedia | null>(null);
  const [error, setError] = useState("");

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
  const routeState = location.state as any;
  const stateMedia =
    routeState?.media || routeState?.song || routeState || null;

  // PlayerBar gửi event này khi người dùng muốn phát audio trong lúc đang ở trang video.
  // Khi đó video sẽ pause để không bị phát chồng âm thanh.
  useEffect(() => {
    const handlePauseVideo = () => {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener("tunevault:pause-video", handlePauseVideo);
    return () => {
      window.removeEventListener("tunevault:pause-video", handlePauseVideo);
    };
  }, []);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoId || Number.isNaN(videoId)) {
        setError("Video không tồn tại");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await axiosInstance.get(`/media/${videoId}`);
        const payload = response.data?.data ?? response.data;

        const videoPath =
          payload?.videoUrl ||
          payload?.videoFilePath ||
          payload?.videoPath ||
          (payload?.mediaType === "Video" ? payload?.filePath : "");

        if (!videoPath) {
          setError("Video không tồn tại");
          setVideo(null);
          return;
        }

        const artistName =
          payload?.artistName ||
          payload?.artist?.name ||
          payload?.artist ||
          payload?.artistDisplayName ||
          stateMedia?.artistName ||
          stateMedia?.artist ||
          "Unknown Artist";

        setVideo({
          id: payload.mediaItemId ?? videoId,
          title:
            payload.videoTitle ||
            payload.VideoTitle ||
            stateMedia?.videoTitle ||
            stateMedia?.title ||
            payload.title ||
            "Video",
          artist: artistName,
          videoUrl: toStaticUrl(videoPath),
          thumbnail: toStaticUrl(
            payload.thumbnailUrl || stateMedia?.thumbnailUrl,
          ),
        });
      } catch (err) {
        console.error("Fetch video error:", err);
        setError("Video không tồn tại");
        setVideo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideo();
  }, [videoId, location.state]);

  // Xử lý metadata và time update
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video?.videoUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration || 0);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      if (videoElement.duration) {
        setProgress((videoElement.currentTime / videoElement.duration) * 100);
        setCurrentTime(videoElement.currentTime);
      }
    };

    const handlePlayEvent = () => {
      pauseTrack();
      setIsPlaying(true);
    };
    const handlePauseEvent = () => setIsPlaying(false);
    const handleError = () => {
      setError("Không tải được file video");
      setIsLoading(false);
    };

    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("play", handlePlayEvent);
    videoElement.addEventListener("pause", handlePauseEvent);
    videoElement.addEventListener("error", handleError);

    return () => {
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("play", handlePlayEvent);
      videoElement.removeEventListener("pause", handlePauseEvent);
      videoElement.removeEventListener("error", handleError);
    };
  }, [video?.videoUrl, pauseTrack]);

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

  const togglePlay = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    try {
      if (videoElement.paused) {
        pauseTrack();
        await videoElement.play();
      } else {
        videoElement.pause();
      }
      resetControlsTimeout();
    } catch (err) {
      console.error("Video play error:", err);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoElement.duration) return;

    const newProgress = parseFloat(e.target.value);
    videoElement.currentTime = (newProgress / 100) * videoElement.duration;
    setProgress(newProgress);
  };

  const skip = (seconds: number) => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoElement.duration) return;

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

    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      videoRef.current.muted = newVolume === 0;
    }
  };

  const handleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !videoRef.current.muted;
  };

  const toggleLoop = () => setIsLooping((prev) => !prev);

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
  }, []);

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (isLoading && !video) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-center">
        <p className="text-gray-400">Đang tải video...</p>
      </div>
    );
  }

  if (error || !video?.videoUrl) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-center">
        <h2 className="mb-4 text-2xl text-red-400">
          {error || "Video không tồn tại"}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-green-600 px-6 py-2 text-white hover:bg-green-500"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"
      >
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div
        className="group relative overflow-hidden rounded-2xl bg-black shadow-2xl"
        onMouseMove={resetControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
            <div className="text-white">Đang tải video...</div>
          </div>
        )}

        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnail}
          className="aspect-video w-full bg-black"
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          playsInline
        />

        {/* Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-3 flex items-center gap-3 px-1">
            <span className="w-10 text-right text-xs text-white">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="flex-1 cursor-pointer accent-green-500"
            />
            <span className="w-10 text-xs text-white">
              {formatTime(duration)}
            </span>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => skip(-10)}
                className="text-white transition hover:text-green-400"
              >
                <RotateCcw size={20} />
              </button>

              <button
                onClick={togglePlay}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200"
              >
                {isPlaying ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} className="ml-0.5" />
                )}
              </button>

              <button
                onClick={() => skip(10)}
                className="text-white transition hover:text-green-400"
              >
                <RotateCw size={20} />
              </button>

              <div className="ml-2 text-white">
                <div className="font-semibold">{video.title}</div>
                <div className="text-sm text-gray-400">{video.artist}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className="rounded border border-[#3a3a3a] bg-[#282828] px-2 py-1 text-sm text-white"
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
                className={`transition ${
                  isLooping
                    ? "text-green-500"
                    : "text-white hover:text-green-400"
                }`}
                title="Lặp lại"
              >
                <Repeat size={20} />
              </button>

              <button
                onClick={togglePictureInPicture}
                className="transition hover:text-green-400"
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
                className="transition hover:text-green-400"
              >
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-gray-500"></p>
    </div>
  );
};

export default VideoPlayerPage;
