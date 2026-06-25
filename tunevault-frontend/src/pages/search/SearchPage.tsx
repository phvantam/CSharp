import { useEffect, useState } from "react";
import {
  Film,
  Heart,
  Music2,
  Play,
  Search,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";
import { favoriteService } from "../../api/favoriteService";
import { userService, type UserSearchResultDto } from "../../api/userService";
import type { MediaItemDto } from "../../api/types/media";
import SongMenu from "../../components/media/SongMenu";
import { formatCount, formatDuration } from "../../utils/formatCount";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5090/api"
).replace(/\/$/, "");

const toStaticUrl = (url?: string | null) => {
  return mediaService.getFullMediaUrl(url);
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

const normalizeSearchResponse = (payload: any): MediaItemDto[] => {
  const data = payload?.data?.data ?? payload?.data ?? payload;

  let items: any[] = [];
  if (Array.isArray(data)) items = data;
  else if (Array.isArray(data?.items)) items = data.items;
  else if (Array.isArray(data?.results)) items = data.results;
  else if (Array.isArray(data?.data)) items = data.data;

  return items
    .map((item) => ({
      mediaItemId: Number(item.mediaItemId ?? item.MediaItemId ?? item.id),
      ownerUserId: item.ownerUserId ?? item.OwnerUserId,
      ownerDisplayName: item.ownerDisplayName ?? item.OwnerDisplayName,
      artistId: item.artistId ?? item.ArtistId,
      artistName:
        item.artistName ??
        item.ArtistName ??
        item.artist ??
        item.Artist ??
        "Unknown Artist",
      albumId: item.albumId ?? item.AlbumId,
      albumTitle: item.albumTitle ?? item.AlbumTitle,
      title: item.title ?? item.Title ?? "Không có tiêu đề",
      videoTitle: item.videoTitle ?? item.VideoTitle,
      durationSeconds:
        item.durationSeconds ?? item.DurationSeconds ?? item.duration ?? 0,
      playCount: item.playCount ?? item.PlayCount ?? 0,
      likeCount: item.likeCount ?? item.LikeCount ?? 0,
      thumbnailUrl:
        item.thumbnailUrl ??
        item.ThumbnailUrl ??
        item.coverUrl ??
        item.CoverUrl ??
        item.imageUrl ??
        item.ImageUrl,
      hasVideo:
        item.hasVideo ??
        item.HasVideo ??
        Boolean(item.videoUrl || item.VideoUrl || item.videoFilePath),
      audioUrl:
        item.audioUrl ??
        item.AudioUrl ??
        item.audioFilePath ??
        item.AudioFilePath ??
        item.filePath ??
        item.FilePath,
      videoUrl:
        item.videoUrl ??
        item.VideoUrl ??
        item.videoFilePath ??
        item.VideoFilePath,
      filePath: item.filePath ?? item.FilePath,
      mediaType: item.mediaType ?? item.MediaType ?? "Audio",
      lyrics: item.lyrics ?? item.Lyrics,
    }))
    .filter((item) => item.mediaItemId && !Number.isNaN(item.mediaItemId));
};

const normalizeAiRecommendations = (payload: any): string[] => {
  const data = payload?.data?.data ?? payload?.data ?? payload;

  if (Array.isArray(data)) {
    return data.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof data === "string") {
    return data
      .split("\n")
      .map((line) =>
        line
          .replace(/^\d+[\).\-\s]+/, "")
          .replace(/^[-*]\s*/, "")
          .trim(),
      )
      .filter(Boolean);
  }

  return [];
};

const suggestionKeywords = [
  "Rap",
  "V-Pop",
  "Ballad",
  "Chill",
  "Sơn Tùng",
  "Đen",
  "MONO",
  "HIEUTHUHAI",
];

