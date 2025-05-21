import { authAdmin, firestoreAdmin, notAvailable } from "@/lib/firebase/server";
import { ServerChatProfileData } from "@/types/profile";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
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

    // Fetch the user's profile from the database
    const ref = firestoreAdmin?.collection("profiles").doc(user.uid);
    const userData = await authAdmin.getUser(user.uid).catch(() => null);
    if (!ref) {
      return NextResponse.json(
        { success: false, error: "Failed to access database" },
        { status: 500 }
      );
    }

    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ success: true, data: {} });
    }

    const profileData = doc.data() as ServerChatProfileData;
    profileData.phoneNumber = undefined;
    profileData.__lastAliasChanged = undefined; // private information
    profileData.photoURL = userData?.photoURL

    return NextResponse.json({ success: true, profile: profileData });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
