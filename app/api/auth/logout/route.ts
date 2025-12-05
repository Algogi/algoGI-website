import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    await deleteSession();
    return NextResponse.redirect(new URL("/admin/login", request.url));
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.redirect(new URL("/admin/login?error=logout_failed", request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    await deleteSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}

