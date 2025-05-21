import { authAdmin, firestoreAdmin, notAvailable } from "@/lib/firebase/server";
import { ServerChatProfileData } from "@/types/profile";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;

    if (!uid || typeof uid !== "string") {
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

    // Fetch the user's followers from the database
    const ref = firestoreAdmin?.collection("profiles").doc(uid);
    if (!ref) {
      return NextResponse.json(
        { success: false, error: "Failed to access database" },
        { status: 500 }
      );
    }

    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ success: true, following: [] });
    }

    const profileData = doc.data() as ServerChatProfileData;
    const following = profileData.following || [];

    return NextResponse.json({ success: true, following });
  } catch (error) {
    console.error("Error fetching following list:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch following list" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;

    if (!uid || typeof uid !== "string") {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    if (!authAdmin || !firestoreAdmin) {
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

    // Cannot follow yourself
    if (user.uid === uid) {
      return NextResponse.json(
        { success: false, error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Get the user's profile
    const userRef = firestoreAdmin.collection("profiles").doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() as ServerChatProfileData : { following: [] };
    
    // Get the target user's profile to verify they exist
    const targetRef = firestoreAdmin.collection("profiles").doc(uid);
    const targetDoc = await targetRef.get();
    const targetData = targetDoc.exists ? targetDoc.data() as ServerChatProfileData : { followers: [] };

    if (!userDoc.exists || Object.keys(userData).length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (!targetDoc.exists || Object.keys(targetData).length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already following
    const following = userData?.following || [];
    const alreadyFollowing = following.includes(uid);

    if (alreadyFollowing) {
      // Unfollow
      await userRef.update({
        following: following.filter(uid => uid !== uid)
      });

      await targetRef.update({
        followers: targetData.followers?.filter(uid => uid !== user.uid) || []
      });

      return NextResponse.json(
        { success: true, following: false },
        { status: 200 }
      );
    } else {
      // Follow
      await userRef.update({
        following: [...following, uid]
      });

      await targetRef.update({
        followers: [...(targetData.followers || []), user.uid]
      });

      return NextResponse.json(
        { success: true, following: true },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error updating follow status:", error);
    return NextResponse.json(
      { error: "Failed to update follow status" },
      { status: 500 }
    );
  }
}
