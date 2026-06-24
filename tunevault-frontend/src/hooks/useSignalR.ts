import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { useNotificationStore } from "../stores/notificationStore";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useSignalR = () => {
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const setConnectionStatus = useNotificationStore(
    (state) => state.setConnectionStatus,
  );
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/notificationHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("✅ SignalR Connected");
        setConnectionStatus(true);

        connection.on("ReceiveNotification", (notification: any) => {
          console.log("📩 New notification received:", notification);

          // Thêm vào store
          addNotification({
            notificationId: notification.id || Date.now(),
            title: notification.title,
            body: notification.body,
            isRead: false,
            createdAt: new Date().toISOString(),
            type: notification.type || "System",
          });

          // Hiển thị Toast đơn giản và ổn định
          toast.success(notification.title || "Bạn có thông báo mới", {
            duration: 5000,
            position: "top-right",
            icon: "🔔",
            style: {
              background: "#181818",
              color: "#fff",
              border: "1px solid #3a3a3a",
            },
          });

          // Tự động chuyển trang Notifications nếu muốn (tùy chọn)
          // toast.success(..., { onClick: () => navigate("/notifications") });
        });
      })
      .catch((err) => {
        console.error("SignalR Connection Error:", err);
        setConnectionStatus(false);
      });

    return () => {
      connection.stop();
    };
  }, [token, navigate]);
};
