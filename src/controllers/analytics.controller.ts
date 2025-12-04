/**
 * Analytics Controller
 * Handles analytics dashboard and CSV export
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { AnalyticsService } from "../services/analytics.service.ts";
import { renderAnalytics } from "../views/admin/analytics.view.ts";

export class AnalyticsController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/dashboard/analytics",
        handler: this.showAnalytics.bind(this),
      },
      {
        method: "GET",
        pattern: "/dashboard/analytics/export",
        handler: this.exportAnalytics.bind(this),
      },
    ];
  }

  /**
   * GET /dashboard/analytics - Show analytics dashboard
   */
  private async showAnalytics(request: Request): Promise<Response> {
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
      const range = url.searchParams.get("range") as "7" | "30" | "90" | "all" || "30";

      // Calculate date range
      const now = Date.now();
      let startDate: number;

      switch (range) {
        case "7":
          startDate = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case "30":
          startDate = now - (30 * 24 * 60 * 60 * 1000);
          break;
        case "90":
          startDate = now - (90 * 24 * 60 * 60 * 1000);
          break;
        case "all":
          startDate = 0;
          break;
        default:
          startDate = now - (30 * 24 * 60 * 60 * 1000);
      }

      // Get analytics data
      const [overview, pageViewsByDay, eventCounts] = await Promise.all([
        AnalyticsService.getOverview(startDate, now),
        AnalyticsService.getPageViewsByDay(startDate, now),
        AnalyticsService.getEventCounts(startDate, now),
      ]);

      const html = renderAnalytics({
        overview,
        pageViewsByDay,
        eventCounts,
        dateRange: range,
        username,
      });

      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Analytics dashboard error:", error);
      return ResponseFactory.error("An error occurred while loading analytics");
    }
  }

  /**
   * GET /dashboard/analytics/export - Export analytics as CSV
   */
  private async exportAnalytics(request: Request): Promise<Response> {
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
      const range = url.searchParams.get("range") as "7" | "30" | "90" | "all" || "30";

      // Calculate date range
      const now = Date.now();
      let startDate: number;

      switch (range) {
        case "7":
          startDate = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case "30":
          startDate = now - (30 * 24 * 60 * 60 * 1000);
          break;
        case "90":
          startDate = now - (90 * 24 * 60 * 60 * 1000);
          break;
        case "all":
          startDate = 0;
          break;
        default:
          startDate = now - (30 * 24 * 60 * 60 * 1000);
      }

      // Generate CSV
      const csv = await AnalyticsService.exportToCSV(startDate, now);

      // Return as downloadable file
      const filename = `analytics-${range}-days-${new Date().toISOString().split('T')[0]}.csv`;

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } catch (error) {
      console.error("Analytics export error:", error);
      return ResponseFactory.error("An error occurred while exporting analytics");
    }
  }
}
