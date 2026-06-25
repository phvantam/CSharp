import { SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

function formatTime(sec: number) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerBar() {
  const {
    currentTrack, isPlaying, currentTime, duration,
    volume, isMuted, togglePlay, next, prev, seek, setVolume, toggleMute,
  } = usePlayer();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) return null;

  return (
    <footer className="h-[90px] bg-[#181818] border-t border-[#282828] flex items-center px-4 gap-4 shrink-0 z-20">
      {/* Track info */}
      <div className="flex items-center gap-3 w-56 shrink-0">
        <div className="w-14 h-14 rounded bg-[#282828] overflow-hidden shrink-0">
          {currentTrack.coverUrl
            ? <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">♪</div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
          <p className="text-xs text-[#b3b3b3] truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-5">
          <button className="text-[#b3b3b3] hover:text-white transition-colors">
            <Shuffle size={16} />
          </button>
          <button onClick={prev} className="text-[#b3b3b3] hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>
          <button onClick={next} className="text-[#b3b3b3] hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>
          <button className="text-[#b3b3b3] hover:text-white transition-colors">
            <Repeat size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full max-w-lg">
          <span className="text-[10px] text-[#b3b3b3] w-8 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 h-1 bg-[#4d4d4d] rounded-full group cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              seek(ratio * duration);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full bg-white group-hover:bg-[#1db954] rounded-full transition-colors"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-[#b3b3b3] w-8 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-36 shrink-0 justify-end">
        <button onClick={toggleMute} className="text-[#b3b3b3] hover:text-white transition-colors">
          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div
          className="relative flex-1 h-1 bg-[#4d4d4d] rounded-full group cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setVolume(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
          }}
        >
          <div
            className="absolute left-0 top-0 h-full bg-white group-hover:bg-[#1db954] rounded-full transition-colors"
            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
          />
        </div>
      </div>
    </footer>
  );
}
