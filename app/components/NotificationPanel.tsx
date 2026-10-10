"use client";

import { useState } from "react";

interface Notification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface NotificationPanelProps {
  notifications: Notification[];
  token: string | null;
  onNotificationUpdate: () => void;
}

export default function NotificationPanel({
  notifications,
  token,
  onNotificationUpdate,
}: NotificationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      FOLLOW: "👤",
      LIKE: "❤️",
      COMMENT: "💬",
      MESSAGE: "✉️",
      FRIEND_REQUEST: "🤝",
      SYSTEM: "🔔",
    };
    return icons[type] || "📢";
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
            No notifications yet
          </p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.isRead
                  ? "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {notification.sender?.name || "System"}
                    </p>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Type: {notification.type}
                  </p>
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={isLoading}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
