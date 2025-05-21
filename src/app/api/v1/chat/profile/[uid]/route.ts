import { authAdmin, firestoreAdmin, notAvailable } from "@/lib/firebase/server";
import { ServerChatProfileData } from "@/types/profile";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    let { uid } = await params;
    let isAlias = false;

    if (uid.includes("@")) {
      isAlias = true;
    }

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
    let ref: FirebaseFirestore.DocumentReference | undefined;
    if (isAlias) {
      const aliasRef = firestoreAdmin?.collection("profiles").where("alias", "==", uid.replace("@", "")).limit(1)
      const aliasDoc = await aliasRef?.get();
      if (aliasDoc?.empty) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      }

      ref = aliasDoc?.docs[0].ref;
      uid = aliasDoc?.docs[0].id || uid;
    } else {
      ref = firestoreAdmin?.collection("profiles").doc(uid);
    }

    const userData = await authAdmin.getUser(uid).catch(() => null);
    if (!ref) {
      return NextResponse.json(
        { success: false, error: "Failed to access database" },
        { status: 500 }
      );
    }
    if (!userData) {
      return NextResponse.json(
        { success: false, error: "Failed to access user data" },
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
