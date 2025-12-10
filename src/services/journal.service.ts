/**
 * Journal Service
 * Manages ministry journal entries in Deno KV
 */

import type {
  JournalEntry,
  JournalEntryWithLocation,
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
} from "../models/journal.model.ts";
import { LocationService } from "./location.service.ts";

export class JournalService {
  private static kv: Deno.Kv;

  /**
   * Initialize KV connection
   */
  static async initialize(): Promise<void> {
    this.kv = await Deno.openKv();
  }

  /**
   * Get KV instance (lazy initialization)
   */
  private static async getKv(): Promise<Deno.Kv> {
    if (!this.kv) {
      await this.initialize();
    }
    return this.kv;
  }

  /**
   * Generate URL-friendly slug from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Generate excerpt from content (first ~200 chars)
   */
  static generateExcerpt(content: string): string {
    const plainText = content.replace(/\n+/g, " ").trim();
    if (plainText.length <= 200) {
      return plainText;
    }
    return plainText.substring(0, 200).trim() + "...";
  }

  /**
   * Create a new journal entry
   */
  static async create(input: CreateJournalEntryInput): Promise<JournalEntry> {
    const kv = await this.getKv();
    const id = crypto.randomUUID();
    const slug = this.generateSlug(input.title);
    const excerpt = this.generateExcerpt(input.content);
    const now = new Date();

    const entry: JournalEntry = {
      id,
      slug,
      title: input.title,
      content: input.content,
      excerpt,
      date: input.date,
      locationId: input.locationId,
      isFeatured: input.isFeatured ?? false,
      isPublished: input.isPublished ?? false,
      createdAt: now,
      updatedAt: now,
    };

    // Store entry
    await kv.set(["journal", id], entry);

    // Store index by slug for lookups
    await kv.set(["journal_by_slug", slug], entry);

    // Store index by date for sorting
    await kv.set(["journal_by_date", entry.date.getTime(), id], entry);

    // If featured, add to featured index
    if (entry.isFeatured) {
      await kv.set(["journal_featured", id], entry);
    }

    // If published, add to published index
    if (entry.isPublished) {
      await kv.set(["journal_published", entry.date.getTime(), id], entry);
    }

    return entry;
  }

  /**
   * Get entry by ID
   */
  static async getById(id: string): Promise<JournalEntry | null> {
    const kv = await this.getKv();
    const result = await kv.get<JournalEntry>(["journal", id]);
    return result.value;
  }

  /**
   * Get entry by slug
   */
  static async getBySlug(slug: string): Promise<JournalEntry | null> {
    const kv = await this.getKv();
    const result = await kv.get<JournalEntry>(["journal_by_slug", slug]);
    return result.value;
  }

  /**
   * Get entry with location details populated
   */
  static async getBySlugWithLocation(
    slug: string
  ): Promise<JournalEntryWithLocation | null> {
    const entry = await this.getBySlug(slug);
    if (!entry) return null;

    if (entry.locationId) {
      const location = await LocationService.getById(entry.locationId);
      if (location) {
        return {
          ...entry,
          location: {
            city: location.city,
            state: location.state,
            stateCode: location.stateCode,
          },
        };
      }
    }

    return { ...entry };
  }

  /**
   * Get all published entries sorted by date (most recent first)
   */
  static async getPublished(limit?: number): Promise<JournalEntry[]> {
    const kv = await this.getKv();
    const entries: JournalEntry[] = [];

    const results = kv.list<JournalEntry>({
      prefix: ["journal_published"],
    });

    for await (const entry of results) {
      entries.push(entry.value);
      if (limit && entries.length >= limit) break;
    }

    // Reverse to get most recent first
    return entries.reverse();
  }

  /**
   * Get published entries with pagination
   */
  static async getPublishedPaginated(
    page: number = 1,
    perPage: number = 10
  ): Promise<{ entries: JournalEntry[]; total: number; totalPages: number }> {
    const allEntries = await this.getPublished();
    const total = allEntries.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const entries = allEntries.slice(start, end);

    return { entries, total, totalPages };
  }

