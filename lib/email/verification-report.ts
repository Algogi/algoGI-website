import { getEmailTransporter, getSenderEmail } from './send-email';

/**
 * Send email verification report to admin user
 */
export async function sendVerificationReportEmail(
  to: string,
  summary: {
    total: number;
    valid: number;
    invalid: number;
  }
): Promise<void> {
  const emailTransporter = getEmailTransporter();
  const fromEmail = getSenderEmail('enquiry');
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const contactsUrl = `${baseUrl}/admin/contacts`;

  const subject = `Email Verification Complete: ${summary.valid} of ${summary.total} verified`;
  
  const validPercentage = summary.total > 0 
    ? ((summary.valid / summary.total) * 100).toFixed(1)
    : '0.0';
  const invalidPercentage = summary.total > 0
    ? ((summary.invalid / summary.total) * 100).toFixed(1)
    : '0.0';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a3aff;">Email Verification Report</h1>
          <p>Your bulk email verification has been completed.</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
            <h2 style="margin-top: 0; color: #333;">Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Total Emails:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right;">${summary.total}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong style="color: #22c55e;">Valid:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right; color: #22c55e;">${summary.valid} (${validPercentage}%)</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong style="color: #ef4444;">Invalid:</strong></td>
                <td style="padding: 10px 0; text-align: right; color: #ef4444;">${summary.invalid} (${invalidPercentage}%)</td>
              </tr>
            </table>
          </div>

          <div style="margin: 30px 0;">
            <a href="${contactsUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #4a3aff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Contacts
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated report from the AlgoGI email verification system.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
    Email Verification Report
    
    Your bulk email verification has been completed.
    
    Summary:
    - Total Emails: ${summary.total}
    - Valid: ${summary.valid} (${validPercentage}%)
    - Invalid: ${summary.invalid} (${invalidPercentage}%)
    
    View contacts: ${contactsUrl}
    
    This is an automated report from the AlgoGI email verification system.
  `;

  try {
    await emailTransporter.sendMail({
      from: `"AlgoGI" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error: any) {
    console.error('Error sending verification report email:', error);
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
  }
}

