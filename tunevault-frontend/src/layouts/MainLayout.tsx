import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import PlayerBar from '../components/layout/PlayerBar';

export default function MainLayout() {
  // TODO: lấy unreadCount từ NotificationContext (Person B sẽ bổ sung)
  const unreadCount = 0;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar unreadCount={unreadCount} />
          <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
            <div className="px-6 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Player bar */}
      <PlayerBar />
    </div>
  );
}
