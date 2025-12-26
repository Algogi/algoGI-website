/**
 * Contact status enum
 */
export type ContactStatus =
  | 'pending'
  | 'verifying'
  | 'verified'
  | 'verified_generic'
  | 'bounced'
  | 'unsubscribed'
  | 'invalid';

/**
 * Contact source enum
 */
export type ContactSource = 'christmas-quiz' | 'csv-import' | 'manual' | 'api' | 'warmup';

/**
 * Contact metadata from Christmas quiz
 */
export interface ContactMetadata {
  q1?: string; // Which AI tool do you currently use most often?
  q2?: string; // AI is currently:
  q3?: string; // Team size:
  q4?: string; // How much work could be automated?
  q5?: string; // Would you like a free AI Tools Analysis?
  companyWebsite?: string;
  phone?: string;
  warmup?: boolean;
}

/**
 * Email preferences for contact
 */
export interface EmailPreferences {
  newsletter: boolean;
  marketing: boolean;
  updates: boolean;
  lastUpdated: string;
}

/**
 * Contact document in Firestore
 */
export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  status: ContactStatus;
  source: ContactSource;
  segments: string[]; // Array of segment IDs
  engagementScore: number;
  lastSent?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  metadata?: ContactMetadata;
  emailPreferences?: EmailPreferences;
}

/**
 * Contact creation input (without auto-generated fields)
 */
export interface ContactInput {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  status?: ContactStatus;
  source: ContactSource;
  segments?: string[];
  engagementScore?: number;
  metadata?: ContactMetadata;
}

/**
 * Contact update input (all fields optional except email)
 */
export interface ContactUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  status?: ContactStatus;
  source?: ContactSource;
  segments?: string[];
  engagementScore?: number;
  lastSent?: Date | null;
  metadata?: ContactMetadata;
  emailPreferences?: EmailPreferences;
}

/**
 * Contact verification result
 */
export interface VerificationResult {
  email: string;
  valid: boolean;
  reason?: string;
  mxRecords?: string[];
}

/**
 * Batch verification result
 */
export interface BatchVerificationResult {
  valid: VerificationResult[];
  invalid: VerificationResult[];
  needsVerification: VerificationResult[];
}

/**
 * Contact stats for dashboard
 */
export interface ContactStats {
  total: number;
  verified: number;
  verified_generic: number;
  pending: number;
  verifying: number;
  bounced: number;
  unsubscribed: number;
  invalid: number;
  verifiedPercentage: number;
  bounceRate: number;
  readyToSend: number; // verified and not unsubscribed
}

