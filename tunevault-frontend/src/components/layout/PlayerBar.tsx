import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  ListMusic,
  Film,
  Mic2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePlayerStore } from "../../stores/playerStore";
import Queue from "../player/Queue";
import { mediaService } from "../../api";

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
};

const PlayerBar = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const restoredTrackIdRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isVideoPage = location.pathname.startsWith("/video/");
  const isNowPlayingPage = location.pathname.startsWith("/now-playing");

  const [showQueue, setShowQueue] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [mediaDetail, setMediaDetail] = useState<any>(null);

  const {
    currentTrack,
    isPlaying,
    progress,
    currentTimeSeconds: savedCurrentTimeSeconds,
    durationSeconds: savedDurationSeconds,
    volume,
    repeatMode,
    shuffle,
    togglePlay,
    pauseTrack,
    setProgress,
    setPlaybackPosition,
    setVolume,
    nextTrack,
    previousTrack,
    setRepeatMode,
    toggleShuffle,
  } = usePlayerStore();

  const hasTrack = Boolean(currentTrack);

  useEffect(() => {
    if (isNowPlayingPage) {
      setShowQueue(false);
    }
  }, [isNowPlayingPage]);

  const displayTitle = currentTrack?.title || "Chưa phát bài nào";
  const displayArtist = currentTrack?.artist || "Chọn một bài hát để bắt đầu";
  const displayThumbnail = currentTrack?.thumbnailUrl || "";

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      if (!currentTrack?.id) {
        setMediaDetail(null);
        return;
      }

      try {
        const detail = await mediaService.getMediaById(currentTrack.id);
        if (!cancelled) setMediaDetail(detail);
      } catch {
        if (!cancelled) setMediaDetail(null);
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id]);

  useEffect(() => {
    restoredTrackIdRef.current = null;

    const initialDuration = Number(
      savedDurationSeconds || currentTrack?.duration || 0,
    );
    const initialTime = Number(savedCurrentTimeSeconds || 0);

    setCurrentTime(initialTime);
    setDurationSeconds(initialDuration);

    if (initialDuration > 0) {
      setProgress(
        Math.max(0, Math.min(100, (initialTime / initialDuration) * 100)),
      );
    } else {
      setProgress(0);
    }
  }, [
    currentTrack?.id,
    currentTrack?.duration,
    savedCurrentTimeSeconds,
    savedDurationSeconds,
    setProgress,
  ]);

  const hasVideo = useMemo(() => {
    return Boolean(
      currentTrack?.hasVideo ||
      (currentTrack as any)?.isVideo ||
      currentTrack?.videoUrl ||
      mediaDetail?.hasVideo ||
      mediaDetail?.videoUrl ||
      mediaDetail?.videoFilePath,
    );
  }, [currentTrack, mediaDetail]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.volume = volume / 100;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, volume]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;

    const duration = audio.duration;
    const shouldRestore =
      currentTrack?.id &&
      restoredTrackIdRef.current !== currentTrack.id &&
      savedCurrentTimeSeconds > 0 &&
      savedCurrentTimeSeconds < duration - 1;

    if (shouldRestore) {
      audio.currentTime = savedCurrentTimeSeconds;
      restoredTrackIdRef.current = currentTrack.id;
    }

    setDurationSeconds(Math.floor(duration));
    setCurrentTime(audio.currentTime);
    setPlaybackPosition(audio.currentTime, duration);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const currentProgress = (audio.currentTime / audio.duration) * 100;
    setProgress(currentProgress);
    setCurrentTime(audio.currentTime);
    setPlaybackPosition(audio.currentTime, audio.duration);

    if (Number.isFinite(audio.duration)) {
      setDurationSeconds(Math.floor(audio.duration));
    }
  };

  const handleEnded = async () => {
    const audio = audioRef.current;

    if (repeatMode !== "off" && audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      setPlaybackPosition(0, audio.duration || durationSeconds);

      try {
        await audio.play();
      } catch (error) {
        console.error("Repeat one play error:", error);
      }

      return;
    }

    nextTrack();
  };

  useEffect(() => {
    if (currentTrack?.id) {
      import("../../api/playHistoryService").then(({ playHistoryService }) => {
        playHistoryService.recordPlay(currentTrack.id);
      });
    }
  }, [currentTrack?.id]);

  const seekAudioBy = (seconds: number) => {
    const audio = audioRef.current;

    if (!audio || !currentTrack || !audio.duration) return;

    const nextTime = Math.max(
      0,
      Math.min(audio.duration, audio.currentTime + seconds),
    );

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    setProgress((nextTime / audio.duration) * 100);
    setPlaybackPosition(nextTime, audio.duration);
  };

  const seekAudioTo = (seconds: number) => {
    const audio = audioRef.current;

    if (!audio || !currentTrack || !audio.duration) return;

    const nextTime = Math.max(0, Math.min(audio.duration, seconds));

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    setProgress((nextTime / audio.duration) * 100);
    setPlaybackPosition(nextTime, audio.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !audio.duration) return;

    const newProgress = parseFloat(e.target.value);
    audio.currentTime = (newProgress / 100) * audio.duration;
    setProgress(newProgress);
    setCurrentTime(audio.currentTime);
    setPlaybackPosition(audio.currentTime, audio.duration);
  };

  useEffect(() => {
    const handleSeekBy = (event: Event) => {
      const audio = audioRef.current;

      if (!audio || !currentTrack || !audio.duration) return;

      const customEvent = event as CustomEvent<{ seconds?: number }>;
      const seconds = Number(customEvent.detail?.seconds || 0);

      if (!Number.isFinite(seconds) || seconds === 0) return;

      seekAudioBy(seconds);
    };

    const handleSeekTo = (event: Event) => {
      const audio = audioRef.current;

      if (!audio || !currentTrack || !audio.duration) return;

      const customEvent = event as CustomEvent<{ seconds?: number }>;
      const seconds = Number(customEvent.detail?.seconds || 0);

      if (!Number.isFinite(seconds)) return;

      seekAudioTo(seconds);
    };

    window.addEventListener("tunevault:seek-by", handleSeekBy);
    window.addEventListener("tunevault:seek-to", handleSeekTo);

    return () => {
      window.removeEventListener("tunevault:seek-by", handleSeekBy);
      window.removeEventListener("tunevault:seek-to", handleSeekTo);
    };
  }, [currentTrack, setPlaybackPosition, setProgress]);

  useEffect(() => {
    const handleKeyboardSeek = (event: KeyboardEvent) => {
      if (!currentTrack || isEditableTarget(event.target)) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        seekAudioBy(-5);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        seekAudioBy(5);
      }
    };

    window.addEventListener("keydown", handleKeyboardSeek);

    return () => {
      window.removeEventListener("keydown", handleKeyboardSeek);
    };
  }, [currentTrack]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const toggleRepeat = () => {
    setRepeatMode(repeatMode === "off" ? "all" : "off");
  };

  const formatTime = (seconds: number) => {
    const value = Number(seconds || 0);
    const min = Math.floor(value / 60);
    const sec = Math.floor(value % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleTogglePlay = () => {
    if (!currentTrack) return;

    const audioWillPlay = !isPlaying;

    if (isVideoPage && audioWillPlay) {
      window.dispatchEvent(new Event("tunevault:pause-video"));
    }

    togglePlay();
  };

  const handleNext = () => {
    if (!currentTrack) return;

    if (isVideoPage) {
      window.dispatchEvent(new Event("tunevault:pause-video"));
    }

    nextTrack();
  };

  const handlePrevious = () => {
    if (!currentTrack) return;

    if (isVideoPage) {
      window.dispatchEvent(new Event("tunevault:pause-video"));
    }

    previousTrack();
  };

  const openNowPlaying = () => {
    if (!currentTrack) return;
    navigate("/now-playing");
  };

  const openMv = () => {
    if (!currentTrack || !hasVideo) return;

    pauseTrack();

    if (audioRef.current) {
      audioRef.current.pause();
    }

    navigate(`/video/${currentTrack.id}`, {
      state: {
        media: {
          mediaItemId: currentTrack.id,
          title: currentTrack.title,
          artistName: currentTrack.artist,
          thumbnailUrl: currentTrack.thumbnailUrl,
          videoUrl: currentTrack.videoUrl || mediaDetail?.videoUrl,
        },
      },
    });
  };

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 z-[140] h-16 border-t border-white/10 bg-[#141414]/95 text-white shadow-[0_-10px_28px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 ${
          isNowPlayingPage
            ? "pointer-events-none translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div
          className={`mx-auto flex h-16 min-h-16 w-full items-center gap-3 px-3 sm:px-4 md:gap-5 ${
            !hasTrack ? "justify-center" : ""
          }`}
        >
          <button
            onClick={hasTrack ? openNowPlaying : undefined}
            disabled={!hasTrack}
            className={`flex min-w-0 items-center gap-3 rounded-xl px-2 py-1.5 text-left transition ${
              hasTrack
                ? "hover:bg-white/5 md:w-1/4"
                : "mx-auto cursor-default md:w-auto"
            }`}
            title={hasTrack ? "Mở lời bài hát" : "Chưa có bài hát"}
          >
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#282828] shadow-lg ring-1 ring-white/10">
              {displayThumbnail ? (
                <img
                  src={displayThumbnail}
                  alt={displayTitle}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-500">
                  <ListMusic size={24} />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold md:text-base">
                {displayTitle}
              </p>
              <p className="truncate text-xs text-gray-400 md:text-sm">
                {displayArtist}
              </p>
            </div>
          </button>

          {hasTrack && (
            <div className="flex min-w-0 flex-1 flex-col items-center md:w-2/4">
              <div className="mb-0.5 flex items-center gap-3 sm:gap-4">
                <button
                  onClick={toggleShuffle}
                  className={
                    shuffle
                      ? "text-green-500"
                      : "text-gray-400 hover:text-white"
                  }
                  title={
                    shuffle ? "Đang bật phát ngẫu nhiên" : "Phát ngẫu nhiên"
                  }
                >
                  <Shuffle size={18} />
                </button>

                <button
                  onClick={handlePrevious}
                  className="text-gray-400 hover:text-white"
                  title="Bài trước"
                >
                  <SkipBack size={20} />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-white/10 transition hover:scale-105 hover:bg-green-400"
                  title={isPlaying ? "Tạm dừng" : "Phát"}
                >
                  {isPlaying ? (
                    <Pause size={20} />
                  ) : (
                    <Play size={20} className="ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="text-gray-400 hover:text-white"
                  title="Bài tiếp"
                >
                  <SkipForward size={20} />
                </button>

                <button
                  onClick={toggleRepeat}
                  className={
                    repeatMode !== "off"
                      ? "text-green-500"
                      : "text-gray-400 hover:text-white"
                  }
                  title={
                    repeatMode !== "off"
                      ? "Đang lặp lại bài hát"
                      : "Bật lặp lại bài hát"
                  }
                >
                  <Repeat size={18} />
                  {repeatMode !== "off" && (
                    <span className="-ml-1 text-[10px] font-black">1</span>
                  )}
                </button>
              </div>

              <div className="flex w-full max-w-xl items-center gap-2 text-[10px] text-gray-400 sm:text-[11px]">
                <span className="w-9 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Number.isFinite(progress) ? progress : 0}
                  onChange={handleSeek}
                  className="min-w-0 flex-1 cursor-pointer accent-green-500"
                  title="Có thể dùng phím ← / → để tua lại hoặc tới 5 giây"
                />
                <span className="w-9">{formatTime(durationSeconds)}</span>
              </div>
            </div>
          )}

          {hasTrack && (
            <div className="flex items-center justify-between gap-3 text-gray-400 md:w-1/4 md:justify-end">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={openMv}
                  disabled={!hasVideo}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    hasVideo
                      ? "bg-green-500/15 text-green-300 hover:bg-green-500 hover:text-white"
                      : "cursor-not-allowed bg-[#222] text-gray-600"
                  }`}
                  title={hasVideo ? "Xem MV" : "Bài này chưa có MV"}
                >
                  <Film size={16} />
                  <span>MV</span>
                </button>

                <button
                  onClick={openNowPlaying}
                  className="rounded-full p-2 transition hover:bg-white/10 hover:text-white"
                  title="Lời bài hát"
                >
                  <Mic2 size={19} />
                </button>

                <button
                  onClick={() => setShowQueue(!showQueue)}
                  className={`rounded-full p-2 transition hover:bg-white/10 hover:text-white ${
                    showQueue ? "text-green-500" : ""
                  }`}
                  title="Danh sách phát"
                >
                  <ListMusic size={20} />
                </button>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <Volume2 size={18} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-green-500 lg:w-24"
                />
              </div>
            </div>
          )}
        </div>

        {hasTrack && (
          <audio
            ref={audioRef}
            src={currentTrack?.audioUrl || ""}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
        )}

        {!isNowPlayingPage && hasTrack && showQueue && (
          <div className="absolute bottom-full right-2 z-[150] max-h-[70vh] w-[calc(100vw-1rem)] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#181818]/95 shadow-2xl backdrop-blur-xl sm:right-4">
            <Queue />
          </div>
        )}
      </div>

      {!isNowPlayingPage && (
        <div className="h-16 shrink-0" aria-hidden="true" />
      )}
    </>
  );
};

export default PlayerBar;
