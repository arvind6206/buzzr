"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import NotificationPanel from "../components/NotificationPanel";
import SendNotification from "../components/SendNotification";

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

export default function DashboardPage() {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!token) return;

    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      eventSource = new EventSource(`/api/notifications/stream?token=${token}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "notifications") {
          setNotifications(data.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        eventSource?.close();
        // Reconnect after 3 seconds
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      eventSource?.close();
    };
  }, [token]);

  const handleNotificationUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Buzzr
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <SendNotification token={token} />
          </div>
          <div>
            <NotificationPanel
              notifications={notifications}
              token={token}
              onNotificationUpdate={handleNotificationUpdate}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
