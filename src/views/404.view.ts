/**
 * 404 Not Found View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";

export function render404(): string {
  const content = `
    <section class="content-section">
      <div class="container" style="text-align: center; max-width: 600px; margin: 60px auto;">
        <h1 style="font-size: 4em; margin-bottom: 20px;">404</h1>
        <h2>Page Not Found</h2>
        <p style="margin: 30px 0;">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style="margin: 40px 0;">
          <a href="/" class="btn">Go Home</a>
        </div>

        <div style="margin-top: 60px; padding: 20px; border: 1px solid #000; text-align: left;">
          <h3>Quick Links</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><a href="/">🏠 Home</a></li>
            <li style="margin: 10px 0;"><a href="/about">📖 About Our Ministry</a></li>
            <li style="margin: 10px 0;"><a href="/videos">🎥 Videos</a></li>
            <li style="margin: 10px 0;"><a href="/donate">💝 Support Us</a></li>
            <li style="margin: 10px 0;"><a href="/pray">🙏 Submit Prayer Request</a></li>
            <li style="margin: 10px 0;"><a href="/prayers">📋 View Public Prayers</a></li>
          </ul>
        </div>
      </div>
    </section>
  `;

  return renderLayout({
    title: "Page Not Found",
    content,
    description: "The page you're looking for doesn't exist.",
  });
}
