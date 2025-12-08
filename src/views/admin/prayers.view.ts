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
    <p style="margin-bottom: 40px;">Total: <strong>${prayers.length}</strong> prayer requests</p>

    <div style="margin-bottom: 40px;">
      <h3>Filter:</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
        <a href="/dashboard/prayers" class="btn" style="${filter === "all" ? "background: #000; color: #fff;" : ""}">
          All (${prayers.length})
        </a>
        <a href="/dashboard/prayers?filter=public" class="btn" style="${filter === "public" ? "background: #000; color: #fff;" : ""}">
          Public (${prayers.filter(p => p.isPublic).length})
        </a>
        <a href="/dashboard/prayers?filter=private" class="btn" style="${filter === "private" ? "background: #000; color: #fff;" : ""}">
          Private (${prayers.filter(p => !p.isPublic).length})
        </a>
        <a href="/dashboard/prayers?filter=prayed" class="btn" style="${filter === "prayed" ? "background: #000; color: #fff;" : ""}">
          Prayed (${prayers.filter(p => p.isPrayed).length})
        </a>
      </div>
    </div>

    ${filteredPrayers.length === 0 ? `
      <div style="padding: 40px; border: 1px solid #000; text-align: center;">
        <p>No prayer requests found for this filter.</p>
      </div>
    ` : `
      <div style="display: grid; gap: 20px;">
        ${filteredPrayers.map(prayer => `
          <div style="padding: 20px; border: 2px solid #000; ${prayer.isPrayed ? "opacity: 0.6;" : ""}">
            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
              <div>
                <strong>${prayer.name || "Anonymous"}</strong>
                ${prayer.email ? `<br><span style="font-size: 0.9em;">${escapeHtml(prayer.email)}</span>` : ""}
                <br>
                <span style="font-size: 0.9em;">${PrayerService.formatTimeAgo(prayer.createdAt)}</span>
                <br>
                <span style="font-size: 0.9em;">
                  ${prayer.isPublic ? "🌍 Public" : "🔒 Private"}
                  ${prayer.isPrayed ? " • ✓ Prayed" : ""}
                </span>
              </div>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${!prayer.isPrayed ? `
                  <form method="POST" action="/dashboard/prayers/${prayer.id}/mark-prayed" style="display: inline;">
                    <button type="submit" class="btn" style="padding: 5px 15px; font-size: 0.9em;">
                      ✓ Mark Prayed
                    </button>
                  </form>
                ` : ""}
                <form method="POST" action="/dashboard/prayers/${prayer.id}/delete" style="display: inline;" onsubmit="return confirm('Delete this prayer request?');">
                  <button type="submit" class="btn" style="padding: 5px 15px; font-size: 0.9em;">
                    Delete
                  </button>
                </form>
              </div>
            </div>
            <p style="white-space: pre-wrap;">${escapeHtml(prayer.prayer)}</p>
            ${prayer.isPrayed && prayer.prayedAt ? `
              <p style="margin-top: 15px; font-size: 0.9em;">
                <em>Prayed ${PrayerService.formatTimeAgo(prayer.prayedAt)}</em>
              </p>
            ` : ""}
          </div>
        `).join("")}
      </div>
    `}

    <div style="margin-top: 60px; padding: 20px; border: 1px solid #000;">
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

/**
