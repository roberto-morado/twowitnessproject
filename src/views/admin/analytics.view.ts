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

    <div style="margin-bottom: 40px; display: flex; gap: 10px; flex-wrap: wrap;">
      <a href="/dashboard/analytics?range=7" class="btn" style="${dateRange === "7" ? "background: #000; color: #fff;" : ""}">
        Last 7 Days
      </a>
      <a href="/dashboard/analytics?range=30" class="btn" style="${dateRange === "30" ? "background: #000; color: #fff;" : ""}">
        Last 30 Days
      </a>
      <a href="/dashboard/analytics?range=90" class="btn" style="${dateRange === "90" ? "background: #000; color: #fff;" : ""}">
        Last 90 Days
      </a>
      <a href="/dashboard/analytics?range=all" class="btn" style="${dateRange === "all" ? "background: #000; color: #fff;" : ""}">
        All Time
      </a>
      <a href="/dashboard/analytics/export?range=${dateRange}" class="btn" style="margin-left: auto;">
        📥 Export CSV
      </a>
    </div>

    <!-- Overview Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
      <div style="padding: 20px; border: 2px solid #000;">
        <h2 style="margin-top: 0;">${overview.totalPageViews}</h2>
        <p>Total Page Views</p>
      </div>
      <div style="padding: 20px; border: 2px solid #000;">
        <h2 style="margin-top: 0;">${overview.uniqueVisitors}</h2>
        <p>Unique Visitors</p>
      </div>
    </div>

    <!-- Page Views Over Time Chart -->
    ${pageViewsByDay.length > 0 ? `
      <div style="margin-bottom: 40px;">
        <h2>Page Views Over Time</h2>
        ${renderBarChart(pageViewsByDay)}
      </div>
    ` : ""}

    <!-- Top Pages -->
    ${overview.topPages.length > 0 ? `
      <div style="margin-bottom: 40px;">
        <h2>Top Pages</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #000;">
              <th style="text-align: left; padding: 10px;">Page</th>
              <th style="text-align: right; padding: 10px;">Views</th>
            </tr>
          </thead>
          <tbody>
            ${overview.topPages.map(page => `
              <tr style="border-bottom: 1px solid #000;">
                <td style="padding: 10px;">${page.path}</td>
                <td style="text-align: right; padding: 10px;"><strong>${page.views}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : ""}

    <!-- Top Referrers -->
    ${overview.topReferrers.length > 0 ? `
      <div style="margin-bottom: 40px;">
        <h2>Top Referrers</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #000;">
              <th style="text-align: left; padding: 10px;">Referrer</th>
              <th style="text-align: right; padding: 10px;">Count</th>
            </tr>
          </thead>
          <tbody>
            ${overview.topReferrers.map(ref => `
              <tr style="border-bottom: 1px solid #000;">
                <td style="padding: 10px;">${escapeHtml(ref.referrer)}</td>
                <td style="text-align: right; padding: 10px;"><strong>${ref.count}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : ""}

    <!-- Device Breakdown -->
    ${Object.keys(overview.deviceBreakdown).length > 0 ? `
      <div style="margin-bottom: 40px;">
        <h2>Device Breakdown</h2>
        ${renderHorizontalBarChart(overview.deviceBreakdown, overview.totalPageViews)}
      </div>
    ` : ""}

    <!-- Browser Breakdown -->
    ${Object.keys(overview.browserBreakdown).length > 0 ? `
      <div style="margin-bottom: 40px;">
        <h2>Browser Breakdown</h2>
        ${renderHorizontalBarChart(overview.browserBreakdown, overview.totalPageViews)}
      </div>
    ` : ""}

    <!-- Event Counts -->
    ${eventCounts.length > 0 ? `
      <div style="margin-bottom: 40px;">
        <h2>Button Clicks & Events</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #000;">
              <th style="text-align: left; padding: 10px;">Event</th>
              <th style="text-align: right; padding: 10px;">Count</th>
            </tr>
          </thead>
          <tbody>
            ${eventCounts.map(event => `
              <tr style="border-bottom: 1px solid #000;">
                <td style="padding: 10px;">${escapeHtml(event.name)}</td>
                <td style="text-align: right; padding: 10px;"><strong>${event.count}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : ""}

    ${overview.totalPageViews === 0 ? `
      <div style="padding: 40px; border: 1px solid #000; text-align: center;">
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

 * Render simple bar chart (vertical)
 */
function renderBarChart(data: Array<{ date: string; views: number }>): string {
  if (data.length === 0) return "<p>No data</p>";

  const maxViews = Math.max(...data.map(d => d.views));

  return `
    <div style="display: flex; align-items: flex-end; gap: 10px; height: 200px; border-bottom: 2px solid #000; padding: 10px 0;">
      ${data.map(item => {
        const height = maxViews > 0 ? (item.views / maxViews) * 100 : 0;
        return `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <div style="width: 100%; background: #000; height: ${height}%; min-height: 2px;"></div>
            <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 0.8em;">
              ${item.date.slice(5)} (${item.views})
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

 * Render horizontal bar chart
 */
function renderHorizontalBarChart(data: Record<string, number>, total: number): string {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${entries.map(([label, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return `
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span><strong>${label}</strong></span>
              <span>${count} (${percentage.toFixed(1)}%)</span>
            </div>
            <div style="width: 100%; height: 20px; border: 1px solid #000;">
              <div style="width: ${percentage}%; height: 100%; background: #000;"></div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

