/**
 * Dashboard Layout
 * Admin dashboard wrapper with navigation
 */

import { AppConfig } from "@config/app.config.ts";

export interface DashboardLayoutData {
  title: string;
  content: string;
  activeTab?: "prayers" | "analytics" | "testimonials" | "security" | "settings";
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
</head>
<body>
  <header>
    <h1>Admin Dashboard</h1>
    <p>
      👤 ${username}
    </p>
    <form method="POST" action="/logout">
      <button type="submit">Logout</button>
    </form>
  </header>

  <nav>
    <ul>
      <li>
        <a href="/dashboard">${activeTab === "prayers" ? "<strong>🙏 Prayer Requests</strong> (current)" : "🙏 Prayer Requests"}</a>
      </li>
      <li>
        <a href="/dashboard/analytics">${activeTab === "analytics" ? "<strong>📊 Analytics</strong> (current)" : "📊 Analytics"}</a>
      </li>
      <li>
        <a href="/dashboard/testimonials">${activeTab === "testimonials" ? "<strong>✨ Testimonials</strong> (current)" : "✨ Testimonials"}</a>
      </li>
      <li>
        <a href="/dashboard/login-attempts">${activeTab === "security" ? "<strong>🔒 Security</strong> (current)" : "🔒 Security"}</a>
      </li>
      <li>
        <a href="/dashboard/settings">${activeTab === "settings" ? "<strong>⚙️ Settings</strong> (current)" : "⚙️ Settings"}</a>
      </li>
    </ul>
  </nav>

  <main>
    ${content}
  </main>

  <footer>
    <hr>
    <p>
      <a href="/">← Back to Website</a>
    </p>
  </footer>
</body>
</html>`;
}
