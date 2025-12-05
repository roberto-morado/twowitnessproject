/**
 * Prayer Controller
 * Handles prayer submission, public prayers list, and admin management
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { RateLimitService } from "../services/ratelimit.service.ts";
import { CsrfService } from "../services/csrf.service.ts";
import { PrayerService, type PrayerSubmission } from "../services/prayer.service.ts";
import { renderPray } from "../views/pray.view.ts";
import { renderPrayers } from "../views/prayers.view.ts";
import { renderAdminPrayers } from "../views/admin/prayers.view.ts";

export class PrayerController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/pray",
        handler: this.showPrayForm.bind(this),
      },
      {
        method: "POST",
        pattern: "/pray",
        handler: this.submitPrayer.bind(this),
      },
      {
        method: "GET",
        pattern: "/prayers",
        handler: this.showPublicPrayers.bind(this),
      },
      {
        method: "GET",
        pattern: "/dashboard/prayers",
        handler: this.showAdminPrayers.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/prayers\/([^\/]+)\/mark-prayed$/,
        handler: this.markPrayerAsPrayed.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/prayers\/([^\/]+)\/delete$/,
        handler: this.deletePrayer.bind(this),
      },
    ];
  }

  /**
   * GET /pray - Show prayer submission form
   */
  private showPrayForm(): Response {
    // Generate CSRF token for the form
    const csrfToken = CsrfService.generateToken();
    const html = renderPray({ csrfToken });

    // Return HTML with CSRF cookie
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
      },
    });
  }

  /**
   * POST /pray - Submit prayer request
   */
  private async submitPrayer(request: Request): Promise<Response> {
    try {
      const formData = await request.formData();

      // Validate CSRF token first
      const csrfValid = await CsrfService.validateFromRequest(request, formData);
      if (!csrfValid) {
        const csrfToken = CsrfService.generateToken();
        const html = renderPray({
          error: "Invalid security token. Please try again.",
          csrfToken,
        });
        return new Response(html, {
          status: 403,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      // Get IP address for rate limiting
      const ip = RateLimitService.getIpFromRequest(request);

      // Check rate limit
      const rateLimitResult = await RateLimitService.checkAndRecord(ip, "pray", "prayer");
      if (!rateLimitResult.allowed) {
        const info = RateLimitService.getRateLimitInfo("prayer");
        const retryMessage = rateLimitResult.retryAfter
          ? ` Please try again in ${rateLimitResult.retryAfter} seconds.`
          : "";
        const csrfToken = CsrfService.generateToken();
        const html = renderPray({
          error: `Too many prayer submissions. Maximum ${info.maxAttempts} submissions per ${info.windowMinutes} minutes.${retryMessage}`,
          csrfToken,
        });
        return new Response(html, {
          status: 429,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      // Honeypot spam protection - if "website" field is filled, it's a bot
      const honeypot = formData.get("website")?.toString();
      if (honeypot) {
        // Silently reject spam (don't tell the bot it failed)
        console.log("Honeypot triggered - potential spam blocked");
        const csrfToken = CsrfService.generateToken();
        const html = renderPray({ success: true, csrfToken });
        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      const name = formData.get("name")?.toString();
      const email = formData.get("email")?.toString();
      const prayer = formData.get("prayer")?.toString();
      const isPublic = formData.get("isPublic") === "true";

      if (!prayer || prayer.trim().length === 0) {
        const csrfToken = CsrfService.generateToken();
        const html = renderPray({
          error: "Prayer text is required",
          csrfToken,
        });
        return new Response(html, {
          status: 400,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      const submission: PrayerSubmission = {
        name,
        email,
        prayer,
        isPublic,
      };

      await PrayerService.submitPrayer(submission);

      const csrfToken = CsrfService.generateToken();
      const html = renderPray({ success: true, csrfToken });
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
        },
      });
    } catch (error) {
      console.error("Prayer submission error:", error);
      const csrfToken = CsrfService.generateToken();
      const html = renderPray({
        error: "An error occurred while submitting your prayer",
        csrfToken,
      });
      return new Response(html, {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
        },
      });
    }
  }

  /**
   * GET /prayers - Show public prayers with pagination
   */
  private async showPublicPrayers(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const perPage = 10;

      const { prayers, total, pages } = await PrayerService.getPrayersPage(
        page,
        perPage,
        true // public only
      );

      const html = renderPrayers({
        prayers,
        page,
        totalPages: pages,
        total,
      });

      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Public prayers error:", error);
      return ResponseFactory.error("An error occurred while loading prayers");
    }
  }

  /**
   * GET /dashboard/prayers - Admin prayer management
   */
  private async showAdminPrayers(request: Request): Promise<Response> {
    // Check authentication
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);

    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const url = new URL(request.url);
      const filter = url.searchParams.get("filter") as "all" | "public" | "private" | "prayed" || "all";

      const prayers = await PrayerService.getAllPrayers();

      const html = renderAdminPrayers({
        prayers,
        filter,
        username,
      });

      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Admin prayers error:", error);
      return ResponseFactory.error("An error occurred while loading prayers");
    }
  }

  /**
   * POST /dashboard/prayers/:id/mark-prayed - Mark prayer as prayed
   */
  private async markPrayerAsPrayed(
    request: Request,
    params?: Record<string, string>
  ): Promise<Response> {
    // Check authentication
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);

    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const prayerId = params?.["0"]; // Regex capture group
      if (!prayerId) {
        return ResponseFactory.error("Invalid prayer ID", 400);
      }
      const success = await PrayerService.markAsPrayed(prayerId);

      if (!success) {
        return ResponseFactory.error("Prayer not found", 404);
      }

      return ResponseFactory.redirect("/dashboard/prayers");
    } catch (error) {
      console.error("Mark prayed error:", error);
      return ResponseFactory.error("An error occurred while updating prayer");
    }
  }

  /**
   * POST /dashboard/prayers/:id/delete - Delete prayer
   */
  private async deletePrayer(
    request: Request,
    params?: Record<string, string>
  ): Promise<Response> {
    // Check authentication
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);

    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const prayerId = params?.["0"]; // Regex capture group
      if (!prayerId) {
        return ResponseFactory.error("Invalid prayer ID", 400);
      }
      const success = await PrayerService.deletePrayer(prayerId);

      if (!success) {
        return ResponseFactory.error("Prayer not found", 404);
      }

      return ResponseFactory.redirect("/dashboard/prayers");
    } catch (error) {
      console.error("Delete prayer error:", error);
      return ResponseFactory.error("An error occurred while deleting prayer");
    }
  }
}
