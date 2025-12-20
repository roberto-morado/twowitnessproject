/**
 * Admin Testimonials Management View
 * Manage testimonials and generate submission keys
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";
import { escapeHtml } from "@utils/html.ts";
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
    <p>Total: <strong>${testimonials.length}</strong> testimonials | <strong>${keys.length}</strong> submission keys</p>

    <!-- Testimonials Section -->
    <div>
      <h2>Testimonials</h2>

      <div>
        <h3>Filter:</h3>
        <div>
          <a href="/dashboard/testimonials"all" ? "background: #000; color: #fff;" : ""}">
            All (${testimonials.length})
          </a>
          <a href="/dashboard/testimonials?filter=pending"pending" ? "background: #000; color: #fff;" : ""}">
            Pending (${testimonials.filter(t => !t.approved).length})
          </a>
          <a href="/dashboard/testimonials?filter=approved"approved" ? "background: #000; color: #fff;" : ""}">
            Approved (${testimonials.filter(t => t.approved).length})
          </a>
        </div>
      </div>

      ${filteredTestimonials.length === 0 ? `
        <div>
          <p>No testimonials found for this filter.</p>
        </div>
      ` : `
        <div>
          ${filteredTestimonials.map(testimonial => `
            <divbackground: #f0fff0;" : "background: #fff9e6;"}">
              <div>
                <div>
                  <strong>${escapeHtml(testimonial.name)}</strong>
                  ${testimonial.location ? `<br><span>${escapeHtml(testimonial.location)}</span>` : ""}
                  <br>
                  <span>${TestimonialService.formatTimeAgo(testimonial.createdAt)}</span>
                  <br>
                  <span>
                    ${testimonial.approved ? "✓ Approved" : "⏳ Pending"}
                  </span>
                </div>
                <div>
                  ${!testimonial.approved ? `
                    <form method="POST" action="/dashboard/testimonials/${escapeHtml(testimonial.id)}/approve">
                      ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}
                      <button type="submit">
                        ✓ Approve
                      </button>
                    </form>
                  ` : ""}
                  <form method="POST" action="/dashboard/testimonials/${escapeHtml(testimonial.id)}/delete" onsubmit="return confirm('Delete this testimonial?');">
                    ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}
                    <button type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <p>${escapeHtml(testimonial.testimony)}</p>
              ${testimonial.approved && testimonial.approvedAt ? `
                <p>
                  Approved ${TestimonialService.formatTimeAgo(testimonial.approvedAt)}
                </p>
              ` : ""}
            </div>
          `).join("")}
        </div>
      `}
    </div>

    <!-- Submission Keys Section -->
    <div>
      <h2>Generate Submission Key</h2>
      <p>Create a unique link for someone to submit their testimony.</p>

      <form method="POST" action="/dashboard/testimonials/create-key">
        ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}

        <div>
          <label for="key_name">
            Key Name/Description:
          </label>
          <input
            type="text"
            id="key_name"
            name="key_name"
            required
            placeholder="e.g., John Smith, Youth Group Event, etc."
          >
          <small>For your reference - this is not shown to the recipient</small>
        </div>

        <div>
          <label for="expires_in_days">
            Expires In (days):
          </label>
          <input
            type="number"
            id="expires_in_days"
            name="expires_in_days"
            min="1"
            max="365"
            placeholder="30"
          >
          <small>Leave blank for no expiration</small>
        </div>

        <button type="submit">
          🔑 Generate Key
        </button>
      </form>
    </div>

    <!-- Existing Keys -->
    <div>
      <h2>Existing Submission Keys</h2>
      <p>Total: <strong>${keys.length}</strong> keys (${keys.filter(k => !k.used).length} unused)</p>

      ${keys.length === 0 ? `
        <div>
          <p>No submission keys created yet.</p>
        </div>
      ` : `
        <div>
          ${keys.map(key => {
            const url = `${siteUrl}/testimonials?key=${key.id}`;
            const isExpired = key.expiresAt && Date.now() > key.expiresAt;
            const smsLink = `sms:?&body=${encodeURIComponent(`You've been invited to share your testimony! ${url}`)}`;

            return `
              <divopacity: 0.6; background: #f5f5f5;" : isExpired ? "opacity: 0.7; background: #fff3cd;" : "background: #fff;"}">
                <div>
                  <div>
                    <strong>${escapeHtml(key.name)}</strong>
                    <br>
                    <span>Created ${TestimonialService.formatTimeAgo(key.createdAt)} by ${escapeHtml(key.createdBy)}</span>
                    <br>
                    <span>
                      ${key.used ? `✓ Used ${TestimonialService.formatTimeAgo(key.usedAt!)}` : isExpired ? "⏰ Expired" : "🟢 Available"}
                    </span>
                    ${key.expiresAt && !key.used ? `
                      <br><span>Expires ${TestimonialService.formatTimeAgo(key.expiresAt)}</span>
                    ` : ""}
                  </div>

                  <div>
                    <form method="POST" action="/dashboard/testimonials/keys/${escapeHtml(key.id)}/delete" onsubmit="return confirm('Delete this key? This action cannot be undone.');" style="margin-top: 0.5rem;">
                      ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}
                      <button type="submit" style="background: #dc2626; color: white; padding: 0.5rem 1rem; border: none; cursor: pointer; border-radius: 4px;">
                        🗑️ Delete Key
                      </button>
                    </form>
                  </div>
                </div>

                ${!key.used && !isExpired ? `
                  <div>
                      <div>
                        <strong>Submission URL:</strong>
                        <div>
                          <input
                            type="text"
                            readonly
                            value="${url}"
                            onclick="this.select()"
                          >
                          <button
                            type="button"
                            onclick="copyToClipboard('${url}')"
                          >
                            📋 Copy
                          </button>
                        </div>
                      </div>

                      <div>
                        <strong>SMS Link:</strong>
                        <div>
                          <a
                            href="${smsLink}"
                          >
                            💬 Open Messages
                          </a>
                          <button
                            type="button"
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
    activeTab: "testimonials",
    username,
  });
}


