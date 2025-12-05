/**
 * Authentication Service
 * Handles password hashing, session management, and admin operations
 */

import { db, KvKeys } from "./db.service.ts";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export interface AdminUser {
  username: string;
  passwordHash: string;
  createdAt: number;
}

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
  private static SCRYPT_KEY_LENGTH = 32; // 256 bits
  private static SCRYPT_COST = 16384; // CPU/memory cost (2^14)

  /**
   * Hash password using scrypt (secure, slow hashing for passwords)
   * Format: salt:hash (both hex-encoded)
   */
  private static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16); // 128-bit salt
    const derivedKey = await scryptAsync(
      password,
      salt,
      this.SCRYPT_KEY_LENGTH,
      { N: this.SCRYPT_COST }
    ) as Buffer;

    // Return salt:hash format for storage
    return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
  }

  /**
   * Verify password against scrypt hash
   * Uses timing-safe comparison to prevent timing attacks
   */
  private static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [saltHex, hashHex] = storedHash.split(":");
    if (!saltHex || !hashHex) return false;

    const salt = Buffer.from(saltHex, "hex");
    const storedKeyBuffer = Buffer.from(hashHex, "hex");

    const derivedKey = await scryptAsync(
      password,
      salt,
      this.SCRYPT_KEY_LENGTH,
      { N: this.SCRYPT_COST }
    ) as Buffer;

    // Timing-safe comparison prevents timing attacks
    return timingSafeEqual(derivedKey, storedKeyBuffer);
  }

  /**
   * Generate random session ID
   */
  private static generateSessionId(): string {
    return crypto.randomUUID();
  }

  /**
   * Initialize admin user from environment variables
   * Returns true if admin was created, false if already exists
   */
  static async initializeAdmin(): Promise<boolean> {
    const username = Deno.env.get("ADMIN_USER");
    const password = Deno.env.get("ADMIN_PASS");

    if (!username || !password) {
      console.warn("⚠ ADMIN_USER or ADMIN_PASS not set in environment variables");
      return false;
    }

    // Check if admin already exists
    const existingAdmin = await db.get<AdminUser>(KvKeys.adminUser(username));
    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      return false;
    }

    // Create admin user
    const passwordHash = await this.hashPassword(password);
    const admin: AdminUser = {
      username,
      passwordHash,
      createdAt: Date.now(),
    };

    await db.set(KvKeys.adminUser(username), admin);
    console.log(`✓ Created admin user: ${username}`);
    return true;
  }

  /**
   * Authenticate user with username and password
   * Returns session ID if successful, null otherwise
   */
  static async login(username: string, password: string, ip = "unknown"): Promise<string | null> {
    try {
      // Get admin user
      const admin = await db.get<AdminUser>(KvKeys.adminUser(username));
      if (!admin) {
        await this.logLoginAttempt(username, false, ip);
        return null;
      }

      // Verify password
      const isValid = await this.verifyPassword(password, admin.passwordHash);
      if (!isValid) {
        await this.logLoginAttempt(username, false, ip);
        return null;
      }

      // Create session
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
