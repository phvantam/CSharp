import { useEffect, useState } from "react";
import { ArrowLeft, Disc3, Heart, Play, Film } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { mediaService } from "../../api";
import type { MediaItemDto } from "../../api/types/media";
import { formatCount, formatDuration } from "../../utils/formatCount";
import { usePlayerStore } from "../../stores/playerStore";
import SongMenu from "../../components/media/SongMenu";

const toImageUrl = (url?: string | null) => {
  if (!url) return "";
  return mediaService.getFullMediaUrl(url);
};

const toAudioUrl = (song: MediaItemDto) => {
  const raw =
    song.audioUrl ||
    song.filePath ||
    mediaService.getStreamUrl(song.mediaItemId);
  return raw?.startsWith("http") ? raw : mediaService.getFullMediaUrl(raw);
};

const formatDate = (value?: string | null) => {
  if (!value) return "Không rõ";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ";

  return date.toLocaleDateString("vi-VN");
};

const getGenreText = (genre?: string | null) => {
  if (!genre || genre.trim().length === 0) return "Chưa phân loại";
  return genre;
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
          className="inline-flex items-center"
        >
          {index > 0 && <span className="mx-2 text-gray-500">,</span>}

          {artist.artistId ? (
            <Link
              to={`/artist/${artist.artistId}`}
              className={
                className || "font-semibold text-white hover:underline"
              }
            >
              {artist.name}
            </Link>
          ) : (
            <span className={className}>{artist.name}</span>
          )}
        </span>
      ))}
    </>
  );
};

const playSong = (
  song: MediaItemDto,
  playTrack: (track: any, queue?: any[]) => void,
  queue?: MediaItemDto[],
) => {
  const tracks = (queue || [song]).map((item) => ({
    id: item.mediaItemId,
    title: item.title,
    artist: item.artistName || "Unknown Artist",
    duration: item.durationSeconds || 0,
    thumbnailUrl: toImageUrl(item.thumbnailUrl),
    audioUrl: toAudioUrl(item),
    hasVideo: item.hasVideo,
    videoUrl: item.videoUrl,
    lyrics: item.lyrics,
  }));

  const current =
    tracks.find((item) => item.id === song.mediaItemId) || tracks[0];
  playTrack(current, tracks);
};

const MediaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playTrack = usePlayerStore((state) => state.playTrack);

  const [media, setMedia] = useState<MediaItemDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mediaId = Number(id);

    if (!mediaId) {
      navigate("/home");
      return;
    }

    setLoading(true);

    mediaService
      .getMediaById(mediaId)
      .then(setMedia)
      .catch((error) => {
        console.error("Lỗi tải bài hát:", error);
        setMedia(null);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading)
    return <div className="p-8 text-gray-400">Đang tải bài hát...</div>;

  if (!media) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold">Không tìm thấy bài hát</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"
      >
        <ArrowLeft size={20} />
        Quay lại
      </button>

      <section className="rounded-3xl bg-gradient-to-br from-[#2a1c3f] via-[#181818] to-[#121212] p-6 shadow-2xl md:p-8">
        <div className="grid gap-7 lg:grid-cols-[340px_1fr]">
          <div className="aspect-square overflow-hidden rounded-3xl bg-[#282828] shadow-xl">
            {media.thumbnailUrl ? (
              <img
                src={toImageUrl(media.thumbnailUrl)}
                alt={media.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Disc3 size={90} className="text-gray-600" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.35em] text-gray-300">
              Bài hát
            </p>

            <h1 className="text-4xl font-black text-white md:text-6xl">
              {media.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-gray-300">
              <ArtistLinks
                media={media}
                className="font-semibold text-white hover:underline"
              />

              {media.albumId && (
                <>
                  <span>•</span>
                  <Link
                    to={`/album/${media.albumId}`}
                    className="hover:text-white hover:underline"
                  >
                    {media.albumTitle}
                  </Link>
                </>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-300">
              <span>{formatCount(media.playCount)} lượt nghe</span>
              <span className="flex items-center gap-1">
                <Heart size={16} />
                {formatCount(media.likeCount)} lượt thích
              </span>
              <span>{formatDuration(media.durationSeconds)}</span>
              {media.genre && <span>{media.genre}</span>}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => playSong(media, playTrack)}
                className="inline-flex items-center gap-3 rounded-full bg-green-500 px-6 py-3 font-black text-black transition hover:bg-green-400"
              >
                <Play size={22} />
                Phát
              </button>

              {media.hasVideo && (
                <button
                  onClick={() => navigate(`/video/${media.mediaItemId}`)}
                  className="inline-flex items-center gap-3 rounded-full bg-green-500 px-6 py-3 font-black text-black transition hover:bg-green-400"
                >
                  <Film size={21} />
                  MV
                </button>
              )}

              <SongMenu media={media} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl bg-[#181818] p-6">
          <h2 className="mb-4 text-2xl font-black">Lời bài hát</h2>

          {media.lyrics ? (
            <pre className="whitespace-pre-wrap font-sans leading-8 text-gray-200">
              {media.lyrics}
            </pre>
          ) : (
            <p className="text-gray-400">Bài hát này chưa có lời.</p>
          )}
        </div>

        <div className="self-start rounded-3xl bg-[#181818] p-6">
          <h2 className="mb-4 text-2xl font-black">Thông tin</h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500">Nghệ sĩ</p>
              <div className="font-semibold text-white">
                <ArtistLinks
                  media={media}
                  className="font-semibold text-white hover:underline"
                />
              </div>
            </div>

            <div>
              <p className="text-gray-500">Album</p>
              {media.albumId ? (
                <Link
                  to={`/album/${media.albumId}`}
                  className="font-semibold text-white hover:underline"
                >
                  {media.albumTitle || "Không rõ"}
                </Link>
              ) : (
                <p className="font-semibold text-white">Không rõ</p>
              )}
            </div>

            <div>
              <p className="text-gray-500">Ngày phát hành</p>
              <p className="font-semibold text-white">
                {formatDate(media.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Thể loại</p>
              <p className="font-semibold text-white">
                {getGenreText(media.genre)}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Nguồn cung cấp</p>
              {media.ownerUserId ? (
                <Link
                  to={`/profile/${media.ownerUserId}`}
                  className="font-semibold text-white hover:underline"
                >
                  {media.ownerDisplayName || "Người dùng"}
                </Link>
              ) : (
                <p className="font-semibold text-white">TuneVault</p>
              )}
            </div>

            <div>
              <p className="text-gray-500">Lượt nghe / thích</p>
              <p className="font-semibold text-white">
                {formatCount(media.playCount)} / {formatCount(media.likeCount)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MediaDetailPage;
