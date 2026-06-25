import axiosInstance from "./axiosInstance";

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  privacyLevel?: "Public" | "Private";
}

export interface FollowStatsDto {
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface PublicUserProfileDto {
  userId: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
  privacyLevel?: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface UserSearchResultDto {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  isFollowing?: boolean;
}

export interface UserListItemDto {
  userId: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  isFollowing: boolean;
}

const unwrap = (res: any) => res.data?.data ?? res.data;

export const userService = {
  // Lấy hồ sơ của tài khoản đang đăng nhập
  async getProfile() {
    const response = await axiosInstance.get("/user/profile");
    return unwrap(response);
  },

  // Cập nhật hồ sơ. Backend hiện đang nhận [FromBody], nên gửi JSON thay vì FormData.
  async updateProfile(data: UpdateProfileRequest) {
    const response = await axiosInstance.put("/user/profile", {
      fullName: data.fullName,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      privacyLevel: data.privacyLevel ?? "Public",
    });

    return unwrap(response);
  },

  // Tìm user để share / follow
  async searchUsers(keyword: string): Promise<UserSearchResultDto[]> {
    if (!keyword.trim()) return [];

    const response = await axiosInstance.get("/user/search", {
      params: { keyword: keyword.trim() },
    });

    return unwrap(response) || [];
  },

  // Xem hồ sơ user khác
  async getPublicProfile(userId: string): Promise<PublicUserProfileDto> {
    const response = await axiosInstance.get(`/user/${userId}/profile`);
    return unwrap(response);
  },

  async getFollowStats(userId: string): Promise<FollowStatsDto> {
    const response = await axiosInstance.get(`/user/${userId}/follow-stats`);
    return unwrap(response);
  },

  async followUser(userId: string) {
    const response = await axiosInstance.post(`/user/${userId}/follow`);
    return unwrap(response);
  },

  async unfollowUser(userId: string) {
    const response = await axiosInstance.delete(`/user/${userId}/follow`);
    return unwrap(response);
  },

  async getFollowers(userId: string): Promise<UserListItemDto[]> {
    try {
      const response = await axiosInstance.get(`/user/${userId}/followers`);
      return unwrap(response) || [];
    } catch (error) {
      console.error("Get followers error:", error);
      return [];
    }
  },

  async getFollowing(userId: string): Promise<UserListItemDto[]> {
    try {
      const response = await axiosInstance.get(`/user/${userId}/following`);
      return unwrap(response) || [];
    } catch (error) {
      console.error("Get following error:", error);
      return [];
    }
  },

  async uploadAvatar(
    file: File,
  ): Promise<string | { avatarUrl?: string; url?: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosInstance.post("/user/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = unwrap(response);

    // Backend có thể trả:
    // 1) ApiResponse<string> => "/media/avatar/xxx.jpg"
    // 2) ApiResponse<object> => { avatarUrl: "/media/avatar/xxx.jpg" }
    if (typeof data === "string") return data;

    return {
      avatarUrl: data?.avatarUrl || data?.url || data?.data || "",
      url: data?.url,
    };
  },
};
