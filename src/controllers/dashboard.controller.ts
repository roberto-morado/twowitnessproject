/**
 * Dashboard Controller
 * Main admin dashboard
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { renderSimpleDashboard } from "../views/admin/dashboard.view.ts";

export class DashboardController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/dashboard",
        handler: this.showDashboard.bind(this),
      },
    ];
  }

  private async showDashboard(request: Request): Promise<Response> {
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);
    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    const html = renderSimpleDashboard();
    return ResponseFactory.html(html);
  }
}
