/**
 * Journal Entry View
 * Individual journal entry page
 */

import type { JournalEntryWithLocation } from "../models/journal.model.ts";
import { textToHtmlWithScripture } from "../utils/scripture.ts";
import { renderLayout } from "./layout.ts";

/**
 * Render journal entry content
 */
function renderJournalEntryContent(entry: JournalEntryWithLocation): string {
  const dateStr = entry.date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Convert plain text content to HTML with scripture auto-linking
  const contentHtml = textToHtmlWithScripture(entry.content);

  return `
    <article>
      <header>
        <h1>${entry.title}</h1>
        <p>
          <time datetime="${entry.date.toISOString()}">${dateStr}</time>
          ${
    entry.location
      ? ` | <a href="/map">${entry.location.city}, ${entry.location.stateCode}</a>`
      : ""
  }
        </p>
      </header>

      <section>
        ${contentHtml}
      </section>
    </article>

    <hr>

    <p>
      <a href="/journal">← Back to Journal</a>
      |
      <a href="/">Home</a>
    </p>
  `;
}

/**
 * Render full journal entry page
 */
export function renderJournalEntryPage(entry: JournalEntryWithLocation): string {
  return renderLayout({
    title: `${entry.title} - Two Witness Project`,
    content: renderJournalEntryContent(entry),
    activeNav: "journal",
  });
}
