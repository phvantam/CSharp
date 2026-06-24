/*import axiosInstance from "./axiosInstance";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ApiMessageResponse,
  AuthResponse,
  UserDto,
} from "./types/user";

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await axiosInstance.post("/auth/login", data);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await axiosInstance.post("/auth/register", data);
    return res.data;
  },

  async getCurrentUser(): Promise<UserDto> {
    const res = await axiosInstance.get("/auth/me");
    return res.data.data;
  },

  async logout() {
    await axiosInstance.post("/auth/logout");
  },
};*/
import axiosInstance from "./axiosInstance";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserDto,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ApiMessageResponse,
} from "./types/user";

// ==================== MOCK MODE ====================
const USE_MOCK = false; // Backend TuneVault.Api is available at http://localhost:5000/api

const mockUser: UserDto = {
  id: "U001",
  displayName: "Phạm Văn Tâm",
  email: "eddypham@gmail.com",
  avatarUrl: "/image/user01.jpg",
  bio: "Thích nghe V-Pop và nhạc chill",
  createdAt: new Date().toISOString(),
};

const mockToken = "mock-jwt-token-for-development-123456";
// ===================================================

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) {
      // Giả lập delay như thật
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Cho phép đăng nhập với bất kỳ email nào (để test dễ)
      return {
        success: true,
        data: {
          token: mockToken,
          user: {
            ...mockUser,
            email: data.email,
            displayName: data.email.split("@")[0],
          },
        },
      };
    }

    // Gọi API thật khi có backend
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

    console.log("Calling register API with:", data);
    const res = await axiosInstance.post<AuthResponse>("/auth/register", data);
    console.log("Register API response:", res.data);
    return res.data;
  },

  async forgotPassword(
    data: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    const res = await axiosInstance.post<ForgotPasswordResponse>(
      "/auth/forgot-password",
      data,
    );
    return res.data;
  },

  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<ApiMessageResponse> {
    const res = await axiosInstance.post<ApiMessageResponse>(
      "/auth/reset-password",
      data,
    );
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
    if (USE_MOCK) {
      return;
    }
    await axiosInstance.post("/auth/logout");
  },
};
