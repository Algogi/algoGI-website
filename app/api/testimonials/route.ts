import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";

export async function GET(request: NextRequest) {
  try {
    let db;
    try {
      db = getDb();
    } catch (firebaseError: any) {
      console.error("Firebase initialization error:", firebaseError);
      // Return empty array if Firebase is not configured (testimonials are optional)
      return NextResponse.json([], {
        status: 200,
        headers: {
          "Cache-Control": "no-cache",
        },
      });
    }
    
    const testimonialsRef = db.collection("testimonials");
    
    // Try to fetch with orderBy, fallback to simple get if order field doesn't exist
    let snapshot;
    try {
      snapshot = await testimonialsRef.orderBy("order", "asc").get();
    } catch (orderError: any) {
      // If orderBy fails (e.g., missing index or field), try without ordering
      console.warn("OrderBy failed, fetching without order:", orderError.message);
      snapshot = await testimonialsRef.get();
    }

    const testimonials = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        quote: data.quote,
        author: data.author,
        role: data.role,
        rating: data.rating || 5,
        order: data.order || 0,
      };
    });

    // Sort manually if orderBy didn't work
    if (testimonials.length > 0 && testimonials.some(t => t.order === undefined || t.order === null)) {
      testimonials.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return NextResponse.json(testimonials, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    // Return empty array if Firestore fails (testimonials are optional)
    // But log the error for debugging
    return NextResponse.json([], {
      status: 200, // Still return 200 since testimonials are optional
      headers: {
        "Cache-Control": "no-cache",
      },
    });
  }
}

