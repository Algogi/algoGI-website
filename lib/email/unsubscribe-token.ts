import { createHmac, timingSafeEqual } from 'crypto';

export interface UnsubscribeTokenData {
  email: string;
  campaignId?: string;
  timestamp: number;
}

/**
 * Generate a secure HMAC-signed token for unsubscribe links
 * Format: base64(email|campaignId|timestamp|signature)
 */
export function generateUnsubscribeToken(
  email: string,
  campaignId?: string
): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  const timestamp = Date.now();
  const payload = `${email}|${campaignId || ''}|${timestamp}`;
  
  // Create HMAC signature
  const hmac = createHmac('sha256', secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  // Combine payload and signature
  const token = `${payload}|${signature}`;
  
  // Base64 encode for URL safety
  return Buffer.from(token).toString('base64url');
}

/**
 * Validate and extract data from an unsubscribe token
 * Returns null if token is invalid or expired
 */
export function validateUnsubscribeToken(
  token: string,
  maxAgeMs: number = 90 * 24 * 60 * 60 * 1000 // 90 days default
): UnsubscribeTokenData | null {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured');
  }

  try {
    // Decode base64
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split('|');
    
    if (parts.length !== 4) {
      return null;
    }
    
    const [email, campaignId, timestampStr, signature] = parts;
    
    // Reconstruct payload
    const payload = `${email}|${campaignId}|${timestampStr}`;
    
    // Verify signature
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return null;
    }
    
    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }
    
    // Check expiration
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return null;
    }
    
    const age = Date.now() - timestamp;
    if (age < 0 || age > maxAgeMs) {
      return null;
    }
    
    return {
      email,
      campaignId: campaignId || undefined,
      timestamp,
    };
  } catch (error) {
    console.error('Error validating unsubscribe token:', error);
    return null;
  }
}


