/**
 * Analytics Dashboard View
 * Shows website statistics with simple visualizations
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";
import { escapeHtml } from "@utils/html.ts";
import type { AnalyticsOverview } from "../../services/analytics.service.ts";

export interface AnalyticsViewData {
  overview: AnalyticsOverview;
  pageViewsByDay: Array<{ date: string; views: number }>;
  eventCounts: Array<{ name: string; count: number }>;
  dateRange: "7" | "30" | "90" | "all";
  username: string;
}

export function renderAnalytics(data: AnalyticsViewData): string {
  const { overview, pageViewsByDay, eventCounts, dateRange, username } = data;

  const content = `
    <h1>📊 Analytics Dashboard</h1>

    <div>
      <a href="/dashboard/analytics?range=7"7" ? "background: #000; color: #fff;" : ""}">
        Last 7 Days
      </a>
      <a href="/dashboard/analytics?range=30"30" ? "background: #000; color: #fff;" : ""}">
        Last 30 Days
      </a>
      <a href="/dashboard/analytics?range=90"90" ? "background: #000; color: #fff;" : ""}">
        Last 90 Days
      </a>
      <a href="/dashboard/analytics?range=all"all" ? "background: #000; color: #fff;" : ""}">
        All Time
      </a>
      <a href="/dashboard/analytics/export?range=${dateRange}">
        📥 Export CSV
      </a>
    </div>

    <!-- Overview Stats -->
    <div>
      <div>
        <h2>${overview.totalPageViews}</h2>
        <p>Total Page Views</p>
      </div>
      <div>
        <h2>${overview.uniqueVisitors}</h2>
        <p>Unique Visitors</p>
      </div>
    </div>

    <!-- Page Views Over Time Chart -->
    ${pageViewsByDay.length > 0 ? `
      <div>
        <h2>Page Views Over Time</h2>
        ${renderBarChart(pageViewsByDay)}
      </div>
    ` : ""}

    <!-- Top Pages -->
    ${overview.topPages.length > 0 ? `
      <div>
        <h2>Top Pages</h2>
        <table>
          <thead>
            <tr>
              <th>Page</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody>
            ${overview.topPages.map(page => `
              <tr>
                <td>${page.path}</td>
                <td><strong>${page.views}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : ""}

    <!-- Top Referrers -->
    ${overview.topReferrers.length > 0 ? `
      <div>
        <h2>Top Referrers</h2>
        <table>
          <thead>
            <tr>
              <th>Referrer</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${overview.topReferrers.map(ref => `
              <tr>
                <td>${escapeHtml(ref.referrer)}</td>
                <td><strong>${ref.count}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : ""}

    <!-- Device Breakdown -->
    ${Object.keys(overview.deviceBreakdown).length > 0 ? `
      <div>
        <h2>Device Breakdown</h2>
        ${renderHorizontalBarChart(overview.deviceBreakdown, overview.totalPageViews)}
      </div>
    ` : ""}

    <!-- Browser Breakdown -->
    ${Object.keys(overview.browserBreakdown).length > 0 ? `
      <div>
        <h2>Browser Breakdown</h2>
        ${renderHorizontalBarChart(overview.browserBreakdown, overview.totalPageViews)}
      </div>
    ` : ""}

    <!-- Event Counts -->
    ${eventCounts.length > 0 ? `
      <div>
        <h2>Button Clicks & Events</h2>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${eventCounts.map(event => `
              <tr>
                <td>${escapeHtml(event.name)}</td>
                <td><strong>${event.count}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : ""}

    ${overview.totalPageViews === 0 ? `
      <div>
        <h2>No Analytics Data Yet</h2>
        <p>Analytics will appear here as visitors browse your website.</p>
      </div>
    ` : ""}
  `;

  return renderDashboardLayout({
    title: "Analytics",
    content,
    activeTab: "analytics",
    username,
  });
}

/**
 * Render simple bar chart (vertical)
 */
function renderBarChart(data: Array<{ date: string; views: number }>): string {
  if (data.length === 0) return "<p>No data</p>";

  const maxViews = Math.max(...data.map(d => d.views));

  return `
    <div>
      ${data.map(item => {
        const height = maxViews > 0 ? (item.views / maxViews) * 100 : 0;
        return `
          <div>
            <div></div>
            <div>
              ${item.date.slice(5)} (${item.views})
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

/**
 * Render horizontal bar chart
 */
function renderHorizontalBarChart(data: Record<string, number>, total: number): string {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return `
    <div>
      ${entries.map(([label, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return `
          <div>
            <div>
              <span><strong>${label}</strong></span>
              <span>${count} (${percentage.toFixed(1)}%)</span>
            </div>
            <div>
              <div></div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

