import { NextResponse } from "next/server";
import {
  databaseAdmin,
  authAdmin,
  firestoreAdmin,
} from "@/lib/firebase/server";
import { Message, MessageFavorite } from "@/types/message";
import { addNotification } from "@/lib/notifications";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid Request" },
        { status: 400 }
      );
    }

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
    const messageData = (await messagesRef.get()).val() as Message;
    if (!messageData) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, favorites: messageData.favorites }, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages from Firebase:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid Request" },
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

    // Push message to Firebase
    const messagesRef = databaseAdmin.ref(`messages/${id}`);
    const timestamp = Date.now();
    const messageData = await messagesRef.get();
    const message = messageData.val() as Message;
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.favorites) {
      const alreadyFavorited = message.favorites.find(
        (favorite) => favorite.uid === user.uid
      );
      if (alreadyFavorited) {
        messagesRef.update({
          favorites: message.favorites.filter(
            (favorite) => favorite.uid !== user.uid
          ),
        });

        return NextResponse.json(
          {
            success: true,
            favorited: false,
          },
          { status: 200 }
        );
      }
    }

    messagesRef.update({
      favorites: [
        ...(message.favorites || []),
        {
          uid: user.uid,
          timestamp,
        } as MessageFavorite,
      ],
    });

    await addNotification({
      userId: message.uid,
      type: "like",
      senderId: user.uid,
      extraMessage: message.id,
    });

    return NextResponse.json(
      {
        success: true,
        favorited: true,
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
