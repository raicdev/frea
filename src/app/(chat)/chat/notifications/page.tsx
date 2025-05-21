"use client";

import { useAuth } from "@/context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Notification } from "@/lib/notifications";
import { toast } from "sonner";
import { Message } from "@/components/Message";
import { ClientMessage } from "@/types/message";

// New NotificationItem component
const NotificationItem = ({
  notification,
  secureFetch,
  onMarkAsRead,
}: {
  notification: Notification;
  secureFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onMarkAsRead: (id: string) => Promise<void>;
}) => {
  const [message, setMessage] = useState<ClientMessage | null>(null);

  useEffect(() => {
    if (notification.extraMessage) {
      const fetchMessage = async () => {
        const response = await secureFetch(
          `/api/v1/messages/${notification.extraMessage}`,
          {
            method: "GET",
          }
        );
        const data = await response.json();

        if (data.success) {
          setMessage(data.message);
        } else {
          toast.error("Failed to fetch extra message");
        }
      };
      fetchMessage();
    }
  }, [notification]);

  return (
    <div
      className={`p-4 border rounded-lg ${
        notification.read
          ? "bg-card text-card-foreground"
          : "bg-secondary text-secondary-foreground"
      }`}
    >
      <div className="flex justify-between">
        <p className="text-sm">{notification.message}</p>
        <span className="text-xs">
          {new Timestamp(
            notification.createdAt._seconds,
            notification.createdAt._nanoseconds
          )
            .toDate()
            .toLocaleString()}
        </span>
      </div>
      {notification.extraMessage && !message && (
        <div className="flex items-center justify-center mt-2">
          <Loader2Icon className="animate-spin h-6 w-6" />
        </div>
      )}
      {notification.extraMessage && message && (
        <Message
          message={message}
          className="!max-w-full m-2 bg-transparent"
          viewOnly={true}
        />
      )}
      {!notification.read && (
        <button
          onClick={() => onMarkAsRead(notification.id)}
          className="text-xs text-blue-600 mt-2"
        >
          Mark as read
        </button>
      )}
    </div>
  );
};

export default function NotificationsPage() {
  const { user, isLoading, secureFetch } = useAuth();
  const router = useRouter();
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
    } else {
      fetchNotifications();
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    notifications.forEach((notification: Notification) => {
      console.log(notification.createdAt);
    });
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await secureFetch("/api/v1/chat/notifications", {
        method: "GET",
      });
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await secureFetch(
        `/api/v1/chat/notifications/${id}/read`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(
          notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
      } else {
        toast.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to update notification");
    }
  };

  if (isLoading || isLoadingNotifications) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader2Icon className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold">Notifications</h2>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          You don&apos;t have any notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              secureFetch={secureFetch}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
