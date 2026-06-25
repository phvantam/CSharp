import { NavLink } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/',        icon: Home,    label: 'Trang chủ' },
  { to: '/search',  icon: Search,  label: 'Tìm kiếm' },
  { to: '/library', icon: Library, label: 'Thư viện' },
];

export default function Sidebar() {
  const { isAuthenticated } = useAuth();

  return (
    <aside className="flex flex-col bg-[#000000] w-60 shrink-0 h-full overflow-hidden">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <span className="text-xl font-bold text-white tracking-tight">
          🎵 TuneVault
        </span>
      </div>

      {/* Main nav */}
      <nav className="px-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'text-white'
                  : 'text-[#b3b3b3] hover:text-white',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="h-px bg-[#282828] mx-3 my-3" />

      {/* Library actions */}
      {isAuthenticated && (
        <nav className="px-3">
          <NavLink
            to="/library/upload"
            className="flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-medium text-[#b3b3b3] hover:text-white transition-colors"
          >
            <PlusSquare size={20} strokeWidth={1.8} />
            Tạo playlist
          </NavLink>
          <NavLink
            to="/library/favorites"
            className="flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-medium text-[#b3b3b3] hover:text-white transition-colors"
          >
            <Heart size={20} strokeWidth={1.8} />
            Bài hát yêu thích
          </NavLink>
        </nav>
      )}

      <div className="h-px bg-[#282828] mx-3 my-3" />

      {/* Playlist shortcuts — Person B sẽ bổ sung dynamic list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="text-xs text-[#6b6b6b] px-3 mb-2 uppercase tracking-widest">Playlist</p>
        {/* TODO: render danh sách playlist của user */}
      </div>
    </aside>
  );
}
