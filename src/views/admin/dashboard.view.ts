/**
 * Simple Admin Dashboard View
 * Links to management pages
 */

import { renderLayout } from "../layout.ts";

export function renderSimpleDashboard(): string {
  const content = `
    <div class="admin-container">
      <div class="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your Linktree-style homepage</p>
      </div>

      <section>
        <h2>Quick Actions</h2>
        <div style="display: grid; gap: 1.5rem; margin-top: 1.5rem;">
          <a href="/dashboard/links" class="btn" style="text-align: center; padding: 1.5rem; font-size: 1.1rem;">
            🔗 Manage Links
          </a>
          <a href="/" class="btn btn-secondary" style="text-align: center; padding: 1.5rem; font-size: 1.1rem;" target="_blank">
            👁️ View Live Site
          </a>
          <a href="/logout" class="btn" style="background: #95A5A6; text-align: center; padding: 1.5rem; font-size: 1.1rem;">
            🚪 Logout
          </a>
        </div>
      </section>
    </div>
  `;

  return renderLayout({
    title: "Dashboard",
    content,
    activeNav: "dashboard",
  });
}
