import {
  Home,
  Search,
  Library,
  Share2,
  Bell,
  User,
  Upload,
  Bot,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useNotificationStore } from "../../stores/notificationStore";

const Sidebar = () => {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();

  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Your Library", path: "/library" },
  ];

  const socialItems = [
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

  return (
    <div className="flex h-full w-64 flex-col bg-black p-3 text-white">
      {/* Logo */}
      <div className="mb-8 px-4 pt-4">
        <h1 className="text-3xl font-bold tracking-tighter text-green-500">
          TuneVault
        </h1>
      </div>

      {/* Main Menu */}
      <div className="px-2 mb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 text-base mb-1 transition-all ${
                isActive(item.path)
                  ? "bg-[#282828] font-semibold text-white"
                  : "text-gray-400 hover:bg-[#282828] hover:text-white"
              }`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="px-4 text-xs font-semibold text-gray-500 mb-2">
        SOCIAL
      </div>

      {/* Social Menu */}
      <div className="px-2">
        {socialItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between rounded-lg px-4 py-3 text-base mb-1 transition-all ${
                isActive(item.path)
                  ? "bg-[#282828] font-semibold text-white"
                  : "text-gray-400 hover:bg-[#282828] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <Icon size={22} />
                <span>{item.label}</span>
              </div>

              {/* Badge */}
              {item.hasBadge && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
