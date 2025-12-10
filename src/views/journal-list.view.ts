/**
 * Journal List View
 * Paginated list of published journal entries
 */

import type { JournalEntry } from "../models/journal.model.ts";
import { renderLayout } from "./layout.ts";

/**
 * Render individual journal entry in list
 */
function renderJournalEntryListItem(entry: JournalEntry): string {
  const dateStr = entry.date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <article>
      <h2>
        <a href="/journal/${entry.slug}">${entry.title}</a>
      </h2>
      <p>
        <time datetime="${entry.date.toISOString()}">${dateStr}</time>
      </p>
      <p>${entry.excerpt}</p>
      <p>
        <a href="/journal/${entry.slug}">Read full entry →</a>
      </p>
    </article>
    <hr>
  `;
}

/**
 * Render pagination controls
 */
function renderPagination(
  currentPage: number,
  totalPages: number,
  baseUrl: string = "/journal"
): string {
  if (totalPages <= 1) {
    return "";
  }

  const links: string[] = [];

  // Previous page
  if (currentPage > 1) {
    const prevPage = currentPage - 1;
    const prevUrl = prevPage === 1 ? baseUrl : `${baseUrl}?page=${prevPage}`;
    links.push(`<a href="${prevUrl}">← Previous</a>`);
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageUrl = i === 1 ? baseUrl : `${baseUrl}?page=${i}`;
    if (i === currentPage) {
      links.push(`<strong>${i}</strong>`);
    } else {
      links.push(`<a href="${pageUrl}">${i}</a>`);
    }
  }

  // Next page
  if (currentPage < totalPages) {
    const nextPage = currentPage + 1;
    const nextUrl = `${baseUrl}?page=${nextPage}`;
    links.push(`<a href="${nextUrl}">Next →</a>`);
  }

  return `
    <nav aria-label="Pagination">
      <p>
        ${links.join(" | ")}
      </p>
    </nav>
  `;
}

/**
 * Render journal list page content
 */
function renderJournalListContent(
  entries: JournalEntry[],
  currentPage: number,
  totalPages: number,
  total: number
): string {
  return `
    <h1>Ministry Journal</h1>

    <p>
      <em>
        Sharing experiences, testimonies, and lessons from our ministry journey.
        Total entries: ${total}
      </em>
    </p>

    ${
    entries.length === 0
      ? `<p>No journal entries published yet. Check back soon!</p>`
      : entries.map(renderJournalEntryListItem).join("")
  }

    ${renderPagination(currentPage, totalPages)}

    <p>
      <a href="/">← Back to Homepage</a>
    </p>
  `;
}

/**
 * Render full journal list page
 */
export function renderJournalListPage(
  entries: JournalEntry[],
  currentPage: number,
  totalPages: number,
  total: number
): string {
  const pageTitle = currentPage === 1
    ? "Ministry Journal - Two Witness Project"
    : `Ministry Journal (Page ${currentPage}) - Two Witness Project`;

  return renderLayout({
    title: pageTitle,
    content: renderJournalListContent(entries, currentPage, totalPages, total),
    activeNav: "journal",
  });
}
