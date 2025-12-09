/**
 * Prayer Request View
 * Form for submitting prayer requests
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";
import { CsrfService } from "../services/csrf.service.ts";
import type { NotificationOptions } from "./components/notification.ts";

export interface PrayViewData {
  success?: boolean;
  error?: string;
  csrfToken?: string;
  notification?: NotificationOptions;
}

export function renderPray(data: PrayViewData = {}): string {
  const { success, error, csrfToken, notification } = data;

  const content = `
    <header>
      <h1>Submit a Prayer Request</h1>
      <p>Share your prayer needs with us and our community</p>
    </header>

    <section>
      ${success ? `
        <details open>
          <summary>Prayer Request Submitted</summary>
          <p>Thank you for sharing your prayer request with us. We will be praying for you!</p>
          <nav>
            <a href="/prayers">View public prayers</a> | <a href="/pray">Submit another prayer</a>
          </nav>
        </details>
      ` : ""}

      ${error ? `
        <details open>
          <summary>Error</summary>
          <p>${error}</p>
        </details>
      ` : ""}

      ${!success ? `
        <form method="POST" action="/pray">
          ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}

          <!-- Honeypot field for spam protection (hidden from users, visible to bots) -->
          <div style="position: absolute; left: -5000px;" aria-hidden="true">
            <label for="website">Website:</label>
            <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
          </div>

          <fieldset>
            <legend>Prayer Request Information</legend>

            <p>
              <label for="name">
                <strong>Your Name (optional):</strong>
              </label>
              <input
                type="text"
                id="name"
                name="name"
              >
              <small>Leave blank to remain anonymous</small>
            </p>

            <p>
              <label for="email">
                <strong>Your Email (optional):</strong>
              </label>
              <input
                type="email"
                id="email"
                name="email"
              >
              <small>We will not share your email or use it for marketing</small>
            </p>

            <p>
              <label for="prayer">
                <strong>Your Prayer Request (required):</strong>
              </label>
              <textarea
                id="prayer"
                name="prayer"
                required
                rows="8"
              ></textarea>
            </p>

            <p>
              <label>
                <input type="checkbox" name="isPublic" value="true">
                <strong>Share publicly</strong> for others to pray
              </label>
              <small>
                If unchecked, only our ministry team will see your prayer request
              </small>
            </p>

            <button type="submit">
              Submit Prayer Request
            </button>
          </fieldset>
        </form>

        <aside>
          <h3>Scripture</h3>
          <blockquote>
            "Do not be anxious about anything, but in every situation, by prayer and petition,
            with thanksgiving, present your requests to God. And the peace of God, which transcends
            all understanding, will guard your hearts and your minds in Christ Jesus."
            <footer><cite>Philippians 4:6-7</cite></footer>
          </blockquote>
        </aside>
      ` : ""}
    </section>
  `;

  return renderLayout({
    title: "Submit Prayer Request",
    content,
    activeNav: "",
    notification,
  });
}
