/**
 * Auth Controller
 * Handles login, logout, and dashboard access
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { RateLimitService } from "../services/ratelimit.service.ts";
import { CsrfService } from "../services/csrf.service.ts";
import { renderLogin } from "../views/admin/login.view.ts";
import { renderDashboard } from "../views/admin/dashboard.view.ts";
import { renderLoginAttempts } from "../views/admin/login-attempts.view.ts";

export class AuthController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/login",
        handler: this.showLogin.bind(this),
      },
      {
        method: "POST",
        pattern: "/login",
        handler: this.handleLogin.bind(this),
      },
      {
        method: "GET",
        pattern: "/dashboard",
        handler: this.showDashboard.bind(this),
      },
      {
        method: "GET",
        pattern: "/dashboard/login-attempts",
        handler: this.showLoginAttempts.bind(this),
      },
      {
        method: "POST",
        pattern: "/logout",
        handler: this.handleLogout.bind(this),
      },
    ];
  }

  /**
   * GET /login - Show login form
   */
  private async showLogin(request: Request): Promise<Response> {
    // Check if already logged in
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (sessionId) {
      const username = await AuthService.validateSession(sessionId);
      if (username) {
        // Already logged in, redirect to dashboard
        return ResponseFactory.redirect("/dashboard");
      }
    }

    // Generate CSRF token for the form
    const csrfToken = CsrfService.generateToken();
    const html = renderLogin({ csrfToken });

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
   * POST /login - Handle login submission
   */
  private async handleLogin(request: Request): Promise<Response> {
    try {
      const formData = await request.formData();

      // Validate CSRF token first
      const csrfValid = await CsrfService.validateFromRequest(request, formData);
      if (!csrfValid) {
        const csrfToken = CsrfService.generateToken();
        const html = renderLogin({
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

      // Get IP address for rate limiting and logging
      const ip = RateLimitService.getIpFromRequest(request);

      // Check rate limit
      const rateLimitResult = await RateLimitService.checkAndRecord(ip, "login", "login");
      if (!rateLimitResult.allowed) {
        const info = RateLimitService.getRateLimitInfo("login");
        const retryMessage = rateLimitResult.retryAfter
          ? ` Please try again in ${rateLimitResult.retryAfter} seconds.`
          : "";
        const csrfToken = CsrfService.generateToken();
        const html = renderLogin({
          error: `Too many login attempts. Maximum ${info.maxAttempts} attempts per ${info.windowMinutes} minutes.${retryMessage}`,
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

      const username = formData.get("username")?.toString();
      const password = formData.get("password")?.toString();

      if (!username || !password) {
        const csrfToken = CsrfService.generateToken();
        const html = renderLogin({
          error: "Username and password are required",
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

      // Attempt login with IP for logging
      const sessionId = await AuthService.login(username, password, ip);

      if (!sessionId) {
        const csrfToken = CsrfService.generateToken();
        const html = renderLogin({
          error: "Invalid username or password",
          csrfToken,
        });
        return new Response(html, {
          status: 401,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      // Login successful, set cookie and redirect
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/dashboard",
          "Set-Cookie": AuthService.createSessionCookie(sessionId),
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      const csrfToken = CsrfService.generateToken();
      const html = renderLogin({
        error: "An error occurred during login",
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
   * GET /dashboard - Redirect to dashboard prayers (requires auth)
   */
  private async showDashboard(request: Request): Promise<Response> {
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

    // Redirect to prayers dashboard (default tab)
    return ResponseFactory.redirect("/dashboard/prayers");
  }

  /**
   * GET /dashboard/login-attempts - Show recent login attempts (requires auth)
   */
  private async showLoginAttempts(request: Request): Promise<Response> {
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

    // Fetch recent login attempts (last 100)
    const attempts = await AuthService.getRecentLoginAttempts(100);

    const html = renderLoginAttempts({ attempts, username });
    return ResponseFactory.html(html);
  }

  /**
   * POST /logout - Handle logout
   */
  private async handleLogout(request: Request): Promise<Response> {
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (sessionId) {
      await AuthService.logout(sessionId);
    }

    // Clear cookie and redirect to home
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": AuthService.createLogoutCookie(),
      },
    });
  }
}
