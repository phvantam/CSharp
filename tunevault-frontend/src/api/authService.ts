import axiosInstance from "./axiosInstance";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserDto,
} from "./types/user";

// ==================== MOCK MODE ====================
const USE_MOCK = false;
// ===================================================

const mockUser: UserDto = {
  id: "U001",
  displayName: "Phạm Văn Tâm",
  email: "eddypham@gmail.com",
  avatarUrl: "/image/user01.jpg",
  bio: "Thích nghe V-Pop và nhạc chill",
  createdAt: new Date().toISOString(),
};

const mockToken = "mock-jwt-token-for-development-123456";

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        success: true,
        data: {
          token: mockToken,
          user: mockUser,
        },
      };
    }

    // Gọi API thật
    const res = await axiosInstance.post<AuthResponse>("/auth/login", data);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        success: true,
        data: {
          token: mockToken,
          user: mockUser,
        },
      };
    }

    const res = await axiosInstance.post<AuthResponse>("/auth/register", data);
    return res.data;
  },

  async getCurrentUser(): Promise<UserDto> {
    if (USE_MOCK) {
      return mockUser;
    }
    const res = await axiosInstance.get<{ data: UserDto }>("/auth/me");
    return res.data.data;
  },

  async logout(): Promise<void> {
    if (USE_MOCK) return;
    await axiosInstance.post("/auth/logout");
  },
};
