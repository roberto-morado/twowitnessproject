/**
 * Public Prayers View
 * List of public prayer requests for community prayer
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";
import type { PrayerRequest } from "../services/prayer.service.ts";
import { PrayerService } from "../services/prayer.service.ts";

export interface PrayersViewData {
  prayers: PrayerRequest[];
  page: number;
  totalPages: number;
  total: number;
}

export function renderPrayers(data: PrayersViewData): string {
  const { prayers, page, totalPages, total } = data;

  const content = `
    <section class="page-header">
      <div class="container">
        <h1>Prayer Requests</h1>
        <p>Join us in praying for these requests from our community</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div style="margin-bottom: 40px; text-align: center;">
          <a href="/pray" class="btn">Submit Your Prayer Request</a>
        </div>

        ${prayers.length === 0 ? `
          <div style="padding: 40px; border: 1px solid #000; text-align: center;">
            <h2>No Public Prayers Yet</h2>
            <p>Be the first to share a public prayer request!</p>
            <p style="margin-top: 20px;">
              <a href="/pray" class="btn">Submit a Prayer</a>
            </p>
          </div>
        ` : `
          <div style="margin-bottom: 20px;">
            <p><strong>${total}</strong> prayer request${total !== 1 ? "s" : ""} shared with the community</p>
          </div>

          <div style="display: grid; gap: 20px; margin-bottom: 40px;">
            ${prayers.map(prayer => `
              <div style="padding: 20px; border: 1px solid #000;">
                <div style="margin-bottom: 10px;">
                  <strong>${prayer.name || "Anonymous"}</strong>
                  <span style="margin-left: 10px; font-size: 0.9em;">
                    ${PrayerService.formatTimeAgo(prayer.createdAt)}
                  </span>
                </div>
                <p style="white-space: pre-wrap;">${escapeHtml(prayer.prayer)}</p>
              </div>
            `).join("")}
          </div>

          ${totalPages > 1 ? `
            <div style="text-align: center; margin-top: 40px;">
              <p style="margin-bottom: 20px;">Page ${page} of ${totalPages}</p>
              <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                ${page > 1 ? `<a href="/prayers?page=${page - 1}" class="btn">← Previous</a>` : ""}
                ${page < totalPages ? `<a href="/prayers?page=${page + 1}" class="btn">Next →</a>` : ""}
              </div>
            </div>
          ` : ""}
        `}

        <div style="margin-top: 60px; padding: 20px; border: 1px solid #000;">
          <h3>🙏 How to Pray</h3>
          <p>
            Take a moment to pray for each request you read. Ask God to provide comfort,
            healing, guidance, and strength according to His will. Your prayers make a difference!
          </p>
        </div>
      </div>
    </section>
  `;

  return renderLayout({
    title: "Prayer Requests",
    content,
    activeNav: "",
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
