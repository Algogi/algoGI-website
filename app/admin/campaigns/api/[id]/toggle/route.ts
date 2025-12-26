import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { calculateEmailsPerHour } from "@/lib/campaigns/warmup-calculator";
import { matchesRule } from "@/lib/utils/segment-matcher";
import { Contact } from "@/lib/types/contact";

/**
 * PUT /admin/campaigns/api/[id]/toggle
 * Toggle campaign start/stop
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection("contact_segments").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const campaign = doc.data();
    if (!campaign) {
      return NextResponse.json({ error: "Campaign data not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const updateData: any = {
      isActive,
      updatedAt: now,
    };

    if (isActive) {
      // Starting campaign
      updateData.status = "active";
      updateData.startedAt = campaign.startedAt || now;
      updateData.pausedAt = null;

      // Recalculate totalContacts to ensure it reflects only verified, eligible contacts
      if (campaign.criteria) {
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

        // Filter to only verified, non-unsubscribed contacts
        const eligibleContacts = matchingContacts.filter(
          (c) => c.status === 'verified' && c.status !== 'unsubscribed' && c.email
        );
        updateData.totalContacts = eligibleContacts.length;
        updateData.contactCount = matchingContacts.length; // Keep total count for reference
      }

      // Calculate emails per hour if not set
      const totalContacts = updateData.totalContacts || campaign.totalContacts || 0;
      if (!campaign.emailsPerHour && totalContacts > 0) {
        const emailsPerHour = calculateEmailsPerHour(
          totalContacts,
          campaign.sentContacts || 0,
          campaign.startedAt || now
        );
        updateData.emailsPerHour = emailsPerHour;
      }
    } else {
      // Stopping campaign
      updateData.status = "paused";
      updateData.pausedAt = now;
    }

    await docRef.update(updateData);

    return NextResponse.json({
      success: true,
      isActive,
      status: updateData.status,
    });
  } catch (error: any) {
    console.error("Error toggling campaign:", error);
    return NextResponse.json(
      { error: "Failed to toggle campaign", details: error.message },
      { status: 500 }
    );
  }
}

