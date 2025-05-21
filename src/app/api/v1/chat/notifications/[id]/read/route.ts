import { NextResponse } from "next/server";
import { markNotificationAsRead } from "@/lib/notifications";
import { authAdmin, notAvailable } from "@/lib/firebase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
      );
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the token
    const user = await authAdmin.verifyIdToken(token).catch(() => null);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Mark the notification as read
    await markNotificationAsRead(id);

    return NextResponse.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
