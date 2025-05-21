import { authAdmin, firestoreAdmin, notAvailable } from "@/lib/firebase/server";
import { ProfileData, ServerChatProfileData, ServerProfileData } from "@/types/profile";
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
    const checkAliasDate = request.headers.get("X-Alias-Data");
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

    const profileData = doc.data() as ServerProfileData;

    if (!checkAliasDate) {
        profileData.__lastAliasChanged = undefined;
    }

    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const { displayName, bio, location, website, phoneNumber, embeds } =
      (await request.json()) as ProfileData;

    if (!displayName) {
      return NextResponse.json(
        { success: false, error: "Display name is required" },
        { status: 400 }
      );
    }

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

    // Update the user's profile
    await authAdmin.updateUser(user.uid, {
      displayName,
      photoURL: user.photoURL,
    });

    // Update the profile in the database
    const ref = firestoreAdmin?.collection("profiles").doc(user.uid);
    if (!ref) {
      return NextResponse.json(
        { success: false, error: "Failed to access database" },
        { status: 500 }
      );
    }

    const existingProfile = await ref.get();
    if (!existingProfile.exists) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    const profileData = existingProfile.data() as ServerChatProfileData;
    if (!profileData) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    await ref.set({
      uid: user.uid,
      displayName,
      bio,
      verified: profileData.verified,
      embeds,
      location,
      website,
      phoneNumber,
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
