/**
 * 404 Not Found View - Minimal
 */

import { AppConfig } from "@config/app.config.ts";
import { renderMinimalLayout } from "./minimal-layout.ts";

export function render404(): string {
  const content = `
    <div class="container" style="text-align: center; padding-top: 4rem;">
      <h1 style="font-size: 4rem; margin-bottom: 1rem;">404</h1>
      <h2 style="font-size: 1.5rem; margin-bottom: 2rem; color: white;">Page Not Found</h2>
      <p style="color: white; opacity: 0.9; margin-bottom: 2rem;">
        The page you're looking for doesn't exist.
      </p>
      <a href="/" class="btn" style="display: inline-block;">
        ← Go Home
      </a>
    </div>
  `;

  return renderMinimalLayout({
    title: "404 - Page Not Found",
    content,
  });
}
