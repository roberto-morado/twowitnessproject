/**
 * Prayer Service
 * Handles prayer request storage and retrieval
 */

import { db, KvKeys } from "./db.service.ts";

export interface PrayerRequest {
  id: string;
  name: string | null;
  email: string | null;
  prayer: string;
  isPublic: boolean;
  isPrayed: boolean;
  createdAt: number;
  prayedAt: number | null;
}

export interface PrayerSubmission {
  name?: string;
  email?: string;
  prayer: string;
  isPublic: boolean;
}

export class PrayerService {
  /**
   * Generate unique prayer ID
   */
  private static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Submit a new prayer request
   */
  static async submitPrayer(submission: PrayerSubmission): Promise<string> {
    const id = this.generateId();
    const prayer: PrayerRequest = {
      id,
      name: submission.name?.trim() || null,
      email: submission.email?.trim() || null,
      prayer: submission.prayer.trim(),
      isPublic: submission.isPublic,
      isPrayed: false,
      createdAt: Date.now(),
      prayedAt: null,
    };

    await db.set(KvKeys.prayer(id), prayer);
    return id;
  }

  /**
   * Get all prayers (admin only)
   */
  static async getAllPrayers(): Promise<PrayerRequest[]> {
    const entries = await db.list<PrayerRequest>(KvKeys.allPrayers());

    // Sort by creation date (newest first)
    return entries
      .map(entry => entry.value)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get public prayers only
   */
  static async getPublicPrayers(): Promise<PrayerRequest[]> {
    const allPrayers = await this.getAllPrayers();
    return allPrayers.filter(p => p.isPublic);
  }

  /**
   * Get prayer by ID
   */
  static async getPrayerById(id: string): Promise<PrayerRequest | null> {
    return await db.get<PrayerRequest>(KvKeys.prayer(id));
  }

  /**
   * Mark prayer as prayed
   */
  static async markAsPrayed(id: string): Promise<boolean> {
    const prayer = await this.getPrayerById(id);
    if (!prayer) {
      return false;
    }

    prayer.isPrayed = true;
    prayer.prayedAt = Date.now();
    await db.set(KvKeys.prayer(id), prayer);
    return true;
  }

  /**
   * Delete prayer
   */
  static async deletePrayer(id: string): Promise<boolean> {
    const prayer = await this.getPrayerById(id);
    if (!prayer) {
      return false;
    }

    await db.delete(KvKeys.prayer(id));
    return true;
  }

  /**
   * Get prayers with pagination
   */
  static async getPrayersPage(
    page: number,
    perPage: number,
    publicOnly: boolean = true
  ): Promise<{ prayers: PrayerRequest[]; total: number; pages: number }> {
    const allPrayers = publicOnly
      ? await this.getPublicPrayers()
      : await this.getAllPrayers();

    const total = allPrayers.length;
    const pages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const prayers = allPrayers.slice(start, end);

    return { prayers, total, pages };
  }

  /**
   * Format time ago (e.g., "2 hours ago", "3 days ago")
   */
  static formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "just now";
  }
}
