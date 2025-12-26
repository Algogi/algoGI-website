import { getEmailTransporter, getSenderEmail } from "./send-email";

export async function sendApplicationConfirmationEmail(
  to: string,
  name: string,
  jobTitle: string,
  applicationId: string
): Promise<void> {
  const emailTransporter = getEmailTransporter();
  const fromEmail = getSenderEmail('job');

  const subject = `Application Received: ${jobTitle}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a3aff;">Thank you for your application!</h1>
          <p>Hi ${name},</p>
          <p>We have received your application for the position of <strong>${jobTitle}</strong>.</p>
          <p>Your application ID is: <strong>${applicationId}</strong></p>
          <p>Our team will review your application and get back to you soon. We typically respond within 5-7 business days.</p>
          <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>What's next?</strong><br>
              Our hiring team will carefully review your application. If your profile matches our requirements, we'll reach out to schedule an interview.
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Best regards,<br>
            The AlgoGI Team
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Thank you for your application!
    
    Hi ${name},
    
    We have received your application for the position of ${jobTitle}.
    
    Your application ID is: ${applicationId}
    
    Our team will review your application and get back to you soon. We typically respond within 5-7 business days.
    
    Best regards,
    The AlgoGI Team
  `;

  try {
    await emailTransporter.sendMail({
      from: `"AlgoGI Careers" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error: any) {
    console.error("Error sending application confirmation email:", error);
    throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
  }
}

export async function sendNewApplicationNotificationEmail(
  jobTitle: string,
  applicantName: string,
  applicantEmail: string,
  applicationId: string,
  jobId: string
): Promise<void> {
  const emailTransporter = getEmailTransporter();
  const fromEmail = getSenderEmail('job');
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_FROM_EMAIL || process.env.EMAIL_JOBS || fromEmail;

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const applicationUrl = `${baseUrl}/admin/careers/${jobId}/applicants/${applicationId}`;

  const subject = `New Application: ${jobTitle}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a3aff;">New Job Application</h1>
          <p>A new application has been submitted for review.</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="margin: 0 0 10px 0;"><strong>Job:</strong> ${jobTitle}</p>
            <p style="margin: 0 0 10px 0;"><strong>Applicant:</strong> ${applicantName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${applicantEmail}</p>
            <p style="margin: 0;"><strong>Application ID:</strong> ${applicationId}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="${applicationUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4a3aff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Application
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated notification from the AlgoGI Careers system.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    New Job Application
    
    A new application has been submitted for review.
    
    Job: ${jobTitle}
    Applicant: ${applicantName}
    Email: ${applicantEmail}
    Application ID: ${applicationId}
    
    View application: ${applicationUrl}
  `;

  try {
    await emailTransporter.sendMail({
      from: `"AlgoGI Careers" <${fromEmail}>`,
      to: adminEmail,
      subject,
      text,
      html,
    });
  } catch (error: any) {
    console.error("Error sending new application notification email:", error);
    throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
  }
}

export async function sendStatusChangeEmail(
  to: string,
  name: string,
  jobTitle: string,
  newStatus: string,
  notes?: string
): Promise<void> {
  const emailTransporter = getEmailTransporter();
  const fromEmail = getSenderEmail('job');

  const statusLabels: Record<string, string> = {
    applied: "Application Received",
    screening: "Under Review",
    "phone-interview": "Phone Interview Scheduled",
    "technical-interview": "Technical Interview Scheduled",
    "final-interview": "Final Interview Scheduled",
    offer: "Job Offer",
    rejected: "Application Update",
    hired: "Congratulations!",
  };

  const statusLabel = statusLabels[newStatus] || newStatus;

  let statusMessage = "";
  let nextSteps = "";

  switch (newStatus) {
    case "screening":
      statusMessage = "Your application is currently under review by our hiring team.";
      nextSteps = "We'll be in touch soon with next steps.";
      break;
    case "phone-interview":
      statusMessage = "We'd like to schedule a phone interview with you.";
      nextSteps = notes || "Our team will contact you shortly to coordinate a time.";
      break;
    case "technical-interview":
      statusMessage = "We'd like to invite you to a technical interview.";
      nextSteps = notes || "Our team will contact you with details and scheduling information.";
      break;
    case "final-interview":
      statusMessage = "We'd like to invite you to a final interview.";
      nextSteps = notes || "Our team will contact you with details and scheduling information.";
      break;
    case "offer":
      statusMessage = "We're excited to extend a job offer to you!";
      nextSteps = notes || "Our team will contact you with offer details and next steps.";
      break;
    case "rejected":
      statusMessage = "Thank you for your interest in joining AlgoGI. After careful consideration, we've decided to move forward with other candidates.";
      nextSteps = "We appreciate the time you took to apply and encourage you to check out future opportunities with us.";
      break;
    case "hired":
      statusMessage = "Congratulations! We're thrilled to welcome you to the AlgoGI team!";
      nextSteps = notes || "Our team will contact you with onboarding details and next steps.";
      break;
    default:
      statusMessage = `Your application status has been updated to: ${statusLabel}`;
      nextSteps = notes || "Our team will be in touch with more information.";
  }

  const subject = `Application Update: ${jobTitle} - ${statusLabel}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a3aff;">${statusLabel}</h1>
          <p>Hi ${name},</p>
          <p>We have an update regarding your application for <strong>${jobTitle}</strong>.</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="margin: 0; font-size: 16px;">${statusMessage}</p>
          </div>
          ${nextSteps ? `
            <div style="margin: 20px 0; padding: 15px; background-color: #e8f4f8; border-left: 4px solid #4a3aff; border-radius: 5px;">
              <p style="margin: 0; font-size: 14px;"><strong>Next Steps:</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px; white-space: pre-wrap;">${nextSteps}</p>
            </div>
          ` : ""}
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            If you have any questions, please don't hesitate to reach out to us.<br>
            Best regards,<br>
            The AlgoGI Team
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    ${statusLabel}
    
    Hi ${name},
    
    We have an update regarding your application for ${jobTitle}.
    
    ${statusMessage}
    
    ${nextSteps ? `Next Steps:\n${nextSteps}` : ""}
    
    If you have any questions, please don't hesitate to reach out to us.
    
    Best regards,
    The AlgoGI Team
  `;

  try {
    await emailTransporter.sendMail({
      from: `"AlgoGI Careers" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error: any) {
    console.error("Error sending status change email:", error);
    throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
  }
}