  /**
   * Get featured entries (for homepage)
   */
  static async getFeatured(limit: number = 2): Promise<JournalEntry[]> {
    const kv = await this.getKv();
    const entries: JournalEntry[] = [];

    const results = kv.list<JournalEntry>({ prefix: ["journal_featured"] });

    for await (const entry of results) {
      if (entry.value.isPublished) {
        entries.push(entry.value);
        if (entries.length >= limit) break;
      }
    }

    // Sort by date, most recent first
    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get all entries (admin view)
   */
  static async getAll(): Promise<JournalEntry[]> {
    const kv = await this.getKv();
    const entries: JournalEntry[] = [];

    const results = kv.list<JournalEntry>({ prefix: ["journal_by_date"] });
    for await (const entry of results) {
      entries.push(entry.value);
    }

    return entries.reverse();
  }

  /**
   * Get entries by location
   */
  static async getByLocation(locationId: string): Promise<JournalEntry[]> {
    const all = await this.getPublished();
    return all.filter((entry) => entry.locationId === locationId);
  }

  /**
   * Update journal entry
   */
  static async update(
    id: string,
    input: UpdateJournalEntryInput
  ): Promise<JournalEntry | null> {
    const kv = await this.getKv();
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    // Regenerate slug if title changed
    const slug =
      input.title && input.title !== existing.title
        ? this.generateSlug(input.title)
        : existing.slug;

    // Regenerate excerpt if content changed
    const excerpt =
      input.content && input.content !== existing.content
        ? this.generateExcerpt(input.content)
        : existing.excerpt;

    const updated: JournalEntry = {
      ...existing,
      ...input,
      slug,
      excerpt,
      updatedAt: new Date(),
    };

    // Update main record
    await kv.set(["journal", id], updated);

    // Update slug index if changed
    if (slug !== existing.slug) {
      await kv.delete(["journal_by_slug", existing.slug]);
      await kv.set(["journal_by_slug", slug], updated);
    } else {
      await kv.set(["journal_by_slug", slug], updated);
    }

    // Update date index if date changed
    if (input.date && input.date.getTime() !== existing.date.getTime()) {
      await kv.delete(["journal_by_date", existing.date.getTime(), id]);
      await kv.set(["journal_by_date", updated.date.getTime(), id], updated);
    } else {
      await kv.set(["journal_by_date", updated.date.getTime(), id], updated);
    }

    // Update featured index
    if (updated.isFeatured && !existing.isFeatured) {
      await kv.set(["journal_featured", id], updated);
    } else if (!updated.isFeatured && existing.isFeatured) {
      await kv.delete(["journal_featured", id]);
    } else if (updated.isFeatured) {
      await kv.set(["journal_featured", id], updated);
    }

    // Update published index
    if (updated.isPublished && !existing.isPublished) {
      await kv.set(["journal_published", updated.date.getTime(), id], updated);
    } else if (!updated.isPublished && existing.isPublished) {
      await kv.delete(["journal_published", existing.date.getTime(), id]);
    } else if (updated.isPublished) {
      // Update in case date changed
      if (input.date && input.date.getTime() !== existing.date.getTime()) {
        await kv.delete(["journal_published", existing.date.getTime(), id]);
      }
      await kv.set(["journal_published", updated.date.getTime(), id], updated);
    }

    return updated;
  }

  /**
   * Delete journal entry
   */
  static async delete(id: string): Promise<boolean> {
    const kv = await this.getKv();
    const existing = await this.getById(id);

    if (!existing) {
      return false;
    }

    // Delete main record
    await kv.delete(["journal", id]);

    // Delete slug index
    await kv.delete(["journal_by_slug", existing.slug]);

    // Delete date index
    await kv.delete(["journal_by_date", existing.date.getTime(), id]);

    // Delete featured index if featured
    if (existing.isFeatured) {
      await kv.delete(["journal_featured", id]);
    }

    // Delete published index if published
    if (existing.isPublished) {
      await kv.delete(["journal_published", existing.date.getTime(), id]);
    }

    return true;
  }
}
