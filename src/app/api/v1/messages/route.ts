import { NextResponse } from "next/server";
import {
  databaseAdmin,
  authAdmin,
  firestoreAdmin,
} from "@/lib/firebase/server";
import { randomUUID } from "crypto";
import { ServerChatProfileData, ServerProfileData } from "@/types/profile";
import { Message, ClientMessage } from "@/types/message";

export async function GET(request: Request) {
  try {
    const userDataCache = new Map<string, ServerChatProfileData>(); // temporary cache for user data

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

    // Get messages from Firebase
    const messagesRef = databaseAdmin.ref("messages");
    const snapshot = await messagesRef
      .orderByChild("timestamp")
      .limitToLast(25)
      .once("value");

    const messages: ClientMessage[] = [];
    const promises: Promise<void>[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const promise = (async () => {
        const messageData = childSnapshot.val() as Message;
        const messageId = childSnapshot.key;

        let userData: ServerChatProfileData | undefined;
        if (userDataCache.has(messageData.uid)) {
          userData = userDataCache.get(messageData.uid);
        } else {
          const firebaseUserData = await authAdmin?.getUser(messageData.uid);
          const userRef = firestoreAdmin?.collection("profiles").doc(messageData.uid);
          const userDoc = await userRef?.get();
          const firestoreUserData = userDoc?.data() as ServerProfileData;
          userData = {
            photoURL: firebaseUserData?.photoURL || "",
            ...firestoreUserData
          };
          userDataCache.set(messageData.uid, userData);
        }

        const message: ClientMessage = {
          ...messageData,
          id: messageId,
          user: {
            displayName: userData?.displayName || "Unknown",
            photoURL: userData?.photoURL || "",
            verified: true,
          },
        };
        messages.push(message);
      })();
      promises.push(promise);
      return false; // Continue iteration
    });
    
    await Promise.all(promises);

    // Sort messages by timestamp in descending order
    messages.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ success: true, messages }, { status: 200 });
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
    const { content } = (await request.json()) as Message;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Invalid message format" },
        { status: 400 }
      );
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

    const messageId = randomUUID();

    // Create the message object
    const message = {
      content,
      id: messageId,
      uid: user.uid,
      timestamp: Date.now(),
    } as Message;

    // Push message to Firebase
    const messagesRef = databaseAdmin.ref("messages");

    const newMessageRef = messagesRef.child(messageId);
    await newMessageRef.set(message);

    return NextResponse.json(
      {
        success: true,
        messageId: newMessageRef.key,
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
