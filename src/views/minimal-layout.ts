/**
 * Minimal Layout - Linktree Style
 * Simple, clean layout with just header and content
 */

import { AppConfig } from "@config/app.config.ts";

export interface MinimalLayoutData {
  title?: string;
  content: string;
}

export function renderMinimalLayout(data: MinimalLayoutData): string {
  const { title, content } = data;

  // Generate emoji favicon
  const faviconSvg = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">👥</text></svg>')}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || AppConfig.ministry.name}</title>
  <link rel="icon" href="${faviconSvg}">
  <link rel="stylesheet" href="/css/linktree.css">
</head>
<body>
  ${content}
</body>
</html>`;
}