const SongRow = ({
  song,
  index,
  likedSongs,
  favoriteLoadingIds,
  onPlay,
  onLike,
  onVideo,
}: {
  song: MediaItemDto;
  index?: number;
  likedSongs: number[];
  favoriteLoadingIds: number[];
  onPlay: (song: MediaItemDto) => void;
  onLike: (mediaItemId: number) => void;
  onVideo: (song: MediaItemDto) => void;
}) => {
  const isLiked = likedSongs.includes(song.mediaItemId);

  return (
    <div className="group grid grid-cols-[32px_64px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl p-3 transition hover:bg-[#282828] max-sm:grid-cols-[52px_minmax(0,1fr)_auto]">
      <span className="text-center text-sm text-gray-500 max-sm:hidden">
        {typeof index === "number" ? index + 1 : ""}
      </span>

      <button
        onClick={() => onPlay(song)}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#282828]"
        title="Phát"
      >
        {song.thumbnailUrl ? (
          <img
            src={toStaticUrl(song.thumbnailUrl)}
            alt={song.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            <Music2 size={26} />
          </div>
        )}

        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <Play size={21} />
        </span>
      </button>

      <div className="min-w-0">
        <Link
          to={`/media/${song.mediaItemId}`}
          className="line-clamp-1 font-bold text-white hover:text-green-400 hover:underline"
        >
          {song.title}
        </Link>

        <div className="mt-1 flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-sm text-gray-400">
          <ArtistLinks
            media={song}
            className="truncate hover:text-green-400 hover:underline"
          />

          {song.albumId && (
            <>
              <span>•</span>
              <Link
                to={`/album/${song.albumId}`}
                className="truncate hover:text-green-400 hover:underline"
              >
                {song.albumTitle || "Album"}
              </Link>
            </>
          )}
        </div>

        <p className="mt-1 truncate text-xs text-gray-500">
          {formatCount(song.playCount)} lượt nghe ·{" "}
          {formatCount(song.likeCount)} thích ·{" "}
          {formatDuration(song.durationSeconds)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {song.hasVideo ? (
          <button
            onClick={() => onVideo(song)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-green-400 max-sm:px-3"
            title="Xem MV"
          >
            <Film size={16} />
            <span className="max-sm:hidden">MV</span>
          </button>
        ) : (
          <button
            onClick={() => onPlay(song)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-green-400 max-sm:px-3"
            title="Phát"
          >
            <Play size={16} />
            <span className="max-sm:hidden">Phát</span>
          </button>
        )}

        <SongMenu media={song} />

        <button
          onClick={() => onLike(song.mediaItemId)}
          disabled={favoriteLoadingIds.includes(song.mediaItemId)}
          className="rounded-full p-2 transition hover:bg-[#3a3a3a] disabled:opacity-60"
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

const RecommendedCard = ({
  song,
  onPlay,
}: {
  song: MediaItemDto;
  onPlay: (song: MediaItemDto) => void;
}) => (
  <div className="group rounded-2xl bg-[#181818] p-4 transition hover:bg-[#282828]">
    <div className="relative mb-4">
      <button
        onClick={() => onPlay(song)}
        className="block aspect-square w-full overflow-hidden rounded-xl bg-[#282828] text-left"
        title="Phát"
      >
        {song.thumbnailUrl ? (
          <img
            src={toStaticUrl(song.thumbnailUrl)}
            alt={song.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            <Music2 size={56} />
          </div>
        )}
      </button>

      <button
        onClick={() => onPlay(song)}
        className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-black opacity-0 shadow-xl transition hover:scale-105 group-hover:opacity-100"
        title="Phát"
      >
        <Play size={22} fill="currentColor" />
      </button>
    </div>

    <Link
      to={`/media/${song.mediaItemId}`}
      className="line-clamp-1 text-lg font-bold text-white hover:text-green-400 hover:underline"
      title={song.title}
    >
      {song.title}
    </Link>

    <div className="mt-1 flex min-w-0 flex-wrap gap-x-2 text-sm text-gray-400">
      {song.artistId ? (
        <Link
          to={`/artist/${song.artistId}`}
          className="truncate hover:text-green-400 hover:underline"
        >
          {song.artistName}
        </Link>
      ) : (
        <span className="truncate">{song.artistName}</span>
      )}
    </div>

    <p className="mt-2 text-xs text-gray-500">
      {formatCount(song.playCount)} lượt nghe · {formatCount(song.likeCount)}{" "}
      thích
    </p>
  </div>
);

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItemDto[]>([]);
  const [userResults, setUserResults] = useState<UserSearchResultDto[]>([]);
  const [recommended, setRecommended] = useState<MediaItemDto[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [followLoadingIds, setFollowLoadingIds] = useState<string[]>([]);
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
    const fetchRecommended = async () => {
      setLoadingRecommended(true);

      try {
        const fallback = await mediaService.getTrendingMedia(8);
        setRecommended(normalizeSearchResponse(fallback).slice(0, 8));
      } catch (error) {
        console.error("Không thể tải trending đề xuất:", error);
      } finally {
        setLoadingRecommended(false);
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 3500);

      try {
        const aiResponse = await fetch(
          `${API_BASE}/ai/recommendations?userId=guest`,
          { signal: controller.signal },
        );

        window.clearTimeout(timeoutId);

        if (!aiResponse.ok) return;

        const aiPayload = await aiResponse.json();
        const aiLines = normalizeAiRecommendations(aiPayload);

        const titles = aiLines
          .slice(0, 8)
          .map((line) => line.split(" - ")[0]?.trim())
          .filter(Boolean) as string[];

        if (titles.length === 0) return;

        const searchResults = await Promise.all(
          titles.map((title) =>
            mediaService.searchMedia(title, 1, 2).catch(() => []),
          ),
        );

        const foundSongs: MediaItemDto[] = [];

        for (const searchRes of searchResults) {
          const items = normalizeSearchResponse(searchRes);

          for (const item of items) {
            if (
              item.mediaItemId &&
              !foundSongs.some((x) => x.mediaItemId === item.mediaItemId)
            ) {
              foundSongs.push(item);
            }
          }
        }

        if (foundSongs.length > 0) {
          setRecommended(foundSongs.slice(0, 8));
        }
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.warn("AI recommendation chậm/lỗi, giữ trending:", error);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    fetchRecommended();
  }, []);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setUserResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const keyword = searchTerm.trim();

      const [mediaRes, users] = await Promise.all([
        mediaService.searchMedia(keyword, 1, 30).catch((error) => {
          console.error("Media search error:", error);
          return [];
        }),
        userService.searchUsers(keyword).catch((error) => {
          console.error("User search error:", error);
          return [];
        }),
      ]);

      setResults(normalizeSearchResponse(mediaRes));
      setUserResults(users || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setUserResults([]);
      toast.error("Tìm kiếm thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleSuggestionClick = (keyword: string) => {
    setQuery(keyword);
    handleSearch(keyword);
  };

  const handlePlay = (song: MediaItemDto) => {
    playTrack({
      id: song.mediaItemId,
      title: song.title,
      artist: song.artistName || "Unknown Artist",
      duration: song.durationSeconds || 0,
      thumbnailUrl: toStaticUrl(song.thumbnailUrl),
      audioUrl: toAudioUrl(song),
      hasVideo: song.hasVideo,
      videoUrl: song.videoUrl,
      lyrics: song.lyrics,
    });
  };

  const openVideo = (song: MediaItemDto) => {
    navigate(`/video/${song.mediaItemId}`, { state: { media: song } });
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

  const openUserProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const toggleFollowUser = async (
    e: React.MouseEvent<HTMLButtonElement>,
    user: UserSearchResultDto,
  ) => {
    e.stopPropagation();

    if (followLoadingIds.includes(user.id)) return;

    setFollowLoadingIds((prev) => [...prev, user.id]);
    const isFollowing = Boolean(user.isFollowing);

    setUserResults((prev) =>
      prev.map((item) =>
        item.id === user.id ? { ...item, isFollowing: !isFollowing } : item,
      ),
    );

    try {
      if (isFollowing) {
        await userService.unfollowUser(user.id);
        toast.success("Đã bỏ theo dõi");
      } else {
        await userService.followUser(user.id);
        toast.success("Đã theo dõi");
      }
    } catch (error) {
      console.error("Follow user error:", error);

      setUserResults((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, isFollowing } : item,
        ),
      );

      toast.error("Thao tác follow thất bại");
    } finally {
      setFollowLoadingIds((prev) => prev.filter((id) => id !== user.id));
    }
  };

  return (
    <div className="w-full">
      <h1 className="mb-8 text-4xl font-bold">Tìm kiếm</h1>

      <div className="relative mb-10 max-w-3xl">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
          size={22}
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Bạn muốn nghe gì?"
          className="w-full rounded-full bg-[#282828] py-4 pl-14 pr-6 text-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {!query && (
        <div className="mt-8">
          <div className="mb-5 flex items-center gap-3">
            <Sparkles className="text-green-400" size={26} />
            <h2 className="text-3xl font-black text-white">
              Được đề xuất cho hôm nay
            </h2>
          </div>

          {loadingRecommended ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-xl bg-[#282828]" />
                  <div className="mt-4 h-5 w-2/3 rounded bg-[#282828]" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-[#282828]" />
                </div>
              ))}
            </div>
          ) : recommended.length === 0 ? (
            <div className="rounded-3xl border border-[#282828] bg-[#181818] p-10 text-gray-400">
              Chưa có đề xuất. Hãy nhập tên bài hát hoặc nghệ sĩ để tìm kiếm.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {recommended.map((song) => (
                <RecommendedCard
                  key={song.mediaItemId}
                  song={song}
                  onPlay={handlePlay}
                />
              ))}
            </div>
          )}

          <div className="mt-10">
            <h3 className="mb-4 text-xl font-bold text-white">
              Gợi ý tìm nhanh
            </h3>
            <div className="flex flex-wrap gap-3">
              {suggestionKeywords.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => handleSuggestionClick(keyword)}
                  className="rounded-full bg-[#282828] px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-green-500 hover:text-black"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-4 p-3">
              <div className="h-12 w-12 rounded bg-[#282828]" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-2/3 rounded bg-[#282828]" />
                <div className="h-3 w-1/3 rounded bg-[#282828]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && userResults.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-gray-300">
            Người dùng
          </h2>

          <div className="grid gap-3 md:grid-cols-2">
            {userResults.map((item) => (
              <button
                key={item.id}
                onClick={() => openUserProfile(item.id)}
                className="flex items-center gap-4 rounded-2xl bg-[#181818] p-4 text-left transition hover:bg-[#282828]"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#282828]">
                  {item.avatarUrl ? (
                    <img
                      src={toStaticUrl(item.avatarUrl)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={26} className="text-gray-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white">{item.name}</p>
                  <p className="truncate text-sm text-gray-400">
                    {item.email || item.username || "TuneVault user"}
                  </p>
                </div>

                <button
                  onClick={(e) => toggleFollowUser(e, item)}
                  disabled={followLoadingIds.includes(item.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                    item.isFollowing
                      ? "bg-[#333] text-white hover:bg-[#3a3a3a]"
                      : "bg-green-500 text-black hover:bg-green-400"
                  }`}
                >
                  {item.isFollowing ? (
                    <UserCheck size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {item.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-300">
            Kết quả cho "{query}"
          </h2>

          <div className="max-w-6xl space-y-1">
            {results.map((song, index) => (
              <SongRow
                key={song.mediaItemId}
                song={song}
                index={index}
                likedSongs={likedSongs}
                favoriteLoadingIds={favoriteLoadingIds}
                onPlay={handlePlay}
                onLike={toggleLike}
                onVideo={openVideo}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading &&
        query &&
        results.length === 0 &&
        userResults.length === 0 && (
          <div className="rounded-3xl border border-[#282828] bg-[#181818] p-10 text-center text-gray-400">
            Không tìm thấy kết quả phù hợp.
          </div>
        )}
    </div>
  );
};

export default SearchPage;
