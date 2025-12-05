/**
 * Dashboard Layout
 * Admin dashboard wrapper with navigation
 */

import { AppConfig } from "@config/app.config.ts";

export interface DashboardLayoutData {
  title: string;
  content: string;
  activeTab?: "prayers" | "analytics" | "settings";
  username: string;
}

export function renderDashboardLayout(data: DashboardLayoutData): string {
  const { title, content, activeTab = "prayers", username } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Admin Dashboard - ${AppConfig.ministry.name}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <header style="border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px;">
    <div class="container">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
        <h1 style="margin: 0;">Admin Dashboard</h1>
        <div style="display: flex; gap: 20px; align-items: center;">
          <span>👤 ${username}</span>
          <form method="POST" action="/logout" style="display: inline;">
            <button type="submit" class="btn">Logout</button>
          </form>
        </div>
      </div>
    </div>
  </header>

  <nav style="border-bottom: 2px solid #000; margin-bottom: 40px;">
    <div class="container">
      <ul style="list-style: none; padding: 0; display: flex; gap: 20px; flex-wrap: wrap;">
        <li>
          <a
            href="/dashboard"
            style="font-weight: bold; ${activeTab === "prayers" ? "text-decoration: underline;" : "text-decoration: none;"}"
          >
            🙏 Prayer Requests
          </a>
        </li>
        <li>
          <a
            href="/dashboard/analytics"
            style="font-weight: bold; ${activeTab === "analytics" ? "text-decoration: underline;" : "text-decoration: none;"}"
          >
            📊 Analytics
          </a>
        </li>
        <li>
          <a
            href="/dashboard/settings"
            style="font-weight: bold; ${activeTab === "settings" ? "text-decoration: underline;" : "text-decoration: none;"}"
          >
            ⚙️ Settings
          </a>
        </li>
      </ul>
    </div>
  </nav>

  <main>
    <div class="container">
      ${content}
    </div>
  </main>

  <footer style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #000;">
    <div class="container">
      <p style="text-align: center;">
        <a href="/">← Back to Website</a>
      </p>
    </div>
  </footer>
</body>
</html>`;
}
