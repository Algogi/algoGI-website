import { getBucket } from "@/lib/firebase/storage";
import { generateSignedUrl } from "@/lib/firebase/storage";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

/**
 * Email type for determining sender address
 */
export type EmailType = 
  | 'newsletter' 
  | 'enquiry' 
  | 'lead' 
  | 'download' 
  | 'job';

/**
 * Get sender email address based on email type
 */
export function getSenderEmail(type: EmailType): string {
  const emailMap: Record<EmailType, string> = {
    newsletter: process.env.EMAIL_NEWSLETTER || process.env.SMTP_FROM_EMAIL || 'newsletters@algogi.com',
    enquiry: process.env.EMAIL_ENQUIRY || process.env.SMTP_FROM_EMAIL || 'info@algogi.com',
    lead: process.env.EMAIL_ENQUIRY || process.env.SMTP_FROM_EMAIL || 'info@algogi.com',
    download: process.env.EMAIL_ENQUIRY || process.env.SMTP_FROM_EMAIL || 'info@algogi.com',
    job: process.env.EMAIL_JOBS || process.env.SMTP_FROM_EMAIL || 'jobs@algogi.com',
  };
  
  return emailMap[type];
}

/**
 * Initialize email transporter using SMTP
 */
export function getEmailTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  // Check for required environment variables
  const missingVars: string[] = [];
  const emptyVars: string[] = [];
  
  if (!process.env.SMTP_HOST) {
    missingVars.push("SMTP_HOST");
  } else if (process.env.SMTP_HOST.trim() === "") {
    emptyVars.push("SMTP_HOST");
  }
  
  if (!process.env.SMTP_PORT) {
    missingVars.push("SMTP_PORT");
  } else if (process.env.SMTP_PORT.trim() === "") {
    emptyVars.push("SMTP_PORT");
  }
  
  if (!process.env.SMTP_USER) {
    missingVars.push("SMTP_USER");
  } else if (process.env.SMTP_USER.trim() === "") {
    emptyVars.push("SMTP_USER");
  }
  
  if (!process.env.SMTP_PASSWORD) {
    missingVars.push("SMTP_PASSWORD");
  } else if (process.env.SMTP_PASSWORD.trim() === "") {
    emptyVars.push("SMTP_PASSWORD");
  }

  if (missingVars.length > 0 || emptyVars.length > 0) {
    let errorMessage = "SMTP email credentials not configured. ";
    if (emptyVars.length > 0) {
      errorMessage += `Empty values found for: ${emptyVars.join(", ")}. `;
    }
    if (missingVars.length > 0) {
      errorMessage += `Missing: ${missingVars.join(", ")}. `;
    }
    errorMessage += "Please set these in your .env.local file. For Gmail, use SMTP settings with an app password.";
    
    console.error("SMTP configuration error:", {
      missing: missingVars,
      empty: emptyVars,
      available: {
        SMTP_HOST: process.env.SMTP_HOST ? `SET (${process.env.SMTP_HOST})` : "NOT SET",
        SMTP_PORT: process.env.SMTP_PORT ? `SET (${process.env.SMTP_PORT})` : "NOT SET",
        SMTP_USER: process.env.SMTP_USER ? `SET (${process.env.SMTP_USER.length} chars)` : "NOT SET",
        SMTP_PASSWORD: process.env.SMTP_PASSWORD ? `SET (${process.env.SMTP_PASSWORD.length} chars)` : "NOT SET",
      }
    });
    
    throw new Error(errorMessage);
  }

  // At this point, we know all env vars are defined (validation above throws if not)
  const smtpHost = process.env.SMTP_HOST!;
  const smtpPort = process.env.SMTP_PORT!;
  const smtpUser = process.env.SMTP_USER!;
  const smtpPassword = process.env.SMTP_PASSWORD!;

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: smtpPort === "465", // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  return transporter;
}

/**
 * Send email with download link using signed URL via SMTP
 */
export async function sendDownloadEmail(
  to: string,
  name: string,
  fileIdentifier: string,
  fileType: "pdf" | "json",
  caseStudyTitle: string
): Promise<void> {
  // Generate signed URL valid for 7 days (604800 seconds)
  const fileName = `downloads/${fileIdentifier}.${fileType}`;
  const downloadUrl = await generateSignedUrl(fileName, 604800);

  // Email content
  const subject = `Your ${caseStudyTitle} Download`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a3aff;">Thank you for your interest!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for requesting <strong>${caseStudyTitle}</strong>.</p>
          <p>You can download the file using the link below. This link will expire in 7 days.</p>
          <div style="margin: 30px 0;">
            <a href="${downloadUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4a3aff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Download ${fileType.toUpperCase()}
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${downloadUrl}" style="color: #4a3aff; word-break: break-all;">${downloadUrl}</a>
          </p>
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
    Thank you for your interest!
    
    Hi ${name},
    
    Thank you for requesting ${caseStudyTitle}.
    
    You can download the file using this link (expires in 7 days):
    ${downloadUrl}
    
    Best regards,
    The AlgoGI Team
  `;

  // Send via SMTP
  try {
    const emailTransporter = getEmailTransporter();
    const fromEmail = getSenderEmail('download');
    
    await emailTransporter.sendMail({
      from: `"AlgoGI" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error: any) {
    console.error("SMTP email error:", error);
    throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
  }
}

