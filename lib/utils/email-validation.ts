// NOTE: This module is server-only because it imports Node APIs (net, dns).
// For client-side work email checks, use ./work-email instead.
import {
  PERSONAL_EMAIL_PROVIDERS,
  extractDomain,
  getWorkEmailErrorMessage,
  isWorkEmail,
} from './work-email';

/**
 * Email validation using Zod schema
 */
import { z } from 'zod';
import { createConnection } from 'net';
import dns from 'dns/promises';

// Re-export client-safe helpers for backward compatibility
export { PERSONAL_EMAIL_PROVIDERS, extractDomain, getWorkEmailErrorMessage, isWorkEmail };

const emailSchema = z.string().email('Invalid email format').max(254, 'Email too long');

// Expanded disposable email list
const EXPANDED_DISPOSABLE_EMAILS = [
  ...PERSONAL_EMAIL_PROVIDERS,
  // Additional disposable email services
  'tempmailo.com',
  'throwaway.email',
  'mohmal.com',
  'dispostable.com',
  'maildrop.cc',
  'mintemail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chitthi.in',
  'emailondeck.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'mailcatch.com',
  'meltmail.com',
  'mox.do',
  'mytrashmail.com',
  'nada.email',
  'spamgourmet.com',
  'tempail.com',
  'tempinbox.com',
  'tempr.email',
  'throwawaymail.com',
  'tmpmail.org',
  'mail-temp.com',
  'temp-mail.ru',
  'melt.li',
  'mohmal.im',
  'tempinbox.co.uk',
  'getairmail.com',
  'inboxkitten.com',
  'mailnesia.com',
  'mytemp.email',
] as const;

// Role-based email prefixes
const ROLE_BASED_PREFIXES = [
  'info',
  'support',
  'help',
  'admin',
  'administrator',
  'contact',
  'sales',
  'marketing',
  'noreply',
  'no-reply',
  'postmaster',
  'abuse',
  'webmaster',
  'hostmaster',
  'security',
  'privacy',
  'legal',
  'billing',
  'accounts',
  'team',
  'hello',
  'service',
  'services',
  'office',
  'enquiry',
  'enquiries',
  'general',
  'customerservice',
  'customer-service',
  'hr',
  'humanresources',
  'it',
  'tech',
  'technical',
  'notifications',
  'alerts',
  'newsletter',
  'updates',
] as const;

// Generic inboxes to treat separately (still valid but lower intent)
const GENERIC_INBOX_PREFIXES = [
  'info',
  'contact',
  'hello',
  'support',
  'sales',
] as const;

// Common domain typos
const DOMAIN_TYPOS: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outllook.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'outlook.con': 'outlook.com',
} as const;

// Domains that typically block SMTP verification
const SMTP_BLOCKED_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
] as const;

/**
 * Validates email syntax using Zod
 */
export function validateEmailSyntax(email: string): { valid: boolean; error?: string } {
  try {
    emailSchema.parse(email);
    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.errors?.[0]?.message || 'Invalid email format' };
  }
}

/**
 * Checks MX records for an email domain
 */
export async function checkMXRecords(domain: string): Promise<{ valid: boolean; mxRecords: string[] }> {
  try {
    const mxRecords = await dns.resolveMx(domain);
    
    if (mxRecords && mxRecords.length > 0) {
      return {
        valid: true,
        mxRecords: mxRecords.map((mx) => mx.exchange),
      };
    }
    
    return { valid: false, mxRecords: [] };
  } catch (error) {
    // DNS lookup failed - domain might not exist or have MX records
    return { valid: false, mxRecords: [] };
  }
}

/**
 * Check if email is from a disposable/temporary email service
 */
export function isDisposableEmail(email: string): boolean {
  const domain = extractDomain(email);
  if (!domain) return false;
  return EXPANDED_DISPOSABLE_EMAILS.includes(domain.toLowerCase() as any);
}

/**
 * Detect role-based emails (info@, support@, etc.)
 */
export function isRoleBasedEmail(email: string): boolean {
  const localPart = email.split('@')[0]?.toLowerCase();
  if (!localPart) return false;
  
  return ROLE_BASED_PREFIXES.some(prefix => 
    localPart === prefix || 
    localPart.startsWith(`${prefix}.`) ||
    localPart.startsWith(`${prefix}_`) ||
    localPart.startsWith(`${prefix}-`)
  );
}

