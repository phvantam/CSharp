import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import NotificationToast from "../components/common/NotificationToast";
import { useNotificationStore } from "../stores/notificationStore";
import { useAuthStore } from "../stores/authStore";
import {
  notificationService,
  normalizeNotification,
  type NotificationDto,
} from "../api/notificationService";

const getApiOrigin = () => {
  return (import.meta.env.VITE_API_URL || "http://localhost:5090/api").replace(
    /\/api\/?$/,
    "",
  );
};

const getActionUrl = (notification: NotificationDto) => {
  if (notification.actionUrl) return notification.actionUrl;

  switch ((notification.type || "").toLowerCase()) {
    case "mediashare":
    case "playlistshare":
      return "/share-inbox";
    case "follow":
      return notification.senderUserId
        ? `/profile/${notification.senderUserId}`
        : "/notifications";
    default:
      return "/notifications";
  }
};

export const useSignalR = () => {
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );
  const setConnectionStatus = useNotificationStore(
    (state) => state.setConnectionStatus,
  );

  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setConnectionStatus(false);
      setNotifications([]);
      return;
    }

    let isMounted = true;

    notificationService
      .getNotifications()
      .then((items) => {
        if (isMounted) {
          setNotifications(items);
        }
      })
      .catch((err) => {
        console.error("Load notifications error:", err);
      });

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${getApiOrigin()}/notificationHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveNotification", (payload: any) => {
      console.log("📩 New notification received:", payload);

      const notification = normalizeNotification(payload);
      const actionUrl = getActionUrl(notification);

      addNotification(notification);

      toast.custom(
        (t) =>
          React.createElement(NotificationToast, {
            title: notification.title,
            message: notification.body || notification.message || "",
            type: notification.type || "System",
            senderName: notification.senderName,
            onClose: () => toast.dismiss(t.id),
            onView: () => {
              toast.dismiss(t.id);
              navigate(actionUrl || "/notifications");
            },
          }),
        {
          id: `notification-${notification.notificationId}`,
          duration: 5000,
          position: "top-center",
        },
      );
    });

    connection
      .start()
      .then(() => {
        console.log("✅ SignalR Connected");
        setConnectionStatus(true);
      })
      .catch((err) => {
        console.error("SignalR Connection Error:", err);
        setConnectionStatus(false);
      });

    connection.onreconnected(() => {
      console.log("✅ SignalR Reconnected");
      setConnectionStatus(true);
    });

    connection.onclose(() => {
      console.log("⚠️ SignalR Disconnected");
      setConnectionStatus(false);
    });

    return () => {
      isMounted = false;
      connection.stop();
    };
  }, [token, addNotification, setNotifications, setConnectionStatus, navigate]);
};
