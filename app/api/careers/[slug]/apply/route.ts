import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { uploadFile } from "@/lib/firebase/storage";
import { generateSignedUrl } from "@/lib/firebase/storage";
import { sendApplicationConfirmationEmail, sendNewApplicationNotificationEmail } from "@/lib/email/job-application-emails";
import { randomBytes } from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();

    // Find the job
    const jobsSnapshot = await db
      .collection("jobs")
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get();

    if (jobsSnapshot.empty) {
      return NextResponse.json(
        { error: "Job not found or not accepting applications" },
        { status: 404 }
      );
    }

    const jobDoc = jobsSnapshot.docs[0];
    const jobData = jobDoc.data();
    const jobId = jobDoc.id;

    // Parse form data (may include files)
    const formData = await request.formData();
    const applicantData: Record<string, any> = {};
    let resumeUrl: string | null = null;
    let name = "";
    let email = "";

    // Get form fields from job or application form template
    let formFields = jobData.formFields || [];
    if (jobData.applicationFormId) {
      try {
        const formDoc = await db.collection("applicationForms").doc(jobData.applicationFormId).get();
        if (formDoc.exists) {
          formFields = formDoc.data()?.formFields || [];
        }
      } catch (error) {
        console.error("Error fetching application form:", error);
      }
    }

    // Process form fields and validate required fields
    for (const field of formFields) {
      const value = formData.get(field.id);
      
      // Check if required field is missing
      if (field.required && !value) {
        return NextResponse.json(
          { error: `${field.label} is required` },
          { status: 400 }
        );
      }

      if (value) {
        if (field.type === "file") {
          // Handle file upload
          const file = value as File;
          
          // Validate file type for resume
          if (field.id === "resume" && file.type !== "application/pdf") {
            return NextResponse.json(
              { error: "Resume must be a PDF file" },
              { status: 400 }
            );
          }
          
          if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
              { error: "File size exceeds 10MB limit" },
              { status: 400 }
            );
          }

          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Generate random filename for security
          const randomString = randomBytes(16).toString("hex");
          const fileExtension = field.id === "resume" ? "pdf" : file.name.split(".").pop() || "";
          const fileName = `careers/resumes/${randomString}.${fileExtension}`;

          await uploadFile(fileName, buffer, file.type);
          if (field.id === "resume") {
            resumeUrl = fileName;
          }
          applicantData[field.id] = fileName;
        } else if (field.type === "checkbox") {
          applicantData[field.id] = value === "true" || value === "on";
        } else {
          applicantData[field.id] = value.toString();
        }
      }
    }

    // Extract name and email from applicantData (if they exist in the form)
    name = applicantData.name || formData.get("name")?.toString() || "";
    email = applicantData.email || formData.get("email")?.toString() || "";

    // Process resume if it wasn't processed in the formFields loop (system field)
    if (!resumeUrl) {
      const resumeFile = formData.get("resume") as File | null;
      if (resumeFile) {
        // Validate file type
        if (resumeFile.type !== "application/pdf") {
          return NextResponse.json(
            { error: "Resume must be a PDF file" },
            { status: 400 }
          );
        }
        
        if (resumeFile.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Resume file size exceeds 10MB limit" },
            { status: 400 }
          );
        }

        const arrayBuffer = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Generate random filename for security
        const randomString = randomBytes(16).toString("hex");
        const fileName = `careers/resumes/${randomString}.pdf`;

        await uploadFile(fileName, buffer, resumeFile.type);
        resumeUrl = fileName;
        applicantData.resume = fileName;
      }
    }

    // Name, email, and resume are always required for all job applications
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!email || email.trim() === "") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Resume is always required
    if (!resumeUrl) {
      return NextResponse.json(
        { error: "Resume is required" },
        { status: 400 }
      );
    }

    // Get cover letter if provided
    const coverLetter = formData.get("coverLetter")?.toString() || "";

    // Create application
    const now = new Date();
    const applicationData = {
      jobId,
      jobTitle: jobData.title,
      name,
      email,
      applicantData,
      resumeUrl,
      coverLetter,
      status: "applied",
      statusHistory: [
        {
          status: "applied",
          timestamp: now,
          modifiedBy: email,
        },
      ],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: email,
    };

    const appRef = await db.collection("applications").add(applicationData);

    // Send emails (non-blocking)
    try {
      await Promise.all([
        sendApplicationConfirmationEmail(email, name, jobData.title, appRef.id),
        sendNewApplicationNotificationEmail(
          jobData.title,
          name,
          email,
          appRef.id,
          jobId
        ),
      ]);
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Don't fail the request if emails fail
    }

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        applicationId: appRef.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}

