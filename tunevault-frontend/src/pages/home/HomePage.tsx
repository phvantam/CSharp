import { useEffect, useState } from "react";
import { Play, Heart } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";
import type { MediaItemDto } from "../../api/types/media";
import ShareModal from "../../components/share/ShareModal";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [trending, setTrending] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const navigate = useNavigate();

  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    media: MediaItemDto | null;
  }>({ isOpen: false, media: null });

  const [likedSongs, setLikedSongs] = useState<number[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);

      setTrending([
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
          mediaItemId: 8,
          title: "Lạ Lùng",
          artistId: 8,
          artistName: "Vũ.",
          durationSeconds: 260,
          playCount: 980000,
          visibility: "Public",
          mediaType: "Audio",
          thumbnailUrl: "/image/lalung.jpg",
          hasVideo: true,
          audioUrl: "/audio/lalung.mp3",
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
          mediaItemId: 2,
          title: "See Tình",
          artistId: 2,
          artistName: "Hoàng Thùy Linh",
          durationSeconds: 207,
          playCount: 870000,
          visibility: "Public",
          mediaType: "Audio",
          thumbnailUrl: "/image/seetinh.jpg",
          hasVideo: true,
          audioUrl: "/audio/seetinh.mp3",
        },
        {
          mediaItemId: 10,
          title: "Sau Tất Cả",
          artistId: 10,
          artistName: "ERIK",
          durationSeconds: 296,
          playCount: 760000,
          visibility: "Public",
          mediaType: "Audio",
          thumbnailUrl: "/image/sautatca.jpg",
          hasVideo: true,
          audioUrl: "/audio/sautatca.mp3",
        },
        {
          mediaItemId: 15,
          title: "Có Hẹn Với Thanh Xuân",
          artistId: 15,
          artistName: "MONSTAR, GREY D",
          durationSeconds: 245,
          playCount: 1450000,
          visibility: "Public",
          mediaType: "Audio",
          thumbnailUrl: "/image/cohenvoithanhxuan.jpg",
          hasVideo: true,
          audioUrl: "/audio/cohenvoithanhxuan.mp3",
        },
        {
          mediaItemId: 16,
          title: "Come My Way",
          artistId: 16,
          artistName: "Sơn Tùng MTP",
          durationSeconds: 268,
          playCount: 920000,
          visibility: "Public",
          mediaType: "Audio",
          thumbnailUrl: "/image/comemyway.jpg",
          hasVideo: true,
          audioUrl: "/audio/comemyway.mp3",
        },
        {
          mediaItemId: 17,
          title: "Em Thua Cô Ta",
          artistId: 17,
          artistName: "Min Quỳnh Anh",
          durationSeconds: 232,
          playCount: 1100000,
          visibility: "Public",
          mediaType: "Audio",
          thumbnailUrl: "/image/emthuacota.jpg",
          hasVideo: true,
          audioUrl: "/audio/emthuacota.mp3",
        },
        {
          mediaItemId: 18,
          title: "Không Thể Say",
          artistId: 1,
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
          mediaItemId: 19,
          title: "Waiting For You",
          artistId: 19,
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
          mediaItemId: 20,
          title: "Có Chàng Trai Viết Lên Cây",
          artistId: 20,
          artistName: "Phan Mạnh Quỳnh",
          durationSeconds: 273,
          playCount: 780000,
          visibility: "Public",
          mediaType: "Audio",
          thumbnailUrl: "/image/cochangtrai.jpg",
          hasVideo: true,
          audioUrl: "/audio/cochangtrai.mp3",
        },
        {
          mediaItemId: 21,
          title: "Thiệp Hồng Sai Tên",
          artistId: 21,
          artistName: "Nguyễn Thành Đạt",
          durationSeconds: 238,
          playCount: 950000,
          visibility: "Public",
          mediaType: "Audio",
          thumbnailUrl: "/image/thiephongsaiten.jpg",
          hasVideo: true,
          audioUrl: "/audio/thiephongsaiten.mp3",
        },
      ]);
      setLoading(false);
    };

    fetchTrending();
  }, []);

  const handlePlay = (media: any) => {
    const track = {
      id: media.mediaItemId,
      title: media.title,
      artist: media.artistName || "Unknown Artist",
      duration: media.durationSeconds,
      thumbnailUrl: media.thumbnailUrl,
      audioUrl: media.audioUrl || mediaService.getStreamUrl(media.mediaItemId),
    };
    playTrack(track);
  };

  const openShareModal = (media: any) => {
    setShareModal({ isOpen: true, media });
  };

  const toggleLike = (mediaItemId: number) => {
    setLikedSongs((prev) =>
      prev.includes(mediaItemId)
        ? prev.filter((id) => id !== mediaItemId)
        : [...prev, mediaItemId],
    );
  };

  // AI Gợi ý nhạc thông minh
  const getRecommendedSongs = () => {
    if (likedSongs.length === 0) {
      return [...trending].sort(() => 0.5 - Math.random()).slice(0, 6);
    }

    const likedArtists = trending
      .filter((song) => likedSongs.includes(song.mediaItemId))
      .map((song) => song.artistName);

    let recommendations = trending.filter(
      (song) => !likedSongs.includes(song.mediaItemId),
    );

    recommendations = recommendations.sort((a, b) => {
      const aScore = likedArtists.includes(a.artistName) ? 2 : 0;
      const bScore = likedArtists.includes(b.artistName) ? 2 : 0;
      return bScore - aScore;
    });

    return recommendations.slice(0, 6);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-[#282828] rounded-2xl mb-4" />
            <div className="h-4 bg-[#282828] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[#282828] rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const recommendedSongs = getRecommendedSongs();

  return (
    <div>
      {/* Trending Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">TRENDING</h1>
        <p className="text-gray-400">Những bài hát đang được nghe nhiều nhất</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {trending.map((media) => (
          <div
            key={media.mediaItemId}
            className="group bg-[#181818] p-4 rounded-2xl hover:bg-[#282828] transition-all duration-300 cursor-pointer relative"
          >
            <div className="relative mb-4" onClick={() => handlePlay(media)}>
              <div className="aspect-square rounded-xl overflow-hidden bg-[#282828]">
                {media.thumbnailUrl ? (
                  <img
                    src={media.thumbnailUrl}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-gray-700">
                    ♪
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay(media);
                }}
                className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                <Play size={24} className="text-black ml-1" />
              </button>
            </div>

            <div onClick={() => handlePlay(media)}>
              <h3 className="font-bold text-lg truncate">{media.title}</h3>
              <p className="text-gray-400 text-sm truncate">
                {media.artistName}
              </p>
              {media.playCount && (
                <p className="text-xs text-gray-500 mt-1">
                  {Math.floor(media.playCount / 1000)}K lượt nghe
                </p>
              )}
            </div>

            <div className="mt-3 flex gap-2 items-center">
              {media.hasVideo ? (
                <button
                  onClick={() => navigate(`/video/${media.mediaItemId}`)}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-full text-sm font-semibold transition"
                >
                  Xem
                </button>
              ) : (
                <button
                  onClick={() => handlePlay(media)}
                  className="flex-1 bg-green-500 hover:bg-green-400 text-black py-2 rounded-full text-sm font-semibold transition"
                >
                  Phát
                </button>
              )}

              <button
                onClick={() => openShareModal(media)}
                className="px-4 bg-[#282828] hover:bg-[#3a3a3a] rounded-full text-sm font-medium transition"
              >
                Chia sẻ
              </button>

              <button
                onClick={() => toggleLike(media.mediaItemId)}
                className="p-2 rounded-full hover:bg-[#3a3a3a] transition"
              >
                <Heart
                  size={20}
                  className={
                    likedSongs.includes(media.mediaItemId)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-400"
                  }
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Gợi ý nhạc thông minh */}
      {recommendedSongs.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Dành cho bạn</h2>
              <p className="text-gray-400 mt-1">
                Gợi ý dựa trên sở thích của bạn
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {recommendedSongs.map((media) => (
              <div
                key={media.mediaItemId}
                className="group bg-[#181818] p-4 rounded-2xl hover:bg-[#282828] transition-all duration-300 cursor-pointer relative"
              >
                <div
                  className="relative mb-4"
                  onClick={() => handlePlay(media)}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#282828]">
                    {media.thumbnailUrl ? (
                      <img
                        src={media.thumbnailUrl}
                        alt={media.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl text-gray-700">
                        ♪
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(media);
                    }}
                    className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-105 active:scale-95"
                  >
                    <Play size={24} className="text-black ml-1" />
                  </button>
                </div>

                <div onClick={() => handlePlay(media)}>
                  <h3 className="font-bold text-lg truncate">{media.title}</h3>
                  <p className="text-gray-400 text-sm truncate">
                    {media.artistName}
                  </p>
                </div>

                <div className="mt-3 flex gap-2 items-center">
                  {media.hasVideo ? (
                    <button
                      onClick={() => navigate(`/video/${media.mediaItemId}`)}
                      className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-full text-sm font-semibold transition"
                    >
                      Xem
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlay(media)}
                      className="flex-1 bg-green-500 hover:bg-green-400 text-black py-2 rounded-full text-sm font-semibold transition"
                    >
                      Phát
                    </button>
                  )}

                  <button
                    onClick={() => openShareModal(media)}
                    className="px-4 bg-[#282828] hover:bg-[#3a3a3a] rounded-full text-sm font-medium transition"
                  >
                    Chia sẻ
                  </button>

                  <button
                    onClick={() => toggleLike(media.mediaItemId)}
                    className="p-2 rounded-full hover:bg-[#3a3a3a] transition"
                  >
                    <Heart
                      size={20}
                      className={
                        likedSongs.includes(media.mediaItemId)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, media: null })}
        mediaItemId={shareModal.media?.mediaItemId}
        title={shareModal.media?.title || ""}
      />
    </div>
  );
};

export default HomePage;
