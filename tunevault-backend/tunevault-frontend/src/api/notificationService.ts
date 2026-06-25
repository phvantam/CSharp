import axiosInstance from "./axiosInstance";

export const notificationService = {
  async getNotifications() {
    const res = await axiosInstance.get<{ data: any[] }>("/notifications");
    return res.data.data || [];
  },

  async markAsRead(id: number) {
    return axiosInstance.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return axiosInstance.patch("/notifications/read-all");
  },
};

