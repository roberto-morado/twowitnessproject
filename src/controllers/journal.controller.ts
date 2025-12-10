/**
 * Journal Controller
 * Handles ministry journal pages
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderJournalListPage } from "@views/journal-list.view.ts";
import { renderJournalEntryPage } from "@views/journal-entry.view.ts";
import { JournalService } from "../services/journal.service.ts";

export class JournalController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/journal",
        handler: this.index.bind(this),
      },
      {
        method: "GET",
        pattern: "/journal/:slug",
        handler: this.show.bind(this),
      },
    ];
  }

  /**
   * Journal list page with pagination
   */
  private async index(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const perPage = 10;

      const { entries, total, totalPages } = await JournalService.getPublishedPaginated(page, perPage);
      const html = renderJournalListPage(entries, page, totalPages, total);
      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Journal list error:", error);
      return ResponseFactory.error("Failed to load journal entries");
    }
  }

  /**
   * Individual journal entry page
   */
  private async show(_request: Request, params: Record<string, string>): Promise<Response> {
    try {
      const slug = params.slug;
      if (!slug) {
        return ResponseFactory.notFound();
      }

      const entry = await JournalService.getBySlugWithLocation(slug);
      if (!entry) {
        return ResponseFactory.notFound();
      }

      // Only show published entries
      if (!entry.isPublished) {
        return ResponseFactory.notFound();
      }

      const html = renderJournalEntryPage(entry);
      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Journal entry error:", error);
      return ResponseFactory.error("Failed to load journal entry");
    }
  }
}
