import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: true,
  isMobileOpen: false,

  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),

  setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),

  openMobileSidebar: () => set({ isMobileOpen: true }),
  closeMobileSidebar: () => set({ isMobileOpen: false }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileOpen: !state.isMobileOpen })),
}));
