import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";

export async function GET(request: NextRequest) {
  const verification = {
    firebaseAnalytics: {
      available: false,
      message: "Not checked",
    },
    gtag: {
      available: false,
      message: "Not checked",
    },
    firestore: {
      available: false,
      message: "Not checked",
    },
  };

  // Check Firestore connection
  try {
    const db = getDb();
    // Try a simple query to verify connection
    const testQuery = await db.collection("analytics_events").limit(1).get();
    verification.firestore = {
      available: true,
      message: "Connected and accessible",
    };
  } catch (error: any) {
    verification.firestore = {
      available: false,
      message: `Connection failed: ${error.message}`,
    };
  }

  // Note: Firebase Analytics and gtag() are client-side only
  // We can't verify them from the server, but we can check if the config exists
  const hasFirebaseConfig =
    !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  verification.firebaseAnalytics = {
    available: hasFirebaseConfig,
    message: hasFirebaseConfig
      ? "Configuration present (client-side verification required)"
      : "Missing configuration",
  };

  verification.gtag = {
    available: hasFirebaseConfig,
    message: hasFirebaseConfig
      ? "Configuration present (client-side verification required)"
      : "Missing configuration",
  };

  return NextResponse.json({
    success: true,
    verification,
    timestamp: new Date().toISOString(),
  });
}

