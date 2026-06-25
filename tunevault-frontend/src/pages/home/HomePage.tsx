import { useEffect, useMemo, useState } from "react";
import { Film, Heart, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";
import { favoriteService } from "../../api/favoriteService";
import type { MediaItemDto } from "../../api/types/media";
import SongMenu from "../../components/media/SongMenu";
import { formatCount } from "../../utils/formatCount";

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || "http://localhost:5090/api"
).replace(/\/api\/?$/, "");

const toStaticUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("blob:")) return url;
  if (url.startsWith("/media/")) return `${API_ORIGIN}${url}`;
  return url;
};

const toAudioUrl = (media: MediaItemDto) => {
  const raw =
    media.audioUrl ||
    (media as any).audioFilePath ||
    media.filePath ||
    mediaService.getStreamUrl(media.mediaItemId);

  return raw?.startsWith("http") ? raw : toStaticUrl(raw);
};

const getArtists = (media: MediaItemDto) => {
  if (media.artists && media.artists.length > 0) {
    return [...media.artists].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0),
    );
  }

  if (media.artistId && media.artistName) {
    return [{ artistId: media.artistId, name: media.artistName }];
  }

  if (media.artistName) {
    return [{ artistId: 0, name: media.artistName }];
  }

  return [];
};

const ArtistLinks = ({
  media,
  className = "",
}: {
  media: MediaItemDto;
  className?: string;
}) => {
  const artists = getArtists(media);

  if (artists.length === 0) {
    return <span className={className}>Unknown Artist</span>;
  }

  return (
    <>
      {artists.map((artist, index) => (
        <span
          key={`${artist.artistId}-${artist.name}`}
          className="inline-flex min-w-0 items-center"
        >
          {index > 0 && <span className="mx-1 text-gray-500">,</span>}

          {artist.artistId ? (
            <Link
              to={`/artist/${artist.artistId}`}
              className={className || "hover:text-white hover:underline"}
              title={artist.name}
            >
              {artist.name}
            </Link>
          ) : (
            <span className={className} title={artist.name}>
              {artist.name}
            </span>
          )}
        </span>
      ))}
    </>
  );
};

const getHardcodedTrending = (): MediaItemDto[] => [
  {
    mediaItemId: 1,
    title: "Nơi Này Có Anh",
    artistId: 1,
    artistName: "Sơn Tùng M-TP",
    durationSeconds: 278,
    playCount: 1250000,
    visibility: "Public",
    mediaType: "Audio",
    thumbnailUrl: "/image/noinaycoanh.png",
    hasVideo: true,
    audioUrl: "/audio/noinaycoanh.mp3",
  },
  {
    mediaItemId: 3,
    title: "Mang Tiền Về Cho Mẹ",
    artistId: 3,
    artistName: "Đen",
    durationSeconds: 407,
    playCount: 2100000,
    visibility: "Public",
    mediaType: "Audio",
    thumbnailUrl: "/image/mangtienvechome.jpg",
    hasVideo: true,
    audioUrl: "/audio/mangtienvechome.mp3",
  },
  {
    mediaItemId: 9,
    title: "Không Thể Say",
    artistId: 13,
    artistName: "HIEUTHUHAI",
    durationSeconds: 255,
    playCount: 1850000,
    visibility: "Public",
    mediaType: "Audio",
    thumbnailUrl: "/image/khongthesay.jpg",
    hasVideo: true,
    audioUrl: "/audio/khongthesay.mp3",
  },
  {
    mediaItemId: 10,
    title: "Waiting For You",
    artistId: 14,
    artistName: "MONO",
    durationSeconds: 241,
    playCount: 1350000,
    visibility: "Public",
    mediaType: "Audio",
    thumbnailUrl: "/image/waitingforyou.jpg",
    hasVideo: true,
    audioUrl: "/audio/waitingforyou.mp3",
  },
  {
    mediaItemId: 6,
    title: "Có Hẹn Với Thanh Xuân",
    artistId: 10,
    artistName: "MONSTAR",
    durationSeconds: 245,
    playCount: 1450000,
    visibility: "Public",
    mediaType: "Audio",
    thumbnailUrl: "/image/cohenvoithanhxuan.jpg",
    hasVideo: true,
    audioUrl: "/audio/cohenvoithanhxuan.mp3",
  },
  {
    mediaItemId: 8,
    title: "Em Thua Cô Ta",
    artistId: 12,
    artistName: "Min Quỳnh Anh",
    durationSeconds: 232,
    playCount: 1100000,
    visibility: "Public",
    mediaType: "Audio",
    thumbnailUrl: "/image/emthuacota.jpg",
    hasVideo: true,
    audioUrl: "/audio/emthuacota.mp3",
  },
];

