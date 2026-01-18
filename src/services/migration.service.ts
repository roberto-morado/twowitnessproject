/**
 * Database Migration Service
 * One-time cleanup script to remove old data structures
 * Preserves: admin users, sessions, links
 * Removes: prayers, testimonials, analytics, locations, etc.
 */

import { db } from "./db.service.ts";

export class MigrationService {
  /**
   * Run migration - cleanup old data structures
   * Only runs if old data exists
   */
  static async runMigration(): Promise<void> {
    console.log("🔄 Checking for old data structures...");

    let deletedCount = 0;

    // Remove prayers
    deletedCount += await this.deletePrefix(["prayers"]);

    // Remove testimonials
    deletedCount += await this.deletePrefix(["testimonials"]);
    deletedCount += await this.deletePrefix(["testimonial", "keys"]);

    // Remove analytics
    deletedCount += await this.deletePrefix(["analytics", "pageviews"]);
    deletedCount += await this.deletePrefix(["analytics", "events"]);

    // Remove locations
    deletedCount += await this.deletePrefix(["locations"]);

    // Remove login attempts (security logs)
    deletedCount += await this.deletePrefix(["security", "loginAttempts"]);

    // Remove settings (email config, etc.)
    deletedCount += await this.deletePrefix(["settings"]);

    // Note: Keep admin users and sessions

    if (deletedCount > 0) {
      console.log(`✓ Migration complete: Removed ${deletedCount} old records`);
    } else {
      console.log("✓ No old data found - database is clean");
    }
  }

  /**
   * Delete all entries with a given prefix
   */
  private static async deletePrefix(prefix: Deno.KvKey): Promise<number> {
    let count = 0;
    const entries = db.kv.list({ prefix });

    for await (const entry of entries) {
      await db.kv.delete(entry.key);
      count++;
    }

    if (count > 0) {
      console.log(`  - Deleted ${count} entries from [${prefix.join("/")}]`);
    }

    return count;
  }
}
