/**
 * Calculate emails per hour for campaign warmup
 * Auto-calculates based on total contacts and remaining time
 */

export function calculateEmailsPerHour(
  totalContacts: number,
  sentContacts: number,
  startedAt: string,
  targetDurationHours?: number,
  metrics?: {
    openRate?: number;
    bounceRate?: number;
    engagementScore?: number;
  }
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
    let baseRate = Math.ceil(remainingContacts / remainingHours);

    // Engagement-aware adjustments
    const openRate = metrics?.openRate ?? 0;
    const bounceRate = metrics?.bounceRate ?? 0;
    const engagementScore = metrics?.engagementScore ?? 0;

    const bouncePenalty = Math.max(0.25, 1 - bounceRate * 2);
    const openBoost =
      openRate >= 0.4 ? 1.2 : openRate >= 0.2 ? 1 : 0.7;
    const engagementBoost =
      engagementScore >= 7 ? 1.2 : engagementScore >= 4 ? 1 : 0.8;

    baseRate = Math.ceil(baseRate * bouncePenalty * openBoost * engagementBoost);
    return Math.max(1, baseRate);
  }

  // Campaign just started, use default distribution
  let baseRate = Math.ceil(remainingContacts / defaultHours);

  const openRate = metrics?.openRate ?? 0;
  const bounceRate = metrics?.bounceRate ?? 0;
  const engagementScore = metrics?.engagementScore ?? 0;

  const bouncePenalty = Math.max(0.25, 1 - bounceRate * 2);
  const openBoost = openRate >= 0.4 ? 1.2 : openRate >= 0.2 ? 1 : 0.7;
  const engagementBoost = engagementScore >= 7 ? 1.2 : engagementScore >= 4 ? 1 : 0.8;

  baseRate = Math.ceil(baseRate * bouncePenalty * openBoost * engagementBoost);
  return Math.max(1, baseRate);
}