interface SongCardProps {
  media: MediaItemDto;
  likedSongs: number[];
  favoriteLoadingIds: number[];
  onPlay: (media: MediaItemDto) => void;
  onLike: (mediaItemId: number) => void;
  onOpenVideo: (media: MediaItemDto) => void;
}

const SongCard = ({
  media,
  likedSongs,
  favoriteLoadingIds,
  onPlay,
  onLike,
  onOpenVideo,
}: SongCardProps) => {
  const isLiked = likedSongs.includes(media.mediaItemId);

  return (
    <div className="group relative flex h-full flex-col rounded-2xl bg-[#181818] p-4 transition-all duration-300 hover:bg-[#282828]">
      <div className="relative mb-4 shrink-0">
        <button
          onClick={() => onPlay(media)}
          className="block aspect-square w-full overflow-hidden rounded-xl bg-[#282828] text-left"
        >
          {media.thumbnailUrl ? (
            <img
              src={toStaticUrl(media.thumbnailUrl)}
              alt={media.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl text-gray-700">
              ♪
            </div>
          )}
        </button>

        <button
          onClick={() => onPlay(media)}
          className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 opacity-0 shadow-xl transition-all hover:scale-105 active:scale-95 group-hover:opacity-100"
          title="Phát"
        >
          <Play size={24} className="ml-1 text-black" />
        </button>
      </div>

      <div className="min-w-0">
        <Link
          to={`/media/${media.mediaItemId}`}
          className="line-clamp-1 text-lg font-bold text-white hover:underline"
          title={media.title}
        >
          {media.title}
        </Link>

        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1 text-sm text-gray-400">
          <ArtistLinks
            media={media}
            className="truncate hover:text-white hover:underline"
          />
        </div>

        {media.albumId && (
          <Link
            to={`/album/${media.albumId}`}
            className="mt-1 block truncate text-xs text-green-400 hover:underline"
            title={media.albumTitle || "Album"}
          >
            Album: {media.albumTitle || "Không rõ"}
          </Link>
        )}

        <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-gray-500">
          <span className="min-w-0 truncate">
            {formatCount(media.playCount)} lượt nghe
          </span>
          <span className="shrink-0">•</span>
          <span className="shrink-0">{formatCount(media.likeCount)} thích</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {media.hasVideo ? (
          <button
            onClick={() => onOpenVideo(media)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-green-400 py-2 text-sm font-semibold text-black transition hover:bg-green-300"
            title="Xem MV"
          >
            <Film size={15} />
            MV
          </button>
        ) : (
          <button
            onClick={() => onPlay(media)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-green-500 py-2 text-sm font-semibold text-black transition hover:bg-green-400"
            title="Phát"
          >
            <Play size={15} />
          </button>
        )}

        <SongMenu media={media} />

        <button
          onClick={() => onLike(media.mediaItemId)}
          disabled={favoriteLoadingIds.includes(media.mediaItemId)}
          className="rounded-full p-2 transition hover:bg-[#3a3a3a] disabled:opacity-50"
          title={isLiked ? "Bỏ thích" : "Thích"}
        >
          <Heart
            size={20}
            className={isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
      </div>
    </div>
  );
};

const Section = ({
  title,
  subtitle,
  songs,
  likedSongs,
  favoriteLoadingIds,
  onPlay,
  onLike,
  onOpenVideo,
}: {
  title: string;
  subtitle?: string;
  songs: MediaItemDto[];
  likedSongs: number[];
  favoriteLoadingIds: number[];
  onPlay: (media: MediaItemDto) => void;
  onLike: (mediaItemId: number) => void;
  onOpenVideo: (media: MediaItemDto) => void;
}) => (
  <section className="mt-14 first:mt-0">
    <div className="mb-6">
      <h2 className="text-3xl font-black uppercase md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-1 text-gray-400">{subtitle}</p>}
    </div>

    {songs.length === 0 ? (
      <p className="rounded-2xl bg-[#181818] p-6 text-gray-400">
        Chưa có bài hát.
      </p>
    ) : (
      <div className="grid auto-rows-fr grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {songs.map((media) => (
          <SongCard
            key={media.mediaItemId}
            media={media}
            likedSongs={likedSongs}
            favoriteLoadingIds={favoriteLoadingIds}
            onPlay={onPlay}
            onLike={onLike}
            onOpenVideo={onOpenVideo}
          />
        ))}
      </div>
    )}
  </section>
);

