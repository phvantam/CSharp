// ============================================================
// NOTIFICATION TYPES
// ============================================================

export type NotificationType = 'share' | 'follow' | 'like' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}
