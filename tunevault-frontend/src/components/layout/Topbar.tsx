import { User, Menu, Bell, LogOut } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import { mediaService } from "../../api";
import { useNotificationStore } from "../../stores/notificationStore";
import { useSidebarStore } from "../../stores/sidebarStore";

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuthStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const navigate = useNavigate();
  const openMobileSidebar = useSidebarStore((state) => state.openMobileSidebar);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMenuClick = () => {
    if (onMenuClick) onMenuClick();
    else openMobileSidebar();
  };

  const getAvatarUrl = () => {
    const avatarUrl = user?.avatarUrl;
    if (!avatarUrl) return "";

    if (avatarUrl.startsWith("http") || avatarUrl.startsWith("blob:")) {
      return avatarUrl;
    }

    return mediaService.getFullMediaUrl(avatarUrl);
  };

  const avatarUrl = getAvatarUrl();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#282828] bg-[#121212]/95 px-3 backdrop-blur md:px-5 lg:px-6">
      <button
        onClick={handleMenuClick}
        className="rounded-full p-2 text-gray-400 transition hover:bg-[#282828] hover:text-white lg:hidden"
        title="Mở menu"
      >
        <Menu size={23} />
      </button>

      <div className="min-w-0 flex-1" />

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {user ? (
          <>
            <button
              onClick={() => navigate("/notifications")}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#282828] text-gray-300 transition hover:bg-[#3a3a3a] hover:text-white"
              title="Thông báo"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex min-w-0 items-center gap-2 rounded-full bg-[#282828] px-1.5 py-1.5 pr-2 transition hover:bg-[#3a3a3a] sm:pr-3"
              title="Trang cá nhân"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-600">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.displayName || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={17} className="text-gray-200" />
                )}
              </div>

              <span className="hidden max-w-[140px] truncate text-sm font-semibold sm:block lg:max-w-[180px]">
                {user.displayName || user.email || "Người dùng"}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full bg-[#282828] px-3.5 py-2 text-sm font-semibold text-gray-300 transition hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/20"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-gray-200"
          >
            Log in
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
