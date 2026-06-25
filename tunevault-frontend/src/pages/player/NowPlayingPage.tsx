import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Edit3,
  Film,
  FileMusic,
  Music2,
  Pause,
  Play,
  Repeat,
  Save,
  Shuffle,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { mediaService } from "../../api";
import { usePlayerStore } from "../../stores/playerStore";

type ParsedLyricLine = {
  id: string;
  text: string;
  originalLine: string;
  time: number | null;
  endTime: number | null;
  order: number;
};

type ParsedLyricsResult = {
  lines: ParsedLyricLine[];
  timedLineIndexes: number[];
  hasTimedLyrics: boolean;
  offsetSeconds: number;
};

const parseTimestampToSeconds = (
  minutes: string,
  seconds: string,
  fraction?: string,
) => {
  const min = Number(minutes);
  const sec = Number(seconds);

  if (!Number.isFinite(min) || !Number.isFinite(sec)) return null;

  const normalizedFraction = (fraction || "").slice(0, 3);
  const decimal = normalizedFraction
    ? Number(`0.${normalizedFraction.padEnd(3, "0")}`)
    : 0;

  const totalSeconds = min * 60 + sec + decimal;

  return Number.isFinite(totalSeconds) ? totalSeconds : null;
};

const parseLyrics = (lyrics?: string | null): ParsedLyricsResult => {
  const rawLines = String(lyrics || "").split(/\r?\n/);

  // Chuẩn LRC phổ biến:
  // [00:12.34] Lời
  // [00:12:34] Lời
  // [00:12] Lời
  // [00:12.34][00:15.20] Lời
  const timestampRegex =
    /\[\s*(\d{1,3})\s*:\s*(\d{1,2})(?:[.:](\d{1,3}))?\s*\]/g;
  const offsetRegex = /^\s*\[\s*offset\s*:\s*([+-]?\d+)\s*\]\s*$/i;
  const metadataRegex =
    /^\s*\[\s*(ti|ar|al|au|by|length|re|ve|tool)\s*:[^\]]*\]\s*$/i;

  let offsetSeconds = 0;
  let order = 0;

  const parsedLines: ParsedLyricLine[] = [];

  rawLines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) return;

    const offsetMatch = line.match(offsetRegex);

    if (offsetMatch) {
      const offsetMs = Number(offsetMatch[1]);

      if (Number.isFinite(offsetMs)) {
        offsetSeconds = offsetMs / 1000;
      }

      return;
    }

    if (metadataRegex.test(line)) return;

    const matches = [...line.matchAll(timestampRegex)];
    const text = line.replace(timestampRegex, "").trim();

    if (!text) return;

    if (matches.length === 0) {
      parsedLines.push({
        id: `plain-${order}`,
        text,
        originalLine: line,
        time: null,
        endTime: null,
        order,
      });
      order += 1;
      return;
    }

    matches.forEach((match) => {
      const parsedTime = parseTimestampToSeconds(match[1], match[2], match[3]);

      if (parsedTime === null) return;

      parsedLines.push({
        id: `time-${parsedTime}-${order}`,
        text,
        originalLine: line,
        time: Math.max(0, parsedTime + offsetSeconds),
        endTime: null,
        order,
      });
      order += 1;
    });
  });

  const hasTimedLyrics = parsedLines.some((line) => line.time !== null);

  if (!hasTimedLyrics) {
    return {
      lines: parsedLines,
      timedLineIndexes: [],
      hasTimedLyrics: false,
      offsetSeconds,
    };
  }

  const sortedLines = [...parsedLines].sort((a, b) => {
    if (a.time === null && b.time === null) return a.order - b.order;
    if (a.time === null) return 1;
    if (b.time === null) return -1;

    if (a.time === b.time) return a.order - b.order;

    return a.time - b.time;
  });

  const timedLineIndexes = sortedLines.reduce<number[]>(
    (result, line, index) => {
      if (line.time !== null) result.push(index);
      return result;
    },
    [],
  );

  timedLineIndexes.forEach((lineIndex, timedPosition) => {
    const nextTimedIndex = timedLineIndexes[timedPosition + 1];
    sortedLines[lineIndex].endTime =
      typeof nextTimedIndex === "number"
        ? sortedLines[nextTimedIndex].time
        : null;
  });

  return {
    lines: sortedLines,
    timedLineIndexes,
    hasTimedLyrics: true,
    offsetSeconds,
  };
};

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

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

