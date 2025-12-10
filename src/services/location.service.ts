/**
 * Location Service
 * Manages ministry journey locations in Deno KV
 */

import type {
  Location,
  CreateLocationInput,
  UpdateLocationInput,
} from "../models/location.model.ts";

export class LocationService {
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
   * Create a new location
   */
  static async create(input: CreateLocationInput): Promise<Location> {
    const kv = await this.getKv();
    const id = crypto.randomUUID();
    const now = new Date();

    // If this location is marked as current, unmark all others
    if (input.isCurrent) {
      await this.unmarkAllCurrent();
    }

    const location: Location = {
      id,
      city: input.city,
      state: input.state,
      stateCode: input.stateCode,
      latitude: input.latitude,
      longitude: input.longitude,
      visitedDate: input.visitedDate,
      isCurrent: input.isCurrent ?? false,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };

    // Store location
    await kv.set(["locations", id], location);

    // Store index by date for sorting
    await kv.set(
      ["locations_by_date", location.visitedDate.getTime(), id],
      location
    );

    // If current, store in special key
    if (location.isCurrent) {
      await kv.set(["locations", "current"], location);
    }

    return location;
  }

  /**
   * Get location by ID
   */
  static async getById(id: string): Promise<Location | null> {
    const kv = await this.getKv();
    const result = await kv.get<Location>(["locations", id]);
    return result.value;
  }

  /**
   * Get current location
   */
  static async getCurrent(): Promise<Location | null> {
    const kv = await this.getKv();
    const result = await kv.get<Location>(["locations", "current"]);
    return result.value;
  }

  /**
   * Get all locations sorted by date (most recent first)
   */
  static async getAll(): Promise<Location[]> {
    const kv = await this.getKv();
    const locations: Location[] = [];

    const entries = kv.list<Location>({ prefix: ["locations_by_date"] });
    for await (const entry of entries) {
      locations.push(entry.value);
    }

    // Reverse to get most recent first
    return locations.reverse();
  }

  /**
   * Update location
   */
  static async update(
    id: string,
    input: UpdateLocationInput
  ): Promise<Location | null> {
    const kv = await this.getKv();
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    // If marking as current, unmark all others
    if (input.isCurrent && !existing.isCurrent) {
      await this.unmarkAllCurrent();
    }

    const updated: Location = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };

    // Update main record
    await kv.set(["locations", id], updated);

    // Update date index if date changed
    if (input.visitedDate && input.visitedDate.getTime() !== existing.visitedDate.getTime()) {
      // Remove old date index
      await kv.delete(["locations_by_date", existing.visitedDate.getTime(), id]);
      // Add new date index
      await kv.set(["locations_by_date", updated.visitedDate.getTime(), id], updated);
    } else {
      // Just update existing date index
      await kv.set(["locations_by_date", updated.visitedDate.getTime(), id], updated);
    }

    // Update current location key if needed
    if (updated.isCurrent) {
      await kv.set(["locations", "current"], updated);
    } else if (existing.isCurrent && !updated.isCurrent) {
      await kv.delete(["locations", "current"]);
    }

    return updated;
  }

  /**
   * Delete location
   */
  static async delete(id: string): Promise<boolean> {
    const kv = await this.getKv();
    const existing = await this.getById(id);

    if (!existing) {
      return false;
    }

    // Delete main record
    await kv.delete(["locations", id]);

    // Delete date index
    await kv.delete(["locations_by_date", existing.visitedDate.getTime(), id]);

    // Delete current marker if this was current
    if (existing.isCurrent) {
      await kv.delete(["locations", "current"]);
    }

    return true;
  }

  /**
   * Unmark all locations as current (helper method)
   */
  private static async unmarkAllCurrent(): Promise<void> {
    const kv = await this.getKv();
    const locations = await this.getAll();

    for (const location of locations) {
      if (location.isCurrent) {
        const updated = { ...location, isCurrent: false, updatedAt: new Date() };
        await kv.set(["locations", location.id], updated);
        await kv.set(
          ["locations_by_date", location.visitedDate.getTime(), location.id],
          updated
        );
      }
    }

    await kv.delete(["locations", "current"]);
  }

  /**
   * Get count of all locations
   */
  static async getCount(): Promise<number> {
    const locations = await this.getAll();
    return locations.length;
  }
}
