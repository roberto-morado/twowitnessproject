/**
 * Dashboard Home View
 * Overview of prayer requests (placeholder for now)
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";

export function renderDashboard(username: string): string {
  const content = `
    <h1>Welcome to the Dashboard</h1>
    <p>This is your admin control panel for the Two Witness Project website.</p>

    <div style="margin-top: 40px;">
      <h2>Quick Links</h2>
      <ul>
        <li><a href="/dashboard">🙏 Prayer Requests</a> - Manage incoming prayers</li>
        <li><a href="/dashboard/analytics">📊 Analytics</a> - View website statistics</li>
      </ul>
    </div>

    <div style="margin-top: 40px; padding: 20px; border: 1px solid #000;">
      <h3>📝 Note</h3>
      <p>Prayer requests and analytics features are coming soon!</p>
    </div>
  `;

  return renderDashboardLayout({
    title: "Dashboard",
    content,
    activeTab: "prayers",
    username,
  });
}
