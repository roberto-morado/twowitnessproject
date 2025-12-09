/**
 * Public Prayers View
 * List of public prayer requests for community prayer
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";
import type { PrayerRequest } from "../services/prayer.service.ts";
import { PrayerService } from "../services/prayer.service.ts";
import { escapeHtml } from "@utils/html.ts";

export interface PrayersViewData {
  prayers: PrayerRequest[];
  page: number;
  totalPages: number;
  total: number;
}

export function renderPrayers(data: PrayersViewData): string {
  const { prayers, page, totalPages, total } = data;

  const content = `
    <header>
      <h1>Prayer Requests</h1>
      <p>Join us in praying for these requests from our community</p>
    </header>

    <section>
      <nav>
        <a href="/pray">Submit Your Prayer Request</a>
      </nav>

      ${prayers.length === 0 ? `
        <article>
          <h2>No Public Prayers Yet</h2>
          <p>Be the first to share a public prayer request!</p>
          <p>
            <a href="/pray">Submit a Prayer</a>
          </p>
        </article>
      ` : `
        <p><strong>${total}</strong> prayer request${total !== 1 ? "s" : ""} shared with the community</p>

        ${prayers.map(prayer => `
          <article>
            <header>
              <strong>${prayer.name || "Anonymous"}</strong>
              <time>${PrayerService.formatTimeAgo(prayer.createdAt)}</time>
            </header>
            <p>${escapeHtml(prayer.prayer)}</p>
          </article>
        `).join("")}

        ${totalPages > 1 ? `
          <nav>
            <p>Page ${page} of ${totalPages}</p>
            ${page > 1 ? `<a href="/prayers?page=${page - 1}">← Previous</a>` : ""}
            ${page < totalPages ? `<a href="/prayers?page=${page + 1}">Next →</a>` : ""}
          </nav>
        ` : ""}
      `}

      <aside>
        <h3>How to Pray</h3>
        <p>
          Take a moment to pray for each request you read. Ask God to provide comfort,
          healing, guidance, and strength according to His will. Your prayers make a difference!
        </p>
      </aside>
    </section>
  `;

  return renderLayout({
    title: "Prayer Requests",
    content,
    activeNav: "",
  });
}

