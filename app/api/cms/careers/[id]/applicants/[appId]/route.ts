import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { sendStatusChangeEmail } from "@/lib/email/job-application-emails";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  try {
    const { appId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const doc = await db.collection("applications").doc(appId).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const data = doc.data()!;
    
    // Fetch job title from jobId
    let jobTitle = "";
    if (data.jobId) {
      try {
        const jobDoc = await db.collection("jobs").doc(data.jobId).get();
        if (jobDoc.exists) {
          jobTitle = jobDoc.data()?.title || "";
        }
      } catch (error) {
        console.error("Error fetching job title:", error);
      }
    }
    
    return NextResponse.json({
      id: doc.id,
      jobId: data.jobId,
      jobTitle: jobTitle, // Fetch from jobId
      name: data.name,
      email: data.email,
      applicantData: data.applicantData || {},
      status: data.status || "applied",
      resumeUrl: data.resumeUrl || null,
      coverLetter: data.coverLetter || "",
      statusHistory: (data.statusHistory || []).map((entry: any) => ({
        status: entry.status,
        timestamp: entry.timestamp?.toDate?.()?.toISOString() || null,
        modifiedBy: entry.modifiedBy,
        notes: entry.notes || "",
      })),
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      updatedBy: data.updatedBy || "",
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  try {
    const { appId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const db = getDb();
    const docRef = db.collection("applications").doc(appId);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const currentData = doc.data()!;
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: session.email,
    };

    // Update status if provided
    if (body.status !== undefined && body.status !== currentData.status) {
      const validStatuses = [
        "applied",
        "screening",
        "phone-interview",
        "technical-interview",
        "final-interview",
        "offer",
        "rejected",
        "hired",
      ];

      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }

      updateData.status = body.status;

      // Add to status history
      const statusHistory = currentData.statusHistory || [];
      statusHistory.push({
        status: body.status,
        timestamp: new Date(),
        modifiedBy: session.email,
        notes: body.notes || "",
      });
      updateData.statusHistory = statusHistory;

      // Fetch job title for email
      let jobTitle = "";
      if (currentData.jobId) {
        try {
          const jobDoc = await db.collection("jobs").doc(currentData.jobId).get();
          if (jobDoc.exists) {
            jobTitle = jobDoc.data()?.title || "";
          }
        } catch (error) {
          console.error("Error fetching job title for email:", error);
        }
      }
      
      // Send status change email (non-blocking)
      try {
        await sendStatusChangeEmail(
          currentData.email,
          currentData.name,
          jobTitle,
          body.status,
          body.notes || ""
        );
      } catch (emailError) {
        console.error("Error sending status change email:", emailError);
        // Don't fail the request if email fails
      }
    }

    // Update other fields if provided
    if (body.notes !== undefined && body.status === undefined) {
      // If only notes are being updated, add to the latest status history entry
      const statusHistory = currentData.statusHistory || [];
      if (statusHistory.length > 0) {
        statusHistory[statusHistory.length - 1].notes = body.notes;
        updateData.statusHistory = statusHistory;
      }
    }

    if (body.applicantData !== undefined) {
      updateData.applicantData = body.applicantData;
    }

    if (body.coverLetter !== undefined) {
      updateData.coverLetter = body.coverLetter;
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const data = updatedDoc.data()!;
    
    // Fetch job title from jobId
    let jobTitle = "";
    if (data.jobId) {
      try {
        const jobDoc = await db.collection("jobs").doc(data.jobId).get();
        if (jobDoc.exists) {
          jobTitle = jobDoc.data()?.title || "";
        }
      } catch (error) {
        console.error("Error fetching job title:", error);
      }
    }

    return NextResponse.json({
      id: updatedDoc.id,
      jobId: data.jobId,
      jobTitle: jobTitle, // Fetch from jobId
      name: data.name,
      email: data.email,
      applicantData: data.applicantData || {},
      status: data.status || "applied",
      resumeUrl: data.resumeUrl || null,
      coverLetter: data.coverLetter || "",
      statusHistory: (data.statusHistory || []).map((entry: any) => ({
        status: entry.status,
        timestamp: entry.timestamp?.toDate?.()?.toISOString() || null,
        modifiedBy: entry.modifiedBy,
        notes: entry.notes || "",
      })),
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      updatedBy: data.updatedBy || "",
    });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

