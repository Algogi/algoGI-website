import { SegmentCriteria } from './segment';

/**
 * Email block types
 */
export type EmailBlockType = 
  | 'text' 
  | 'image' 
  | 'button' 
  | 'divider' 
  | 'spacer' 
  | 'link' 
  | 'html'
  | 'hero-banner'
  | 'gradient-header'
  | 'rich-text'
  | 'quote'
  | 'feature-list'
  | 'stats-row'
  | 'image-gallery'
  | 'primary-button'
  | 'secondary-button'
  | 'button-group'
  | 'social-links'
  | 'footer'
  | 'columns';

/**
 * Common block styles shared by all blocks
 */
export interface CommonBlockStyles {
  backgroundColor?: string;
  backgroundImage?: string;
  padding?: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; bottom: number };
  borderRadius?: string;
  boxShadow?: string;
  animation?: 'none' | 'fade' | 'slide' | 'zoom';
  mobileHide?: boolean;
  linkUrl?: string;
  linkTarget?: '_self' | '_blank';
}

/**
 * Email block definition
 */
export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  props: Record<string, any>; // Block-specific properties
  styles?: Record<string, string>; // Inline styles
  commonStyles?: CommonBlockStyles; // Shared styling properties
}

/**
 * Email campaign status
 */
export type EmailCampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'scheduled' | 'sending' | 'sent';

/**
 * Recipient type
 */
export type RecipientType = 'contacts' | 'segments' | 'manual';

/**
 * Email campaign document in Firestore
 * Key Principle: Campaigns own name, subject, and fromEmail. Email templates are content-only.
 */
export interface EmailCampaign {
  id: string;
  name: string; // Campaign-specific name
  description?: string;
  
  // Campaign-specific email settings (NOT in templates)
  subject: string; // Campaign-specific subject line
  fromEmail: string; // Campaign-specific sender email
  replyTo?: string; // Campaign-specific reply-to
  
  // Contact selection (formerly segment criteria)
  criteria?: SegmentCriteria; // For rule-based selection
  contactIds?: string[]; // For manual selection
  autoAddContacts?: boolean; // Auto-add contacts based on rules
  
  // Email content (can reference template or have direct content)
  templateId?: string; // Optional: reference to email template
  content?: EmailBlock[]; // Direct content blocks (if not using template)
  htmlContent?: string; // Rendered HTML (from template or direct)
  textContent?: string; // Plain text fallback (from template or direct)
  
  // Campaign status and control
  status: EmailCampaignStatus;
  isActive: boolean; // Toggle for start/stop
  
  // SMTP verification
  smtpVerified?: boolean; // Whether SMTP verification has been run
  smtpVerifiedAt?: string;
  
