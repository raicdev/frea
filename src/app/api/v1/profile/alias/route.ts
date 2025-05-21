import { authAdmin, firestoreAdmin, notAvailable } from "@/lib/firebase/server";
import { ServerProfileData } from "@/types/profile";
import { NextResponse } from "next/server";

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
    const { alias } = await request.json();

    if (!alias) {
      return NextResponse.json(
        { success: false, error: "Alias is required" },
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

    const profileData = existingProfile.data() as ServerProfileData;
    if (!profileData) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profileData.__lastAliasChanged) {
      // check 14 days
      const lastAliasChanged = new Date(profileData.__lastAliasChanged);
      const currentDate = new Date();
      const timeDiff = currentDate.getTime() - lastAliasChanged.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      if (daysDiff < 14) {
        return NextResponse.json(
          {
            success: false,
            error: `You can only change your alias every 14 days.`,
          },
          { status: 429 }
        );
      }
    }

    // Check if the alias is already taken
    const aliasSnapshot = await firestoreAdmin
      ?.collection("profiles")
      .where("alias", "==", alias)
      .get();

    if (aliasSnapshot?.empty) {
      await ref.set(
        {
          alias,
          __lastAliasChanged: Date.now(), // Internal field to track alias changes
        },
        { merge: true }
      );

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Alias is already taken" },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
