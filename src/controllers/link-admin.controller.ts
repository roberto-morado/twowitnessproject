/**
 * Link Admin Controller
 * Handles CRUD operations for links in admin dashboard
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { LinkService } from "../services/link.service.ts";
import { AuthService } from "../services/auth.service.ts";
import { CsrfService } from "../services/csrf.service.ts";
import { renderAdminLinks } from "../views/admin/links.view.ts";

export class LinkAdminController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/dashboard/links",
        handler: this.showLinksAdmin.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/links\/create$/,
        handler: this.createLink.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/links\/([^\/]+)\/toggle$/,
        handler: this.toggleLink.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/links\/([^\/]+)\/delete$/,
        handler: this.deleteLink.bind(this),
      },
    ];
  }

  /**
   * Show links management page
   */
  private async showLinksAdmin(request: Request): Promise<Response> {
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);
    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    const links = await LinkService.getAllLinks(true); // Include inactive
    const csrfToken = CsrfService.generateToken();

    const html = renderAdminLinks({ links, csrfToken });
    return ResponseFactory.html(html);
  }

  /**
   * Create a new link
   */
  private async createLink(request: Request, params?: Record<string, string>): Promise<Response> {
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);
    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    const formData = await request.formData();

    // CSRF validation
    const csrfValid = await CsrfService.validateFromRequest(request, formData);
    if (!csrfValid) {
      return ResponseFactory.redirect("/dashboard/links?error=" + encodeURIComponent("Invalid security token"));
    }

    const title = formData.get("title")?.toString().trim();
    const url = formData.get("url")?.toString().trim();
    const emoji = formData.get("emoji")?.toString().trim();
    const orderStr = formData.get("order")?.toString().trim();

    if (!title || !url || !emoji) {
      return ResponseFactory.redirect("/dashboard/links?error=" + encodeURIComponent("Title, URL, and Emoji are required"));
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return ResponseFactory.redirect("/dashboard/links?error=" + encodeURIComponent("Invalid URL format"));
    }

    await LinkService.createLink({
      title,
      url,
      emoji,
      order: orderStr ? parseInt(orderStr) : undefined,
    });

    return ResponseFactory.redirect("/dashboard/links?success=" + encodeURIComponent("Link created successfully"));
  }

  /**
   * Toggle link active/inactive
   */
  private async toggleLink(request: Request, params?: Record<string, string>): Promise<Response> {
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);
    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    const linkId = params?.["0"];
    if (!linkId) {
      return ResponseFactory.error("Invalid link ID", 400);
    }

    const formData = await request.formData();

    // CSRF validation
    const csrfValid = await CsrfService.validateFromRequest(request, formData);
    if (!csrfValid) {
      return ResponseFactory.redirect("/dashboard/links?error=" + encodeURIComponent("Invalid security token"));
    }

    const link = await LinkService.getLinkById(linkId);
    if (!link) {
      return ResponseFactory.redirect("/dashboard/links?error=" + encodeURIComponent("Link not found"));
    }

    await LinkService.updateLink(linkId, { isActive: !link.isActive });

    return ResponseFactory.redirect("/dashboard/links?success=" + encodeURIComponent("Link updated successfully"));
  }

  /**
   * Delete a link
   */
  private async deleteLink(request: Request, params?: Record<string, string>): Promise<Response> {
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);
    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    const linkId = params?.["0"];
    if (!linkId) {
      return ResponseFactory.error("Invalid link ID", 400);
    }

    const formData = await request.formData();

    // CSRF validation
    const csrfValid = await CsrfService.validateFromRequest(request, formData);
    if (!csrfValid) {
      return ResponseFactory.redirect("/dashboard/links?error=" + encodeURIComponent("Invalid security token"));
    }

    const success = await LinkService.deleteLink(linkId);
    if (!success) {
      return ResponseFactory.redirect("/dashboard/links?error=" + encodeURIComponent("Link not found"));
    }

    return ResponseFactory.redirect("/dashboard/links?success=" + encodeURIComponent("Link deleted successfully"));
  }
}
