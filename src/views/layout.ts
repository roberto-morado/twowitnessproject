/**
 * Layout View - Template Pattern
 * Provides consistent layout wrapper for all pages
 */

import { AppConfig } from "@config/app.config.ts";

export interface LayoutData {
  title: string;
  content: string;
  activeNav?: string;
}

export function renderLayout(data: LayoutData): string {
  const { title, content, activeNav = "" } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${AppConfig.ministry.description}">
  <title>${title} - ${AppConfig.ministry.name}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <header>
    <nav class="navbar">
      <div class="container">
        <a href="/" class="logo">
          <h1>${AppConfig.ministry.name}</h1>
        </a>
        <ul class="nav-menu">
          <li><a href="/" class="${activeNav === "home" ? "active" : ""}">Home</a></li>
          <li><a href="/about" class="${activeNav === "about" ? "active" : ""}">About</a></li>
          <li><a href="/videos" class="${activeNav === "videos" ? "active" : ""}">Videos</a></li>
          <li><a href="/donate" class="${activeNav === "donate" ? "active" : ""}">Donate</a></li>
        </ul>
      </div>
    </nav>
  </header>

  <main>
    ${content}
  </main>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>${AppConfig.ministry.name}</h3>
          <p>${AppConfig.ministry.tagline}</p>
        </div>
        <div class="footer-section">
          <h3>Follow Us</h3>
          <div class="social-links">
            <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener">YouTube</a>
            <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener">Instagram</a>
            <a href="${AppConfig.socialMedia.facebook}" target="_blank" rel="noopener">Facebook</a>
            <a href="${AppConfig.socialMedia.twitter}" target="_blank" rel="noopener">Twitter</a>
            <a href="${AppConfig.socialMedia.tiktok}" target="_blank" rel="noopener">TikTok</a>
          </div>
        </div>
        <div class="footer-section">
          <h3>Support Our Ministry</h3>
          <p>Help us spread the Gospel</p>
          <a href="/donate" class="btn btn-secondary">Donate</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${AppConfig.ministry.name}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}
