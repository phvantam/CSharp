import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from 'react';
import type { MediaItem } from '../types/media.types';
import { mediaApi } from '../api/media.api';

interface PlayerContextValue {
  currentTrack: MediaItem | null;
  queue: MediaItem[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  play: (track: MediaItem, queue?: MediaItem[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<MediaItem | null>(null);
  const [queue, setQueue]               = useState<MediaItem[]>([]);
  const [queueIndex, setQueueIndex]     = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolumeState]        = useState(0.8);
  const [isMuted, setIsMuted]           = useState(false);

  const playTrack = useCallback((track: MediaItem) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = mediaApi.getStreamUrl(track.id);
    audio.play().then(() => setIsPlaying(true)).catch(console.error);
    mediaApi.recordPlay(track.id).catch(() => {});
    setCurrentTrack(track);
  }, []);

  const play = useCallback((track: MediaItem, newQueue?: MediaItem[]) => {
    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    }
    playTrack(track);
  }, [playTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(console.error);
  }, []);

  const togglePlay = useCallback(() => {
    isPlaying ? pause() : resume();
  }, [isPlaying, pause, resume]);

  const next = useCallback(() => {
    const nextIdx = (queueIndex + 1) % queue.length;
    if (queue[nextIdx]) { setQueueIndex(nextIdx); playTrack(queue[nextIdx]); }
  }, [queue, queueIndex, playTrack]);

  const prev = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    if (queue[prevIdx]) { setQueueIndex(prevIdx); playTrack(queue[prevIdx]); }
  }, [queue, queueIndex, playTrack]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
    if (vol > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => {
      if (audioRef.current) audioRef.current.muted = !m;
      return !m;
    });
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentTrack, queue, isPlaying, currentTime, duration, volume, isMuted,
      play, pause, resume, togglePlay, next, prev, seek, setVolume, toggleMute, audioRef,
    }}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onEnded={next}
        preload="metadata"
      />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return ctx;
}
