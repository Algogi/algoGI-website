/**
 * List of common personal email providers and temporary/disposable email services
 * that should be blocked for work email validation
 */
const PERSONAL_EMAIL_PROVIDERS = [
  // Personal email providers
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.it',
  'yahoo.es',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'live.com',
  'msn.com',
  // Temporary/disposable email services
  'yopmail.com',
  'yopmail.fr',
  '10minutemail.com',
  '10minutemail.de',
  'tempmail.com',
  'tempmail.org',
  'tempmail.net',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'throwaway.email',
  'temp-mail.org',
  'temp-mail.io',
  'getnada.com',
  'fakemail.net',
  'trashmail.com',
  'trashmail.net',
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
] as const;

/**
 * Extracts the domain from an email address
 * @param email - The email address
 * @returns The domain (lowercase) or null if invalid
 */
function extractDomain(email: string): string | null {
  const trimmedEmail = email.trim().toLowerCase();
  const atIndex = trimmedEmail.lastIndexOf('@');
  
  if (atIndex === -1 || atIndex === trimmedEmail.length - 1) {
    return null;
  }
  
  const domain = trimmedEmail.substring(atIndex + 1);
  
  // Basic domain validation
  if (!domain || domain.length === 0) {
    return null;
  }
  
  return domain;
}

/**
 * Checks if an email address is a work email (not from a personal email provider)
 * @param email - The email address to validate
 * @returns true if it's a work email, false if it's from a personal provider
 */
export function isWorkEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const domain = extractDomain(email);
  
  if (!domain) {
    return false;
  }
  
  // Check if domain is in the personal email providers list
  return !PERSONAL_EMAIL_PROVIDERS.includes(domain as any);
}

/**
 * Returns a user-friendly error message for work email validation
 */
export function getWorkEmailErrorMessage(): string {
  return 'Please use your work email address. Personal email addresses (Gmail, Yahoo, Outlook, etc.) and temporary email services are not accepted.';
}

