import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getEmailTransporter } from "@/lib/email/send-email";
import { getSenderEmail } from "@/lib/email/send-email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appId } = await params;
    const body = await request.json();
    const { to, subject, body: emailBody } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "To, subject, and body are required" },
        { status: 400 }
      );
    }

    const emailTransporter = getEmailTransporter();
    const fromEmail = getSenderEmail('job');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="white-space: pre-wrap;">${emailBody.replace(/\n/g, "<br>")}</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
              This email was sent from the AlgoGI Careers system.
            </p>
          </div>
        </body>
      </html>
    `;

    await emailTransporter.sendMail({
      from: `"AlgoGI Careers" <${fromEmail}>`,
      to,
      subject,
      text: emailBody,
      html,
      replyTo: session.email,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}