/**
 * Detect generic catch-all inboxes (info@, contact@, etc.)
 */
export function isGenericInbox(email: string): boolean {
  const localPart = email.split('@')[0]?.toLowerCase();
  if (!localPart) return false;

  return GENERIC_INBOX_PREFIXES.some(prefix =>
    localPart === prefix ||
    localPart.startsWith(`${prefix}.`) ||
    localPart.startsWith(`${prefix}_`) ||
    localPart.startsWith(`${prefix}-`)
  );
}

/**
 * Detect common domain typos
 */
export function detectDomainTypo(domain: string): { hasTypo: boolean; suggested?: string } {
  const lowerDomain = domain.toLowerCase();
  const suggested = DOMAIN_TYPOS[lowerDomain];
  return { hasTypo: !!suggested, suggested };
}

/**
 * SMTP Verification - Connect to recipient's mail server to check if mailbox exists
 * Similar to ZeroBounce/NeverBounce approach
 */
export async function verifySMTP(email: string, timeout = 10000): Promise<{
  valid: boolean;
  reason?: string;
  catchAll?: boolean;
  smtpResponse?: string;
}> {
  const domain = extractDomain(email);
  if (!domain) {
    return { valid: false, reason: 'Invalid domain' };
  }

  // Skip SMTP for domains that typically block it
  if (SMTP_BLOCKED_DOMAINS.includes(domain.toLowerCase() as any)) {
    return { valid: false, reason: 'SMTP verification blocked for this domain' };
  }

  try {
    // Get MX records
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: 'No MX records found' };
    }

    // Sort by priority (lower is better)
    mxRecords.sort((a, b) => a.priority - b.priority);
    const mxHost = mxRecords[0].exchange;

    // Connect to SMTP server
    return await new Promise((resolve) => {
      const socket = createConnection(25, mxHost);
      let state = 'connect';
      let dataBuffer = '';
      let ehloSent = false;
      let mailFromSent = false;
      let rcptToSent = false;
      let quitSent = false;
      let resolved = false; // Guard to prevent multiple resolves

      // Helper to safely resolve once
      const safeResolve = (result: { valid: boolean; reason?: string; catchAll?: boolean; smtpResponse?: string }) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeoutId);
        clearTimeout(connectionTimeoutId);
        if (!socket.destroyed) {
          socket.destroy();
        }
        resolve(result);
      };

      // Overall timeout (includes connection + SMTP conversation)
      const timeoutId = setTimeout(() => {
        safeResolve({ valid: false, reason: 'SMTP connection timeout' });
      }, timeout);

      // Connection timeout (fail fast if connection doesn't establish)
      const connectionTimeout = Math.min(5000, timeout / 2); // 5 seconds or half of overall timeout
      const connectionTimeoutId = setTimeout(() => {
        if (state === 'connect') {
          safeResolve({ valid: false, reason: 'SMTP connection timeout (could not connect)' });
        }
      }, connectionTimeout);

      const getResponseCode = (line: string): number | null => {
        const match = line.match(/^(\d{3})/);
        return match ? parseInt(match[1], 10) : null;
      };

      const isCompleteResponse = (line: string): boolean => {
        // SMTP responses end with space or dash followed by newline
        // Space (e.g., "250 OK") means last line
        // Dash (e.g., "250-") means more lines coming
        return line.length >= 4 && line[3] === ' ';
      };

      socket.on('connect', () => {
        clearTimeout(connectionTimeoutId);
        state = 'connected';
      });

      socket.on('data', (data: Buffer) => {
        dataBuffer += data.toString();
        const lines = dataBuffer.split('\r\n');
        
        // Process complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const code = getResponseCode(line);
          if (code === null) continue;

          const isComplete = isCompleteResponse(line);
          
          if (state === 'connected' && code === 220 && isComplete) {
            // Send EHLO
            socket.write(`EHLO ${domain}\r\n`);
            ehloSent = true;
            state = 'ehlo';
          } else if (state === 'ehlo') {
            // Handle multi-line EHLO responses
            // Accept both intermediate lines (250-) and final line (250 )
            if (code === 250) {
              if (isComplete) {
                // Final line of EHLO response - proceed to MAIL FROM
                socket.write(`MAIL FROM:<verify@${domain}>\r\n`);
                mailFromSent = true;
                state = 'mailfrom';
              }
              // If not complete (250-), continue waiting for more lines
            }
          } else if (state === 'mailfrom' && code === 250 && isComplete && mailFromSent) {
            // Send RCPT TO - this checks if mailbox exists
            socket.write(`RCPT TO:<${email}>\r\n`);
            rcptToSent = true;
            state = 'rcptto';
          } else if (state === 'rcptto' && isComplete && rcptToSent) {
            // Got RCPT TO response - store it and send QUIT before closing
            const rcptCode = code;
            const rcptResponse = line;
            
            // Store RCPT response for later use
            (socket as any).lastRcptCode = rcptCode;
            (socket as any).lastRcptResponse = rcptResponse;
            
            // Send QUIT
            socket.write(`QUIT\r\n`);
            quitSent = true;
            state = 'quit';
          } else if (state === 'quit' && code === 221 && isComplete && quitSent) {
            // QUIT acknowledged - now we can resolve based on stored RCPT response
            const lastRcptCode = (socket as any).lastRcptCode;
            const lastRcptResponse = (socket as any).lastRcptResponse || '';
            
            let result: { valid: boolean; reason?: string; catchAll?: boolean; smtpResponse?: string };
            if (lastRcptCode === 250) {
              // Mailbox exists
              result = { valid: true, smtpResponse: lastRcptResponse };
            } else if (lastRcptCode === 550 || lastRcptCode === 551 || lastRcptCode === 553) {
              // Mailbox doesn't exist
              result = { valid: false, reason: 'Mailbox does not exist', smtpResponse: lastRcptResponse };
            } else {
              // Other error
              result = { valid: false, reason: `SMTP error: ${lastRcptResponse}`, smtpResponse: lastRcptResponse };
            }
            
            safeResolve(result);
            return;
          }
        }
        
        // Keep incomplete line in buffer
        dataBuffer = lines[lines.length - 1] || '';
      });

      socket.on('error', (error) => {
        safeResolve({ valid: false, reason: `SMTP connection error: ${error.message}` });
      });

      socket.on('close', () => {
        if (!resolved) {
          if (state === 'quit' && quitSent) {
            // Connection closed after QUIT - this is expected
            // Resolve based on last RCPT response if we have it
            const lastRcptCode = (socket as any).lastRcptCode;
            const lastRcptResponse = (socket as any).lastRcptResponse;
            if (lastRcptCode === 250) {
              safeResolve({ valid: true, smtpResponse: lastRcptResponse });
            } else if (lastRcptCode === 550 || lastRcptCode === 551 || lastRcptCode === 553) {
              safeResolve({ valid: false, reason: 'Mailbox does not exist', smtpResponse: lastRcptResponse });
            } else if (lastRcptCode) {
              safeResolve({ valid: false, reason: `SMTP error: ${lastRcptResponse}`, smtpResponse: lastRcptResponse });
            } else {
              safeResolve({ valid: false, reason: 'SMTP connection closed unexpectedly' });
            }
          } else if (state !== 'rcptto' && !rcptToSent && !quitSent) {
            safeResolve({ valid: false, reason: 'SMTP connection closed unexpectedly' });
          }
        }
      });
    });
  } catch (error: any) {
    return { valid: false, reason: `SMTP verification failed: ${error.message}` };
  }
}

