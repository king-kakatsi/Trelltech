/**
 * Shared validation helpers.
 * All functions return { valid: true } or { valid: false, error: string }.
 */
export function required(value, fieldName = 'Field') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function requiredArray(value, fieldName = 'Field') {
  if (!Array.isArray(value) || value.length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function isValidUrl(url) {
  try {
    const parsed = new URL(url.trim());
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function validateUrl(value, fieldName = 'Website') {
  if (!value || String(value).trim() === '') {
    return { valid: true };
  }
  if (isValidUrl(value)) {
    return { valid: true };
  }
  return { valid: false, error: `${fieldName} must be a valid http:// or https:// URL` };
}

export function minLength(value, length, fieldName = 'Field') {
  if (String(value).trim().length < length) {
    return { valid: false, error: `${fieldName} must be at least ${length} characters` };
  }
  return { valid: true };
}
