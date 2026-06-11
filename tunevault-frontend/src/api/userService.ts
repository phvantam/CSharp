import axiosInstance from "./axiosInstance";

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

    if (data.fullName) formData.append("fullName", data.fullName);
    if (data.bio) formData.append("bio", data.bio);
    if (data.avatar) formData.append("avatar", data.avatar);

    const response = await axiosInstance.put("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Lấy thông tin hồ sơ người dùng hiện tại
   */
  async getProfile() {
    const response = await axiosInstance.get("/users/profile");
    return response.data;
  },
};
