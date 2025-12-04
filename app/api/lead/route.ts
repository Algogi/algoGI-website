import { NextRequest, NextResponse } from "next/server";

interface LeadData {
  name: string;
  email: string;
  company: string;
  projectDescription: string;
  budgetTimeline: string;
  openToCall?: boolean;
  preferredCallTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadData = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "company",
      "projectDescription",
      "budgetTimeline",
    ];
    const missingFields = requiredFields.filter((field) => !body[field as keyof LeadData]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate call time if openToCall is true
    if (body.openToCall && !body.preferredCallTime) {
      return NextResponse.json(
        { error: "Please provide your preferred call time" },
        { status: 400 }
      );
    }

    // Log the lead data (in production, you would send this to your CRM)
    console.log("New lead submission:", {
      timestamp: new Date().toISOString(),
      ...body,
    });

    // TODO: Integrate with your CRM or automation platform
    // Examples:
    // - Send to HubSpot: await sendToHubSpot(body);
    // - Send to Salesforce: await sendToSalesforce(body);
    // - Send to Zapier webhook: await sendToZapier(body);
    // - Store in database: await db.leads.create(body);
    // - Send email notification: await sendEmailNotification(body);

    return NextResponse.json(
      {
        success: true,
        message: "Lead submitted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

