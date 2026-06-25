import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import PlayerBar from "../components/layout/PlayerBar";
import { useEffect } from "react";
import { useSignalR } from "../hooks/useSignalR";
import { useSidebarStore } from "../stores/sidebarStore";

const MainLayout = () => {
  const isMobileOpen = useSidebarStore((state) => state.isMobileOpen);
  const closeMobileSidebar = useSidebarStore(
    (state) => state.closeMobileSidebar,
  );

  useSignalR();

  useEffect(() => {
    if (!isMobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#121212] text-white">
      <div className="hidden shrink-0 lg:block">
        <Sidebar />
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeMobileSidebar}
            aria-label="Đóng menu"
          />
          <div className="absolute left-0 top-0 h-full max-w-[82vw]">
            <Sidebar isMobile />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-8 sm:px-5 md:px-6 lg:px-8">
          <Outlet />
        </main>

        {/* Giữ PlayerBar ở tất cả trang, kể cả /video/:id */}
        <PlayerBar />
      </div>
    </div>
  );
};

export default MainLayout;
