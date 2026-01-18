/// <reference lib="deno.unstable" />

/**
 * Database Service - Deno KV wrapper
 * Provides CRUD operations and key naming conventions
 */

export class DatabaseService {
  private static instance: DatabaseService;
  private kv: Deno.Kv | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize Deno KV connection
   */
  async connect(): Promise<void> {
    if (!this.kv) {
      this.kv = await Deno.openKv();
      console.log("✓ Connected to Deno KV");
    }
  }

  /**
   * Get the KV instance (ensures connection)
   */
  private async getKv(): Promise<Deno.Kv> {
    if (!this.kv) {
      await this.connect();
    }
    return this.kv!;
  }

  /**
   * Generic get operation
   */
  async get<T>(key: Deno.KvKey): Promise<T | null> {
    const kv = await this.getKv();
    const result = await kv.get<T>(key);
    return result.value;
  }

  /**
   * Generic set operation
   */
  async set<T>(key: Deno.KvKey, value: T): Promise<void> {
    const kv = await this.getKv();
    await kv.set(key, value);
  }

  /**
   * Generic delete operation
   */
  async delete(key: Deno.KvKey): Promise<void> {
    const kv = await this.getKv();
    await kv.delete(key);
  }

  /**
   * List entries with a prefix
   */
  async list<T>(prefix: Deno.KvKey): Promise<Array<{ key: Deno.KvKey; value: T }>> {
    const kv = await this.getKv();
    const entries: Array<{ key: Deno.KvKey; value: T }> = [];

    const iter = kv.list<T>({ prefix });
    for await (const entry of iter) {
      entries.push({ key: entry.key, value: entry.value });
    }

    return entries;
  }

  /**
   * Atomic operation (transaction)
   */
  async atomic(): Promise<Deno.AtomicOperation> {
    const kv = await this.getKv();
    return kv.atomic();
  }

  /**
   * Close connection
   */
  close(): void {
    if (this.kv) {
      this.kv.close();
      this.kv = null;
      console.log("✓ Closed Deno KV connection");
    }
  }
}

/**
 * Key naming conventions for organized data structure
 */
export const KvKeys = {
  // Admin users: ["admin", "users", username]
  adminUser: (username: string) => ["admin", "users", username],

  // Sessions: ["sessions", sessionId]
  session: (sessionId: string) => ["sessions", sessionId],

  // Prayer requests: ["prayers", prayerId]
  prayer: (prayerId: string) => ["prayers", prayerId],

  // Analytics page views: ["analytics", "pageviews", timestamp, id]
  pageView: (timestamp: number, id: string) => ["analytics", "pageviews", timestamp, id],

  // Analytics events: ["analytics", "events", timestamp, id]
  event: (timestamp: number, id: string) => ["analytics", "events", timestamp, id],

  // Login attempts: ["security", "loginAttempts", timestamp, id]
  loginAttempt: (timestamp: number, id: string) => ["security", "loginAttempts", timestamp, id],

  // Rate limiting: ["rateLimit", identifier, timestamp]
  rateLimit: (identifier: string, timestamp: number) => ["rateLimit", identifier, timestamp],

  // Settings: ["settings", key]
  setting: (key: string) => ["settings", key],

  // Testimonials: ["testimonials", testimonialId]
  testimonial: (testimonialId: string) => ["testimonials", testimonialId],

  // Testimonial keys: ["testimonial", "keys", keyId]
  testimonialKey: (keyId: string) => ["testimonial", "keys", keyId],

  // Links (for Linktree-style homepage): ["links", linkId]
  link: (linkId: string) => ["links", linkId],

  // Prefixes for listing
  allPrayers: () => ["prayers"],
  allPageViews: () => ["analytics", "pageviews"],
  allEvents: () => ["analytics", "events"],
  allSessions: () => ["sessions"],
  allLoginAttempts: () => ["security", "loginAttempts"],
  allTestimonials: () => ["testimonials"],
  allTestimonialKeys: () => ["testimonial", "keys"],
  allRateLimits: (identifier: string) => ["rateLimit", identifier],
};

// Export singleton instance
export const db = DatabaseService.getInstance();
