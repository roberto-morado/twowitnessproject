/**
 * Admin Journal Management View
 * Manage ministry journal entries
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";
import { escapeHtml } from "@utils/html.ts";
import type { JournalEntry } from "../../models/journal.model.ts";
import type { Location } from "../../models/location.model.ts";

export interface AdminJournalViewData {
  entries: JournalEntry[];
  locations: Location[];
  username: string;
  editingEntry?: JournalEntry | null;
  filter: "all" | "published" | "drafts" | "featured";
}

export function renderAdminJournal(data: AdminJournalViewData): string {
  const { entries, locations, username, editingEntry, filter } = data;

  // Apply filter
  let filteredEntries = entries;
  if (filter === "published") {
    filteredEntries = entries.filter(e => e.isPublished);
  } else if (filter === "drafts") {
    filteredEntries = entries.filter(e => !e.isPublished);
  } else if (filter === "featured") {
    filteredEntries = entries.filter(e => e.isFeatured && e.isPublished);
  }

  const content = `
    <h1>📖 Journal Management</h1>
    <p>
      Total: <strong>${entries.length}</strong> entries |
      Published: <strong>${entries.filter(e => e.isPublished).length}</strong> |
      Drafts: <strong>${entries.filter(e => !e.isPublished).length}</strong> |
      Featured: <strong>${entries.filter(e => e.isFeatured && e.isPublished).length}</strong>
    </p>

    <!-- Add/Edit Journal Entry Form -->
    <section>
      <h2>${editingEntry ? "Edit Journal Entry" : "Create New Journal Entry"}</h2>

      <form method="POST" action="${editingEntry ? `/dashboard/journal/${editingEntry.id}/update` : "/dashboard/journal/create"}">
        <fieldset>
          <legend>Entry Details</legend>

          <div>
            <label for="title">Title: *</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value="${editingEntry ? escapeHtml(editingEntry.title) : ""}"
              placeholder="An Encounter in Phoenix"
            >
            <small>Slug will be auto-generated from title</small>
          </div>

          <div>
            <label for="date">Date: *</label>
            <input
              type="date"
              id="date"
              name="date"
              required
              value="${editingEntry ? editingEntry.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}"
            >
          </div>

          <div>
            <label for="locationId">Location (optional):</label>
            <select id="locationId" name="locationId">
              <option value="">No location</option>
              ${locations.map(location => `
                <option
                  value="${location.id}"
                  ${editingEntry?.locationId === location.id ? "selected" : ""}
                >
                  ${escapeHtml(location.city)}, ${escapeHtml(location.stateCode)}
                </option>
              `).join("")}
            </select>
            <small>Link this entry to a location on the map</small>
          </div>

          <div>
            <label for="content">Content: *</label>
            <textarea
              id="content"
              name="content"
              required
              rows="15"
              placeholder="Write your journal entry here. Use plain text with line breaks.

Scripture references like John 3:16 or Matthew 5:14-16 will be automatically linked.

Double line breaks create new paragraphs."
            >${editingEntry ? escapeHtml(editingEntry.content) : ""}</textarea>
            <small>Plain text only. Scripture references will be auto-linked (e.g., John 3:16).</small>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                name="isPublished"
                value="true"
                ${editingEntry?.isPublished ? "checked" : ""}
              >
              Publish entry
            </label>
            <small>Only published entries are visible to visitors</small>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                name="isFeatured"
                value="true"
                ${editingEntry?.isFeatured ? "checked" : ""}
              >
              Feature on homepage
            </label>
            <small>Last 2 featured entries appear on homepage</small>
          </div>

          <div>
            <button type="submit">
              ${editingEntry ? "💾 Update Entry" : "➕ Create Entry"}
            </button>
            ${editingEntry ? `
              <a href="/dashboard/journal">
                <button type="button">Cancel Edit</button>
              </a>
            ` : ""}
          </div>
        </fieldset>
      </form>
    </section>

    <!-- Filter Entries -->
    <section>
      <h2>Journal Entries</h2>

      <div>
        <strong>Filter:</strong>
        <a href="/dashboard/journal">${filter === "all" ? "<strong>All</strong> (current)" : "All"}</a> |
        <a href="/dashboard/journal?filter=published">${filter === "published" ? "<strong>Published</strong> (current)" : "Published"}</a> |
        <a href="/dashboard/journal?filter=drafts">${filter === "drafts" ? "<strong>Drafts</strong> (current)" : "Drafts"}</a> |
        <a href="/dashboard/journal?filter=featured">${filter === "featured" ? "<strong>Featured</strong> (current)" : "Featured"}</a>
      </div>

      ${filteredEntries.length === 0 ? `
        <p>No entries found for this filter.</p>
      ` : `
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filteredEntries.map(entry => {
              const dateStr = entry.date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const location = entry.locationId
                ? locations.find(l => l.id === entry.locationId)
                : null;

              return `
                <tr${entry.isFeatured ? ' style="background: #ffffcc;"' : !entry.isPublished ? ' style="background: #f5f5f5;"' : ""}>
                  <td>
                    <strong>${escapeHtml(entry.title)}</strong>
                    <br>
                    <small>/${entry.slug}</small>
                  </td>
                  <td>${dateStr}</td>
                  <td>
                    ${location ? `${escapeHtml(location.city)}, ${escapeHtml(location.stateCode)}` : "—"}
                  </td>
                  <td>
                    ${entry.isPublished ? "✓ Published" : "📝 Draft"}
                    ${entry.isFeatured ? "<br>⭐ Featured" : ""}
                  </td>
                  <td>
                    ${entry.isPublished ? `
                      <a href="/journal/${entry.slug}" target="_blank">
                        <button type="button">View</button>
                      </a>
                    ` : ""}
                    <form method="POST" action="/dashboard/journal/${entry.id}/edit" style="display: inline;">
                      <button type="submit">Edit</button>
                    </form>
                    <br>
                    <form method="POST" action="/dashboard/journal/${entry.id}/toggle-publish" style="display: inline;">
                      <button type="submit">${entry.isPublished ? "Unpublish" : "Publish"}</button>
                    </form>
                    <form method="POST" action="/dashboard/journal/${entry.id}/toggle-feature" style="display: inline;">
                      <button type="submit">${entry.isFeatured ? "Unfeature" : "Feature"}</button>
                    </form>
                    <br>
                    <form method="POST" action="/dashboard/journal/${entry.id}/delete" style="display: inline;" onsubmit="return confirm('Delete this journal entry? This cannot be undone.');">
                      <button type="submit">Delete</button>
                    </form>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      `}
    </section>
  `;

  return renderDashboardLayout({
    title: "Journal",
    content,
    activeTab: "journal",
    username,
  });
}
