import { cookies } from "next/headers";

export interface Session {
  email: string;
  name: string;
  picture?: string;
  expiresAt: number;
}

const SESSION_COOKIE_NAME = "cms_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSession(email: string, name: string, picture?: string): Session {
  return {
    email,
    name,
    picture,
    expiresAt: Date.now() + SESSION_DURATION,
  };
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value);

    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      return null;
    }

    // Verify email domain
    if (!session.email.endsWith("@algogi.com")) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

