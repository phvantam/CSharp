import { create } from "zustand";

export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  thumbnailUrl?: string;
  audioUrl: string;
}

type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  queue: Track[];
  currentIndex: number;
  repeatMode: RepeatMode;
  shuffle: boolean;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void; // Phát ngay bài tiếp theo
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  volume: 80,
  queue: [],
  currentIndex: 0,
  repeatMode: "off",
  shuffle: false,

  playTrack: (track, newQueue) => {
    const queue = newQueue || get().queue.length > 0 ? get().queue : [track];
    const index = queue.findIndex((t) => t.id === track.id);

    set({
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      queue: queue,
      currentIndex: index >= 0 ? index : 0,
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setProgress: (progress) => set({ progress }),
  setVolume: (volume) => set({ volume }),

  nextTrack: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === "all") nextIndex = 0;
      else return;
    }

    const nextTrack = queue[nextIndex];
    set({
      currentTrack: nextTrack,
      currentIndex: nextIndex,
      isPlaying: true,
      progress: 0,
    });
  },

  previousTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    set({
      currentTrack: queue[prevIndex],
      currentIndex: prevIndex,
      isPlaying: true,
      progress: 0,
    });
  },

  addToQueue: (track) => {
    set((state) => ({ queue: [...state.queue, track] }));
  },

  playNext: (track) => {
    const { queue, currentIndex } = get();
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, track);
    set({ queue: newQueue });
  },

  removeFromQueue: (index) => {
    set((state) => {
      const newQueue = state.queue.filter((_, i) => i !== index);
      return { queue: newQueue };
    });
  },

  clearQueue: () => set({ queue: [], currentIndex: 0 }),

  setRepeatMode: (mode) => set({ repeatMode: mode }),
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
}));
