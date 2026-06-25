import {
  Home,
  Search,
  Library,
  Share2,
  Bell,
  User,
  Upload,
  Bot,
  Clock3,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useNotificationStore } from "../../stores/notificationStore";
import { useSidebarStore } from "../../stores/sidebarStore";

interface SidebarProps {
  isMobile?: boolean;
}

const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();
  const { isCollapsed, toggleSidebar, closeMobileSidebar } = useSidebarStore();

  const collapsed = isMobile ? false : isCollapsed;

  // Gom tất cả menu thành 1 danh sách
  const allMenuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Your Library", path: "/library" },
    { icon: Clock3, label: "Recently Played", path: "/history" },
    { icon: Share2, label: "Share Inbox", path: "/share-inbox" },
    { icon: Upload, label: "Upload", path: "/upload" },
    { icon: Bot, label: "Music Assistant", path: "/ai-chat" },
    {
      icon: Bell,
      label: "Notifications",
      path: "/notifications",
      hasBadge: true,
    },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigate = () => {
    if (isMobile) closeMobileSidebar();
  };

  const renderItem = (item: any) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={handleNavigate}
        className={`group relative mb-1 flex min-h-11 items-center rounded-2xl px-3 py-2.5 transition-all duration-200 ${
          collapsed ? "justify-center" : "gap-4"
        } ${
          active
            ? "bg-green-500/10 text-white"
            : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
        }`}
        title={collapsed ? item.label : ""}
      >
        {/* Left active indicator */}
        {active && (
          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-green-500" />
        )}

        {/* Icon container */}
        <div
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
            active
              ? "bg-green-500 text-black shadow-lg shadow-green-500/25"
              : "bg-white/[0.04] text-gray-300 group-hover:bg-white/[0.08] group-hover:text-white"
          }`}
        >
          <Icon size={20} />

          {item.hasBadge && unreadCount > 0 && collapsed && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-[#050505]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        {!collapsed && (
          <span className="truncate text-sm font-semibold">{item.label}</span>
        )}

        {item.hasBadge && unreadCount > 0 && !collapsed && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={`relative z-[110] flex h-screen shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#141414]/95 pt-0 text-white shadow-[10px_0_35px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && (
          <Link
            to="/home"
            onClick={handleNavigate}
            className="text-2xl font-black tracking-[-0.5px] text-green-500"
          >
            TuneVault
          </Link>
        )}

        {isMobile ? (
          <button
            onClick={closeMobileSidebar}
            className="rounded-full p-2 text-gray-400 transition hover:bg-[#282828] hover:text-white"
          >
            <X size={20} />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="rounded-full p-2 text-gray-400 transition hover:bg-[#282828] hover:text-white"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>

      {/* Navigation - Chỉ còn 1 danh sách duy nhất */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-20 [scrollbar-width:thin] [scrollbar-color:#4b5563_transparent]">
        <div className="space-y-1">{allMenuItems.map(renderItem)}</div>
      </nav>
    </aside>
  );
};

export default Sidebar;