const HomePage = () => {
  const [trending, setTrending] = useState<MediaItemDto[]>([]);
  const [newReleases, setNewReleases] = useState<MediaItemDto[]>([]);
  const [aiRecommended, setAiRecommended] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedSongs, setLikedSongs] = useState<number[]>([]);
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<number[]>([]);

  const playTrack = usePlayerStore((state) => state.playTrack);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favorites = await favoriteService.getMyFavorites();
        setLikedSongs(favorites.map((item) => item.mediaItemId));
      } catch (error) {
        console.error("Lỗi tải danh sách yêu thích:", error);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);

      try {
        const data = await mediaService.getTrendingMedia(50);
        setTrending(data && data.length > 0 ? data : getHardcodedTrending());
      } catch (error) {
        console.error("Lỗi khi gọi API trending, dùng dữ liệu cũ:", error);
        setTrending(getHardcodedTrending());
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        const data = await mediaService.getNewReleases(6);
        setNewReleases(data || []);
      } catch (error) {
        console.error("Lỗi khi lấy New Releases:", error);
      }
    };

    fetchNewReleases();
  }, []);

  useEffect(() => {
    const fetchAIRecommendations = async () => {
      try {
        const res = await fetch(
          "http://localhost:5090/api/ai/recommendations?userId=guest",
        );

        if (!res.ok) throw new Error("Failed to fetch AI recommendations");

        const payload = await res.json();
        const recommendedTitles: string[] = Array.isArray(payload)
          ? payload
          : payload?.data || [];

        const matched = trending.filter((song) =>
          recommendedTitles.some((title) =>
            String(title).toLowerCase().includes(song.title.toLowerCase()),
          ),
        );

        setAiRecommended(
          matched.length > 0 ? matched.slice(0, 6) : getRecommendedSongs(),
        );
      } catch (error) {
        console.error("AI Recommendation error:", error);
        setAiRecommended(getRecommendedSongs());
      }
    };

    if (trending.length > 0) {
      fetchAIRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trending]);

  const handlePlay = (media: MediaItemDto) => {
    const track = {
      id: media.mediaItemId,
      title: media.title,
      artist: media.artistName || "Unknown Artist",
      duration: media.durationSeconds ?? 0,
      thumbnailUrl: toStaticUrl(media.thumbnailUrl),
      audioUrl: toAudioUrl(media),
      hasVideo: media.hasVideo,
      videoUrl: media.videoUrl,
      lyrics: media.lyrics,
    };

    const queue = trending.map((item) => ({
      id: item.mediaItemId,
      title: item.title,
      artist: item.artistName || "Unknown Artist",
      duration: item.durationSeconds ?? 0,
      thumbnailUrl: toStaticUrl(item.thumbnailUrl),
      audioUrl: toAudioUrl(item),
      hasVideo: item.hasVideo,
      videoUrl: item.videoUrl,
      lyrics: item.lyrics,
    }));

    playTrack(track, queue.length > 0 ? queue : [track]);
  };

  const openVideo = (media: MediaItemDto) => {
    navigate(`/video/${media.mediaItemId}`, { state: { media } });
  };

  const toggleLike = async (mediaItemId: number) => {
    if (favoriteLoadingIds.includes(mediaItemId)) return;

    const isLiked = likedSongs.includes(mediaItemId);
    setFavoriteLoadingIds((prev) => [...prev, mediaItemId]);

    setLikedSongs((prev) =>
      isLiked
        ? prev.filter((id) => id !== mediaItemId)
        : [...prev, mediaItemId],
    );

    try {
      if (isLiked) {
        await favoriteService.removeFromFavorite(mediaItemId);
        toast.success("Đã bỏ khỏi bài hát đã thích");
      } else {
        await favoriteService.addToFavorite(mediaItemId);
        toast.success("Đã thêm vào bài hát đã thích");
      }
    } catch (error) {
      console.error("Lỗi cập nhật yêu thích:", error);

      setLikedSongs((prev) =>
        isLiked
          ? [...prev, mediaItemId]
          : prev.filter((id) => id !== mediaItemId),
      );

      toast.error("Cập nhật yêu thích thất bại");
    } finally {
      setFavoriteLoadingIds((prev) => prev.filter((id) => id !== mediaItemId));
    }
  };

  const getRecommendedSongs = () => {
    if (likedSongs.length === 0) {
      return [...trending].sort(() => 0.5 - Math.random()).slice(0, 6);
    }

    const likedArtists = trending
      .filter((song) => likedSongs.includes(song.mediaItemId))
      .map((song) => song.artistName);

    return trending
      .filter((song) => !likedSongs.includes(song.mediaItemId))
      .sort((a, b) => {
        const aScore = likedArtists.includes(a.artistName) ? 2 : 0;
        const bScore = likedArtists.includes(b.artistName) ? 2 : 0;
        return bScore - aScore;
      })
      .slice(0, 6);
  };

  const recommendedSongs = useMemo(
    () => (aiRecommended.length > 0 ? aiRecommended : getRecommendedSongs()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aiRecommended, trending, likedSongs],
  );

  if (loading) {
    return (
      <div className="grid auto-rows-fr grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="mb-4 aspect-square rounded-2xl bg-[#282828]" />
            <div className="mb-2 h-4 w-3/4 rounded bg-[#282828]" />
            <div className="h-3 w-1/2 rounded bg-[#282828]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <Section
        title="Trending"
        subtitle="Những bài hát đang được nghe nhiều nhất"
        songs={trending}
        likedSongs={likedSongs}
        favoriteLoadingIds={favoriteLoadingIds}
        onPlay={handlePlay}
        onLike={toggleLike}
        onOpenVideo={openVideo}
      />

      <Section
        title="Mới phát hành"
        subtitle=""
        songs={newReleases}
        likedSongs={likedSongs}
        favoriteLoadingIds={favoriteLoadingIds}
        onPlay={handlePlay}
        onLike={toggleLike}
        onOpenVideo={openVideo}
      />

      <Section
        title="Dành cho bạn"
        subtitle=""
        songs={recommendedSongs}
        likedSongs={likedSongs}
        favoriteLoadingIds={favoriteLoadingIds}
        onPlay={handlePlay}
        onLike={toggleLike}
        onOpenVideo={openVideo}
      />
    </div>
  );
};

export default HomePage;
