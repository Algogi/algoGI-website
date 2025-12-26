/**
 * Plunk API Client
 * Documentation: https://docs.useplunk.com
 */

const PLUNK_API_BASE = 'https://api.useplunk.com/v1';

import {
  addCampaignFooter,
  wrapAllLinksForTracking,
} from '@/lib/email/render-email';

export interface PlunkEmail {
  to: string;
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
}

export interface PlunkSendResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface PlunkVerifyResponse {
  valid: boolean;
  email: string;
  reason?: string;
  mxRecords?: string[];
}

export interface PlunkWebhookEvent {
  event: 'bounced' | 'delivered' | 'opened' | 'clicked' | 'unsubscribed';
  email: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class PlunkClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PLUNK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('PLUNK_API_KEY not set. Plunk features will not work.');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('PLUNK_API_KEY is not configured');
    }

    const url = `${PLUNK_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Plunk API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Send a transactional email
   */
  async sendEmail(email: PlunkEmail): Promise<PlunkSendResponse> {
    try {
      const response = await this.request<PlunkSendResponse>('/send', {
        method: 'POST',
        body: JSON.stringify({
          to: email.to,
          subject: email.subject,
          body: email.body,
          from: email.from,
          reply_to: email.replyTo,
        }),
      });
      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send a campaign to multiple recipients
   */
  async sendCampaign(
    recipients: string[],
    subject: string,
    body: string,
    from?: string
  ): Promise<{ success: boolean; sent: number; failed: number; errors?: string[] }> {
    try {
      // Plunk typically supports batch sending
      // Adjust this based on actual Plunk API
      const results = await Promise.allSettled(
        recipients.map((to) =>
          this.sendEmail({
            to,
            subject,
            body,
            from,
          })
        )
      );

      const sent = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - sent;
      const errors = results
        .filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
        .map((r) => r.status === 'rejected' ? r.reason?.message : r.value.error)
        .filter(Boolean) as string[];

      return { success: true, sent, failed, errors };
    } catch (error: any) {
      return {
        success: false,
        sent: 0,
        failed: recipients.length,
        errors: [error.message],
      };
    }
  }

  /**
   * Send a campaign with tracking (unsubscribe links, click tracking, open tracking)
   */
  async sendCampaignWithTracking(
    recipients: string[],
    subject: string,
    body: string,
    campaignId: string,
    baseUrl: string,
    from?: string,
    contacts?: Array<{ email: string; firstName?: string; lastName?: string; company?: string }>
  ): Promise<{ success: boolean; sent: number; failed: number; errors?: string[] }> {
    try {
      // Import personalization functions
      const { replacePersonalizationTags, replacePersonalizationTagsInHTML } = await import('@/lib/email/personalization');

      // Process each recipient with personalized tracking
      const results = await Promise.allSettled(
        recipients.map(async (email, index) => {
          // Create recipient ID (sanitized email for URL safety)
          const recipientId = email.replace(/[^a-zA-Z0-9]/g, '_');
          
          // Get contact data for personalization
          const contact = contacts?.[index] || { email };
          const contactData = {
            firstName: contact.firstName || "",
            lastName: contact.lastName || "",
            email: contact.email || email,
            company: contact.company || "",
          };
          
          // Personalize subject line
          const personalizedSubject = replacePersonalizationTags(subject, contactData);
          
          // Personalize body HTML before wrapping links and adding footer
          let personalizedBody = replacePersonalizationTagsInHTML(body, contactData);
          
          // Wrap all links for click tracking
          personalizedBody = wrapAllLinksForTracking(
            personalizedBody,
            campaignId,
            recipientId,
            baseUrl
          );
          
          // Add footer with unsubscribe link and tracking pixel
          personalizedBody = addCampaignFooter(
            personalizedBody,
            email,
            campaignId,
            recipientId,
            baseUrl
          );
          
          // Send personalized email
          return this.sendEmail({
            to: email,
            subject: personalizedSubject,
            body: personalizedBody,
            from,
          });
        })
      );

      const sent = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - sent;
      const errors = results
        .filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
        .map((r) => r.status === 'rejected' ? r.reason?.message : r.value.error)
        .filter(Boolean) as string[];

      return { success: true, sent, failed, errors };
    } catch (error: any) {
      return {
        success: false,
        sent: 0,
        failed: recipients.length,
        errors: [error.message],
      };
    }
  }

  /**
   * Verify an email address
   * Note: Plunk may have a specific verification endpoint
   * This is a placeholder that can be adjusted based on actual API
   */
  async verifyEmail(email: string): Promise<PlunkVerifyResponse> {
    try {
      // If Plunk has a verification endpoint, use it here
      // For now, we'll return a basic response
      // The actual verification will be done via MX lookup + Plunk API if available
      const response = await this.request<PlunkVerifyResponse>(
        `/verify?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error: any) {
      // If verification endpoint doesn't exist, return basic validation
      return {
        valid: false,
        email,
        reason: error.message || 'Verification failed',
      };
    }
  }

  /**
   * Batch verify email addresses
   */
  async verifyBatch(emails: string[]): Promise<PlunkVerifyResponse[]> {
    const results = await Promise.allSettled(
      emails.map((email) => this.verifyEmail(email))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        valid: false,
        email: emails[index],
        reason: result.reason?.message || 'Verification failed',
      };
    });
  }

  /**
   * Get email status (delivered, opened, clicked, etc.)
   */
  async getEmailStatus(messageId: string): Promise<{
    status: string;
    delivered?: boolean;
    opened?: boolean;
    clicked?: boolean;
  }> {
    try {
      const response = await this.request<{
        status: string;
        delivered?: boolean;
        opened?: boolean;
        clicked?: boolean;
      }>(`/emails/${messageId}`, {
        method: 'GET',
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to get email status: ${error.message}`);
    }
  }
}

// Singleton instance
let plunkClient: PlunkClient | null = null;

/**
 * Get or create Plunk client instance
 */
export function getPlunkClient(apiKey?: string): PlunkClient {
  if (!plunkClient) {
    plunkClient = new PlunkClient(apiKey);
  }
  return plunkClient;
}

/**
 * Create a new Plunk client instance
 */
export function createPlunkClient(apiKey?: string): PlunkClient {
  return new PlunkClient(apiKey);
}

export default PlunkClient;

