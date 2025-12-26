import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { matchesRule } from "@/lib/utils/segment-matcher";
import { Contact } from "@/lib/types/contact";

/**
 * POST /admin/campaigns/api/[id]/recalculate
 * Recalculate totalContacts based on current verified contacts
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const db = getDb();
    const campaignDoc = await db.collection("contact_segments").doc(campaignId).get();

    if (!campaignDoc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const campaign = campaignDoc.data();
    if (!campaign) {
      return NextResponse.json({ error: "Campaign data not found" }, { status: 404 });
    }

    if (!campaign.criteria) {
      return NextResponse.json(
        { error: "Campaign has no criteria to recalculate" },
        { status: 400 }
      );
    }

    // Get all contacts
    const allContactsSnapshot = await db.collection("contacts").get();
    const allContacts: Contact[] = allContactsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        status: data.status || 'pending',
        source: data.source || 'manual',
        segments: data.segments || [],
        engagementScore: data.engagementScore || 0,
        lastSent: data.lastSent?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        metadata: data.metadata,
      };
    });

    // Apply criteria filters
    const logic = campaign.criteria.logic || "AND";
    const matchingContacts = allContacts.filter((contact) => {
      if (logic === "AND") {
        return campaign.criteria.rules.every((rule: any) =>
          matchesRule(contact, rule)
        );
      } else {
        return campaign.criteria.rules.some((rule: any) =>
          matchesRule(contact, rule)
        );
      }
    });
    
    // Filter to only verified, non-unsubscribed contacts (eligible for sending)
    const eligibleContacts = matchingContacts.filter(
      (c) => c.status === 'verified' && c.email
    );

    // Update campaign with new counts
    await db.collection("contact_segments").doc(campaignId).update({
      contactCount: matchingContacts.length, // Total matching contacts
      totalContacts: eligibleContacts.length, // Only verified contacts
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      totalContacts: matchingContacts.length,
      eligibleContacts: eligibleContacts.length,
      message: `Recalculated: ${eligibleContacts.length} eligible contacts out of ${matchingContacts.length} total`,
    });
  } catch (error: any) {
    console.error("Error recalculating campaign contacts:", error);
    return NextResponse.json(
      { error: "Failed to recalculate contacts", details: error.message },
      { status: 500 }
    );
  }
}

