// Input sanitization utilities for security

/**
 * Sanitize string input - removes potentially dangerous characters
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';
  
  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim whitespace
    .trim()
    // Limit length
    .substring(0, 10000);
}

/**
 * Sanitize string for HTML display - escape HTML entities
 */
export function escapeHtml(input: string | null | undefined): string {
  if (!input) return '';
  
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  
  return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  
  // Basic email sanitization
  const sanitized = email
    .toLowerCase()
    .trim()
    .substring(0, 254); // Max email length
  
  // Validate format (basic check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove everything except digits, plus, parentheses, dashes, spaces
  return phone
    .replace(/[^\d+\-() ]/g, '')
    .substring(0, 20);
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number | null | undefined,
  options?: { min?: number; max?: number; allowNegative?: boolean }
): number | null {
  if (input === null || input === undefined || input === '') return null;
  
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) return null;
  
  let result = num;
  
  if (!options?.allowNegative && result < 0) {
    result = 0;
  }
  
  if (options?.min !== undefined && result < options.min) {
    result = options.min;
  }
  
  if (options?.max !== undefined && result > options.max) {
    result = options.max;
  }
  
  return result;
}

/**
 * Sanitize date string
 */
export function sanitizeDate(date: string | null | undefined): Date | null {
  if (!date) return null;
  
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Sanitize ID (CUID format)
 */
export function sanitizeId(id: string | null | undefined): string {
  if (!id) return '';
  
  // CUIDs are alphanumeric and typically 25 characters
  const sanitized = id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30);
  
  return sanitized;
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string | null | undefined): string {
  if (!filename) return '';
  
  return filename
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    // Remove slashes
    .replace(/[/\\]/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Limit to safe characters
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // Limit length
    .substring(0, 255);
}

/**
 * Sanitize rich text by stripping ALL HTML tags.
 * For safe rich text rendering, use a proper library like DOMPurify on the client.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return '';

  // Strip all HTML tags — regex-based allow-lists are bypassable
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\0/g, '')
    .trim()
    .substring(0, 50000);
}

/**
 * Validate and sanitize an object against a schema
 */
export interface FieldSchema {
  type: 'string' | 'number' | 'email' | 'phone' | 'date' | 'boolean' | 'id' | 'url';
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: string[];
}

export function sanitizeObject<T extends Record<string, any>>(
  input: any,
  schema: Record<string, FieldSchema>
): { data: Partial<T>; errors: string[] } {
  const errors: string[] = [];
  const data: Record<string, any> = {};
  
  for (const [field, fieldSchema] of Object.entries(schema)) {
    const value = input?.[field];
    
    // Check required
    if (fieldSchema.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value === undefined || value === null) {
      continue;
    }
    
    // Validate and sanitize by type
    switch (fieldSchema.type) {
      case 'string':
        let strValue = sanitizeString(String(value));
        if (fieldSchema.maxLength) {
          strValue = strValue.substring(0, fieldSchema.maxLength);
        }
        if (fieldSchema.enum && !fieldSchema.enum.includes(strValue)) {
          errors.push(`${field} must be one of: ${fieldSchema.enum.join(', ')}`);
        } else {
          data[field] = strValue;
        }
        break;
        
      case 'number':
        const numValue = sanitizeNumber(value, {
          min: fieldSchema.min,
          max: fieldSchema.max,
        });
        if (numValue === null && fieldSchema.required) {
          errors.push(`${field} must be a valid number`);
        } else if (numValue !== null) {
          data[field] = numValue;
        }
        break;
        
      case 'email':
        const emailValue = sanitizeEmail(value);
        if (!emailValue && fieldSchema.required) {
          errors.push(`${field} must be a valid email`);
        } else if (emailValue) {
          data[field] = emailValue;
        }
        break;
        
      case 'phone':
        data[field] = sanitizePhone(value);
        break;
        
      case 'date':
        const dateValue = sanitizeDate(value);
        if (!dateValue && fieldSchema.required) {
          errors.push(`${field} must be a valid date`);
        } else if (dateValue) {
          data[field] = dateValue;
        }
        break;
        
      case 'boolean':
        data[field] = Boolean(value);
        break;
        
      case 'id':
        const idValue = sanitizeId(value);
        if (!idValue && fieldSchema.required) {
          errors.push(`${field} must be a valid ID`);
        } else if (idValue) {
          data[field] = idValue;
        }
        break;
        
      case 'url':
        const urlValue = sanitizeUrl(value);
        if (!urlValue && fieldSchema.required) {
          errors.push(`${field} must be a valid URL`);
        } else if (urlValue) {
          data[field] = urlValue;
        }
        break;
    }
  }
  
  return { data: data as Partial<T>, errors };
}
