import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";

interface AnalyticsEventData {
  eventName: string;
  params: Record<string, any>;
  pagePath: string;
  userAgent?: string;
  trackingResults?: {
    firebaseAnalytics: boolean;
    gtag: boolean;
    firestore: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsEventData = await request.json();

    // Validate required fields
    if (!body.eventName) {
      return NextResponse.json(
        { error: "eventName is required" },
        { status: 400 }
      );
    }

    // Get client IP address (if available)
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Store event in Firestore
    try {
      const db = getDb();
      await db.collection("analytics_events").add({
        eventName: body.eventName,
        params: body.params || {},
        pagePath: body.pagePath || "",
        userAgent: body.userAgent || "",
        ipAddress,
        trackingResults: body.trackingResults || {
          firebaseAnalytics: false,
          gtag: false,
          firestore: true, // This one succeeded
        },
        timestamp: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true });
    } catch (dbError: any) {
      console.error("Error storing analytics event in Firestore:", dbError);
      return NextResponse.json(
        { error: "Failed to store event", details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error processing analytics event:", error);
    return NextResponse.json(
      { error: "Invalid request", details: error.message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const eventName = searchParams.get("eventName");
    const pagePath = searchParams.get("pagePath");
    const limit = parseInt(searchParams.get("limit") || "1000");

    const db = getDb();
    let query: FirebaseFirestore.Query = db.collection("analytics_events");

    // Build query based on available filters
    // Note: Firestore requires composite indexes for multiple where clauses with orderBy
    // We'll prioritize eventName filter if present, then apply date filters
    
    if (eventName) {
      // If filtering by eventName, use the composite index (eventName + timestamp)
      query = query.where("eventName", "==", eventName);
      
      if (startDate) {
        query = query.where("timestamp", ">=", new Date(startDate));
      }
      if (endDate) {
        query = query.where("timestamp", "<=", new Date(endDate));
      }
      
      query = query.orderBy("timestamp", "desc").limit(limit);
    } else if (pagePath) {
      // If filtering by pagePath, use the composite index (pagePath + timestamp)
      query = query.where("pagePath", "==", pagePath);
      
      if (startDate) {
        query = query.where("timestamp", ">=", new Date(startDate));
      }
      if (endDate) {
        query = query.where("timestamp", "<=", new Date(endDate));
      }
      
      query = query.orderBy("timestamp", "desc").limit(limit);
    } else {
      // No eventName or pagePath filter - just use timestamp
      if (startDate) {
        query = query.where("timestamp", ">=", new Date(startDate));
      }
      if (endDate) {
        query = query.where("timestamp", "<=", new Date(endDate));
      }
      
      query = query.orderBy("timestamp", "desc").limit(limit);
    }

    const snapshot = await query.get();
    const events = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        eventName: data.eventName,
        params: data.params || {},
        pagePath: data.pagePath || "",
        userAgent: data.userAgent || "",
        ipAddress: data.ipAddress || "",
        trackingResults: data.trackingResults || {},
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
      };
    });

    // If we have both eventName and pagePath filters, filter in memory
    // (Firestore doesn't support multiple equality filters easily)
    let filteredEvents = events;
    if (eventName && pagePath) {
      filteredEvents = events.filter(
        (e) => e.eventName === eventName && e.pagePath === pagePath
      );
    }

    return NextResponse.json(filteredEvents);
  } catch (error: any) {
    console.error("Error fetching analytics events:", error);
    // If it's an index error, return empty array with a note
    if (error.message?.includes("index")) {
      console.warn("Firestore index may not be ready. Events will be available once index is built.");
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: "Failed to fetch events", details: error.message },
      { status: 500 }
    );
  }
}

