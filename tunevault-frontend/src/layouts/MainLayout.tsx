import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import PlayerBar from "../components/layout/PlayerBar";
import { useState } from "react";
import { useSignalR } from "../hooks/useSignalR";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Kích hoạt SignalR khi vào layout (chỉ gọi 1 lần)
  useSignalR();

  return (
    <div className="flex h-screen flex-col bg-[#121212] text-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Sidebar Mobile (Drawer) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-black">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Nội dung chính */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>

      <PlayerBar />
    </div>
  );
};

export default MainLayout;
