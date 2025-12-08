/**
 * CSRF (Cross-Site Request Forgery) Protection Service
 * Generates and validates CSRF tokens to prevent CSRF attacks
 *
 * Uses Double Submit Cookie pattern:
 * - Token stored in both cookie and form
 * - Server validates that both match
 * - Works for both authenticated and unauthenticated requests
 */

import { db, KvKeys } from "./db.service.ts";
import { timingSafeEqual } from "@utils/crypto.ts";

export interface CsrfToken {
  token: string;
  createdAt: number;
  expiresAt: number;
}

export class CsrfService {
  private static TOKEN_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  private static COOKIE_NAME = "csrf_token";

  /**
   * Generate a new CSRF token
   * Uses Double Submit Cookie pattern - no session required
   */
  static generateToken(): string {
    return crypto.randomUUID();
  }

  /**
   * Validate CSRF token using Double Submit Cookie pattern
   * Compares cookie value with form value using timing-safe comparison
   * to prevent timing attacks
   */
  static validateToken(cookieToken: string | null, formToken: string | null): boolean {
    // Both must be present
    if (!cookieToken || !formToken) {
      return false;
    }

    // Both must match - use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(cookieToken, formToken);
  }

  /**
   * Get CSRF token from cookie header
   */
  static getTokenFromCookie(cookieHeader: string | null): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(";").map(c => c.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name === this.COOKIE_NAME) {
        return value;
      }
    }

    return null;
  }

  /**
   * Extract CSRF token from form data
   */
  static getTokenFromFormData(formData: FormData): string | null {
    return formData.get("csrf_token")?.toString() || null;
  }

  /**
   * Create CSRF token cookie header
   */
  static createTokenCookie(token: string): string {
    const maxAge = this.TOKEN_DURATION / 1000; // Convert to seconds
    // SameSite=Strict prevents the cookie from being sent in cross-site requests
    return `${this.COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`;
  }

  /**
   * Generate HTML hidden input for CSRF token
   */
  static generateTokenInput(token: string): string {
    return `<input type="hidden" name="csrf_token" value="${token}">`;
  }

  /**
   * Validate CSRF token from request and form data
   * Convenience method that extracts tokens and validates
   */
  static async validateFromRequest(request: Request, formData: FormData): Promise<boolean> {
    const cookieToken = this.getTokenFromCookie(request.headers.get("Cookie"));
    const formToken = this.getTokenFromFormData(formData);
    return this.validateToken(cookieToken, formToken);
  }
}
