import { NextResponse } from "next/server";
import { getNotifications } from "@/lib/notifications";
import { authAdmin, notAvailable } from "@/lib/firebase/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Invalid Request" },
        { status: 400 }
      );
    }

    if (!authAdmin || notAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: "Auth server is currently down, please try again.",
        },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ); // Hide reason for security
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ); // Hide reason for security
    }

    // Verify the token
    const user = await authAdmin.verifyIdToken(token).catch(() => null);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ); // Hide reason for security
    }

    // Get the user's notifications
    let notifications = await getNotifications(user.uid);
    if (!notifications) {
      return NextResponse.json({ success: true, notifications });
    }

    // Filter notifications based on the provided ID

    notifications = notifications.filter(notification => notification.id === id);
    if (notifications.length === 0) {
      return NextResponse.json({ success: false, error: "No notifications found" }, { status: 404 });
    }

    // Add descriptive messages based on notification type
    const notificationsWithMessages = notifications.map(async (notification) => {
      let message = "";
      let targetUser = null;

      if (["like", "reply", "follow", "mention"].includes(notification.type) && notification.senderId) {
        targetUser = await authAdmin?.getUser(notification.senderId);
      }

      switch (notification.type) {
        case "like":
          message = `${targetUser?.displayName} liked your message`;
          break;
        case "reply":
          message = `${targetUser?.displayName} replied to your message`;
          break;
        case "follow":
          message = `${targetUser?.displayName} followed you`;
          break;
        case "mention":
          message = `${targetUser?.displayName} mentioned you`;
          break;
        default:
          message = "You have a new notification";
      }

      return { ...notification, message };
    });

    notifications = await Promise.all(notificationsWithMessages);

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
