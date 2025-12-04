/**
 * Auth Controller
 * Handles login, logout, and dashboard access
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { renderLogin } from "../views/admin/login.view.ts";
import { renderDashboard } from "../views/admin/dashboard.view.ts";

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

    const html = renderLogin();
    return ResponseFactory.html(html);
  }

  /**
   * POST /login - Handle login submission
   */
  private async handleLogin(request: Request): Promise<Response> {
    try {
      const formData = await request.formData();
      const username = formData.get("username")?.toString();
      const password = formData.get("password")?.toString();

      if (!username || !password) {
        const html = renderLogin({ error: "Username and password are required" });
        return ResponseFactory.html(html, 400);
      }

      // Attempt login
      const sessionId = await AuthService.login(username, password);

      if (!sessionId) {
        const html = renderLogin({ error: "Invalid username or password" });
        return ResponseFactory.html(html, 401);
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
      const html = renderLogin({ error: "An error occurred during login" });
      return ResponseFactory.html(html, 500);
    }
  }

  /**
   * GET /dashboard - Show dashboard (requires auth)
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

    // Show dashboard
    const html = renderDashboard(username);
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
