import { NextRequest, NextResponse } from "next/server";

interface NewsletterData {
  email: string;
  agreedToMarketing?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterData = await request.json();

    // Validate email field
    if (!body.email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // Validate marketing consent
    if (!body.agreedToMarketing) {
      return NextResponse.json(
        { error: "Marketing consent is required" },
        { status: 400 }
      );
    }

    // Log the newsletter subscription (in production, you would send this to your email service)
    console.log("New newsletter subscription:", {
      timestamp: new Date().toISOString(),
      email: body.email,
      agreedToMarketing: body.agreedToMarketing,
    });

    // TODO: Integrate with your email service provider
    // Examples:
    // - Send to Mailchimp: await addToMailchimp(body.email);
    // - Send to SendGrid: await addToSendGrid(body.email);
    // - Send to ConvertKit: await addToConvertKit(body.email);
    // - Store in database: await db.newsletter.create({ email: body.email });
    // - Send to Zapier webhook: await sendToZapier({ email: body.email, type: 'newsletter' });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to newsletter",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing newsletter subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

