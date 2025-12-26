/**
 * Determine the canonical base URL for email links and assets.
 * Prefers NEXT_PUBLIC_BASE_URL, then VERCEL_URL, then localhost.
 * Trailing slashes are trimmed and missing protocols are fixed.
 */
export function getBaseUrl(): string {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();

  let base = envBase || "";

  if (!base && vercelUrl) {
    // Vercel supplies the host without protocol; default to https
    base = vercelUrl.startsWith("http")
      ? vercelUrl
      : `https://${vercelUrl}`;
  }

  if (!base) {
    base = "http://localhost:3000";
  }

  // Ensure we have a protocol and remove trailing slashes
  if (!base.startsWith("http://") && !base.startsWith("https://")) {
    base = `https://${base}`;
  }

  return base.replace(/\/+$/, "");
}

/**
 * Resolve a media URL to an absolute URL suitable for emails.
 * Leaves already-absolute, data, cid, or protocol-relative URLs untouched.
 */
export function resolveMediaUrl(url: string | undefined | null, baseUrl: string): string {
  const value = (url || "").trim();
  if (!value) return "";

  const lower = value.toLowerCase();

  // Already absolute or inline sources
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("data:") ||
    lower.startsWith("cid:") ||
    value.startsWith("//")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${baseUrl}${value}`;
  }

  return `${baseUrl}/${value}`;
}

