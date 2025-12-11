/**
 * Email Configuration Model
 * Stores SMTP settings for sending emails via Postale.io or other providers
 */

export interface EmailConfig {
  id: string;
  smtpHost: string; // e.g., mail.postale.io
  smtpPort: number; // e.g., 587 or 465
  smtpUsername: string; // e.g., ministry@twowitnessproject.org
  smtpPassword: string; // Stored securely in Deno KV
  fromEmail: string; // e.g., ministry@twowitnessproject.org
  fromName: string; // e.g., Two Witness Project
  isEnabled: boolean; // Whether email sending is active
  useTLS: boolean; // Whether to use TLS (recommended)
  updatedAt: Date;
  updatedBy: string; // Admin username who updated
}

/**
 * Email template types
 */
export type EmailTemplateType =
  | "prayer_confirmation"
  | "testimonial_confirmation"
  | "contact_reply"
  | "test_email";

/**
 * Email data for sending
 */
export interface EmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
}
