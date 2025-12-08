/**
 * Input Validation Utilities
 * Provides validation for user input to prevent DoS attacks, data corruption, and security issues
 */

/**
 * Validation limits for various input fields
 * These limits prevent excessive memory usage and database bloat
 */
export const ValidationLimits = {
  // Prayer request limits
  MAX_PRAYER_LENGTH: 5000,

  // Testimonial limits
  MAX_TESTIMONY_LENGTH: 10000,

  // Common field limits
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_LOCATION_LENGTH: 100,

  // Admin/settings limits
  MAX_WEBHOOK_URL_LENGTH: 2000,
  MAX_WEBHOOK_NAME_LENGTH: 100,

  // Minimum lengths
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
} as const;

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate string length
 *
 * @param value - The string to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - Name of the field (for error messages)
 * @param minLength - Optional minimum length (default: 1)
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateLength(
  value: string,
  maxLength: number,
  fieldName: string,
  minLength = 1
): ValidationResult {
  const trimmedValue = value.trim();

  if (trimmedValue.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} character${minLength !== 1 ? 's' : ''} long`,
    };
  }

  if (value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be ${maxLength} characters or less (currently ${value.length})`,
    };
  }

  return { valid: true };
}

/**
 * Validate email format (basic validation)
 *
 * @param email - The email to validate
 * @returns ValidationResult
 */
export function validateEmail(email: string): ValidationResult {
  // Basic email regex - not perfect but catches most invalid formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: "Please enter a valid email address",
    };
  }

  return validateLength(email, ValidationLimits.MAX_EMAIL_LENGTH, "Email");
}

/**
 * Validate prayer request submission
 *
 * @param data - Prayer submission data
 * @returns ValidationResult
 */
export function validatePrayerSubmission(data: {
  name?: string;
  email?: string;
  prayer: string;
}): ValidationResult {
  // Validate prayer text (required)
  if (!data.prayer || data.prayer.trim().length === 0) {
    return {
      valid: false,
      error: "Prayer text is required",
    };
  }

  const prayerValidation = validateLength(
    data.prayer,
    ValidationLimits.MAX_PRAYER_LENGTH,
    "Prayer text"
  );
  if (!prayerValidation.valid) {
    return prayerValidation;
  }

  // Validate name if provided
  if (data.name && data.name.trim().length > 0) {
    const nameValidation = validateLength(
      data.name,
      ValidationLimits.MAX_NAME_LENGTH,
      "Name",
      0 // Name is optional, so min length is 0
    );
    if (!nameValidation.valid) {
      return nameValidation;
    }
  }

  // Validate email if provided
  if (data.email && data.email.trim().length > 0) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      return emailValidation;
    }
  }

  return { valid: true };
}

/**
 * Validate testimonial submission
 *
 * @param data - Testimonial submission data
 * @returns ValidationResult
 */
export function validateTestimonialSubmission(data: {
  name: string;
  testimony: string;
  location?: string;
}): ValidationResult {
  // Validate name (required)
  if (!data.name || data.name.trim().length === 0) {
    return {
      valid: false,
      error: "Name is required",
    };
  }

  const nameValidation = validateLength(
    data.name,
    ValidationLimits.MAX_NAME_LENGTH,
    "Name"
  );
  if (!nameValidation.valid) {
    return nameValidation;
  }

  // Validate testimony (required)
  if (!data.testimony || data.testimony.trim().length === 0) {
    return {
      valid: false,
      error: "Testimony is required",
    };
  }

  const testimonyValidation = validateLength(
    data.testimony,
    ValidationLimits.MAX_TESTIMONY_LENGTH,
    "Testimony"
  );
  if (!testimonyValidation.valid) {
    return testimonyValidation;
  }

  // Validate location if provided
  if (data.location && data.location.trim().length > 0) {
    const locationValidation = validateLength(
      data.location,
      ValidationLimits.MAX_LOCATION_LENGTH,
      "Location",
      0
    );
    if (!locationValidation.valid) {
      return locationValidation;
    }
  }

  return { valid: true };
}

/**
 * Validate webhook URL
 *
 * @param url - The webhook URL to validate
 * @returns ValidationResult
 */
export function validateWebhookUrl(url: string): ValidationResult {
  // Check length
  const lengthValidation = validateLength(
    url,
    ValidationLimits.MAX_WEBHOOK_URL_LENGTH,
    "Webhook URL"
  );
  if (!lengthValidation.valid) {
    return lengthValidation;
  }

  // Check if it's a valid URL
  try {
    const parsedUrl = new URL(url);

    // Must be HTTPS (security requirement)
    if (parsedUrl.protocol !== "https:") {
      return {
        valid: false,
        error: "Webhook URL must use HTTPS protocol",
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: "Invalid webhook URL format",
    };
  }
}

/**
 * Sanitize string by removing control characters
 *
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  // Remove control characters except newlines and tabs
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
