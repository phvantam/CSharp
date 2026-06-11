import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNotificationStore } from "../../stores/notificationStore";
import { notificationService } from "../../api";

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();
  const [loading, setLoading] = useState(true);

  // Lấy danh sách thông báo khi vào trang
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await notificationService.getNotifications();
        useNotificationStore.getState().setNotifications(data);
      } catch {
        // Mock data
        const mockData = [
          {
            notificationId: 1,
            title: "Bạn nhận được một bài hát mới",
            body: "Nguyễn Yến Vy đã chia sẻ “Nơi Này Có Anh” cho bạn.",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            type: "MediaShared",
          },
          {
            notificationId: 2,
            title: "Bạn nhận được một playlist mới",
            body: "Trần Minh Khang đã chia sẻ playlist “Video MV Việt nổi bật”.",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            type: "PlaylistShared",
          },
        ];
        useNotificationStore.getState().setNotifications(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="text-green-500" size={32} />
          <h1 className="text-4xl font-bold">Thông báo</h1>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#181818] animate-pulse">
              <div className="h-5 bg-[#282828] rounded w-3/4 mb-3" />
              <div className="h-4 bg-[#282828] rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Bell className="text-green-500" size={32} />
          <h1 className="text-4xl font-bold">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm px-3 py-0.5 rounded-full">
              {unreadCount} mới
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white self-start sm:self-center"
          >
            <CheckCheck size={18} /> Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell className="mx-auto mb-4" size={48} />
          <p className="text-xl">Chưa có thông báo nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((noti) => (
            <div
              key={noti.notificationId}
              onClick={() => markAsRead(noti.notificationId)}
              className={`p-5 rounded-2xl cursor-pointer transition-all ${
                noti.isRead
                  ? "bg-[#181818] hover:bg-[#202020]"
                  : "bg-[#282828] border-l-4 border-green-500"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <div>
                  <p className="font-semibold text-lg">{noti.title}</p>
                  {noti.body && (
                    <p className="text-gray-300 mt-1 text-sm sm:text-base">
                      {noti.body}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-400 whitespace-nowrap sm:ml-4">
                  {formatTime(noti.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