const getKaraokeCharStyle = (
  charIndex: number,
  charCount: number,
  progress: number,
): React.CSSProperties => {
  const safeProgress = clamp(progress, 0, 1);
  const cursor = safeProgress * charCount;
  const charFill = clamp(cursor - charIndex, 0, 1);

  if (charFill <= 0) {
    return {
      color: "rgba(255, 255, 255, 0.42)",
      opacity: 1,
      textShadow: "none",
      transition:
        "color 40ms linear, opacity 40ms linear, text-shadow 40ms linear",
    };
  }

  const isCursorChar = charFill > 0 && charFill < 1;
  const opacity = isCursorChar ? 0.5 + charFill * 0.5 : 1;

  return {
    color: "#4ade80",
    opacity,
    textShadow: isCursorChar
      ? "0 0 20px rgba(74, 222, 128, 0.9)"
      : "0 0 12px rgba(74, 222, 128, 0.48)",
    transition:
      "color 40ms linear, opacity 40ms linear, text-shadow 40ms linear",
  };
};

const renderKaraokeText = (text: string, progress: number) => {
  const characters = Array.from(text);
  const totalCharacters = Math.max(1, characters.length);

  return characters.map((char, index) => (
    <span
      key={`${char}-${index}`}
      style={getKaraokeCharStyle(index, totalCharacters, progress)}
    >
      {char}
    </span>
  ));
};

const getMediaId = (media: any) => {
  return Number(
    media?.mediaItemId || media?.MediaItemId || media?.id || media?.Id || 0,
  );
};

const getMediaTitle = (media: any) => {
  return media?.title || media?.Title || "Không rõ tên bài hát";
};

const getMediaArtist = (media: any) => {
  return (
    media?.artistName ||
    media?.ArtistName ||
    media?.artist ||
    media?.Artist ||
    "Unknown Artist"
  );
};

const getMediaDuration = (media: any) => {
  return Number(media?.durationSeconds || media?.DurationSeconds || 0);
};

const getMediaThumbnail = (media: any) => {
  const raw = media?.thumbnailUrl || media?.ThumbnailUrl || "";
  return raw ? mediaService.getFullMediaUrl(raw) : "";
};

const getMediaAudioUrl = (media: any) => {
  const mediaId = getMediaId(media);
  const raw =
    media?.audioUrl ||
    media?.AudioUrl ||
    media?.audioFilePath ||
    media?.AudioFilePath ||
    media?.filePath ||
    media?.FilePath ||
    (mediaId ? mediaService.getStreamUrl(mediaId) : "");

  return raw?.startsWith("http") ? raw : mediaService.getFullMediaUrl(raw);
};

const buildTrackFromMedia = (media: any) => {
  const mediaId = getMediaId(media);

  if (!mediaId) return null;

  return {
    id: mediaId,
    title: getMediaTitle(media),
    artist: getMediaArtist(media),
    duration: getMediaDuration(media),
    thumbnailUrl: getMediaThumbnail(media),
    audioUrl: getMediaAudioUrl(media),
    videoUrl:
      media?.videoUrl ||
      media?.VideoUrl ||
      media?.videoFilePath ||
      media?.VideoFilePath,
    hasVideo: Boolean(
      media?.hasVideo ||
      media?.HasVideo ||
      media?.videoUrl ||
      media?.VideoUrl ||
      media?.videoFilePath ||
      media?.VideoFilePath,
    ),
    isVideo: Boolean(media?.isVideo || media?.IsVideo),
    lyrics: media?.lyrics || media?.Lyrics || "",
  };
};

const NowPlayingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const routeMediaId = Number(id || 0);
  const activeLyricRef = useRef<HTMLParagraphElement | null>(null);

  const [mediaDetail, setMediaDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [lyricsDraft, setLyricsDraft] = useState("");
  const [savingLyrics, setSavingLyrics] = useState(false);
  const [smoothCurrentTimeSeconds, setSmoothCurrentTimeSeconds] = useState(0);
  const smoothTimeBaseRef = useRef({
    audioTime: 0,
    performanceTime: 0,
  });

  const {
    currentTrack,
    isPlaying,
    repeatMode,
    shuffle,
    progress,
    currentTimeSeconds: playerCurrentTimeSeconds,
    durationSeconds: playerDurationSeconds,
    playTrack,
    togglePlay,
    nextTrack,
    previousTrack,
    toggleShuffle,
    setRepeatMode,
  } = usePlayerStore();

  const targetMediaId = routeMediaId || currentTrack?.id || 0;

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      if (!targetMediaId) {
        setMediaDetail(null);
        return;
      }

      setLoadingDetail(true);

      try {
        const detail = await mediaService.getMediaById(targetMediaId);
        if (!cancelled) setMediaDetail(detail);
      } catch (error) {
        console.error("Lỗi tải media detail:", error);
        if (!cancelled) setMediaDetail(null);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [targetMediaId]);

  const viewedTrack = useMemo(() => {
    if (routeMediaId && mediaDetail) {
      return buildTrackFromMedia(mediaDetail);
    }

    return currentTrack;
  }, [routeMediaId, mediaDetail, currentTrack]);

  const isViewingCurrentTrack = Boolean(
    viewedTrack?.id && currentTrack?.id && viewedTrack.id === currentTrack.id,
  );

  const isViewerPlaying = isViewingCurrentTrack && isPlaying;

  const handlePlayViewedTrack = () => {
    if (!viewedTrack) return;

    if (isViewingCurrentTrack) {
      togglePlay();
      return;
    }

    playTrack(viewedTrack);
  };

  useEffect(() => {
    const handleKeyboardSeek = (event: KeyboardEvent) => {
      if (
        !viewedTrack ||
        !isViewingCurrentTrack ||
        showLyricsModal ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        window.dispatchEvent(
          new CustomEvent("tunevault:seek-by", {
            detail: { seconds: -5 },
          }),
        );
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        window.dispatchEvent(
          new CustomEvent("tunevault:seek-by", {
            detail: { seconds: 5 },
          }),
        );
      }
    };

    window.addEventListener("keydown", handleKeyboardSeek);

    return () => {
      window.removeEventListener("keydown", handleKeyboardSeek);
    };
  }, [viewedTrack, isViewingCurrentTrack, showLyricsModal]);

  const realLyrics = useMemo(() => {
    return (
      mediaDetail?.lyrics ||
      mediaDetail?.Lyrics ||
      currentTrack?.lyrics ||
      ""
    ).trim();
  }, [mediaDetail, currentTrack?.lyrics]);

  const hasLyrics = realLyrics.length > 0;
  const parsedLyrics = useMemo(() => parseLyrics(realLyrics), [realLyrics]);
  const lyricsLines = parsedLyrics.lines;
  const hasTimedLyrics = parsedLyrics.hasTimedLyrics;
  const timedLineIndexes = parsedLyrics.timedLineIndexes;

  const durationSeconds = isViewingCurrentTrack
    ? Number(
        playerDurationSeconds ??
          currentTrack?.duration ??
          mediaDetail?.durationSeconds ??
          mediaDetail?.DurationSeconds ??
          0,
      )
    : Number(
        viewedTrack?.duration ||
          mediaDetail?.durationSeconds ||
          mediaDetail?.DurationSeconds ||
          0,
      );

  const progressBasedTime =
    durationSeconds > 0 ? (Number(progress || 0) / 100) * durationSeconds : 0;

  const currentTimeSecondsFromStore = isViewingCurrentTrack
    ? Number.isFinite(Number(playerCurrentTimeSeconds)) &&
      Number(playerCurrentTimeSeconds) >= 0
      ? Number(playerCurrentTimeSeconds)
      : progressBasedTime
    : 0;

  useEffect(() => {
    smoothTimeBaseRef.current = {
      audioTime: currentTimeSecondsFromStore,
      performanceTime: performance.now(),
    };

    setSmoothCurrentTimeSeconds(currentTimeSecondsFromStore);
  }, [currentTimeSecondsFromStore]);

  useEffect(() => {
    if (!isViewerPlaying || durationSeconds <= 0) {
      setSmoothCurrentTimeSeconds(currentTimeSecondsFromStore);
      return;
    }

    let frameId = 0;

    const tick = () => {
      const elapsedSeconds =
        (performance.now() - smoothTimeBaseRef.current.performanceTime) / 1000;
      const nextTime = Math.min(
        durationSeconds,
        Math.max(0, smoothTimeBaseRef.current.audioTime + elapsedSeconds),
      );

      setSmoothCurrentTimeSeconds(Number(nextTime.toFixed(3)));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [currentTimeSecondsFromStore, durationSeconds, isViewerPlaying]);

  const currentTimeSeconds = smoothCurrentTimeSeconds;

  const currentLyricIndex = useMemo(() => {
    if (!hasLyrics || !hasTimedLyrics || timedLineIndexes.length === 0) {
      return -1;
    }

    // Dò nhị phân trên index thật của lyricsLines để tránh lỗi khi 2 dòng trùng chữ.
    let left = 0;
    let right = timedLineIndexes.length - 1;
    let activeIndex = -1;

    while (left <= right) {
      const middle = Math.floor((left + right) / 2);
      const lyricIndex = timedLineIndexes[middle];
      const lyricTime = lyricsLines[lyricIndex]?.time;

      if (
        lyricTime !== null &&
        lyricTime !== undefined &&
        lyricTime <= currentTimeSeconds + 0.04
      ) {
        activeIndex = lyricIndex;
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }

    return activeIndex;
  }, [
    currentTimeSeconds,
    hasLyrics,
    hasTimedLyrics,
    lyricsLines,
    timedLineIndexes,
  ]);

  const currentLyricProgress = useMemo(() => {
    if (currentLyricIndex < 0 || !hasTimedLyrics) return 0;

    const currentLine = lyricsLines[currentLyricIndex];

    if (!currentLine || currentLine.time === null) return 0;

    const start = currentLine.time;
    const end =
      currentLine.endTime ??
      (durationSeconds > start ? durationSeconds : start + 4);

    const range = Math.max(0.35, end - start);
    const rawProgress = clamp((currentTimeSeconds - start) / range, 0, 1);

    // Smoothstep giúp đầu/cuối dòng mềm hơn, không bị giật chữ.
    return rawProgress * rawProgress * (3 - 2 * rawProgress);
  }, [
    currentLyricIndex,
    currentTimeSeconds,
    durationSeconds,
    hasTimedLyrics,
    lyricsLines,
  ]);

  const getLyricState = (index: number) => {
    const line = lyricsLines[index];

    if (!hasTimedLyrics || line.time === null) {
      return {
        isActive: false,
        isPast: false,
        isFuture: false,
      };
    }

    return {
      isActive: index === currentLyricIndex,
      isPast: currentLyricIndex >= 0 && index < currentLyricIndex,
      isFuture: currentLyricIndex < 0 || index > currentLyricIndex,
    };
  };

  useEffect(() => {
    if (currentLyricIndex < 0) return;

    activeLyricRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [currentLyricIndex]);

  const hasVideo = Boolean(
    currentTrack?.hasVideo ||
    currentTrack?.isVideo ||
    currentTrack?.videoUrl ||
    mediaDetail?.hasVideo ||
    mediaDetail?.videoUrl ||
    mediaDetail?.videoFilePath,
  );

  const coverUrl =
    viewedTrack?.thumbnailUrl ||
    mediaService.getFullMediaUrl(mediaDetail?.thumbnailUrl);

  const toggleRepeat = () => {
    const modes: ("off" | "all" | "one")[] = ["off", "all", "one"];
    const current = modes.indexOf(repeatMode);
    setRepeatMode(modes[(current + 1) % 3]);
  };

  const openMv = () => {
    if (!viewedTrack || !hasVideo) return;

    navigate(`/video/${viewedTrack.id}`, {
      state: {
        media: {
          mediaItemId: viewedTrack.id,
          title: viewedTrack.title,
          artistName: viewedTrack.artist,
          thumbnailUrl: viewedTrack.thumbnailUrl,
          videoUrl: viewedTrack.videoUrl || mediaDetail?.videoUrl,
        },
      },
    });
  };

  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Number(seconds || 0));
    const min = Math.floor(safeSeconds / 60);
    const sec = Math.floor(safeSeconds % 60);

    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const openLyricsModal = () => {
    setLyricsDraft(realLyrics);
    setShowLyricsModal(true);
  };

  const closeLyricsModal = () => {
    if (savingLyrics) return;
    setShowLyricsModal(false);
  };

  const saveLyrics = async () => {
    if (!targetMediaId) return;

    const nextLyrics = lyricsDraft.trim();

    setSavingLyrics(true);

    try {
      await mediaService.updateMedia(targetMediaId, {
        lyrics: nextLyrics,
      });

      setMediaDetail((prev: any) => ({
        ...(prev || {}),
        lyrics: nextLyrics,
        Lyrics: nextLyrics,
      }));

      usePlayerStore.setState((state) => ({
        currentTrack: state.currentTrack
          ? {
              ...state.currentTrack,
              lyrics: nextLyrics,
            }
          : state.currentTrack,
        queue: state.queue.map((track) =>
          track.id === targetMediaId
            ? {
                ...track,
                lyrics: nextLyrics,
              }
            : track,
        ),
      }));

      toast.success("Đã lưu lời bài hát");
      setShowLyricsModal(false);
    } catch (error: any) {
      console.error("Lỗi lưu lyrics:", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        error?.response?.data?.error ||
        "Không thể lưu lời bài hát";
      toast.error(message);
    } finally {
      setSavingLyrics(false);
    }
  };

  if (!viewedTrack) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <Music2 size={72} className="mb-5 text-gray-600" />
        <h1 className="text-3xl font-bold">
          {loadingDetail ? "Đang tải lời bài hát..." : "Chưa có bài hát"}
        </h1>
        <p className="mt-2 text-gray-400">
          Hãy chọn một bài hát để mở trình phát lời bài hát.
        </p>
        <button
          onClick={() => navigate("/home")}
          className="mt-6 rounded-full bg-green-500 px-6 py-3 font-bold text-black hover:bg-green-400"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="relative -m-6 min-h-[calc(100vh-64px)] overflow-hidden bg-[#17111f] text-white">
      <div
        className="absolute inset-0 opacity-35 blur-3xl"
        style={{
          backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-[#2b1740]/90 via-[#191720]/95 to-[#090909]/95" />

      <div className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col px-5 py-5 sm:px-8 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 backdrop-blur"></div>

          <div className="flex items-center gap-3">
            {viewedTrack && (
              <button
                onClick={openLyricsModal}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-green-500 px-5 text-sm font-black text-black transition hover:bg-green-400"
                title={hasLyrics ? "Sửa lời bài hát" : "Thêm lời bài hát"}
              >
                <Edit3 size={18} />
                <span className="hidden sm:inline">
                  {hasLyrics ? "Sửa lời bài hát" : "Thêm lời bài hát"}
                </span>
              </button>
            )}

            <button
              onClick={openMv}
              disabled={!hasVideo}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                hasVideo
                  ? "bg-white/15 hover:bg-green-500 hover:text-black"
                  : "cursor-not-allowed bg-white/5 text-white/30"
              }`}
              title={hasVideo ? "Xem MV" : "Bài này chưa có MV"}
            >
              <Film size={21} />
            </button>

            <button
              onClick={() => navigate(-1)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
              title="Thu nhỏ"
            >
              <ChevronDown size={24} />
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-8 lg:grid-cols-[430px_minmax(0,1fr)] lg:gap-16">
          <div className="flex flex-col items-center justify-center">
            <div className="aspect-square w-full max-w-[390px] overflow-hidden rounded-3xl bg-black/30 shadow-2xl ring-1 ring-white/10 lg:max-w-[430px]">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={viewedTrack.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music2 size={90} className="text-white/30" />
                </div>
              )}
            </div>
          </div>

          <div className="flex min-w-0 items-center overflow-hidden">
            <div className="min-w-0 w-full">
              {hasLyrics ? (
                <>
                  <div className="mb-8">
                    <h1 className="text-4xl font-black text-white md:text-5xl"></h1>
                  </div>

                  <div className="max-h-[calc(100vh-360px)] min-h-[360px] space-y-4 overflow-x-hidden overflow-y-auto pr-5">
                    {lyricsLines.map((line, index) => {
                      const { isActive, isPast, isFuture } =
                        getLyricState(index);
                      return (
                        <p
                          key={line.id}
                          ref={isActive ? activeLyricRef : null}
                          className={`max-w-full whitespace-normal break-words rounded-2xl px-4 py-2 text-[clamp(1.65rem,3vw,2.7rem)] font-black leading-[1.18] transition-transform duration-300 ${
                            isActive
                              ? "translate-x-1 scale-[1.025] drop-shadow-[0_0_26px_rgba(34,197,94,0.52)]"
                              : isPast
                                ? "text-white/22"
                                : isFuture
                                  ? "text-white/52"
                                  : "text-white/80"
                          }`}
                        >
                          {isActive ? (
                            <span className="inline whitespace-normal break-words">
                              {renderKaraokeText(
                                line.text,
                                currentLyricProgress,
                              )}
                            </span>
                          ) : (
                            line.text
                          )}
                        </p>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-black/25 p-8 text-center shadow-2xl backdrop-blur">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/15 text-green-300 ring-1 ring-green-400/20">
                    <FileMusic size={42} />
                  </div>

                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-green-300">
                    Chưa có lyrics
                  </p>

                  <h1 className="text-3xl font-black text-white md:text-4xl">
                    Chưa có lời bài hát cho bài này
                  </h1>

                  <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-300">
                    TuneVault chưa có lời cho bài hát này. Bạn có thể bổ sung
                    lyrics để phần Now Playing hiển thị đầy đủ và thân thiện
                    hơn.
                  </p>

                  {loadingDetail ? (
                    <p className="mt-6 text-sm text-gray-500">
                      Đang kiểm tra thông tin bài hát...
                    </p>
                  ) : (
                    <button
                      onClick={openLyricsModal}
                      className="mt-7 inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-black text-black transition hover:bg-green-400"
                    >
                      <Edit3 size={19} />
                      Thêm lời bài hát
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-7 w-full max-w-3xl pb-4">
          <div className="mb-3 text-center text-sm font-black text-white">
            {viewedTrack.title}{" "}
            <span className="text-white/55">- {viewedTrack.artist}</span>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <span className="w-12 text-right text-sm font-bold text-white/55">
              {formatTime(currentTimeSeconds)}
            </span>

            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-green-400 transition-[width] duration-300"
                style={{
                  width: `${isViewingCurrentTrack ? Math.max(0, Math.min(100, progress)) : 0}%`,
                }}
              />
            </div>

            <span className="w-12 text-sm font-bold text-white/80">
              {formatTime(durationSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-7">
            <button
              onClick={toggleShuffle}
              disabled={!isViewingCurrentTrack}
              className={`transition hover:scale-110 ${
                !isViewingCurrentTrack
                  ? "cursor-not-allowed text-white/25"
                  : shuffle
                    ? "text-green-300"
                    : "text-white/80 hover:text-white"
              }`}
              title="Trộn bài"
            >
              <Shuffle size={22} />
            </button>

            <button
              onClick={previousTrack}
              disabled={!isViewingCurrentTrack}
              className={`transition hover:scale-110 ${
                isViewingCurrentTrack
                  ? "text-white/80 hover:text-white"
                  : "cursor-not-allowed text-white/25"
              }`}
              title="Bài trước"
            >
              <SkipBack size={26} />
            </button>

            <button
              onClick={handlePlayViewedTrack}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/85 bg-white/10 text-white shadow-[0_0_35px_rgba(255,255,255,0.16)] transition hover:scale-105 hover:bg-white/20"
              title={isViewerPlaying ? "Tạm dừng" : "Phát"}
            >
              {isViewerPlaying ? (
                <Pause size={28} />
              ) : (
                <Play size={28} className="ml-1" />
              )}
            </button>

            <button
              onClick={nextTrack}
              disabled={!isViewingCurrentTrack}
              className={`transition hover:scale-110 ${
                isViewingCurrentTrack
                  ? "text-white/80 hover:text-white"
                  : "cursor-not-allowed text-white/25"
              }`}
              title="Bài tiếp"
            >
              <SkipForward size={26} />
            </button>

            <button
              onClick={toggleRepeat}
              disabled={!isViewingCurrentTrack}
              className={`transition hover:scale-110 ${
                !isViewingCurrentTrack
                  ? "cursor-not-allowed text-white/25"
                  : repeatMode !== "off"
                    ? "text-green-300"
                    : "text-white/80 hover:text-white"
              }`}
              title="Lặp lại"
            >
              <Repeat size={22} />
            </button>
          </div>

          <p className="mt-4 text-center text-xs font-semibold text-white/35"></p>
        </div>
      </div>

      {showLyricsModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#181818] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {hasLyrics ? "Sửa lời bài hát" : "Thêm lời bài hát"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Karaoke chạy theo audio.currentTime thật. Dòng đang hát giữ
                  nền chữ xám, phần đã hát sẽ chuyển xanh từ trái sang phải.
                </p>
              </div>

              <button
                onClick={closeLyricsModal}
                className="rounded-full p-2 text-gray-400 transition hover:bg-[#282828] hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <textarea
              value={lyricsDraft}
              onChange={(e) => setLyricsDraft(e.target.value)}
              placeholder={`Ví dụ LRC chính xác:\n[00:12.50] Ngày mai em đi mất\n[00:17.20] Anh vẫn đứng chờ nơi đây...\n[00:22.00] Một mình anh với cơn mưa\n\nCó thể thêm offset nếu cần lệch thời gian:\n[offset:+300]`}
              className="min-h-[360px] w-full resize-y rounded-2xl border border-white/10 bg-[#252525] p-4 text-base leading-7 text-white outline-none transition placeholder:text-gray-500 focus:border-green-500"
            />

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                onClick={closeLyricsModal}
                disabled={savingLyrics}
                className="rounded-full bg-[#282828] px-5 py-3 font-semibold text-white transition hover:bg-[#333] disabled:opacity-60"
              >
                Hủy
              </button>

              <button
                onClick={saveLyrics}
                disabled={savingLyrics}
                className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 font-black text-black transition hover:bg-green-400 disabled:opacity-60"
              >
                <Save size={18} />
                {savingLyrics ? "Đang lưu..." : "Lưu lyrics"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NowPlayingPage;
