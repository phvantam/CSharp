import { Search, User, Menu } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  onMenuClick?: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-[#282828] bg-[#121212] px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Nút menu cho mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white"
        >
          <Menu size={22} />
        </button>

        {/* Search Bar */}
        <div className="relative w-64 md:w-96">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Bạn muốn nghe nhạc gì?"
            className="w-full rounded-full bg-[#282828] py-2.5 pl-12 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[#282828] px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-600">
                <User size={16} />
              </div>
              <span className="text-sm font-medium">{user.displayName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-full bg-[#282828] px-4 py-1.5 text-sm font-medium hover:bg-[#3a3a3a]"
            >
              Log out
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-gray-200"
          >
            Log in
          </button>
        )}
      </div>
    </div>
  );
};

export default Topbar;
