import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bell, Upload, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TopbarProps {
  unreadCount?: number;
}

export default function Topbar({ unreadCount = 0 }: TopbarProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-[#121212]/80 backdrop-blur-sm shrink-0 sticky top-0 z-10">
      {/* Navigation arrows */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-[#000000]/70 flex items-center justify-center text-white hover:bg-[#282828] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-full bg-[#000000]/70 flex items-center justify-center text-white hover:bg-[#282828] transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {/* Upload */}
            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full hover:scale-105 transition-transform"
            >
              <Upload size={14} />
              Tải lên
            </button>

            {/* Notification bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#1db954] text-black text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar menu */}
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full overflow-hidden bg-[#535353] flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                : <User size={16} className="text-white" />
              }
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-semibold text-[#b3b3b3] hover:text-white px-4 py-2 transition-colors"
            >
              Đăng ký
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-black text-sm font-bold px-6 py-2 rounded-full hover:scale-105 transition-transform"
            >
              Đăng nhập
            </button>
          </>
        )}
      </div>
    </header>
  );
}
