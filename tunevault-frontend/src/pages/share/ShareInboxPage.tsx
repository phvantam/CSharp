import { useEffect, useState } from "react";
import { Share2, Play, Video } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { shareService } from "../../api";
import { mediaService } from "../../api";
import { useNavigate } from "react-router-dom";

interface SharedItem {
  id: number;
  senderName: string;
  mediaItemId?: number;
  playlistId?: number;
  title: string;
  artistName?: string;
  message?: string;
  sharedAt: string;
  type: "Media" | "Playlist";
  hasVideo?: boolean;
}

const ShareInboxPage = () => {
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedItems = async () => {
      setLoading(true);
      try {
        const data = await shareService.getSharedWithMe();
        setSharedItems(data);
      } catch {
        // Mock data
        const mockData: SharedItem[] = [
          {
            id: 1,
            senderName: "Nguyễn Yến Vy",
            mediaItemId: 1,
            title: "Nơi Này Có Anh",
            artistName: "Sơn Tùng M-TP",
            message:
              "Nghe bài này đi, hợp giao diện Spotify-like của nhóm mình nè.",
            sharedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            type: "Media",
            hasVideo: true,
          },
          {
            id: 2,
            senderName: "Trần Minh Khang",
            playlistId: 2,
            title: "Video MV Việt nổi bật",
            message:
              "Mình share playlist MV Việt để test tính năng share inbox.",
            sharedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            type: "Playlist",
          },
          {
            id: 3,
            senderName: "Lê Hoài Linh",
            mediaItemId: 50,
            title: "MV Lạ Lùng",
            artistName: "Vũ.",
            message: "Bài này hay lắm, nghe đi!",
            sharedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
            type: "Media",
            hasVideo: true,
          },
        ];
        setSharedItems(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedItems();
  }, []);

  const handlePlay = (item: SharedItem) => {
    if (item.type === "Media" && item.mediaItemId) {
      const track = {
        id: item.mediaItemId,
        title: item.title,
        artist: item.artistName || "Unknown Artist",
        duration: 0,
        audioUrl: mediaService.getStreamUrl(item.mediaItemId),
      };
      playTrack(track);
    } else if (item.type === "Playlist" && item.playlistId) {
      navigate(`/playlist/${item.playlistId}`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ trước`;
    return `${Math.floor(diffMins / 1440)} ngày trước`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
          <Share2 className="text-green-500" /> Share Inbox
        </h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#181818] p-6 rounded-2xl animate-pulse">
              <div className="h-5 bg-[#282828] rounded w-1/3 mb-3" />
              <div className="h-4 bg-[#282828] rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Share2 className="text-green-500" size={36} />
        <h1 className="text-4xl font-bold">Share Inbox</h1>
      </div>

      {sharedItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Share2 size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">Chưa có nội dung nào được chia sẻ với bạn</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sharedItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#181818] rounded-2xl p-6 hover:bg-[#202020] transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-400">
                      {formatTimeAgo(item.sharedAt)}
                    </span>
                    {item.type === "Media" && item.hasVideo && (
                      <span className="text-xs bg-purple-600 px-2 py-0.5 rounded-full">
                        Video
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-2xl font-semibold hover:text-green-400 cursor-pointer"
                    onClick={() => handlePlay(item)}
                  >
                    {item.title}
                  </h3>

                  {item.artistName && (
                    <p className="text-gray-400 mt-1">{item.artistName}</p>
                  )}

                  {item.message && (
                    <div className="mt-3 p-3 bg-[#282828] rounded-xl text-gray-300 italic">
                      “{item.message}”
                    </div>
                  )}

                  <p className="text-sm text-gray-400 mt-3">
                    Được chia sẻ bởi{" "}
                    <span className="font-medium text-white">
                      {item.senderName}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                  <button
                    onClick={() => handlePlay(item)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black px-5 py-2 rounded-full font-semibold transition"
                  >
                    <Play size={18} />{" "}
                    {item.type === "Playlist" ? "Mở Playlist" : "Phát"}
                  </button>

                  {item.hasVideo && item.mediaItemId && (
                    <button
                      onClick={() => navigate(`/video/${item.mediaItemId}`)}
                      className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                    >
                      <Video size={16} /> Xem Video
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShareInboxPage;
