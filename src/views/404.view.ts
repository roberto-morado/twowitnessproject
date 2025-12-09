/**
 * 404 Not Found View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";

export function render404(): string {
  const content = `
    <section>
      <header>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          The page you're looking for doesn't exist or has been moved.
        </p>
      </header>

      <nav>
        <a href="/">Go Home</a>
      </nav>

      <aside>
        <h3>Quick Links</h3>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Our Ministry</a></li>
            <li><a href="/videos">Videos</a></li>
            <li><a href="/donate">Support Us</a></li>
            <li><a href="/pray">Submit Prayer Request</a></li>
            <li><a href="/prayers">View Public Prayers</a></li>
          </ul>
        </nav>
      </aside>
    </section>
  `;

  return renderLayout({
    title: "Page Not Found",
    content,
    description: "The page you're looking for doesn't exist.",
  });
}
