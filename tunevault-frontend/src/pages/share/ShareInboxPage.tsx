import { useEffect, useState } from "react";
import { Film, Share2, Play } from "lucide-react";
import { usePlayerStore } from "../../stores/playerStore";
import { shareService } from "../../api";
import { mediaService } from "../../api";
import { useNavigate } from "react-router-dom";

type ShareTab = "received" | "sent";

interface SharedItem {
  id: number;
  senderName: string;
  receiverName?: string;
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
  const [activeTab, setActiveTab] = useState<ShareTab>("received");
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const playTrack = usePlayerStore((state) => state.playTrack);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedItems = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          activeTab === "received"
            ? await shareService.getSharedWithMe()
            : await shareService.getSharedByMe();

        const items = Array.isArray(data) ? data : [];

        setSharedItems(
          items.map((item: any) => ({
            id: item.id ?? item.shareId,
            senderName: item.senderName ?? "Unknown User",
            receiverName: item.receiverName ?? "Unknown User",
            mediaItemId: item.mediaItemId,
            playlistId: item.playlistId,
            title: item.title ?? "Không có tiêu đề",
            artistName: item.artistName,
            message: item.message,
            sharedAt: item.sharedAt,
            type: item.type ?? (item.mediaItemId ? "Media" : "Playlist"),
            hasVideo: item.hasVideo ?? false,
          })),
        );
      } catch (err) {
        console.error("Lỗi tải Share Inbox:", err);
        setError(
          "Không thể tải Share Inbox. Kiểm tra backend hoặc token đăng nhập.",
        );
        setSharedItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedItems();
  }, [activeTab]);

  const handlePlay = (item: SharedItem) => {
    if (item.type === "Media" && item.mediaItemId) {
      const track = {
        id: item.mediaItemId,
        title: item.title,
        artist: item.artistName || "Unknown Artist",
        duration: 0,
        audioUrl: mediaService.getStreamUrl(item.mediaItemId),
        isVideo: item.hasVideo ?? false,
      };

      playTrack(track);
      return;
    }

    if (item.type === "Playlist" && item.playlistId) {
      navigate(`/playlist/${item.playlistId}`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "";

    // Backend thường lưu DateTime.UtcNow nhưng JSON đôi khi thiếu hậu tố Z.
    // Thêm Z để trình duyệt hiểu đây là UTC, tránh lệch +7 giờ.
    const utcString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;

    const date = new Date(utcString);
    const now = new Date();

    if (Number.isNaN(date.getTime())) return "";

    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  const renderTabs = () => (
    <div className="mb-6 flex gap-3">
      <button
        onClick={() => setActiveTab("received")}
        className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
          activeTab === "received"
            ? "bg-green-500 text-black"
            : "bg-[#282828] text-gray-300 hover:bg-[#3a3a3a] hover:text-white"
        }`}
      >
        Được chia sẻ với tôi
      </button>

      <button
        onClick={() => setActiveTab("sent")}
        className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
          activeTab === "sent"
            ? "bg-green-500 text-black"
            : "bg-[#282828] text-gray-300 hover:bg-[#3a3a3a] hover:text-white"
        }`}
      >
        Tôi đã chia sẻ
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="mb-8 flex items-center gap-3 text-4xl font-bold">
          <Share2 className="text-green-500" /> Share Inbox
        </h1>

        {renderTabs()}

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-[#181818] p-6">
              <div className="mb-3 h-5 w-1/3 rounded bg-[#282828]" />
              <div className="h-4 w-2/3 rounded bg-[#282828]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <h1 className="mb-8 flex items-center gap-3 text-4xl font-bold">
          <Share2 className="text-green-500" /> Share Inbox
        </h1>

        {renderTabs()}

        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center gap-3">
        <Share2 className="text-green-500" size={36} />
        <h1 className="text-4xl font-bold">Share Inbox</h1>
      </div>

      {renderTabs()}

      {sharedItems.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Share2 size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">
            {activeTab === "received"
              ? "Chưa có nội dung nào được chia sẻ với bạn"
              : "Bạn chưa chia sẻ nội dung nào"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sharedItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[#181818] p-6 transition-all hover:bg-[#202020]"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      {formatTimeAgo(item.sharedAt)}
                    </span>

                    {item.type === "Media" && item.hasVideo && (
                      <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-black">
                        Video
                      </span>
                    )}

                    {item.type === "Playlist" && (
                      <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs">
                        Playlist
                      </span>
                    )}
                  </div>

                  <h3
                    className="cursor-pointer text-2xl font-semibold hover:text-green-400"
                    onClick={() => handlePlay(item)}
                  >
                    {item.title}
                  </h3>

                  {item.artistName && (
                    <p className="mt-1 text-gray-400">{item.artistName}</p>
                  )}

                  {item.message && (
                    <div className="mt-3 rounded-xl bg-[#282828] p-3 italic text-gray-300">
                      “{item.message}”
                    </div>
                  )}

                  <p className="mt-3 text-sm text-gray-400">
                    {activeTab === "received" ? (
                      <>
                        Được chia sẻ bởi{" "}
                        <span className="font-medium text-white">
                          {item.senderName}
                        </span>
                      </>
                    ) : (
                      <>
                        Đã chia sẻ cho{" "}
                        <span className="font-medium text-white">
                          {item.receiverName}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="ml-4 flex flex-col items-end gap-2">
                  <button
                    onClick={() => handlePlay(item)}
                    className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 font-semibold text-black transition hover:bg-green-400"
                  >
                    <Play size={16} />{" "}
                    {item.type === "Playlist" ? "Mở Playlist" : "Phát"}
                  </button>

                  {item.hasVideo && item.mediaItemId && (
                    <button
                      onClick={() => navigate(`/video/${item.mediaItemId}`)}
                      className="flex items-center gap-2 rounded-full bg-green-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-green-400"
                      title="Xem MV"
                    >
                      <Film size={16} />
                      MV
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
