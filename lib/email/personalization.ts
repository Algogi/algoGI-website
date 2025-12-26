/**
 * Personalization tag replacement utilities
 */

export interface ContactData {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  [key: string]: any; // Allow additional fields
}

/**
 * Sample contact data for preview
 */
export const SAMPLE_CONTACT: ContactData = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  company: "Acme Corp",
};

/**
 * Replace personalization tags in text with contact data
 */
export function replacePersonalizationTags(text: string, contact: ContactData = SAMPLE_CONTACT): string {
  if (!text) return text;

  let result = text;

  const fullName = contact.firstName && contact.lastName
    ? `${contact.firstName} ${contact.lastName}`
    : contact.firstName || contact.lastName || "";

  const tagValues: Record<string, string> = {
    first_name: contact.firstName || "",
    last_name: contact.lastName || "",
    full_name: fullName,
    email: contact.email || "",
    company: contact.company || "",
  };

  // Replace {{first_name}}
  result = result.replace(/\{\{first_name\}\}/gi, tagValues.first_name);
  
  // Replace {{last_name}}
  result = result.replace(/\{\{last_name\}\}/gi, tagValues.last_name);
  
  // Replace {{full_name}}
  result = result.replace(/\{\{full_name\}\}/gi, tagValues.full_name);
  
  // Replace {{email}}
  result = result.replace(/\{\{email\}\}/gi, tagValues.email);
  
  // Replace {{company}}
  result = result.replace(/\{\{company\}\}/gi, tagValues.company);

  // Replace {{first_name|fallback:value}} pattern
  result = result.replace(/\{\{first_name\|fallback:([^}]+)\}\}/gi, (match, fallback) => {
    return contact.firstName || fallback || "";
  });

  // Replace {{last_name|fallback:value}} pattern
  result = result.replace(/\{\{last_name\|fallback:([^}]+)\}\}/gi, (match, fallback) => {
    return contact.lastName || fallback || "";
  });

  // Replace {{full_name|fallback:value}} pattern
  result = result.replace(/\{\{full_name\|fallback:([^}]+)\}\}/gi, (match, fallback) => {
    const fullName = contact.firstName && contact.lastName
      ? `${contact.firstName} ${contact.lastName}`
      : contact.firstName || contact.lastName || "";
    return fullName || fallback || "";
  });

  // Replace {{company|fallback:value}} pattern
  result = result.replace(/\{\{company\|fallback:([^}]+)\}\}/gi, (match, fallback) => {
    return contact.company || fallback || "";
  });

  // Fallback: replace malformed tags missing closing braces (e.g., {{first_name{{email}})
  result = result.replace(/\{\{(first_name|last_name|full_name|email|company)\}?/gi, (_, key: string) => {
    const normalizedKey = key.toLowerCase();
    return tagValues[normalizedKey] ?? "";
  });

  return result;
}

/**
 * Replace personalization tags in HTML content
 */
export function replacePersonalizationTagsInHTML(html: string, contact: ContactData = SAMPLE_CONTACT): string {
  if (!html) return html;

  // Replace tags in text content (not in HTML tags)
  // This is a simple approach - for production, consider using a proper HTML parser
  return replacePersonalizationTags(html, contact);
}

/**
 * Check if text contains personalization tags
 */
export function hasPersonalizationTags(text: string): boolean {
  if (!text) return false;
  return /\{\{[^}]+\}\}/.test(text);
}

/**
 * Get all personalization tags in text
 */
export function extractPersonalizationTags(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\{\{[^}]+\}\}/g);
  return matches ? [...new Set(matches)] : [];
}

