import { create } from "zustand";
import type { NotificationDto } from "../api/notificationService";

interface NotificationState {
  notifications: NotificationDto[];
  unreadCount: number;
  isConnected: boolean;

  setNotifications: (notifications: NotificationDto[]) => void;
  addNotification: (notification: NotificationDto) => void;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  setConnectionStatus: (isConnected: boolean) => void;
}

const getUnreadCount = (notifications: NotificationDto[]) =>
  notifications.filter((notification) => !notification.isRead).length;

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: getUnreadCount(notifications),
    }),

  addNotification: (notification) =>
    set((state) => {
      const exists = state.notifications.some(
        (item) => item.notificationId === notification.notificationId,
      );

      const notifications = exists
        ? state.notifications.map((item) =>
            item.notificationId === notification.notificationId
              ? { ...item, ...notification }
              : item,
          )
        : [notification, ...state.notifications];

      return {
        notifications,
        unreadCount: getUnreadCount(notifications),
      };
    }),

  markAsRead: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.map((notification) =>
        notification.notificationId === notificationId
          ? { ...notification, isRead: true }
          : notification,
      );

      return {
        notifications,
        unreadCount: getUnreadCount(notifications),
      };
    }),

  markAllAsRead: () =>
    set((state) => {
      const notifications = state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));

      return {
        notifications,
        unreadCount: 0,
      };
    }),

  setConnectionStatus: (isConnected) => set({ isConnected }),
}));
