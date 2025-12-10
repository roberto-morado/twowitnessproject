/**
 * Journal Dashboard Controller
 * Admin management for ministry journal entries
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { JournalService } from "../services/journal.service.ts";
import { LocationService } from "../services/location.service.ts";
import { renderAdminJournal } from "../views/admin/journal.view.ts";

export class JournalDashboardController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/dashboard/journal",
        handler: this.index.bind(this),
      },
      {
        method: "POST",
        pattern: "/dashboard/journal/create",
        handler: this.create.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/journal\/([^\/]+)\/edit$/,
        handler: this.edit.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/journal\/([^\/]+)\/update$/,
        handler: this.update.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/journal\/([^\/]+)\/toggle-publish$/,
        handler: this.togglePublish.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/journal\/([^\/]+)\/toggle-feature$/,
        handler: this.toggleFeature.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/journal\/([^\/]+)\/delete$/,
        handler: this.delete.bind(this),
      },
    ];
  }

  /**
   * GET /dashboard/journal - Journal management page
   */
  private async index(request: Request): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const url = new URL(request.url);
      const filter =
        (url.searchParams.get("filter") as "all" | "published" | "drafts" | "featured") ||
        "all";

      const [entries, locations] = await Promise.all([
        JournalService.getAll(),
        LocationService.getAll(),
      ]);

      const html = renderAdminJournal({
        entries,
        locations,
        username: auth.username!,
        filter,
      });
      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Journal dashboard error:", error);
      return ResponseFactory.error("Failed to load journal entries");
    }
  }

  /**
   * POST /dashboard/journal/create - Create new journal entry
   */
  private async create(request: Request): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const formData = await request.formData();

      const title = formData.get("title")?.toString();
      const content = formData.get("content")?.toString();
      const date = new Date(formData.get("date")?.toString() || "");
      const locationId = formData.get("locationId")?.toString() || undefined;
      const isPublished = formData.get("isPublished") === "true";
      const isFeatured = formData.get("isFeatured") === "true";

      if (!title || !content || isNaN(date.getTime())) {
        return ResponseFactory.error("Invalid form data", 400);
      }

      await JournalService.create({
        title,
        content,
        date,
        locationId,
        isPublished,
        isFeatured,
      });

      return ResponseFactory.redirect("/dashboard/journal");
    } catch (error) {
      console.error("Create journal entry error:", error);
      return ResponseFactory.error("Failed to create journal entry");
    }
  }

  /**
   * POST /dashboard/journal/:id/edit - Load journal entry for editing
   */
  private async edit(request: Request, params?: Record<string, string>): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const entryId = params?.["0"];
      if (!entryId) {
        return ResponseFactory.error("Invalid entry ID", 400);
      }

      const entry = await JournalService.getById(entryId);
      if (!entry) {
        return ResponseFactory.error("Entry not found", 404);
      }

      const [entries, locations] = await Promise.all([
        JournalService.getAll(),
        LocationService.getAll(),
      ]);

      const html = renderAdminJournal({
        entries,
        locations,
        username: auth.username!,
        editingEntry: entry,
        filter: "all",
      });
      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Edit journal entry error:", error);
      return ResponseFactory.error("Failed to load journal entry");
    }
  }

  /**
   * POST /dashboard/journal/:id/update - Update journal entry
   */
  private async update(request: Request, params?: Record<string, string>): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const entryId = params?.["0"];
      if (!entryId) {
        return ResponseFactory.error("Invalid entry ID", 400);
      }

      const formData = await request.formData();

      const title = formData.get("title")?.toString();
      const content = formData.get("content")?.toString();
      const date = new Date(formData.get("date")?.toString() || "");
      const locationId = formData.get("locationId")?.toString() || undefined;
      const isPublished = formData.get("isPublished") === "true";
      const isFeatured = formData.get("isFeatured") === "true";

      if (!title || !content || isNaN(date.getTime())) {
        return ResponseFactory.error("Invalid form data", 400);
      }

      await JournalService.update(entryId, {
        title,
        content,
        date,
        locationId,
        isPublished,
        isFeatured,
      });

      return ResponseFactory.redirect("/dashboard/journal");
    } catch (error) {
      console.error("Update journal entry error:", error);
      return ResponseFactory.error("Failed to update journal entry");
    }
  }

  /**
   * POST /dashboard/journal/:id/toggle-publish - Toggle publish status
   */
  private async togglePublish(
    request: Request,
    params?: Record<string, string>
  ): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const entryId = params?.["0"];
      if (!entryId) {
        return ResponseFactory.error("Invalid entry ID", 400);
      }

      const entry = await JournalService.getById(entryId);
      if (!entry) {
        return ResponseFactory.error("Entry not found", 404);
      }

      await JournalService.update(entryId, {
        isPublished: !entry.isPublished,
      });

      return ResponseFactory.redirect("/dashboard/journal");
    } catch (error) {
      console.error("Toggle publish error:", error);
      return ResponseFactory.error("Failed to toggle publish status");
    }
  }

  /**
   * POST /dashboard/journal/:id/toggle-feature - Toggle feature status
   */
  private async toggleFeature(
    request: Request,
    params?: Record<string, string>
  ): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const entryId = params?.["0"];
      if (!entryId) {
        return ResponseFactory.error("Invalid entry ID", 400);
      }

      const entry = await JournalService.getById(entryId);
      if (!entry) {
        return ResponseFactory.error("Entry not found", 404);
      }

      await JournalService.update(entryId, {
        isFeatured: !entry.isFeatured,
      });

      return ResponseFactory.redirect("/dashboard/journal");
    } catch (error) {
      console.error("Toggle feature error:", error);
      return ResponseFactory.error("Failed to toggle feature status");
    }
  }

  /**
   * POST /dashboard/journal/:id/delete - Delete journal entry
   */
  private async delete(request: Request, params?: Record<string, string>): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const entryId = params?.["0"];
      if (!entryId) {
        return ResponseFactory.error("Invalid entry ID", 400);
      }

      const success = await JournalService.delete(entryId);
      if (!success) {
        return ResponseFactory.error("Entry not found", 404);
      }

      return ResponseFactory.redirect("/dashboard/journal");
    } catch (error) {
      console.error("Delete journal entry error:", error);
      return ResponseFactory.error("Failed to delete journal entry");
    }
  }

  /**
   * Check authentication helper
   */
  private async checkAuth(
    request: Request
  ): Promise<{ authenticated: boolean; username?: string }> {
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return { authenticated: false };
    }

    const username = await AuthService.validateSession(sessionId);

    if (!username) {
      return { authenticated: false };
    }

    return { authenticated: true, username };
  }
}
