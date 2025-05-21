import { NextResponse } from "next/server";
import {
  databaseAdmin,
  authAdmin,
  firestoreAdmin,
} from "@/lib/firebase/server";
import { ClientMessage } from "@/types/message";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!databaseAdmin || !authAdmin || !firestoreAdmin) {
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Invalid Request" },
        { status: 400 }
      );
    }
    
    // Get messages from Firebase
    const messagesRef = databaseAdmin.ref(`messages/${id}`);
    const messageData = (await messagesRef.get()).val() as ClientMessage;
    if (!messageData) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    // Fetch the sender's profile data
    const senderRef = firestoreAdmin.collection("profiles").doc(messageData.uid);
    const senderDoc = await senderRef.get();
    const senderData = senderDoc.data();

    const senderUserData = await authAdmin.getUser(messageData.uid).catch(() => null);
    if (!senderUserData || !senderData) {
      return NextResponse.json(
        { success: false, error: "Sender not found" },
        { status: 404 }
      );
    }

    messageData.user = {
      displayName: senderData.displayName,
      photoURL: senderUserData.photoURL,
      verified: false
    };

    return NextResponse.json({ success: true, message: messageData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages from Firebase:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