/**
 * Send email with file attachment via SMTP
 * Downloads file from Cloud Storage and attaches it
 */
export async function sendDownloadEmailWithAttachment(
  to: string,
  name: string,
  fileIdentifier: string,
  fileType: "pdf" | "json",
  caseStudyTitle: string
): Promise<void> {
  const bucket = getBucket();
  const fileName = `downloads/${fileIdentifier}.${fileType}`;
  const file = bucket.file(fileName);

  // Download file as buffer
  const [fileBuffer] = await file.download();

  // Determine content type
  const contentType =
    fileType === "pdf"
      ? "application/pdf"
      : "application/json";

  // Email content
  const subject = `Your ${caseStudyTitle} Download`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a3aff;">Thank you for your interest!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for requesting <strong>${caseStudyTitle}</strong>.</p>
          <p>The file is attached to this email.</p>
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
    Thank you for your interest!
    
    Hi ${name},
    
    Thank you for requesting ${caseStudyTitle}.
    
    The file is attached to this email.
    
    Best regards,
    The AlgoGI Team
  `;

  // Send via SMTP with attachment
  try {
    const emailTransporter = getEmailTransporter();
    const fromEmail = getSenderEmail('download');
    
    await emailTransporter.sendMail({
      from: `"AlgoGI" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: `${fileIdentifier}.${fileType}`,
          content: fileBuffer,
          contentType,
        },
      ],
    });
  } catch (error: any) {
    console.error("SMTP email error:", error);
    throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
  }
}

/**
 * Send newsletter subscription confirmation email
 */
export async function sendNewsletterConfirmationEmail(
  to: string
): Promise<void> {
  const emailTransporter = getEmailTransporter();
  const fromEmail = getSenderEmail('newsletter');

  const subject = "Welcome to AlgoGI Newsletter!";
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a3aff;">Thank you for subscribing!</h1>
          <p>Hi there,</p>
          <p>Thank you for subscribing to the AlgoGI newsletter. We're excited to share the latest updates, insights, and news about AI and software development with you.</p>
          <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>What to expect:</strong><br>
              You'll receive regular updates about our latest projects, industry insights, AI trends, and exclusive content delivered straight to your inbox.
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            If you didn't subscribe to this newsletter, you can safely ignore this email.<br>
            Best regards,<br>
            The AlgoGI Team
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Thank you for subscribing!
    
    Hi there,
    
    Thank you for subscribing to the AlgoGI newsletter. We're excited to share the latest updates, insights, and news about AI and software development with you.
    
    What to expect:
    You'll receive regular updates about our latest projects, industry insights, AI trends, and exclusive content delivered straight to your inbox.
    
    If you didn't subscribe to this newsletter, you can safely ignore this email.
    
    Best regards,
    The AlgoGI Team
  `;

  try {
    await emailTransporter.sendMail({
      from: `"AlgoGI Newsletter" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error: any) {
    console.error("Error sending newsletter confirmation email:", error);
    throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
  }
}

/**
 * Send lead notification email to admin
 */
export async function sendLeadNotificationEmail(
  leadName: string,
  leadEmail: string,
  company: string,
  projectDescription: string,
  budgetTimeline: string,
  openToCall?: boolean,
  preferredCallTime?: string
): Promise<void> {
  const emailTransporter = getEmailTransporter();
  const fromEmail = getSenderEmail('lead');
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || fromEmail;

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const leadsUrl = `${baseUrl}/admin/leads`;

  const subject = `New Lead Submission: ${leadName} from ${company}`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a3aff;">New Lead Submission</h1>
          <p>A new lead has been submitted through the contact form.</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${leadName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${leadEmail}">${leadEmail}</a></p>
            <p style="margin: 0 0 10px 0;"><strong>Company:</strong> ${company}</p>
            <p style="margin: 0 0 10px 0;"><strong>Budget/Timeline:</strong> ${budgetTimeline}</p>
            ${openToCall ? `<p style="margin: 0 0 10px 0;"><strong>Open to Call:</strong> Yes</p>` : ''}
            ${preferredCallTime ? `<p style="margin: 0 0 10px 0;"><strong>Preferred Call Time:</strong> ${preferredCallTime}</p>` : ''}
          </div>
          <div style="margin: 20px 0; padding: 20px; background-color: #e8f4f8; border-left: 4px solid #4a3aff; border-radius: 5px;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Project Description:</strong></p>
            <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${projectDescription}</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="${leadsUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4a3aff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View All Leads
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated notification from the AlgoGI contact form.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    New Lead Submission
    
    A new lead has been submitted through the contact form.
    
    Name: ${leadName}
    Email: ${leadEmail}
    Company: ${company}
    Budget/Timeline: ${budgetTimeline}
    ${openToCall ? `Open to Call: Yes\n` : ''}${preferredCallTime ? `Preferred Call Time: ${preferredCallTime}\n` : ''}
    Project Description:
    ${projectDescription}
    
    View all leads: ${leadsUrl}
    
    This is an automated notification from the AlgoGI contact form.
  `;

  try {
    await emailTransporter.sendMail({
      from: `"AlgoGI" <${fromEmail}>`,
      to: adminEmail,
      subject,
      text,
      html,
    });
  } catch (error: any) {
    console.error("Error sending lead notification email:", error);
    throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
  }
}
