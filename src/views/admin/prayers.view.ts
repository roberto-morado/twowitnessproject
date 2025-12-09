/**
 * Admin Prayer Management View
 * Shows all prayers (public and private) with management actions
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";
import { escapeHtml } from "@utils/html.ts";
import type { PrayerRequest } from "../../services/prayer.service.ts";
import { PrayerService } from "../../services/prayer.service.ts";

export interface AdminPrayersViewData {
  prayers: PrayerRequest[];
  filter: "all" | "public" | "private" | "prayed";
  username: string;
}

export function renderAdminPrayers(data: AdminPrayersViewData): string {
  const { prayers, filter, username } = data;

  // Apply filter
  let filteredPrayers = prayers;
  if (filter === "public") {
    filteredPrayers = prayers.filter(p => p.isPublic);
  } else if (filter === "private") {
    filteredPrayers = prayers.filter(p => !p.isPublic);
  } else if (filter === "prayed") {
    filteredPrayers = prayers.filter(p => p.isPrayed);
  }

  const content = `
    <h1>🙏 Prayer Request Management</h1>
    <p>Total: <strong>${prayers.length}</strong> prayer requests</p>

    <div>
      <h3>Filter:</h3>
      <div>
        <a href="/dashboard/prayers"all" ? "background: #000; color: #fff;" : ""}">
          All (${prayers.length})
        </a>
        <a href="/dashboard/prayers?filter=public"public" ? "background: #000; color: #fff;" : ""}">
          Public (${prayers.filter(p => p.isPublic).length})
        </a>
        <a href="/dashboard/prayers?filter=private"private" ? "background: #000; color: #fff;" : ""}">
          Private (${prayers.filter(p => !p.isPublic).length})
        </a>
        <a href="/dashboard/prayers?filter=prayed"prayed" ? "background: #000; color: #fff;" : ""}">
          Prayed (${prayers.filter(p => p.isPrayed).length})
        </a>
      </div>
    </div>

    ${filteredPrayers.length === 0 ? `
      <div>
        <p>No prayer requests found for this filter.</p>
      </div>
    ` : `
      <div>
        ${filteredPrayers.map(prayer => `
          <divopacity: 0.6;" : ""}">
            <div>
              <div>
                <strong>${prayer.name || "Anonymous"}</strong>
                ${prayer.email ? `<br><span>${escapeHtml(prayer.email)}</span>` : ""}
                <br>
                <span>${PrayerService.formatTimeAgo(prayer.createdAt)}</span>
                <br>
                <span>
                  ${prayer.isPublic ? "🌍 Public" : "🔒 Private"}
                  ${prayer.isPrayed ? " • ✓ Prayed" : ""}
                </span>
              </div>
              <div>
                ${!prayer.isPrayed ? `
                  <form method="POST" action="/dashboard/prayers/${prayer.id}/mark-prayed">
                    <button type="submit">
                      ✓ Mark Prayed
                    </button>
                  </form>
                ` : ""}
                <form method="POST" action="/dashboard/prayers/${prayer.id}/delete" onsubmit="return confirm('Delete this prayer request?');">
                  <button type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </div>
            <p>${escapeHtml(prayer.prayer)}</p>
            ${prayer.isPrayed && prayer.prayedAt ? `
              <p>
                <em>Prayed ${PrayerService.formatTimeAgo(prayer.prayedAt)}</em>
              </p>
            ` : ""}
          </div>
        `).join("")}
      </div>
    `}

    <div>
      <h3>💡 Tips</h3>
      <ul>
        <li>Mark prayers as "Prayed" after you've lifted them up</li>
        <li>Private prayers are only visible to admins</li>
        <li>Public prayers appear on the /prayers page for community prayer</li>
        <li>Prayed prayers will be automatically deleted after 30 days (configurable)</li>
      </ul>
    </div>
  `;

  return renderDashboardLayout({
    title: "Prayer Requests",
    content,
    activeTab: "prayers",
    username,
  });
}

