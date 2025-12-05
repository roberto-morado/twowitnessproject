/**
 * Settings Controller
 * Handles admin settings configuration (Discord webhooks, etc.)
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { DiscordService } from "../services/discord.service.ts";
import { CsrfService } from "../services/csrf.service.ts";
import { renderSettings } from "../views/admin/settings.view.ts";

export class SettingsController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/dashboard/settings",
        handler: this.showSettings.bind(this),
      },
      {
        method: "POST",
        pattern: "/dashboard/settings/webhooks",
        handler: this.saveWebhooks.bind(this),
      },
      {
        method: "POST",
        pattern: "/dashboard/settings/test-webhook",
        handler: this.testWebhook.bind(this),
      },
    ];
  }

  /**
   * GET /dashboard/settings - Show settings page
   */
  private async showSettings(request: Request): Promise<Response> {
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
      // Get current webhook configurations
      const adminWebhook = await DiscordService.getWebhook("admin");
      const communityWebhook = await DiscordService.getWebhook("community");

      // Generate CSRF token
      const csrfToken = CsrfService.generateToken();

      const html = renderSettings({
        username,
        adminWebhook,
        communityWebhook,
        csrfToken,
      });

      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
        },
      });
    } catch (error) {
      console.error("Settings error:", error);
      return ResponseFactory.error("An error occurred while loading settings");
    }
  }

  /**
   * POST /dashboard/settings/webhooks - Save webhook configuration
   */
  private async saveWebhooks(request: Request): Promise<Response> {
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
      const formData = await request.formData();

      // Validate CSRF token
      const csrfValid = await CsrfService.validateFromRequest(request, formData);
      if (!csrfValid) {
        return ResponseFactory.error("Invalid security token", 403);
      }

      // Save admin webhook
      const adminUrl = formData.get("admin_webhook_url")?.toString()?.trim() || "";
      const adminEnabled = formData.get("admin_webhook_enabled") === "true";
      await DiscordService.saveWebhook("admin", {
        name: "Admin Webhook",
        url: adminUrl,
        enabled: adminEnabled,
      });

      // Save community webhook
      const communityUrl = formData.get("community_webhook_url")?.toString()?.trim() || "";
      const communityEnabled = formData.get("community_webhook_enabled") === "true";
      await DiscordService.saveWebhook("community", {
        name: "Community Webhook",
        url: communityUrl,
        enabled: communityEnabled,
      });

      // Redirect back with success message
      return ResponseFactory.redirect("/dashboard/settings?success=1");
    } catch (error) {
      console.error("Save webhooks error:", error);
      return ResponseFactory.error("An error occurred while saving settings");
    }
  }

  /**
   * POST /dashboard/settings/test-webhook - Test webhook
   */
  private async testWebhook(request: Request): Promise<Response> {
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
      const formData = await request.formData();

      // Validate CSRF token
      const csrfValid = await CsrfService.validateFromRequest(request, formData);
      if (!csrfValid) {
        return ResponseFactory.json({ success: false, error: "Invalid security token" }, 403);
      }

      const type = formData.get("type")?.toString() as "admin" | "community";
      if (!type || (type !== "admin" && type !== "community")) {
        return ResponseFactory.json({ success: false, error: "Invalid webhook type" }, 400);
      }

      const success = await DiscordService.testWebhook(type);

      return ResponseFactory.json({
        success,
        message: success
          ? "Test message sent successfully!"
          : "Failed to send test message. Check your webhook URL.",
      });
    } catch (error) {
      console.error("Test webhook error:", error);
      return ResponseFactory.json({ success: false, error: "An error occurred" }, 500);
    }
  }
}