/**
 * Verify email using Plunk API
 */
export async function verifyEmailWithPlunk(email: string): Promise<{
  valid: boolean;
  reason?: string;
  mxRecords?: string[];
}> {
  try {
    const { getPlunkClient } = await import('@/lib/plunk/client');
    const plunk = getPlunkClient();
    const result = await plunk.verifyEmail(email);
    return {
      valid: result.valid,
      reason: result.reason,
      mxRecords: result.mxRecords,
    };
  } catch (error: any) {
    // If Plunk verification fails, fall back to basic validation
    return {
      valid: false,
      reason: error.message || 'Plunk verification failed',
    };
  }
}

/**
 * Enhanced email verification with all checks (SMTP, disposable, role-based, typo)
 * Similar to ZeroBounce/NeverBounce approach
 */
export async function verifyEmailEnhanced(email: string): Promise<{
  valid: boolean;
  status: 'valid' | 'invalid' | 'disposable' | 'role_based' | 'typo' | 'catch_all';
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
  details: {
    syntax: boolean;
    mx: boolean;
    smtp: boolean;
    disposable: boolean;
    roleBased: boolean;
    typo: boolean;
    catchAll?: boolean;
  };
}> {
  const reasons: string[] = [];
  const details: any = {};

  // 1. Syntax validation
  const syntaxCheck = validateEmailSyntax(email);
  details.syntax = syntaxCheck.valid;
  if (!syntaxCheck.valid) {
    return {
      valid: false,
      status: 'invalid',
      confidence: 'high',
      reasons: [syntaxCheck.error || 'Invalid syntax'],
      details,
    };
  }

  // 2. Extract domain
  const domain = extractDomain(email);
  if (!domain) {
    return {
      valid: false,
      status: 'invalid',
      confidence: 'high',
      reasons: ['Invalid domain'],
      details,
    };
  }

  // 3. Typo detection
  const typoCheck = detectDomainTypo(domain);
  details.typo = !typoCheck.hasTypo;
  if (typoCheck.hasTypo) {
    return {
      valid: false,
      status: 'typo',
      confidence: 'high',
      reasons: [`Possible typo: ${typoCheck.suggested}`],
      details,
    };
  }

  // 4. Disposable email check
  const isDisposable = isDisposableEmail(email);
  details.disposable = !isDisposable;
  if (isDisposable) {
    return {
      valid: false,
      status: 'disposable',
      confidence: 'high',
      reasons: ['Disposable/temporary email service'],
      details,
    };
  }

  // 5. Role-based email check
  const isRoleBased = isRoleBasedEmail(email);
  details.roleBased = !isRoleBased;
  if (isRoleBased) {
    reasons.push('Role-based email (may have lower engagement)');
  }

  // 6. MX records
  const mxCheck = await checkMXRecords(domain);
  details.mx = mxCheck.valid;
  if (!mxCheck.valid) {
    return {
      valid: false,
      status: 'invalid',
      confidence: 'high',
      reasons: ['No MX records found'],
      details,
    };
  }

  // 7. SMTP Verification (the key check - like ZeroBounce/NeverBounce)
  const enableSMTP = process.env.ENABLE_SMTP_VERIFICATION !== 'false';
  const smtpTimeout = parseInt(process.env.SMTP_VERIFICATION_TIMEOUT || '10000', 10);
  
  let smtpCheck: { valid: boolean; reason?: string; catchAll?: boolean; smtpResponse?: string } = {
    valid: true,
    catchAll: false,
  }; // Default to valid if disabled
  if (enableSMTP) {
    try {
      smtpCheck = await verifySMTP(email, smtpTimeout);
    } catch (error: any) {
      smtpCheck = { valid: false, reason: `SMTP error: ${error.message}`, catchAll: false };
    }
  } else {
    // SMTP disabled - skip verification but mark as not verified
    smtpCheck = { valid: false, reason: 'SMTP verification disabled', catchAll: false };
  }
  
  details.smtp = smtpCheck.valid;
  details.catchAll = smtpCheck.catchAll;

  if (!smtpCheck.valid && enableSMTP) {
    // Distinguish between connection errors and mailbox-not-found errors
    const reason = smtpCheck.reason || '';
    const isConnectionError = reason.includes('timeout') || 
                             reason.includes('connection') || 
                             reason.includes('could not connect') ||
                             reason.includes('blocked');
    
    if (isConnectionError) {
      // Connection error - don't mark as invalid, consider valid if MX records exist
      // Continue to return valid if MX records exist
    } else {
      // Mailbox doesn't exist (550/551/553) or other SMTP error - mark as invalid
      return {
        valid: false,
        status: 'invalid',
        confidence: 'high',
        reasons: [smtpCheck.reason || 'Mailbox does not exist'],
        details,
      };
    }
  }
  
  // If SMTP is disabled, we still consider email valid if MX records exist
  // This maintains backward compatibility

  // Determine final status
  let status: 'valid' | 'catch_all' | 'role_based' = 'valid';
  if (smtpCheck.catchAll) {
    status = 'catch_all';
    reasons.push('Catch-all domain (accepts all emails)');
  }
  if (isRoleBased) {
    status = 'role_based';
  }

  // Calculate confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (details.smtp && details.mx && !details.catchAll) {
    confidence = 'high';
  } else if (details.mx && !enableSMTP) {
    confidence = 'medium';
  } else if (details.mx) {
    confidence = 'medium';
  }

  return {
    valid: true,
    status,
    confidence,
    reasons,
    details,
  };
}

