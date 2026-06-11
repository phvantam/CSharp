export interface NotificationDto {
  notificationId: number;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
}
