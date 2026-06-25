import axiosInstance from "./axiosInstance";
import type { UserDto } from "./types/user";


export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  avatar?: File;
}

export const userService = {
  /**
   * Cập nhật thông tin hồ sơ người dùng
   */
  async updateProfile(data: UpdateProfileRequest) {
    const formData = new FormData();

    if (data.fullName) {
      formData.append("fullName", data.fullName);
      formData.append("displayName", data.fullName);
    }
    if (data.bio) formData.append("bio", data.bio);
    if (data.avatar) formData.append("avatar", data.avatar);

    const response = await axiosInstance.put<{ data: any }>("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  /**
   * Lấy thông tin hồ sơ người dùng hiện tại
   */
  async getProfile() {
    const response = await axiosInstance.get<{ data: any }>("/users/profile");
    return response.data.data;
  },

  async searchUsers(query = ""): Promise<UserDto[]> {
    const response = await axiosInstance.get<{ data: UserDto[] }>("/users/search", {
      params: { q: query },
    });
    return response.data.data || [];
  },
};
