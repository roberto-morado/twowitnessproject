/**
 * Cleanup Service
 * Automated data retention and cleanup tasks
 */

import { AuthService } from "./auth.service.ts";
import { AnalyticsService } from "./analytics.service.ts";
import { PrayerService } from "./prayer.service.ts";
import { RateLimitService } from "./ratelimit.service.ts";

export interface CleanupResult {
  expiredSessions: number;
  oldAnalytics: number;
  prayedPrayers: number;
  rateLimits: number;
  totalCleaned: number;
}

export class CleanupService {
  /**
   * Run all cleanup tasks
   */
  static async runCleanup(
    analyticsRetentionDays: number,
    prayedPrayersRetentionDays: number
  ): Promise<CleanupResult> {
    console.log("🧹 Starting cleanup tasks...");

    const result: CleanupResult = {
      expiredSessions: 0,
      oldAnalytics: 0,
      prayedPrayers: 0,
      rateLimits: 0,
      totalCleaned: 0,
    };

    try {
      // 1. Clean up expired sessions
      result.expiredSessions = await AuthService.cleanupExpiredSessions();

      // 2. Delete old analytics data
      result.oldAnalytics = await AnalyticsService.deleteOldData(analyticsRetentionDays);

      // 3. Delete old prayed prayers
      result.prayedPrayers = await this.cleanupPrayedPrayers(prayedPrayersRetentionDays);

      // 4. Clean up old rate limit entries
      result.rateLimits = await RateLimitService.cleanup();

      // Calculate total
      result.totalCleaned = result.expiredSessions + result.oldAnalytics + result.prayedPrayers + result.rateLimits;

      if (result.totalCleaned > 0) {
        console.log(`✓ Cleanup complete: ${result.totalCleaned} items removed`);
        console.log(`  - Expired sessions: ${result.expiredSessions}`);
        console.log(`  - Old analytics: ${result.oldAnalytics}`);
        console.log(`  - Prayed prayers: ${result.prayedPrayers}`);
        console.log(`  - Rate limits: ${result.rateLimits}`);
      } else {
        console.log("✓ Cleanup complete: No items to remove");
      }
    } catch (error) {
      console.error("❌ Cleanup error:", error);
    }

    return result;
  }

  /**
   * Delete prayed prayers older than X days
   */
  private static async cleanupPrayedPrayers(daysToKeep: number): Promise<number> {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const allPrayers = await PrayerService.getAllPrayers();
    let deleted = 0;

    for (const prayer of allPrayers) {
      // Only delete prayers that are marked as prayed AND older than retention period
      if (prayer.isPrayed && prayer.prayedAt && prayer.prayedAt < cutoffDate) {
        await PrayerService.deletePrayer(prayer.id);
        deleted++;
      }
    }

    return deleted;
  }
}
