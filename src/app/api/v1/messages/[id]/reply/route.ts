import { NextResponse } from "next/server";
import {
  databaseAdmin,
  authAdmin,
  firestoreAdmin,
} from "@/lib/firebase/server";
import { randomUUID } from "crypto";
import { ReplyMessage, Message } from "@/types/message";
import { ProfileData, ServerChatProfileData } from "@/types/profile";
import { addNotification } from "@/lib/notifications";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Invalid Request" },
        { status: 400 }
      );
    }

    if (!databaseAdmin || !authAdmin) {
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

    // Get messages from Firebase
    const messagesRef = databaseAdmin.ref(`messages/${id}`);
    const messageData = await messagesRef.get();
    const message = messageData.val() as Message;
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const replies = message.replies || [];
    const userDataCache = new Map<string, ServerChatProfileData>();

    // Map replies to an array of promises instead of using forEach with async callbacks
    const userDataPromises = replies.map(async (reply) => {
      const userId = reply.uid;

      let userData: ServerChatProfileData | undefined;
      if (userDataCache.has(userId)) {
        userData = userDataCache.get(userId);
      } else {
        const firebaseUserData = await authAdmin
          ?.getUser(userId)
          .catch(() => null);
        const firestoreUserData = await firestoreAdmin
          ?.collection("users")
          .doc(userId)
          .get()
          .then((doc) => doc.data() as ProfileData | undefined)
          .catch(() => undefined);

        if (firebaseUserData) {
          userData = {
            displayName: firebaseUserData.displayName || "unknown",
            photoURL: firebaseUserData.photoURL || "",
            ...firestoreUserData,
          } as ServerChatProfileData;
          userDataCache.set(userId, userData);
        }
      }

      // Return the reply with user data
      return {
        ...reply,
        user: userData,
      };
    });

    // Wait for all promises to resolve
    const populatedMessages = await Promise.all(userDataPromises);
    populatedMessages.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json(
      { success: true, messages: populatedMessages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages from Firebase:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content, replyTo } = (await request.json()) as ReplyMessage;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    if (!replyTo || typeof replyTo !== "string") {
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
    const userData = await authAdmin.getUser(user?.uid || "").catch(() => null);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ); // Hide reason for security
    }

    const messageId = randomUUID();

    // Create the message object
    const replyMessage = {
      content,
      id: messageId,
      uid: user.uid,
      user: {
        displayName: userData?.displayName || "unknown",
        photoURL: user.picture || userData?.photoURL || "",
        verified: false,
      },
      replyTo,
      timestamp: Date.now(),
    } as ReplyMessage;

    // Push message to Firebase
    const messagesRef = databaseAdmin.ref(`messages/${replyTo}`);
    const messageData = await messagesRef.get();
    const message = messageData.val() as Message;
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await addNotification({
      userId: message.uid,
      type: "reply",
      senderId: user.uid,
      extraMessage: message.id,
    });

    messagesRef.update({
      replies: [...(message.replies || []), replyMessage],
    });

    return NextResponse.json(
      {
        success: true,
        messageId: messageId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error pushing message to Firebase:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
