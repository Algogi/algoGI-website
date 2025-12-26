import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { matchesRule } from "@/lib/utils/segment-matcher";

/**
 * GET /admin/campaigns/api/[id]/contacts
 * Get campaign contacts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const doc = await db.collection("contact_segments").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const campaign = doc.data();
    if (!campaign) {
      return NextResponse.json({ error: "Campaign data not found" }, { status: 404 });
    }

    let contacts: any[] = [];

    // Get contacts based on selection method
    if (campaign.contactIds && campaign.contactIds.length > 0) {
      // Manual selection
      const contactDocs = await Promise.all(
        campaign.contactIds.map((contactId: string) =>
          db.collection("contacts").doc(contactId).get()
        )
      );
      contacts = contactDocs
        .filter((doc) => doc.exists)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
    } else if (campaign.criteria) {
      // Rule-based selection
      const allContactsSnapshot = await db.collection("contacts").get();
      const allContacts = allContactsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const logic = campaign.criteria.logic || "AND";
      contacts = allContacts.filter((contact) => {
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
    }

    // Calculate verification breakdown
    const verificationStats = {
      total: contacts.length,
      verified: contacts.filter((c: any) => c.status === 'verified').length,
      verified_generic: contacts.filter((c: any) => c.status === 'verified_generic').length,
      pending: contacts.filter((c: any) => c.status === 'pending').length,
      verifying: contacts.filter((c: any) => c.status === 'verifying').length,
      invalid: contacts.filter((c: any) => c.status === 'invalid').length,
      bounced: contacts.filter((c: any) => c.status === 'bounced').length,
      unsubscribed: contacts.filter((c: any) => c.status === 'unsubscribed').length,
    };

    // Get pending contacts only for bulk verification
    const unverifiedContacts = contacts.filter((c: any) => c.status === 'pending');

    return NextResponse.json({
      contacts,
      total: contacts.length,
      verificationStats,
      unverifiedContacts: unverifiedContacts.map((c: any) => ({
        id: c.id,
        email: c.email,
        status: c.status,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching campaign contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign contacts", details: error.message },
      { status: 500 }
    );
  }
}

