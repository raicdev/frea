import { Timestamp } from "firebase-admin/firestore";
import { firestoreAdmin } from "./firebase/server";

export type NotificationType =
  | "message"
  | "like"
  | "reply"
  | "follow"
  | "mention"
  | "other";

export type SpecialNotificationType = "like" | "reply" | "follow" | "mention";

export type NotificationData =
  | {
      userId: string;
      type: SpecialNotificationType;
      senderId: string;
      extraMessage: string;
    }
  | {
      userId: string;
      message: string;
      type: "message";
    }
  | {
      userId: string;
      type: Exclude<NotificationType, SpecialNotificationType>;
    };

export type Notification = {
  id: string;
  userId: string;
  message?: string;
  senderId?: string;
  read: boolean;
  createdAt: { _nanoseconds: number; _seconds: number };
  type: NotificationType;
  extraMessage?: string;
};

/**
 * Adds a new notification to Firestore
 * @param userId The user ID to add the notification for
 * @param message The notification message
 * @returns The ID of the newly created notification
 */
export async function addNotification(
  notificationData: NotificationData
): Promise<string | null> {
  if (!firestoreAdmin) return null;
  const notificationsRef = firestoreAdmin.collection("notifications");

  const uuid = crypto.randomUUID();

  const notification: Notification = {
    id: uuid,
    userId: notificationData.userId,
    read: false,
    createdAt: Timestamp.now() as unknown as { _nanoseconds: number; _seconds: number },
    type: notificationData.type,
  };

  // Check if this is a special notification type
  if (
    isSpecialNotificationType(notificationData.type) &&
    "extraMessage" in notificationData
  ) {
    // Add extraMessage for special notification types
    notification.extraMessage = notificationData.extraMessage;
  }

  if (notificationData.type === "message" && "message" in notificationData) {
    notification.message = notificationData.message;
  }

  if (isSpecialNotificationType(notificationData.type) && "senderId" in notificationData) {
    notification.senderId = notificationData.senderId;
  }

  await notificationsRef.doc(uuid).set(notification);
  return notification.id;
}

// Type guard function to check if a type is a SpecialNotificationType
function isSpecialNotificationType(
  type: NotificationType
): type is SpecialNotificationType {
  return ["like", "reply", "follow", "mention"].includes(type as string);
}

/**
 * Gets all notifications for a user
 * @param userId The user ID to get notifications for
 * @param onlyUnread Optional parameter to only get unread notifications
 * @returns An array of notification objects
 */
export async function getNotifications(
  userId: string,
  onlyUnread = false
): Promise<Notification[] | null> {
  if (!firestoreAdmin) return null;
  const notificationsRef = firestoreAdmin.collection("notifications");

  let query = notificationsRef.where("userId", "==", userId);

  if (onlyUnread) {
    query = query.where("read", "==", false);
  }

  const snapshot = await query.orderBy("createdAt", "desc").get();

  return snapshot.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
    } as Notification;
  });
}

/**
 * Marks a notification as read
 * @param notificationId The ID of the notification to mark as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const notificationRef = firestoreAdmin
    ?.collection("notifications")
    .doc(notificationId);

  await notificationRef?.update({
    read: true,
  });
}
