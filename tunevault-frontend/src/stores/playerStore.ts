import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  thumbnailUrl?: string;
  audioUrl: string;

  videoUrl?: string;
  hasVideo?: boolean;
  isVideo?: boolean;
  lyrics?: string;
}

type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  currentTimeSeconds: number;
  durationSeconds: number;
  volume: number;
  queue: Track[];
  currentIndex: number;
  repeatMode: RepeatMode;
  shuffle: boolean;

  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pauseTrack: () => void;
  setProgress: (progress: number) => void;
  setPlaybackPosition: (
    currentTimeSeconds: number,
    durationSeconds: number,
  ) => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  resetPlayer: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
}

const getRandomIndex = (length: number, currentIndex: number) => {
  if (length <= 1) return currentIndex;

  let nextIndex = currentIndex;

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }

  return nextIndex;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      currentTimeSeconds: 0,
      durationSeconds: 0,
      volume: 80,
      queue: [],
      currentIndex: 0,
      repeatMode: "off",
      shuffle: false,

      playTrack: (track, newQueue) => {
        const queue =
          newQueue && newQueue.length > 0
            ? newQueue
            : get().queue.length > 0 &&
                get().queue.some((item) => item.id === track.id)
              ? get().queue
              : [track];

        const index = queue.findIndex((t) => t.id === track.id);

        set({
          currentTrack: track,
          isPlaying: true,
          progress: 0,
          currentTimeSeconds: 0,
          durationSeconds: Number(track.duration || 0),
          queue,
          currentIndex: index >= 0 ? index : 0,
        });
      },

      togglePlay: () =>
        set((state) => ({
          isPlaying: state.currentTrack ? !state.isPlaying : false,
        })),

      pauseTrack: () => set({ isPlaying: false }),

      setProgress: (progress) => set({ progress }),

      setPlaybackPosition: (currentTimeSeconds, durationSeconds) =>
        set({
          currentTimeSeconds: Number.isFinite(currentTimeSeconds)
            ? currentTimeSeconds
            : 0,
          durationSeconds: Number.isFinite(durationSeconds)
            ? durationSeconds
            : 0,
          progress:
            durationSeconds > 0
              ? Math.max(
                  0,
                  Math.min(100, (currentTimeSeconds / durationSeconds) * 100),
                )
              : 0,
        }),

      setVolume: (volume) => set({ volume }),

      nextTrack: () => {
        const { queue, currentIndex, shuffle } = get();

        if (queue.length === 0) {
          set({
            currentTrack: null,
            isPlaying: false,
            progress: 0,
            currentTimeSeconds: 0,
            durationSeconds: 0,
            currentIndex: 0,
          });
          return;
        }

        if (queue.length === 1) {
          set({
            isPlaying: false,
            progress: 0,
            currentTimeSeconds: 0,
            durationSeconds: 0,
          });
          return;
        }

        let nextIndex = currentIndex + 1;

        if (shuffle) {
          nextIndex = getRandomIndex(queue.length, currentIndex);
        } else if (nextIndex >= queue.length) {
          set({
            isPlaying: false,
            progress: 0,
            currentTimeSeconds: 0,
            durationSeconds: 0,
          });
          return;
        }

        set({
          currentTrack: queue[nextIndex],
          currentIndex: nextIndex,
          isPlaying: true,
          progress: 0,
          currentTimeSeconds: 0,
          durationSeconds: Number(queue[nextIndex]?.duration || 0),
        });
      },

      previousTrack: () => {
        const { queue, currentIndex, shuffle } = get();

        if (queue.length === 0) return;

        let prevIndex = currentIndex - 1;

        if (shuffle) {
          prevIndex = getRandomIndex(queue.length, currentIndex);
        } else if (prevIndex < 0) {
          prevIndex = queue.length - 1;
        }

        set({
          currentTrack: queue[prevIndex],
          currentIndex: prevIndex,
          isPlaying: true,
          progress: 0,
          currentTimeSeconds: 0,
          durationSeconds: Number(queue[prevIndex]?.duration || 0),
        });
      },

      addToQueue: (track) =>
        set((state) => ({
          queue: [...state.queue, track],
        })),

      playNext: (track) => {
        const { queue, currentIndex } = get();
        const newQueue = [...queue];
        newQueue.splice(currentIndex + 1, 0, track);
        set({ queue: newQueue });
      },

      removeFromQueue: (index) =>
        set((state) => {
          const newQueue = state.queue.filter((_, i) => i !== index);

          return {
            queue: newQueue,
            currentIndex:
              state.currentIndex >= newQueue.length
                ? Math.max(0, newQueue.length - 1)
                : state.currentIndex,
          };
        }),

      clearQueue: () => set({ queue: [], currentIndex: 0 }),

      resetPlayer: () =>
        set({
          currentTrack: null,
          isPlaying: false,
          progress: 0,
          currentTimeSeconds: 0,
          durationSeconds: 0,
          queue: [],
          currentIndex: 0,
          repeatMode: "off",
          shuffle: false,
        }),

      setRepeatMode: (mode) => set({ repeatMode: mode }),

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
    }),
    {
      name: "tunevault-player",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        isPlaying: false,
        progress: state.progress,
        currentTimeSeconds: state.currentTimeSeconds,
        durationSeconds: state.durationSeconds,
        volume: state.volume,
        queue: state.queue,
        currentIndex: state.currentIndex,
        repeatMode: state.repeatMode,
        shuffle: state.shuffle,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isPlaying = false;
        }
      },
    },
  ),
);
