/**
 * Email Settings Controller
 * Handles email configuration management in dashboard
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { EmailConfigService, EmailService } from "../services/email.service.ts";
import { renderEmailSettings } from "../views/admin/email-settings.view.ts";

export class EmailSettingsController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/dashboard/email-settings",
        handler: this.index.bind(this),
      },
      {
        method: "POST",
        pattern: "/dashboard/email-settings/save",
        handler: this.save.bind(this),
      },
      {
        method: "POST",
        pattern: "/dashboard/email-settings/test",
        handler: this.test.bind(this),
      },
    ];
  }

  /**
   * GET /dashboard/email-settings - Show email settings page
   */
  private async index(request: Request): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const url = new URL(request.url);
      const config = await EmailConfigService.getConfig();

      // Parse success/error messages from query params
      let successMessage: string | undefined;
      let errorMessage: string | undefined;

      if (url.searchParams.get("success") === "1") {
        successMessage = "Email settings saved successfully!";
      } else if (url.searchParams.get("success") === "test_sent") {
        successMessage = "Test email sent successfully! Check your inbox.";
      }

      const errorParam = url.searchParams.get("error");
      if (errorParam === "email_required") {
        errorMessage = "Email address is required for test email";
      } else if (errorParam === "test_failed") {
        errorMessage = "Failed to send test email. Check your settings.";
      } else if (errorParam) {
        errorMessage = decodeURIComponent(errorParam);
      }

      const html = renderEmailSettings({
        username: auth.username!,
        config,
        successMessage,
        errorMessage,
      });

      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Email settings error:", error);
      return ResponseFactory.error("Failed to load email settings");
    }
  }

  /**
   * POST /dashboard/email-settings/save - Save email configuration
   */
  private async save(request: Request): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const formData = await request.formData();

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
        const config = await EmailConfigService.getConfig();
        const html = renderEmailSettings({
          username: auth.username!,
          config,
          errorMessage: "Please fill in all required fields",
        });
        return ResponseFactory.html(html);
      }

      // Get existing config to preserve password if not provided
      const existingConfig = await EmailConfigService.getConfig();
      const finalPassword = smtpPassword || existingConfig?.smtpPassword || "";

      if (!smtpPassword && !existingConfig) {
        const html = renderEmailSettings({
          username: auth.username!,
          config: existingConfig,
          errorMessage: "Password is required for initial setup",
        });
        return ResponseFactory.html(html);
      }

      // Save configuration
      await EmailConfigService.saveConfig({
        smtpHost,
        smtpPort,
        smtpUsername,
        smtpPassword: finalPassword,
        fromEmail,
        fromName,
        isEnabled,
        useTLS,
        updatedBy: auth.username!,
      });

      // Redirect with success message
      return ResponseFactory.redirect("/dashboard/email-settings?success=1");
    } catch (error) {
      console.error("Save email settings error:", error);
      const config = await EmailConfigService.getConfig();
      const html = renderEmailSettings({
        username: auth.username!,
        config,
        errorMessage: "Failed to save settings. Please try again.",
      });
      return ResponseFactory.html(html);
    }
  }

  /**
   * POST /dashboard/email-settings/test - Send test email
   */
  private async test(request: Request): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const formData = await request.formData();
      const testEmail = formData.get("testEmail")?.toString();

      if (!testEmail) {
        return ResponseFactory.redirect("/dashboard/email-settings?error=email_required");
      }

      // Send test email
      const result = await EmailService.sendTestEmail(testEmail);

      if (result.success) {
        return ResponseFactory.redirect("/dashboard/email-settings?success=test_sent");
      } else {
        return ResponseFactory.redirect(
          `/dashboard/email-settings?error=${encodeURIComponent(result.error || "Unknown error")}`
        );
      }
    } catch (error) {
      console.error("Test email error:", error);
      return ResponseFactory.redirect("/dashboard/email-settings?error=test_failed");
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
