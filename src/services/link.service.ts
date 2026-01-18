/**
 * Link Service
 * Handles CRUD operations for links
 */

import { db } from "./db.service.ts";
import { KvKeys } from "./db.service.ts";
import type { Link, CreateLinkInput, UpdateLinkInput } from "../models/link.model.ts";

export class LinkService {
  /**
   * Get all links (active only for public, all for admin)
   */
  static async getAllLinks(includeInactive = false): Promise<Link[]> {
    const links: Link[] = [];
    const entries = db.kv.list<Link>({ prefix: ["links"] });

    for await (const entry of entries) {
      const link = entry.value;
      if (includeInactive || link.isActive) {
        links.push(link);
      }
    }

    // Sort by order (ascending)
    return links.sort((a, b) => a.order - b.order);
  }

  /**
   * Get a single link by ID
   */
  static async getLinkById(id: string): Promise<Link | null> {
    const result = await db.get<Link>(KvKeys.link(id));
    return result || null;
  }

  /**
   * Create a new link
   */
  static async createLink(input: CreateLinkInput): Promise<Link> {
    const id = crypto.randomUUID();
    const now = new Date();

    // If no order specified, put it at the end
    const allLinks = await this.getAllLinks(true);
    const maxOrder = allLinks.length > 0 ? Math.max(...allLinks.map(l => l.order)) : 0;

    const link: Link = {
      id,
      title: input.title,
      url: input.url,
      description: input.description,
      emoji: input.emoji,
      order: input.order ?? maxOrder + 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.set(KvKeys.link(id), link);
    return link;
  }

  /**
   * Update an existing link
   */
  static async updateLink(id: string, input: UpdateLinkInput): Promise<Link | null> {
    const existing = await this.getLinkById(id);
    if (!existing) {
      return null;
    }

    const updated: Link = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };

    await db.set(KvKeys.link(id), updated);
    return updated;
  }

  /**
   * Delete a link
   */
  static async deleteLink(id: string): Promise<boolean> {
    const existing = await this.getLinkById(id);
    if (!existing) {
      return false;
    }

    await db.delete(KvKeys.link(id));
    return true;
  }

  /**
   * Reorder links
   * Takes an array of {id, order} and updates all at once
   */
  static async reorderLinks(orders: Array<{ id: string; order: number }>): Promise<void> {
    for (const { id, order } of orders) {
      const link = await this.getLinkById(id);
      if (link) {
        await this.updateLink(id, { order });
      }
    }
  }
}