  // Warming up tracking
  totalContacts: number; // Total contacts in campaign
  sentContacts: number; // Contacts already sent to
  emailsPerHour?: number; // Auto-calculated or manual
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  
  // Legacy fields (for backward compatibility)
  scheduledAt?: string;
  sentAt?: string;
  recipientType?: RecipientType;
  recipientIds?: string[];
  recipientEmails?: string[];
  abTestId?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Email template document in Firestore
 * NOTE: Templates are content-only (no subject, fromEmail, replyTo - these are campaign-specific)
 */
export interface EmailTemplate {
  id: string;
  name: string; // Template name (for organization only)
  description?: string; // Template description
  category: 'newsletter' | 'transactional' | 'marketing' | 'other';
  content: EmailBlock[]; // Template content blocks
  htmlContent?: string; // Pre-rendered HTML (optional)
  textContent?: string; // Plain text fallback (optional)
  thumbnail?: string; // Preview image
  createdAt: string;
  updatedAt: string;
  // NOTE: NO subject, fromEmail, replyTo - these are campaign-specific
}

/**
 * Email analytics document in Firestore
 */
export interface EmailAnalytics {
  campaignId: string;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  uniqueOpened: number;
  totalClicked: number;
  uniqueClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  recipientAnalytics: {
    email: string;
    opened: boolean;
    openedAt?: string;
    clicked: boolean;
    clickedAt?: string;
    clickedLinks?: string[];
    bounced?: boolean;
    unsubscribed?: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

/**
 * A/B test document in Firestore
 */
export interface EmailABTest {
  id: string;
  campaignId: string;
  variantA: {
    subject: string;
    content: EmailBlock[];
    htmlContent: string;
  };
  variantB: {
    subject: string;
    content: EmailBlock[];
    htmlContent: string;
  };
  splitPercentage: number; // Percentage for variant A (rest goes to B)
  duration: number; // Hours to run test
  winningMetric: 'open' | 'click';
  status: 'running' | 'completed' | 'cancelled';
  winner?: 'A' | 'B';
  results?: {
    variantA: {
      sent: number;
      opened: number;
      clicked: number;
      openRate: number;
      clickRate: number;
    };
    variantB: {
      sent: number;
      opened: number;
      clicked: number;
      openRate: number;
      clickRate: number;
    };
  };
  createdAt: string;
  completedAt?: string;
}

/**
 * Block property definitions for each block type
 */
export interface TextBlockProps {
  text: string;
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  padding?: string;
  lineHeight?: string;
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  link?: string;
  width?: string;
  height?: string;
  align?: 'left' | 'center' | 'right';
  padding?: string;
  caption?: string;
}

export interface ButtonBlockProps {
  text: string;
  link: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  padding?: string;
  borderRadius?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DividerBlockProps {
  color?: string;
  thickness?: string;
  style?: 'solid' | 'dashed' | 'dotted' | 'festive-dots' | 'festive-snowflakes' | 'festive-stars';
  padding?: string;
}

export interface SpacerBlockProps {
  height: string;
}

export interface LinkBlockProps {
  text: string;
  url: string;
  color?: string;
  fontSize?: string;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  padding?: string;
}

export interface HtmlBlockProps {
  html: string;
}

// Phase 1: Core Blocks

export interface HeroBannerBlockProps {
  imageUrl: string;
  heading: string;
  subheading?: string;
  ctaText: string;
  ctaLink: string;
  overlayOpacity?: number;
  textColor?: string;
  headingSize?: string;
  subheadingSize?: string;
  align?: 'left' | 'center' | 'right';
  height?: string;
}

export interface GradientHeaderBlockProps {
  text: string;
  gradientColors?: string[]; // Array of color stops
  fontSize?: string;
  fontWeight?: string;
  align?: 'left' | 'center' | 'right';
  padding?: string;
}

export interface RichTextBlockProps {
  content: string; // HTML content from WYSIWYG
  columns?: 1 | 2 | 3;
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  lineHeight?: string;
}

export interface QuoteBlockProps {
  quote: string;
  author: string;
  authorTitle?: string;
  avatarUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  align?: 'left' | 'center' | 'right';
}

export interface FeatureListItem {
  icon?: string; // Icon name or URL
  text: string;
  link?: string;
}

export interface FeatureListBlockProps {
  items: FeatureListItem[];
  iconSize?: string;
  iconColor?: string;
  textColor?: string;
  fontSize?: string;
  spacing?: string;
}

export interface StatItem {
  value: string;
  label: string;
  icon?: string;
}

export interface StatsRowBlockProps {
  stats: StatItem[];
  valueColor?: string;
  labelColor?: string;
  valueSize?: string;
  labelSize?: string;
  backgroundColor?: string;
  columns?: 3 | 4 | 5 | 6;
}

export interface ImageGalleryItem {
  src: string;
  alt: string;
  link?: string;
  caption?: string;
}

export interface ImageGalleryBlockProps {
  images: ImageGalleryItem[];
  columns?: 1 | 2 | 3 | 4;
  spacing?: string;
  imageWidth?: string;
  showCaptions?: boolean;
}

export interface PrimaryButtonBlockProps {
  text: string;
  link: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
  padding?: string;
  borderRadius?: string;
  glow?: boolean;
  fullWidth?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface SecondaryButtonBlockProps {
  text: string;
  link: string;
  borderColor?: string;
  textColor?: string;
  fontSize?: string;
  padding?: string;
  borderRadius?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ButtonGroupButton {
  text: string;
  link: string;
  variant?: 'primary' | 'secondary';
}

export interface ButtonGroupBlockProps {
  buttons: ButtonGroupButton[];
  spacing?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'github' | 'custom';
  url: string;
  iconUrl?: string; // For custom platform
  label?: string;
}

export interface SocialLinksBlockProps {
  links: SocialLink[];
  iconSize?: string;
  iconColor?: string;
  spacing?: string;
  align?: 'left' | 'center' | 'right';
  layout?: 'horizontal' | 'grid';
}

export interface FooterBlockProps {
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  unsubscribeText?: string;
  unsubscribeUrl?: string;
  socialLinks?: SocialLink[];
  copyrightText?: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
}

export interface ColumnsBlockProps {
  columns: 1 | 2 | 3 | 4;
  columnGap?: string;
  backgroundColor?: string;
  padding?: string;
  nestedBlocks?: EmailBlock[]; // Blocks inside columns
}

