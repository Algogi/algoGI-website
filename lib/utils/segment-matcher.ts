/**
 * Utility functions for matching contacts against segment criteria
 */

/**
 * Get field value from contact object (supports nested fields like metadata.q1)
 */
export function getFieldValue(contact: any, field: string): any {
  if (!field || !contact) return undefined;
  
  const parts = field.split('.');
  let value = contact;
  
  for (const part of parts) {
    if (value === undefined || value === null) return undefined;
    value = value[part];
  }
  
  return value;
}

/**
 * Check if a contact matches a segment rule
 */
export function matchesRule(contact: any, rule: any): boolean {
  const fieldValue = getFieldValue(contact, rule.field);

  switch (rule.operator) {
    case 'equals':
      return String(fieldValue) === String(rule.value);
    case 'not_equals':
      return String(fieldValue) !== String(rule.value);
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());
    case 'not_contains':
      return !String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());
    case 'in':
      return Array.isArray(rule.value) && rule.value.includes(fieldValue);
    case 'not_in':
      return Array.isArray(rule.value) && !rule.value.includes(fieldValue);
    case 'greater_than':
      return Number(fieldValue) > Number(rule.value);
    case 'less_than':
      return Number(fieldValue) < Number(rule.value);
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null;
    case 'not_exists':
      return fieldValue === undefined || fieldValue === null;
    default:
      return false;
  }
}