/**
 * Verify email up to MX records only (no SMTP)
 * Used for regular contact verification
 */
type DomainCacheEntry = { valid: boolean; mxRecords: string[] };

export async function verifyEmailMXOnly(
  email: string,
  options?: { domainCache?: Map<string, DomainCacheEntry> }
): Promise<{
  valid: boolean;
  status: 'valid' | 'invalid' | 'disposable' | 'role_based' | 'typo';
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
  details: {
    syntax: boolean;
    mx: boolean;
    disposable: boolean;
    roleBased: boolean;
    typo: boolean;
  };
}> {
  const reasons: string[] = [];
  const details: any = {};

  // 1. Syntax validation
  const syntaxCheck = validateEmailSyntax(email);
  details.syntax = syntaxCheck.valid;
  if (!syntaxCheck.valid) {
    return {
      valid: false,
      status: 'invalid',
      confidence: 'high',
      reasons: [syntaxCheck.error || 'Invalid syntax'],
      details,
    };
  }

  // 2. Extract domain
  const domain = extractDomain(email);
  if (!domain) {
    return {
      valid: false,
      status: 'invalid',
      confidence: 'high',
      reasons: ['Invalid domain'],
      details,
    };
  }

  // 3. Typo detection
  const typoCheck = detectDomainTypo(domain);
  details.typo = !typoCheck.hasTypo;
  if (typoCheck.hasTypo) {
    return {
      valid: false,
      status: 'typo',
      confidence: 'high',
      reasons: [`Possible typo: ${typoCheck.suggested}`],
      details,
    };
  }

  // 4. Disposable email check
  const isDisposable = isDisposableEmail(email);
  details.disposable = !isDisposable;
  if (isDisposable) {
    return {
      valid: false,
      status: 'disposable',
      confidence: 'high',
      reasons: ['Disposable/temporary email service'],
      details,
    };
  }

  // 5. Role-based email check
  const isRoleBased = isRoleBasedEmail(email);
  details.roleBased = !isRoleBased;
  if (isRoleBased) {
    reasons.push('Role-based email (may have lower engagement)');
  }

  // 6. MX records (STOP HERE - no SMTP verification)
  const cacheKey = domain.toLowerCase();
  const cache = options?.domainCache;
  let mxCheck: DomainCacheEntry;

  const cached = cache?.get(cacheKey);
  if (cached) {
    mxCheck = cached;
  } else {
    mxCheck = await checkMXRecords(domain);
    cache?.set(cacheKey, mxCheck);
  }
  details.mx = mxCheck.valid;
  if (!mxCheck.valid) {
    return {
      valid: false,
      status: 'invalid',
      confidence: 'high',
      reasons: ['No MX records found'],
      details,
    };
  }

  // Calculate confidence (medium since we only checked MX, not SMTP)
  const confidence: 'high' | 'medium' | 'low' = 'medium';

  return {
    valid: true,
    status: isRoleBased ? 'role_based' : 'valid',
    confidence,
    reasons,
    details,
  };
}

