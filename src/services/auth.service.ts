/**
 * Authentication Service
 * Handles session management and admin authentication
 * Admin credentials are read directly from environment variables (no database storage)
 */

import { db, KvKeys } from "./db.service.ts";

export interface Session {
  id: string;
  username: string;
  createdAt: number;
  expiresAt: number;
}

export interface LoginAttempt {
  username: string;
  success: boolean;
  timestamp: number;
  ip: string;
}

export class AuthService {
  private static SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  /**
   * Generate random session ID
   */
  private static generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Authenticate user with username and password
   * Checks directly against environment variables (ADMIN_USER and ADMIN_PASS)
   * Returns session ID if successful, null otherwise
   */
  static async login(username: string, password: string, ip = "unknown"): Promise<string | null> {
    try {
      // Get admin credentials from environment variables (source of truth)
      const adminUsername = Deno.env.get("ADMIN_USER");
      const adminPassword = Deno.env.get("ADMIN_PASS");

      // Check if admin credentials are configured
      if (!adminUsername || !adminPassword) {
        console.error("⚠ Admin credentials not configured in environment variables");
        await this.logLoginAttempt(username, false, ip);
        return null;
      }

      // Check username
      if (username !== adminUsername) {
        await this.logLoginAttempt(username, false, ip);
        return null;
      }

      // Check password
      if (password !== adminPassword) {
        await this.logLoginAttempt(username, false, ip);
        return null;
      }

      // Authentication successful - create session
      const sessionId = this.generateSessionId();
      const session: Session = {
        id: sessionId,
        username,
        createdAt: Date.now(),
        expiresAt: Date.now() + this.SESSION_DURATION,
      };

      await db.set(KvKeys.session(sessionId), session);
      await this.logLoginAttempt(username, true, ip);
      return sessionId;
    } catch (error) {
      console.error("Login error:", error);
      await this.logLoginAttempt(username, false, ip);
      return null;
    }
  }

  /**
   * Log login attempt for security monitoring
   */
  private static async logLoginAttempt(username: string, success: boolean, ip: string): Promise<void> {
    const timestamp = Date.now();
    const id = crypto.randomUUID();

    const attempt: LoginAttempt = {
      username,
      success,
      timestamp,
      ip,
    };

    await db.set(KvKeys.loginAttempt(timestamp, id), attempt);
  }

  /**
   * Get recent login attempts for monitoring
   */
  static async getRecentLoginAttempts(limit = 50): Promise<LoginAttempt[]> {
    const attempts = await db.list<LoginAttempt>(KvKeys.allLoginAttempts());
    return attempts
      .map(entry => entry.value)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Validate session and return username if valid
   */
  static async validateSession(sessionId: string): Promise<string | null> {
    const session = await db.get<Session>(KvKeys.session(sessionId));

    if (!session) {
      return null;
    }

    // Check if expired
    if (Date.now() > session.expiresAt) {
      await db.delete(KvKeys.session(sessionId));
      return null;
    }

    return session.username;
  }

  /**
   * Logout - destroy session
   */
  static async logout(sessionId: string): Promise<void> {
    await db.delete(KvKeys.session(sessionId));
  }

  /**
   * Clean up expired sessions (run periodically)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const allSessions = await db.list<Session>(KvKeys.allSessions());
    const now = Date.now();
    let cleaned = 0;

    for (const entry of allSessions) {
      if (now > entry.value.expiresAt) {
        await db.delete(entry.key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`✓ Cleaned up ${cleaned} expired session(s)`);
    }

    return cleaned;
  }

  /**
   * Get session from cookie header
   */
  static getSessionFromCookie(cookieHeader: string | null): string | null {
    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(";").map(c => c.trim());
    for (const cookie of cookies) {
      const [name, value] = cookie.split("=");
      if (name === "session") {
        return value;
      }
    }

    return null;
  }

  /**
   * Create session cookie header
   */
  static createSessionCookie(sessionId: string): string {
    const maxAge = this.SESSION_DURATION / 1000; // Convert to seconds
    return `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`;
  }

  /**
   * Create logout cookie header (expires immediately)
   */
  static createLogoutCookie(): string {
    return `session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`;
  }
}
