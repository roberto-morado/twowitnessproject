/**
 * Settings Controller
 * Handles admin settings configuration (Discord webhooks, Email SMTP, etc.)
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { DiscordService } from "../services/discord.service.ts";
import { EmailConfigService, EmailService } from "../services/email.service.ts";
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
      {
        method: "POST",
        pattern: "/dashboard/settings/email",
        handler: this.saveEmail.bind(this),
      },
      {
        method: "POST",
        pattern: "/dashboard/settings/test-email",
        handler: this.testEmail.bind(this),
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
      const url = new URL(request.url);

      // Get current configurations
      const [adminWebhook, communityWebhook, emailConfig] = await Promise.all([
        DiscordService.getWebhook("admin"),
        DiscordService.getWebhook("community"),
        EmailConfigService.getConfig(),
      ]);

      // Generate CSRF token
      const csrfToken = CsrfService.generateToken();

      // Parse success/error messages
      let successMessage: string | undefined;
      let errorMessage: string | undefined;

      const successParam = url.searchParams.get("success");
      if (successParam === "1") {
        successMessage = "Webhook settings saved successfully!";
      } else if (successParam === "email_saved") {
        successMessage = "Email settings saved successfully!";
      } else if (successParam === "test_sent") {
        successMessage = "Test email sent successfully! Check your inbox.";
      }

      const errorParam = url.searchParams.get("error");
      if (errorParam) {
        errorMessage = decodeURIComponent(errorParam);
      }

      const html = renderSettings({
        username,
        adminWebhook,
        communityWebhook,
        emailConfig,
        csrfToken,
        successMessage,
        errorMessage,
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
        return ResponseFactory.json({ success: false, error: "Invalid security token" }, { status: 403 });
      }

      const type = formData.get("type")?.toString() as "admin" | "community";
      if (!type || (type !== "admin" && type !== "community")) {
        return ResponseFactory.json({ success: false, error: "Invalid webhook type" }, { status: 400 });
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
      return ResponseFactory.json({ success: false, error: "An error occurred" }, { status: 500 });
    }
  }

  /**
   * POST /dashboard/settings/email - Save email configuration
   */
  private async saveEmail(request: Request): Promise<Response> {
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
        return ResponseFactory.redirect("/dashboard/settings?error=invalid_token");
      }

      const smtpHost = formData.get("smtpHost")?.toString();
      const smtpPort = parseInt(formData.get("smtpPort")?.toString() || "587");
      const smtpUsername = formData.get("smtpUsername")?.toString();
      const smtpPassword = formData.get("smtpPassword")?.toString();
      const fromEmail = formData.get("fromEmail")?.toString();
      const fromName = formData.get("fromName")?.toString();
      const isEnabled = formData.get("isEnabled") === "true";
      const useTLS = formData.get("useTLS") === "true";

      // Validate required fields
      if (!smtpHost || !smtpUsername || !fromEmail || !fromName) {
        return ResponseFactory.redirect("/dashboard/settings?error=missing_fields");
      }

      // Get existing config to preserve password if not provided
      const existingConfig = await EmailConfigService.getConfig();
      const finalPassword = smtpPassword || existingConfig?.smtpPassword || "";

      if (!smtpPassword && !existingConfig) {
        return ResponseFactory.redirect("/dashboard/settings?error=password_required");
      }

      // Build test configuration
      const testConfig = {
        id: "default",
        smtpHost,
        smtpPort,
        smtpUsername,
        smtpPassword: finalPassword,
        fromEmail,
        fromName,
        isEnabled,
        useTLS,
        updatedAt: new Date(),
        updatedBy: username,
      };

      // Test connection BEFORE saving to database
      const testResult = await EmailService.testConnection(testConfig);

      if (!testResult.success) {
        const errorMsg = encodeURIComponent(`Connection test failed: ${testResult.error || "Unknown error"}`);
        return ResponseFactory.redirect(`/dashboard/settings?error=${errorMsg}`);
      }

      // Connection test passed - save configuration
      await EmailConfigService.saveConfig({
        smtpHost,
        smtpPort,
        smtpUsername,
        smtpPassword: finalPassword,
        fromEmail,
        fromName,
        isEnabled,
        useTLS,
        updatedBy: username,
      });

      // Redirect with success message
      return ResponseFactory.redirect("/dashboard/settings?success=email_saved");
    } catch (error) {
      console.error("Save email settings error:", error);
      return ResponseFactory.redirect("/dashboard/settings?error=save_failed");
    }
  }

  /**
   * POST /dashboard/settings/test-email - Send test email
   */
  private async testEmail(request: Request): Promise<Response> {
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
        return ResponseFactory.json({ success: false, error: "Invalid security token" }, { status: 403 });
      }

      const testEmail = formData.get("testEmail")?.toString();

      if (!testEmail) {
        return ResponseFactory.json({ success: false, error: "Email address is required" }, { status: 400 });
      }

      // Send test email
      const result = await EmailService.sendTestEmail(testEmail);

      return ResponseFactory.json({
        success: result.success,
        message: result.success
          ? "Test email sent successfully! Check your inbox."
          : result.error || "Failed to send test email",
      });
    } catch (error) {
      console.error("Test email error:", error);
      return ResponseFactory.json({ success: false, error: "An error occurred" }, { status: 500 });
    }
  }
}
