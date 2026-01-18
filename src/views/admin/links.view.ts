/**
 * Admin Links Management View
 * CRUD interface for managing homepage links
 */

import { renderLayout } from "../layout.ts";
import type { Link } from "../../models/link.model.ts";
import { escapeHtml } from "@utils/html.ts";
import { CsrfService } from "../../services/csrf.service.ts";

export interface AdminLinksData {
  links: Link[];
  csrfToken?: string;
}

export function renderAdminLinks(data: AdminLinksData): string {
  const { links, csrfToken } = data;

  const content = `
    <div class="admin-container">
      <div class="admin-header">
        <h1>Manage Links</h1>
        <p>Add, edit, or remove links that appear on your homepage</p>
      </div>

      <!-- Add New Link Form -->
      <section>
        <h2>Add New Link</h2>
        <form method="POST" action="/dashboard/links/create">
          ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}

          <div class="form-group">
            <label for="title">Title *</label>
            <input type="text" id="title" name="title" required placeholder="e.g., YouTube Channel">
          </div>

          <div class="form-group">
            <label for="url">URL *</label>
            <input type="url" id="url" name="url" required placeholder="https://youtube.com/@channel">
          </div>

          <div class="form-group">
            <label for="emoji">Emoji *</label>
            <input type="text" id="emoji" name="emoji" required placeholder="📺" maxlength="2">
          </div>

          <div class="form-group">
            <label for="order">Display Order (lower = higher on page)</label>
            <input type="number" id="order" name="order" min="0" placeholder="Leave blank to add at end">
          </div>

          <button type="submit" class="btn">Add Link</button>
        </form>
      </section>

      <!-- Existing Links -->
      <section style="margin-top: 3rem;">
        <h2>Current Links (${links.length})</h2>
        ${links.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Emoji</th>
                <th>Title</th>
                <th>URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${links.map(link => `
                <tr>
                  <td>${link.order}</td>
                  <td style="font-size: 1.5rem;">${link.emoji}</td>
                  <td>${escapeHtml(link.title)}</td>
                  <td><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.url.substring(0, 50))}${link.url.length > 50 ? '...' : ''}</a></td>
                  <td>${link.isActive ? '✅ Active' : '❌ Inactive'}</td>
                  <td>
                    <form method="POST" action="/dashboard/links/${escapeHtml(link.id)}/toggle" style="display: inline;">
                      ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}
                      <button type="submit" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                        ${link.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </form>
                    <form method="POST" action="/dashboard/links/${escapeHtml(link.id)}/delete" style="display: inline;" onsubmit="return confirm('Delete this link? This cannot be undone.');">
                      ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}
                      <button type="submit" class="btn" style="background: #E74C3C; padding: 0.5rem 1rem; font-size: 0.9rem;">Delete</button>
                    </form>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : `
          <p>No links yet. Add your first link using the form above!</p>
        `}
      </section>

      <section style="margin-top: 2rem;">
        <a href="/dashboard" class="btn btn-secondary">← Back to Dashboard</a>
        <a href="/" class="btn" style="margin-left: 1rem;" target="_blank">View Live Site →</a>
      </section>
    </div>
  `;

  return renderLayout({
    title: "Manage Links",
    content,
    activeNav: "dashboard",
  });
}
