import { OAuth2Client } from "google-auth-library";

let oauth2Client: OAuth2Client | null = null;

export function getOAuth2Client(): OAuth2Client {
  if (!oauth2Client) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error(
        "Missing Google OAuth configuration. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables."
      );
    }

    oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback`
    );
  }

  return oauth2Client;
}

export function getAuthUrl(): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    prompt: "consent",
  });
}

export async function verifyToken(token: string) {
  const client = getOAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid token payload");
  }

  return {
    email: payload.email!,
    name: payload.name!,
    picture: payload.picture,
  };
}

export async function getTokenFromCode(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

