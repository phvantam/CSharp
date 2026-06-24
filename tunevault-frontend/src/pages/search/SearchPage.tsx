import { useState } from "react";
import { Search, Play, Heart } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { mediaService } from "../../api";
import ShareModal from "../../components/share/ShareModal";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  mediaItemId: number;
  title: string;
  artistName: string;
  durationSeconds: number;
  thumbnailUrl?: string;
  hasVideo?: boolean;
  audioUrl?: string;
}

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const navigate = useNavigate();

  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    media: SearchResult | null;
  }>({ isOpen: false, media: null });
  const [likedSongs, setLikedSongs] = useState<number[]>([]);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockData: SearchResult[] = [
      {
        mediaItemId: 1,
        title: "Nơi Này Có Anh",
        artistName: "Sơn Tùng M-TP",
        durationSeconds: 278,
        thumbnailUrl: "/image/noinaycoanh.png",
        hasVideo: true,
        audioUrl: "/audio/noi-nay-co-anh.mp3",
      },
      {
        mediaItemId: 8,
        title: "Lạ Lùng",
        artistName: "Vũ.",
        durationSeconds: 260,
        thumbnailUrl: "/image/lalung.jpg",
        hasVideo: true,
        audioUrl: "/audio/la-lung.mp3",
      },
      {
        mediaItemId: 3,
        title: "Mang Tiền Về Cho Mẹ",
        artistName: "Đen",
        durationSeconds: 407,
        thumbnailUrl: "/image/mangtienvechome.jpg",
        hasVideo: true,
        audioUrl: "/audio/mang-tien-ve-cho-me.mp3",
      },
      {
        mediaItemId: 2,
        title: "See Tình",
        artistName: "Hoàng Thùy Linh",
        durationSeconds: 207,
        thumbnailUrl: "/image/seetinh.jpg",
        hasVideo: true,
        audioUrl: "/audio/see-tinh.mp3",
      },
      {
        mediaItemId: 10,
        title: "Sau Tất Cả",
        artistName: "ERIK",
        durationSeconds: 296,
        thumbnailUrl: "/image/sautatca.jpg",
        hasVideo: true,
        audioUrl: "/audio/sau-tat-ca.mp3",
      },
      {
        mediaItemId: 15,
        title: "Có Hẹn Với Thanh Xuân",
        artistName: "MONSTAR, GREY D",
        durationSeconds: 245,
        thumbnailUrl: "/image/cohenvoithanhxuan.jpg",
        hasVideo: true,
        audioUrl: "/audio/co-hen-voi-thanh-xuan.mp3",
      },
      {
        mediaItemId: 16,
        title: "Come My Way",
        artistName: "Sơn Tùng MTP",
        durationSeconds: 268,
        thumbnailUrl: "/image/comemyway.jpg",
        hasVideo: true,
        audioUrl: "/audio/come-my-way.mp3",
      },
      {
        mediaItemId: 17,
        title: "Em Thua Cô Ta",
        artistName: "Min Quỳnh Anh",
        durationSeconds: 232,
        thumbnailUrl: "/image/emthuacota.jpg",
        hasVideo: true,
        audioUrl: "/audio/em-thua-co-ta.mp3",
      },
      {
        mediaItemId: 18,
        title: "Không Thể Say",
        artistName: "HIEUTHUHAI",
        durationSeconds: 255,
        thumbnailUrl: "/image/khongthesay.jpg",
        hasVideo: true,
        audioUrl: "/audio/khong-the-say.mp3",
      },
      {
        mediaItemId: 19,
        title: "Waiting For You",
        artistName: "MONO",
        durationSeconds: 241,
        thumbnailUrl: "/image/waitingforyou.jpg",
        hasVideo: true,
        audioUrl: "/audio/waiting-for-you.mp3",
      },
      {
        mediaItemId: 20,
        title: "Có Chàng Trai Viết Lên Cây",
        artistName: "Phan Mạnh Quỳnh",
        durationSeconds: 273,
        thumbnailUrl: "/image/cochangtrai.jpg",
        hasVideo: true,
        audioUrl: "/audio/co-chang-trai-viet-len-cay.mp3",
      },
      {
        mediaItemId: 21,
        title: "Thiệp Hồng Sai Tên",
        artistName: "Nguyễn Thành Đạt",
        durationSeconds: 238,
        thumbnailUrl: "/image/thiephongsaiten.jpg",
        hasVideo: true,
        audioUrl: "/audio/thiep-hong-sai-ten.mp3",
      },
      {
        mediaItemId: 50,
        title: "MV Nơi Này Có Anh",
        artistName: "Sơn Tùng M-TP",
        durationSeconds: 278,
        thumbnailUrl: "/image/noinaycoanh.png",
        hasVideo: true,
        audioUrl: "/audio/noi-nay-co-anh.mp3",
      },
      {
        mediaItemId: 51,
        title: "MV Lạ Lùng",
        artistName: "Vũ.",
        durationSeconds: 260,
        thumbnailUrl: "/image/lalung.jpg",
        hasVideo: true,
        audioUrl: "/audio/la-lung.mp3",
      },
    ].filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.artistName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setResults(mockData);
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handlePlay = (item: SearchResult) => {
    const track = {
      id: item.mediaItemId,
      title: item.title,
      artist: item.artistName,
      duration: item.durationSeconds,
      thumbnailUrl: item.thumbnailUrl,
      audioUrl: item.audioUrl || mediaService.getStreamUrl(item.mediaItemId),
    };
    playTrack(track);
  };

  const openShareModal = (item: SearchResult) => {
    setShareModal({ isOpen: true, media: item });
  };

  const toggleLike = (mediaItemId: number) => {
    setLikedSongs((prev) =>
      prev.includes(mediaItemId)
        ? prev.filter((id) => id !== mediaItemId)
        : [...prev, mediaItemId],
    );
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">Tìm kiếm</h1>

      <div className="relative mb-10 max-w-2xl">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Bạn muốn nghe gì?"
          className="w-full bg-[#282828] text-white pl-14 pr-6 py-4 text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
              <div className="w-12 h-12 bg-[#282828] rounded" />
              <div className="flex-1">
                <div className="h-4 bg-[#282828] rounded w-2/3 mb-2" />
                <div className="h-3 bg-[#282828] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">
            Kết quả cho "{query}"
          </h2>
          <div className="space-y-1">
            {results.map((item) => (
              <div
                key={item.mediaItemId}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#282828] group transition-colors"
              >
                <div
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => handlePlay(item)}
                >
                  <div className="w-12 h-12 flex-shrink-0 rounded-md bg-[#282828] overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-600">
                        ♪
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {item.artistName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handlePlay(item)}
                    className="p-2 hover:text-white hover:bg-[#3a3a3a] rounded-full"
                  >
                    <Play size={18} />
                  </button>
                  <button
                    onClick={() => openShareModal(item)}
                    className="px-3 py-1.5 text-sm bg-[#282828] hover:bg-[#3a3a3a] rounded-full"
                  >
                    Chia sẻ
                  </button>
                  <button
                    onClick={() => toggleLike(item.mediaItemId)}
                    className="p-2 hover:bg-[#3a3a3a] rounded-full"
                  >
                    <Heart
                      size={18}
                      className={
                        likedSongs.includes(item.mediaItemId)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>

                  {item.hasVideo ? (
                    <button
                      onClick={() => navigate(`/video/${item.mediaItemId}`)}
                      className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 rounded-full"
                    >
                      Xem
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlay(item)}
                      className="px-3 py-1 text-xs bg-green-500 text-black rounded-full"
                    >
                      Phát
                    </button>
                  )}
                  <span className="text-sm w-12 text-right hidden sm:block">
                    {formatDuration(item.durationSeconds)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && query && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-2xl text-gray-400">Không tìm thấy kết quả</p>
        </div>
      )}

      {!query && (
        <div className="text-gray-400 text-lg">
          Hãy nhập tên bài hát hoặc nghệ sĩ để tìm kiếm...
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

export default SearchPage;
