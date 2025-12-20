/**
 * Testimonial Service
 * Handles testimonial storage, approval, and key generation
 */

import { db, KvKeys } from "./db.service.ts";
import { DiscordService } from "./discord.service.ts";

export interface Testimonial {
  id: string;
  name: string;
  testimony: string;
  location?: string; // City/State, optional
  approved: boolean;
  approvedAt: number | null;
  createdAt: number;
  keyId?: string; // ID of the key used for submission
}

export interface TestimonialKey {
  id: string;
  name: string; // Descriptive name for admin tracking
  createdAt: number;
  createdBy: string; // Admin username who created it
  used: boolean;
  usedAt: number | null;
  expiresAt: number | null; // null = never expires
}

export interface TestimonialSubmission {
  name: string;
  testimony: string;
  location?: string;
  keyId: string;
}

export class TestimonialService {
  /**
   * Generate unique testimonial ID
   */
  private static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Create a new testimonial submission key
   */
  static async createKey(
    name: string,
    createdBy: string,
    expiresInDays?: number
  ): Promise<TestimonialKey> {
    const id = this.generateId();
    const now = Date.now();

    const key: TestimonialKey = {
      id,
      name,
      createdAt: now,
      createdBy,
      used: false,
      usedAt: null,
      expiresAt: expiresInDays
        ? now + (expiresInDays * 24 * 60 * 60 * 1000)
        : null,
    };

    await db.set(KvKeys.testimonialKey(id), key);
    return key;
  }

  /**
   * Validate a testimonial key
   * Returns key if valid, null if invalid/expired/used
   */
  static async validateKey(keyId: string): Promise<TestimonialKey | null> {
    const key = await db.get<TestimonialKey>(KvKeys.testimonialKey(keyId));

    if (!key) {
      return null; // Key doesn't exist
    }

    if (key.used) {
      return null; // Already used
    }

    if (key.expiresAt && Date.now() > key.expiresAt) {
      return null; // Expired
    }

    return key;
  }

  /**
   * Mark a key as used
   */
  private static async markKeyAsUsed(keyId: string): Promise<void> {
    const key = await db.get<TestimonialKey>(KvKeys.testimonialKey(keyId));
    if (key) {
      key.used = true;
      key.usedAt = Date.now();
      await db.set(KvKeys.testimonialKey(keyId), key);
    }
  }

  /**
   * Submit a new testimonial (requires valid key)
   */
  static async submitTestimonial(submission: TestimonialSubmission): Promise<string | null> {
    // Validate key
    const key = await this.validateKey(submission.keyId);
    if (!key) {
      return null; // Invalid/expired/used key
    }

    const id = this.generateId();
    const testimonial: Testimonial = {
      id,
      name: submission.name.trim(),
      testimony: submission.testimony.trim(),
      location: submission.location?.trim() || undefined,
      approved: false,
      approvedAt: null,
      createdAt: Date.now(),
      keyId: submission.keyId,
    };

    await db.set(KvKeys.testimonial(id), testimonial);

    // Mark key as used
    await this.markKeyAsUsed(submission.keyId);

    // Send Discord notification
    DiscordService.notifyAdminNewTestimonial({
      id: testimonial.id,
      name: testimonial.name,
      testimony: testimonial.testimony,
    }).catch(err => console.error("Discord notification failed:", err));

    return id;
  }

  /**
   * Get all testimonials (admin only)
   */
  static async getAllTestimonials(): Promise<Testimonial[]> {
    const entries = await db.list<Testimonial>(KvKeys.allTestimonials());

    // Sort by creation date (newest first)
    return entries
      .map(entry => entry.value)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get approved testimonials only (for public display)
   */
  static async getApprovedTestimonials(): Promise<Testimonial[]> {
    const allTestimonials = await this.getAllTestimonials();
    return allTestimonials.filter(t => t.approved);
  }

  /**
   * Get testimonial by ID
   */
  static async getTestimonialById(id: string): Promise<Testimonial | null> {
    return await db.get<Testimonial>(KvKeys.testimonial(id));
  }

  /**
   * Approve testimonial
   */
  static async approveTestimonial(id: string): Promise<boolean> {
    const testimonial = await this.getTestimonialById(id);
    if (!testimonial) {
      return false;
    }

    testimonial.approved = true;
    testimonial.approvedAt = Date.now();
    await db.set(KvKeys.testimonial(id), testimonial);
    return true;
  }

  /**
   * Delete testimonial
   */
  static async deleteTestimonial(id: string): Promise<boolean> {
    const testimonial = await this.getTestimonialById(id);
    if (!testimonial) {
      return false;
    }

    await db.delete(KvKeys.testimonial(id));
    return true;
  }

  /**
   * Get all testimonial keys (admin only)
   */
  static async getAllKeys(): Promise<TestimonialKey[]> {
    const entries = await db.list<TestimonialKey>(KvKeys.allTestimonialKeys());

    // Sort by creation date (newest first)
    return entries
      .map(entry => entry.value)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Delete a testimonial submission key
   */
  static async deleteKey(keyId: string): Promise<boolean> {
    const key = await db.get<TestimonialKey>(KvKeys.testimonialKey(keyId));
    if (!key) {
      return false;
    }

    await db.delete(KvKeys.testimonialKey(keyId));
    return true;
  }

  /**
   * Get testimonials with pagination
   */
  static async getTestimonialsPage(
    page: number,
    perPage: number,
    approvedOnly: boolean = true
  ): Promise<{ testimonials: Testimonial[]; total: number; pages: number }> {
    const allTestimonials = approvedOnly
      ? await this.getApprovedTestimonials()
      : await this.getAllTestimonials();

    const total = allTestimonials.length;
    const pages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const testimonials = allTestimonials.slice(start, end);

    return { testimonials, total, pages };
  }

  /**
   * Generate SMS link for sharing testimonial key
   */
  static generateSMSLink(phoneNumber: string, keyId: string, siteUrl: string): string {
    const message = `You've been invited to share your testimony with ${AppConfig.ministry.name}! Click here: ${siteUrl}/testimonials?key=${keyId}`;
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    return `sms:${phoneNumber}?&body=${encodedMessage}`;
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

// Need to import AppConfig for SMS link generation
import { AppConfig } from "../config/app.config.ts";
