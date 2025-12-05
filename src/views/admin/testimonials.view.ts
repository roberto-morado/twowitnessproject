/**
 * Admin Testimonials Management View
 * Manage testimonials and generate submission keys
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";
import type { Testimonial, TestimonialKey } from "../../services/testimonial.service.ts";
import { TestimonialService } from "../../services/testimonial.service.ts";
import { CsrfService } from "../../services/csrf.service.ts";

export interface AdminTestimonialsViewData {
  testimonials: Testimonial[];
  keys: TestimonialKey[];
  filter: "all" | "pending" | "approved";
  username: string;
  csrfToken?: string;
  siteUrl: string;
}

export function renderAdminTestimonials(data: AdminTestimonialsViewData): string {
  const { testimonials, keys, filter, username, csrfToken, siteUrl } = data;

  // Apply filter
  let filteredTestimonials = testimonials;
  if (filter === "pending") {
    filteredTestimonials = testimonials.filter(t => !t.approved);
  } else if (filter === "approved") {
    filteredTestimonials = testimonials.filter(t => t.approved);
  }

  const content = `
    <h1>✨ Testimonial Management</h1>
    <p style="margin-bottom: 40px;">Total: <strong>${testimonials.length}</strong> testimonials | <strong>${keys.length}</strong> submission keys</p>

    <!-- Testimonials Section -->
    <div style="margin-bottom: 60px;">
      <h2>Testimonials</h2>

      <div style="margin: 20px 0 40px 0;">
        <h3>Filter:</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
          <a href="/dashboard/testimonials" class="btn" style="${filter === "all" ? "background: #000; color: #fff;" : ""}">
            All (${testimonials.length})
          </a>
          <a href="/dashboard/testimonials?filter=pending" class="btn" style="${filter === "pending" ? "background: #000; color: #fff;" : ""}">
            Pending (${testimonials.filter(t => !t.approved).length})
          </a>
          <a href="/dashboard/testimonials?filter=approved" class="btn" style="${filter === "approved" ? "background: #000; color: #fff;" : ""}">
            Approved (${testimonials.filter(t => t.approved).length})
          </a>
        </div>
      </div>

      ${filteredTestimonials.length === 0 ? `
        <div style="padding: 40px; border: 1px solid #000; text-align: center;">
          <p>No testimonials found for this filter.</p>
        </div>
      ` : `
        <div style="display: grid; gap: 20px;">
          ${filteredTestimonials.map(testimonial => `
            <div style="padding: 20px; border: 2px solid #000; ${testimonial.approved ? "background: #f0fff0;" : "background: #fff9e6;"}">
              <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                <div>
                  <strong style="font-size: 1.2em;">${escapeHtml(testimonial.name)}</strong>
                  ${testimonial.location ? `<br><span style="font-size: 0.9em;">${escapeHtml(testimonial.location)}</span>` : ""}
                  <br>
                  <span style="font-size: 0.9em;">${TestimonialService.formatTimeAgo(testimonial.createdAt)}</span>
                  <br>
                  <span style="font-size: 0.9em;">
                    ${testimonial.approved ? "✓ Approved" : "⏳ Pending"}
                  </span>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  ${!testimonial.approved ? `
                    <form method="POST" action="/dashboard/testimonials/${testimonial.id}/approve" style="display: inline;">
                      <button type="submit" class="btn" style="padding: 5px 15px; font-size: 0.9em; background: #28a745; color: #fff;">
                        ✓ Approve
                      </button>
                    </form>
                  ` : ""}
                  <form method="POST" action="/dashboard/testimonials/${testimonial.id}/delete" style="display: inline;" onsubmit="return confirm('Delete this testimonial?');">
                    <button type="submit" class="btn" style="padding: 5px 15px; font-size: 0.9em;">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <p style="white-space: pre-wrap;">${escapeHtml(testimonial.testimony)}</p>
              ${testimonial.approved && testimonial.approvedAt ? `
                <p style="margin-top: 15px; font-size: 0.9em; font-style: italic;">
                  Approved ${TestimonialService.formatTimeAgo(testimonial.approvedAt)}
                </p>
              ` : ""}
            </div>
          `).join("")}
        </div>
      `}
    </div>

    <!-- Submission Keys Section -->
    <div style="padding: 30px; border: 2px solid #000; background: #f9f9f9; margin-bottom: 40px;">
      <h2>Generate Submission Key</h2>
      <p>Create a unique link for someone to submit their testimony.</p>

      <form method="POST" action="/dashboard/testimonials/create-key" style="max-width: 600px; margin-top: 20px;">
        ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}

        <div style="margin-bottom: 20px;">
          <label for="key_name" style="display: block; font-weight: bold; margin-bottom: 5px;">
            Key Name/Description:
          </label>
          <input
            type="text"
            id="key_name"
            name="key_name"
            required
            style="width: 100%; padding: 10px; border: 2px solid #000; font-size: 16px; font-family: Times, serif;"
            placeholder="e.g., John Smith, Youth Group Event, etc."
          >
          <small style="display: block; margin-top: 5px;">For your reference - this is not shown to the recipient</small>
        </div>

        <div style="margin-bottom: 20px;">
          <label for="expires_in_days" style="display: block; font-weight: bold; margin-bottom: 5px;">
            Expires In (days):
          </label>
          <input
            type="number"
            id="expires_in_days"
            name="expires_in_days"
            min="1"
            max="365"
            style="width: 200px; padding: 10px; border: 2px solid #000; font-size: 16px; font-family: Times, serif;"
            placeholder="30"
          >
          <small style="display: block; margin-top: 5px;">Leave blank for no expiration</small>
        </div>

        <button type="submit" class="btn" style="width: 100%;">
          🔑 Generate Key
        </button>
      </form>
    </div>

    <!-- Existing Keys -->
    <div style="margin-bottom: 40px;">
      <h2>Existing Submission Keys</h2>
      <p style="margin-bottom: 20px;">Total: <strong>${keys.length}</strong> keys (${keys.filter(k => !k.used).length} unused)</p>

      ${keys.length === 0 ? `
        <div style="padding: 40px; border: 1px solid #000; text-align: center;">
          <p>No submission keys created yet.</p>
        </div>
      ` : `
        <div style="display: grid; gap: 15px;">
          ${keys.map(key => {
            const url = `${siteUrl}/testimonials?key=${key.id}`;
            const isExpired = key.expiresAt && Date.now() > key.expiresAt;
            const smsLink = `sms:?&body=${encodeURIComponent(`You've been invited to share your testimony! ${url}`)}`;

            return `
              <div style="padding: 20px; border: 2px solid #000; ${key.used ? "opacity: 0.6; background: #f5f5f5;" : isExpired ? "opacity: 0.7; background: #fff3cd;" : "background: #fff;"}">
                <div style="display: flex; justify-content: space-between; align-items: start; gap: 15px; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 200px;">
                    <strong style="font-size: 1.1em;">${escapeHtml(key.name)}</strong>
                    <br>
                    <span style="font-size: 0.9em;">Created ${TestimonialService.formatTimeAgo(key.createdAt)} by ${escapeHtml(key.createdBy)}</span>
                    <br>
                    <span style="font-size: 0.9em;">
                      ${key.used ? `✓ Used ${TestimonialService.formatTimeAgo(key.usedAt!)}` : isExpired ? "⏰ Expired" : "🟢 Available"}
                    </span>
                    ${key.expiresAt && !key.used ? `
                      <br><span style="font-size: 0.9em;">Expires ${TestimonialService.formatTimeAgo(key.expiresAt)}</span>
                    ` : ""}
                  </div>

                  ${!key.used && !isExpired ? `
                    <div style="flex: 2; min-width: 300px;">
                      <div style="margin-bottom: 10px;">
                        <strong style="font-size: 0.9em;">Submission URL:</strong>
                        <div style="display: flex; gap: 5px; margin-top: 5px;">
                          <input
                            type="text"
                            readonly
                            value="${url}"
                            style="flex: 1; padding: 5px; border: 1px solid #000; font-size: 0.85em; font-family: monospace;"
                            onclick="this.select()"
                          >
                          <button
                            type="button"
                            class="btn"
                            style="padding: 5px 10px; font-size: 0.85em;"
                            onclick="copyToClipboard('${url}')"
                          >
                            📋 Copy
                          </button>
                        </div>
                      </div>

                      <div>
                        <strong style="font-size: 0.9em;">SMS Link:</strong>
                        <div style="display: flex; gap: 5px; margin-top: 5px;">
                          <a
                            href="${smsLink}"
                            class="btn"
                            style="padding: 5px 15px; font-size: 0.85em; text-decoration: none;"
                          >
                            💬 Open Messages
                          </a>
                          <button
                            type="button"
                            class="btn"
                            style="padding: 5px 10px; font-size: 0.85em;"
                            onclick="copyToClipboard('${smsLink}')"
                          >
                            📋 Copy SMS Link
                          </button>
                        </div>
                      </div>
                    </div>
                  ` : ""}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `}
    </div>

    <script>
      function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
          alert('✓ Copied to clipboard!');
        }).catch(err => {
          alert('Failed to copy: ' + err);
        });
      }
    </script>
  `;

  return renderDashboardLayout({
    title: "Testimonials",
    content,
    activeTab: undefined, // No specific tab for testimonials
    username,
  });
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