/**
 * Comprehensive email verification (syntax + MX + SMTP + disposable + role-based + typo)
 * Enhanced version with SMTP verification similar to ZeroBounce/NeverBounce
 */
export async function verifyEmailComprehensive(email: string): Promise<{
  valid: boolean;
  reason?: string;
  mxRecords?: string[];
  syntaxValid: boolean;
  mxValid: boolean;
  smtpValid: boolean;
  disposable: boolean;
  roleBased: boolean;
  catchAll?: boolean;
  plunkValid?: boolean; // Keep for backward compatibility
}> {
  // Use enhanced verification
  const enhanced = await verifyEmailEnhanced(email);
  
  // Get MX records for backward compatibility
  const domain = extractDomain(email);
  const mxCheck = domain ? await checkMXRecords(domain) : { valid: false, mxRecords: [] };
  
  // Try Plunk verification as optional fallback (for backward compatibility)
  let plunkCheck: { valid: boolean; reason?: string; mxRecords?: string[] } = {
    valid: false,
    reason: 'Plunk not configured',
  };
  try {
    plunkCheck = await verifyEmailWithPlunk(email);
  } catch {
    // Plunk verification is optional
  }

  // Return with backward compatibility
  return {
    valid: enhanced.valid && enhanced.status === 'valid',
    reason: enhanced.reasons.length > 0 ? enhanced.reasons.join('; ') : undefined,
    mxRecords: mxCheck.mxRecords,
    syntaxValid: enhanced.details.syntax,
    mxValid: enhanced.details.mx,
    smtpValid: enhanced.details.smtp,
    disposable: !enhanced.details.disposable,
    roleBased: !enhanced.details.roleBased,
    catchAll: enhanced.details.catchAll,
    plunkValid: plunkCheck.valid, // Keep for backward compatibility
  };
}

