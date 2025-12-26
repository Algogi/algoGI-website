import { EmailBlock } from './email';

/**
 * Segment criteria operators
 */
export type SegmentOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'in' 
  | 'not_in'
  | 'greater_than' 
  | 'less_than'
  | 'exists'
  | 'not_exists';

/**
 * Segment criteria field types
 */
export type SegmentField = 
  | 'status'
  | 'source'
  | 'engagementScore'
  | 'segments'
  | 'metadata.q1'
  | 'metadata.q2'
  | 'metadata.q3'
  | 'metadata.q4'
  | 'metadata.q5'
  | 'company'
  | 'lastSent';

/**
 * Single segment criteria rule
 */
export interface SegmentCriteriaRule {
  field: SegmentField;
  operator: SegmentOperator;
  value: string | number | string[] | boolean | null;
}

/**
 * Segment criteria (can have multiple rules with AND/OR logic)
 */
export interface SegmentCriteria {
  rules: SegmentCriteriaRule[];
  logic?: 'AND' | 'OR'; // Default: AND
}

/**
 * Verification statistics for a segment
 */
export interface SegmentVerificationStats {
  total: number;
  verified: number;
  verifiedGeneric?: number;
  pending: number;
  invalid: number;
  bounced: number;
  unsubscribed: number;
  verifiedPercentage: number;
  unverifiedCount: number;
}

/**
 * Campaign status (unified with email campaigns)
 */
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'scheduled' | 'sending' | 'sent';

/**
 * Segment/Campaign document in Firestore
 * NOTE: Segments are now unified with campaigns - they can have email content and sending capabilities
 */
export interface Segment {
  id: string;
  name: string;
  description?: string;
  criteria: SegmentCriteria;
  contactCount: number; // Cached count (same as totalContacts for campaigns)
  
  // Campaign email settings (optional - campaigns can have these)
  subject?: string; // Campaign-specific subject line
  fromEmail?: string; // Campaign-specific sender email
  replyTo?: string; // Campaign-specific reply-to
  
  // Email content (optional - campaigns can have these)
  templateId?: string; // Optional: reference to email template
  content?: EmailBlock[]; // Direct content blocks (if not using template)
  htmlContent?: string; // Rendered HTML (from template or direct)
  textContent?: string; // Plain text fallback (from template or direct)
  
  // Campaign status and control (optional - campaigns can have these)
  status?: CampaignStatus; // Campaign status (defaults to 'draft' if not set)
  isActive?: boolean; // Toggle for start/stop (defaults to false)
  
  // SMTP verification (optional - campaigns can have these)
  smtpVerified?: boolean; // Whether SMTP verification has been run
  smtpVerifiedAt?: string;
  
  // Warming up tracking (optional - campaigns can have these)
  totalContacts?: number; // Total contacts in campaign (alias for contactCount)
  sentContacts?: number; // Contacts already sent to
  emailsPerHour?: number; // Auto-calculated or manual
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  
  // Legacy fields (for backward compatibility)
  emailCampaignIds?: string[]; // DEPRECATED: campaigns now have direct content
  
  // Segment-to-campaign associations (for segment email manager)
  associatedCampaignIds?: string[]; // Campaigns attached to this segment
  
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // Who created the campaign
  verificationStats?: SegmentVerificationStats; // Optional, computed on demand
}

/**
 * Campaign type alias for Segment (for clarity in campaign contexts)
 */
export type Campaign = Segment;

/**
 * Segment creation input
 */
export interface SegmentInput {
  name: string;
  description?: string;
  criteria: SegmentCriteria;
}

/**
 * Segment update input
 */
export interface SegmentUpdate {
  name?: string;
  description?: string;
  criteria?: SegmentCriteria;
}

/**
 * Segment preview result
 */
export interface SegmentPreview {
  segmentId?: string;
  criteria: SegmentCriteria;
  contactCount: number; // Total matching contacts
  eligibleCount?: number; // Verified, non-unsubscribed contacts (for sending)
  sampleContacts: Array<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    status: string;
  }>;
}

