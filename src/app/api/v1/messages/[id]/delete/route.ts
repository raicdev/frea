import { NextResponse } from "next/server";
import { databaseAdmin, authAdmin } from "@/lib/firebase/server";
import { Message } from "@/types/message";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    if (!authAdmin || !databaseAdmin) {
      return NextResponse.json(
        { error: "Auth server is currently unavailable" },
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

    // Push message to Firebase
    const messagesRef = databaseAdmin.ref(`messages/${id}`);
    const messageData = await messagesRef.get();
    const message = messageData.val() as Message;
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.uid != user.uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ); // Hide reason for security
    }

    messagesRef.remove();

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error pushing message to Firebase:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
