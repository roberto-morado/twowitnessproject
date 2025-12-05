/**
 * Rate Limiting Service
 * Prevents brute force attacks and spam by limiting request frequency
 */

import { db, KvKeys } from "./db.service.ts";

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export interface RateLimitEntry {
  ip: string;
  endpoint: string;
  timestamp: number;
}

export class RateLimitService {
  // Rate limit configurations
  private static configs: Record<string, RateLimitConfig> = {
    login: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    prayer: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    },
    form: {
      maxAttempts: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
    },
  };

  /**
   * Check if request should be rate limited
   * Returns true if rate limit exceeded, false if allowed
   */
  static async isRateLimited(
    ip: string,
    endpoint: string,
    configType: keyof typeof RateLimitService.configs = "form"
  ): Promise<boolean> {
    const config = this.configs[configType];
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get all recent attempts for this IP and endpoint
    const attempts = await this.getRecentAttempts(ip, endpoint, windowStart);

    return attempts.length >= config.maxAttempts;
  }

  /**
   * Record a rate limit attempt
   */
  static async recordAttempt(ip: string, endpoint: string): Promise<void> {
    const timestamp = Date.now();
    const id = crypto.randomUUID();

    const entry: RateLimitEntry = {
      ip,
      endpoint,
      timestamp,
    };

    await db.set(KvKeys.rateLimit(`${ip}:${endpoint}`, timestamp), entry);
  }

  /**
   * Check rate limit and record attempt if allowed
   * Returns object with { allowed: boolean, retryAfter?: number }
   */
  static async checkAndRecord(
    ip: string,
    endpoint: string,
    configType: keyof typeof RateLimitService.configs = "form"
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const isLimited = await this.isRateLimited(ip, endpoint, configType);

    if (isLimited) {
      // Calculate when the oldest attempt will expire
      const config = this.configs[configType];
      const now = Date.now();
      const windowStart = now - config.windowMs;
      const attempts = await this.getRecentAttempts(ip, endpoint, windowStart);

      if (attempts.length > 0) {
        // Find oldest attempt in the window
        const oldestTimestamp = Math.min(...attempts.map(a => a.timestamp));
        const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);

        return { allowed: false, retryAfter };
      }

      return { allowed: false };
    }

    // Not rate limited - record the attempt
    await this.recordAttempt(ip, endpoint);
    return { allowed: true };
  }

  /**
   * Get recent attempts within the time window
   */
  private static async getRecentAttempts(
    ip: string,
    endpoint: string,
    windowStart: number
  ): Promise<RateLimitEntry[]> {
    const allAttempts = await db.list<RateLimitEntry>(
      KvKeys.allRateLimits(`${ip}:${endpoint}`)
    );

    return allAttempts
      .map(entry => entry.value)
      .filter(entry => entry.timestamp >= windowStart);
  }

  /**
   * Clean up old rate limit entries (run periodically)
   * Removes entries older than the longest window (1 hour)
   */
  static async cleanup(): Promise<number> {
    const maxWindowMs = Math.max(
      ...Object.values(this.configs).map(c => c.windowMs)
    );
    const cutoffTime = Date.now() - maxWindowMs;
    let cleaned = 0;

    // Get all unique IP:endpoint combinations
    const seenIdentifiers = new Set<string>();

    for (const configType of Object.keys(this.configs)) {
      const allAttempts = await db.list<RateLimitEntry>(
        KvKeys.allRateLimits("") // Get all rate limits
      );

      for (const entry of allAttempts) {
        if (entry.value.timestamp < cutoffTime) {
          await db.delete(entry.key);
          cleaned++;
        }

        const identifier = `${entry.value.ip}:${entry.value.endpoint}`;
        seenIdentifiers.add(identifier);
      }
    }

    if (cleaned > 0) {
      console.log(`✓ Cleaned up ${cleaned} old rate limit entries`);
    }

    return cleaned;
  }

  /**
   * Get rate limit info for display in error messages
   */
  static getRateLimitInfo(
    configType: keyof typeof RateLimitService.configs
  ): { maxAttempts: number; windowMinutes: number } {
    const config = this.configs[configType];
    return {
      maxAttempts: config.maxAttempts,
      windowMinutes: Math.ceil(config.windowMs / (60 * 1000)),
    };
  }

  /**
   * Extract IP address from request
   */
  static getIpFromRequest(request: Request): string {
    // Try common headers first (for proxies/load balancers)
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      return forwardedFor.split(",")[0].trim();
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
      return realIp;
    }

    // Fallback to connection info (may not be available in all environments)
    // For Deno Deploy, we'll get the IP from the platform
    return "unknown";
  }
}
