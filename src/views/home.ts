import { Link } from "../links.ts";
import { ColorTheme } from "../colors.ts";

export function renderHome(links: Link[], theme: ColorTheme): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Two Witness Project</title>
  <link rel="stylesheet" href="/styles.css">
  <style>
    :root {
      --color-primary: ${theme.primary};
      --color-secondary: ${theme.secondary};
      --color-accent: ${theme.accent};
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Two Witness Project</h1>
      <p>Traveling across USA preaching Christ</p>
    </header>

    <main class="links-grid">
      ${links.map(link => `
        <a href="${escapeHtml(link.url)}" class="link-card" target="_blank" rel="noopener noreferrer">
          <h2>${escapeHtml(link.name)}</h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <path d="M15 3h6v6"/>
            <path d="M10 14L21 3"/>
          </svg>
        </a>
      `).join("")}
    </main>
  </div>
</body>
</html>`;
}

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
