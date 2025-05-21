import { databaseAdmin, authAdmin, firestoreAdmin } from "@/lib/firebase/server";
import { ClientMessage, Message } from "@/types/message";
import { ServerChatProfileData, ServerProfileData } from "@/types/profile";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const userDataCache = new Map<string, ServerChatProfileData>(); // temporary cache for user data
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.toLowerCase() || '';
    const requestedLimit = parseInt(searchParams.get('limit') || '25');
    const limit = Math.min(requestedLimit, 25); // Ensure limit doesn't exceed 25


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
    // We'll fetch more than needed to filter locally by content
    const snapshot = await messagesRef
      .orderByChild("timestamp")
      .limitToLast(limit * 5) // Fetch more to ensure we have enough after filtering
      .once("value");

    const messages: ClientMessage[] = [];
    const promises: Promise<void>[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const promise = (async () => {
        const messageData = childSnapshot.val() as Message;
        const messageId = childSnapshot.key;
        
        // Skip if query doesn't match content
        if (query && !messageData.content.toLowerCase().includes(query)) {
          return;
        }

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

    // Limit results to requested amount
    const limitedMessages = messages.slice(0, limit);

    return NextResponse.json({ 
      success: true, 
      messages: limitedMessages,
      totalResults: messages.length,
      hasMore: messages.length > limit
    }, { status: 200 });
  } catch (error) {
    console.error("Error searching messages from Firebase:", error);
    return NextResponse.json(
      { error: "Failed to search messages" },
      { status: 500 }
    );
  }
}
