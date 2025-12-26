/**
 * Calculate emails per hour for campaign warmup
 * Auto-calculates based on total contacts and remaining time
 */

export function calculateEmailsPerHour(
  totalContacts: number,
  sentContacts: number,
  startedAt: string,
  targetDurationHours?: number
): number {
  const remainingContacts = totalContacts - sentContacts;
  
  if (remainingContacts <= 0) {
    return 0;
  }

  // If target duration is provided, use it
  if (targetDurationHours && targetDurationHours > 0) {
    return Math.ceil(remainingContacts / targetDurationHours);
  }

  // Auto-calculate: distribute over minimum 24 hours
  // For small campaigns (< 100), send over 12 hours
  // For medium campaigns (100-1000), send over 24 hours
  // For large campaigns (> 1000), send over 48 hours
  let defaultHours = 24;
  if (remainingContacts < 100) {
    defaultHours = 12;
  } else if (remainingContacts > 1000) {
    defaultHours = 48;
  }

  // Calculate based on time since start if campaign has been running
  const startTime = new Date(startedAt).getTime();
  const now = Date.now();
  const elapsedHours = (now - startTime) / (1000 * 60 * 60);

  if (elapsedHours > 0) {
    // Campaign has been running, calculate based on remaining time
    // Use at least 12 more hours to complete
    const remainingHours = Math.max(12, defaultHours - elapsedHours);
    return Math.ceil(remainingContacts / remainingHours);
  }

  // Campaign just started, use default distribution
  return Math.ceil(remainingContacts / defaultHours);
}

