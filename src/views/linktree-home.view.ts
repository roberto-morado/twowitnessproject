/**
 * Linktree Homepage View
 * Displays list of links as cards
 */

import { AppConfig } from "@config/app.config.ts";
import { renderMinimalLayout } from "./minimal-layout.ts";
import type { Link } from "../models/link.model.ts";
import { escapeHtml } from "@utils/html.ts";

export interface LinktreeHomeData {
  links: Link[];
}

export function renderLinktreeHome(data: LinktreeHomeData): string {
  const { links } = data;

  const content = `
    <div class="container">
      <!-- Header -->
      <header class="profile-header">
        <h1>${AppConfig.ministry.name}</h1>
        <p>${AppConfig.ministry.tagline}</p>
      </header>

      <!-- Links -->
      <div class="links">
        ${links.map(link => `
          <a href="${escapeHtml(link.url)}" class="link-card" target="_blank" rel="noopener">
            <span class="link-emoji">${link.emoji}</span>
            <span class="link-title">${escapeHtml(link.title)}</span>
          </a>
        `).join("")}
      </div>

      <!-- Footer -->
      <footer class="site-footer">
        <p>&copy; ${new Date().getFullYear()} ${AppConfig.ministry.name}</p>
      </footer>
    </div>
  `;

  return renderMinimalLayout({
    title: AppConfig.ministry.name,
    content,
  });
}
