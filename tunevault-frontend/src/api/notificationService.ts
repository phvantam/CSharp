import axiosInstance from "./axiosInstance";

export type NotificationType =
  | "MediaShare"
  | "PlaylistShare"
  | "Follow"
  | "System"
  | string;

export interface NotificationDto {
  notificationId: number;
  title: string;
  message?: string | null;
  body?: string | null;
  type?: NotificationType | null;
  referenceId?: number | null;
  senderUserId?: string | null;
  senderName?: string | null;
  senderAvatarUrl?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

const unwrapNotifications = (payload: any): any[] => {
  const data = payload?.data?.data ?? payload?.data ?? payload ?? [];
  return Array.isArray(data) ? data : [];
};

const unwrap = (payload: any) =>
  payload?.data?.data ?? payload?.data ?? payload;

export const normalizeNotification = (noti: any): NotificationDto => {
  const message = noti.message ?? noti.Message ?? noti.body ?? noti.Body ?? "";

  return {
    notificationId:
      noti.notificationId ??
      noti.NotificationId ??
      noti.id ??
      noti.Id ??
      Date.now(),
    title: noti.title ?? noti.Title ?? "Bạn có thông báo mới",
    message,
    body: noti.body ?? noti.Body ?? message,
    type: noti.type ?? noti.Type ?? "System",
    referenceId: noti.referenceId ?? noti.ReferenceId ?? null,
    senderUserId: noti.senderUserId ?? noti.SenderUserId ?? null,
    senderName: noti.senderName ?? noti.SenderName ?? null,
    senderAvatarUrl: noti.senderAvatarUrl ?? noti.SenderAvatarUrl ?? null,
    actionUrl: noti.actionUrl ?? noti.ActionUrl ?? null,
    isRead: noti.isRead ?? noti.IsRead ?? false,
    createdAt: noti.createdAt ?? noti.CreatedAt ?? new Date().toISOString(),
  };
};

export const notificationService = {
  async getNotifications(): Promise<NotificationDto[]> {
    const res = await axiosInstance.get("/notification");
    return unwrapNotifications(res.data).map(normalizeNotification);
  },

  async markAsRead(id: number) {
    const res = await axiosInstance.put(`/notification/${id}/read`);
    return unwrap(res.data);
  },

  async markAllAsRead() {
    const res = await axiosInstance.put("/notification/read-all");
    return unwrap(res.data);
  },
};
