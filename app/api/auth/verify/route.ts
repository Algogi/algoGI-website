import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/google-auth";
import { createSession, setSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing idToken" },
        { status: 400 }
      );
    }

    // Verify the token and get user info
    const userInfo = await verifyToken(idToken);

    // Verify email domain
    if (!userInfo.email.endsWith("@algogi.com")) {
      return NextResponse.json(
        { error: "Only @algogi.com email addresses are allowed" },
        { status: 403 }
      );
    }

    // Create and set session
    const session = createSession(
      userInfo.email,
      userInfo.name,
      userInfo.picture
    );
    await setSession(session);

    return NextResponse.json({
      success: true,
      user: {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}

