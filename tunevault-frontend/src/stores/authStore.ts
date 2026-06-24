import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDto } from "../api/types/user";

interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: UserDto) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<UserDto>) => void; // ← Thêm hàm này
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      // Hàm cập nhật thông tin user (dùng trong ProfilePage)
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: "tunevault-auth",
    },
  ),
);
