import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Clock3,
  ExternalLink,
  ListMusic,
  Music2,
  UserPlus,
  Info,
  MailOpen,
  Circle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../../stores/notificationStore";
import {
  notificationService,
  type NotificationDto,
} from "../../api/notificationService";

const getTypeInfo = (type?: string | null) => {
  switch ((type || "").toLowerCase()) {
    case "mediashare":
      return {
        label: "Chia sẻ bài hát",
        icon: Music2,
        badgeClass: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
        iconClass: "text-emerald-300",
      };
    case "playlistshare":
      return {
        label: "Chia sẻ playlist",
        icon: ListMusic,
        badgeClass: "bg-violet-500/15 text-violet-300 ring-violet-400/20",
        iconClass: "text-violet-300",
      };
    case "follow":
      return {
        label: "Theo dõi",
        icon: UserPlus,
        badgeClass: "bg-sky-500/15 text-sky-300 ring-sky-400/20",
        iconClass: "text-sky-300",
      };
    default:
      return {
        label: "Hệ thống",
        icon: Info,
        badgeClass: "bg-white/10 text-gray-300 ring-white/10",
        iconClass: "text-gray-300",
      };
  }
};

const getActionUrl = (notification: NotificationDto) => {
  if (notification.actionUrl) return notification.actionUrl;

  switch ((notification.type || "").toLowerCase()) {
    case "mediashare":
    case "playlistshare":
      return "/share-inbox";
    case "follow":
      return notification.senderUserId
        ? `/profile/${notification.senderUserId}`
        : "";
    default:
      return "";
  }
};

const formatTime = (dateString?: string) => {
  if (!dateString) return "";

  const utcString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
  const date = new Date(utcString);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const NotificationsPage = () => {
  const navigate = useNavigate();

  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      ),
    [notifications],
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await notificationService.getNotifications();
        useNotificationStore.getState().setNotifications(data);
      } catch (err) {
        console.error("Lỗi tải thông báo:", err);
        setError(
          "Không thể tải thông báo. Kiểm tra backend hoặc token đăng nhập.",
        );
        useNotificationStore.getState().setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleOpenNotification = async (notification: NotificationDto) => {
    try {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.notificationId);
        markAsRead(notification.notificationId);
      }
    } catch (err) {
      console.error("Mark as read error:", err);
    }

    const actionUrl = getActionUrl(notification);
    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      markAllAsRead();
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <Bell className="text-green-500" size={34} />
          <h1 className="text-4xl font-bold">Thông báo</h1>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-3xl bg-[#181818] p-6">
              <div className="mb-3 h-5 w-3/4 rounded bg-[#282828]" />
              <div className="h-4 w-1/2 rounded bg-[#282828]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 ring-1 ring-green-400/20">
            <Bell className="text-green-400" size={28} />
          </div>

          <div>
            <h1 className="text-4xl font-bold">Thông báo</h1>
            <p className="mt-1 text-sm text-gray-400">
              Theo dõi chia sẻ media, playlist và lượt follow mới.
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>

        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 self-start rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-[#282828] disabled:text-gray-500 sm:self-center"
        >
          <CheckCheck size={18} />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      {sortedNotifications.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-[#181818] py-20 text-center text-gray-400">
          <Bell className="mx-auto mb-4 opacity-60" size={54} />
          <p className="text-xl font-semibold text-white">
            Chưa có thông báo nào
          </p>
          <p className="mt-2 text-sm">
            Khi có người chia sẻ bài hát, playlist hoặc follow bạn, thông báo sẽ
            xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotifications.map((notification) => {
            const typeInfo = getTypeInfo(notification.type);
            const Icon = typeInfo.icon;
            const actionUrl = getActionUrl(notification);
            const message = notification.body || notification.message;

            return (
              <button
                key={notification.notificationId}
                onClick={() => handleOpenNotification(notification)}
                className={`group w-full rounded-3xl border p-5 text-left transition-all ${
                  notification.isRead
                    ? "border-white/5 bg-[#181818] hover:bg-[#202020]"
                    : "border-green-400/25 bg-[#1f2a22] shadow-[0_0_0_1px_rgba(34,197,94,0.12)] hover:bg-[#243126]"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 ${typeInfo.iconClass}`}
                  >
                    <Icon size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${typeInfo.badgeClass}`}
                      >
                        {typeInfo.label}
                      </span>

                      {!notification.isRead && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-black">
                          <Circle size={8} fill="currentColor" />
                          Mới
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-lg font-bold text-white">
                          {notification.title}
                        </p>

                        {message && (
                          <p className="mt-1 text-sm leading-6 text-gray-300">
                            {message}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          {notification.senderName && (
                            <span>
                              Người gửi:{" "}
                              <b className="font-semibold text-gray-200">
                                {notification.senderName}
                              </b>
                            </span>
                          )}

                          {/*notification.referenceId && (
                            <span>
                              Mã tham chiếu: #{notification.referenceId}
                            </span>
                          )*/}

                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={14} />
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-sm text-gray-400">
                        {notification.isRead ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5">
                            <MailOpen size={15} />
                            Đã đọc
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-500/15 px-3 py-1.5 font-semibold text-green-300">
                            Chưa đọc
                          </span>
                        )}

                        {actionUrl && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 transition group-hover:bg-white/10 group-hover:text-white">
                            Mở
                            <ExternalLink size={15} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