/**
 * Batch verify emails with progress callback
 * Enhanced with rate limiting and improved error handling
 */
type BatchCallbacks = {
  onProgress?: (progress: { completed: number; total: number; current?: string }) => void;
  onResult?: (result: { email: string; valid: boolean; reason?: string; mxRecords?: string[] }) => void | Promise<void>;
  domainCache?: Map<string, DomainCacheEntry>;
};

export async function verifyEmailBatch(
  emails: string[],
  callbacks?: BatchCallbacks | ((progress: { completed: number; total: number; current?: string }) => void)
): Promise<{
  valid: Array<{ email: string; valid: boolean; reason?: string; mxRecords?: string[] }>;
  invalid: Array<{ email: string; valid: boolean; reason?: string; mxRecords?: string[] }>;
  needsVerification: Array<{ email: string; valid: boolean; reason?: string; mxRecords?: string[] }>;
}> {
  const onProgress = typeof callbacks === 'function' ? callbacks : callbacks?.onProgress;
  const onResult = typeof callbacks === 'function' ? undefined : callbacks?.onResult;
  const domainCache =
    callbacks && typeof callbacks === 'object'
      ? callbacks.domainCache ?? new Map<string, DomainCacheEntry>()
      : new Map<string, DomainCacheEntry>();
  const valid: Array<{ email: string; valid: boolean; reason?: string; mxRecords?: string[] }> = [];
  const invalid: Array<{ email: string; valid: boolean; reason?: string; mxRecords?: string[] }> = [];
  const needsVerification: Array<{ email: string; valid: boolean; reason?: string; mxRecords?: string[] }> = [];

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];

    try {
      // Use MX-only verification (no SMTP)
      const result = await verifyEmailMXOnly(email, domainCache ? { domainCache } : undefined);
      
      const reasonText = result.reasons.length > 0 ? result.reasons.join('; ') : undefined;
      const emailResult = {
        email,
        valid: result.valid,
        reason: reasonText,
        mxRecords: result.details.mx ? [] : undefined, // MX records not returned by verifyEmailMXOnly
      };

      if (result.valid) {
        valid.push(emailResult);
      } else {
        // Invalid email (syntax invalid, MX invalid, disposable, or typo)
        invalid.push(emailResult);
      }

      if (onResult) {
        await onResult(emailResult);
      }
    } catch (error: any) {
      const fallbackResult = {
        email,
        valid: false,
        reason: error.message || 'Verification failed',
      };

      invalid.push(fallbackResult);

      if (onResult) {
        await onResult(fallbackResult);
      }
    }

    if (onProgress) {
      onProgress({ completed: i + 1, total: emails.length, current: email });
    }
  }

  if (onProgress) {
    onProgress({ completed: emails.length, total: emails.length });
  }

  return { valid, invalid, needsVerification };
}

