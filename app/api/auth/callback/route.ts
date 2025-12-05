import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client, getTokenFromCode } from "@/lib/auth/google-auth";
import { createSession, setSession } from "@/lib/auth/session";
import { OAuth2Client } from "google-auth-library";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/login?error=${error}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/admin/login?error=missing_code", request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await getTokenFromCode(code);
    
    if (!tokens.id_token) {
      throw new Error("No ID token received");
    }

    // Verify the token and get user info
    const client = getOAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid token payload");
    }

    // Verify email domain
    if (!payload.email.endsWith("@algogi.com")) {
      return NextResponse.redirect(
        new URL("/admin/login?error=invalid_domain", request.url)
      );
    }

    // Create and set session
    const session = createSession(
      payload.email,
      payload.name || payload.email,
      payload.picture
    );
    await setSession(session);

    // Redirect to admin dashboard
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.redirect(
      new URL("/admin/login?error=auth_failed", request.url)
    );
  }
}

