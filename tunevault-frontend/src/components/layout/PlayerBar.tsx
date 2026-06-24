import { useEffect, useRef, useState } from "react";
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
  const [showQueue, setShowQueue] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const {
    currentTrack,
    isPlaying,
    progress,
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
    if (audio && audio.duration) {
      const currentProgress = (audio.currentTime / audio.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(audio.currentTime);
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
    if (!audio || !currentTrack) return;

    const newProgress = parseFloat(e.target.value);
    audio.currentTime = (newProgress / 100) * audio.duration;
    setProgress(newProgress);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume / 100;
  };

  const toggleRepeat = () => {
    const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % 3]);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
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
            onClick={toggleRepeat}
            className={
              repeatMode !== "off"
                ? "text-green-500"
                : "text-gray-400 hover:text-white"
            }
          >
            <Repeat size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full max-w-lg text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="flex-1 accent-green-500 cursor-pointer"
          />
          <span>{formatTime(currentTrack.duration)}</span>
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
        onEnded={nextTrack}
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
