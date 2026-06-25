import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  ListMusic,
} from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import Queue from "../player/Queue";

const PlayerBar = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const location = useLocation();
  const [showQueue, setShowQueue] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const clickTimeoutRef = useRef<any>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current !== null) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const {
    currentTrack,
    isPlaying,
    volume,
    repeatMode,
    shuffle,
    togglePlay,
    setProgress,
    setVolume,
    nextTrack,
    previousTrack,
    setRepeatMode,
    toggleShuffle,
  } = usePlayerStore();

  // Close queue when location pathname changes
  useEffect(() => {
    setShowQueue(false);
  }, [location.pathname]);

  // Reset progress and set duration when track changes
  useEffect(() => {
    if (currentTrack) {
      setCurrentTime(0);
      setDuration(currentTrack.duration || 0);
    }
  }, [currentTrack]);

  // Phát / Dừng
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Cập nhật thời gian thực
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        const currentProgress = (audio.currentTime / audio.duration) * 100;
        setProgress(currentProgress);
      }
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setDuration(audio.duration);
    }
  };

  useEffect(() => {
    if (currentTrack?.id) {
      import("../../api/playHistoryService").then(({ playHistoryService }) => {
        playHistoryService.recordPlay(currentTrack.id);
      });
    }
  }, [currentTrack?.id]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress((newTime / duration) * 100);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume / 100;
  };

  const handleRepeatClick = () => {
    if (clickTimeoutRef.current !== null) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      setRepeatMode("one");
    } else {
      clickTimeoutRef.current = window.setTimeout(() => {
        clickTimeoutRef.current = null;
        setRepeatMode(repeatMode === "off" ? "all" : "off");
      }, 250);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleEnded = () => {
    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      nextTrack();
    }
  };

  if (!currentTrack) {
    return (
      <div className="flex h-20 items-center justify-center border-t border-[#282828] bg-[#181818] text-sm text-gray-400">
        Chọn bài hát để bắt đầu phát
      </div>
    );
  }

  return (
    <div className="flex h-20 items-center border-t border-[#282828] bg-[#181818] px-4 text-white relative">
      {/* Track Info */}
      <div className="flex w-1/4 items-center gap-4">
        <div className="h-14 w-14 rounded overflow-hidden bg-[#282828]">
          {currentTrack.thumbnailUrl && (
            <img
              src={currentTrack.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{currentTrack.title}</p>
          <p className="text-sm text-gray-400 truncate">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex w-2/4 flex-col items-center">
        <div className="flex items-center gap-5 mb-1">
          <button
            onClick={toggleShuffle}
            className={
              shuffle ? "text-green-500" : "text-gray-400 hover:text-white"
            }
          >
            <Shuffle size={18} />
          </button>
          <button
            onClick={previousTrack}
            className="text-gray-400 hover:text-white"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-black hover:scale-105"
          >
            {isPlaying ? (
              <Pause size={22} />
            ) : (
              <Play size={22} className="ml-0.5" />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="text-gray-400 hover:text-white"
          >
            <SkipForward size={20} />
          </button>
          <button
            onClick={handleRepeatClick}
            className={`relative p-1 ${
              repeatMode !== "off"
                ? "text-green-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Repeat size={18} />
            {repeatMode === "one" && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-black border border-[#181818]">
                1
              </span>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full max-w-lg text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-green-500 cursor-pointer"
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume + Queue */}
      <div className="flex w-1/4 justify-end items-center gap-4 text-gray-400">
        <button
          onClick={() => setShowQueue(!showQueue)}
          className={`hover:text-white transition ${showQueue ? "text-green-500" : ""}`}
        >
          <ListMusic size={20} />
        </button>

        <div className="flex items-center gap-2">
          <Volume2 size={18} />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-green-500"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Queue Panel */}
      {showQueue && (
        <div className="absolute bottom-[80px] right-4 w-80 bg-[#181818] border border-[#282828] rounded-xl shadow-2xl z-50 max-h-[400px] overflow-hidden">
          <Queue />
        </div>
      )}
    </div>
  );
};

export default PlayerBar;
