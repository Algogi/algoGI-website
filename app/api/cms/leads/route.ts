import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const leadsSnapshot = await db.collection("leads").orderBy("submittedAt", "desc").get();

    const leads = leadsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        company: data.company,
        projectDescription: data.projectDescription,
        budgetTimeline: data.budgetTimeline,
        openToCall: data.openToCall || false,
        preferredCallTime: data.preferredCallTime || null,
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() || null,
        ipAddress: data.ipAddress || null,
      };
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

