/**
 * Prayer Request View
 * Form for submitting prayer requests
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";

export interface PrayViewData {
  success?: boolean;
  error?: string;
}

export function renderPray(data: PrayViewData = {}): string {
  const { success, error } = data;

  const content = `
    <section class="page-header">
      <div class="container">
        <h1>Submit a Prayer Request</h1>
        <p>Share your prayer needs with us and our community</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        ${success ? `
          <div style="border: 2px solid #000; padding: 20px; margin-bottom: 40px;">
            <h2>✓ Prayer Request Submitted</h2>
            <p>Thank you for sharing your prayer request with us. We will be praying for you!</p>
            <p><a href="/prayers">View public prayers</a> | <a href="/pray">Submit another prayer</a></p>
          </div>
        ` : ""}

        ${error ? `
          <div style="border: 2px solid #000; padding: 20px; margin-bottom: 40px;">
            <h2>Error</h2>
            <p>${error}</p>
          </div>
        ` : ""}

        ${!success ? `
          <form method="POST" action="/pray" style="max-width: 600px;">
            <div style="margin-bottom: 20px;">
              <label for="name" style="display: block; font-weight: bold; margin-bottom: 5px;">
                Your Name (optional):
              </label>
              <input
                type="text"
                id="name"
                name="name"
                style="width: 100%; padding: 10px; border: 2px solid #000; font-size: 18px; font-family: Times, serif;"
              >
              <p style="margin-top: 5px; font-size: 0.9em;">Leave blank to remain anonymous</p>
            </div>

            <div style="margin-bottom: 20px;">
              <label for="email" style="display: block; font-weight: bold; margin-bottom: 5px;">
                Your Email (optional):
              </label>
              <input
                type="email"
                id="email"
                name="email"
                style="width: 100%; padding: 10px; border: 2px solid #000; font-size: 18px; font-family: Times, serif;"
              >
              <p style="margin-top: 5px; font-size: 0.9em;">We will not share your email or use it for marketing</p>
            </div>

            <div style="margin-bottom: 20px;">
              <label for="prayer" style="display: block; font-weight: bold; margin-bottom: 5px;">
                Your Prayer Request (required):
              </label>
              <textarea
                id="prayer"
                name="prayer"
                required
                rows="8"
                style="width: 100%; padding: 10px; border: 2px solid #000; font-size: 18px; font-family: Times, serif; resize: vertical;"
              ></textarea>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block;">
                <input type="checkbox" name="isPublic" value="true" style="width: auto; margin-right: 10px;">
                <strong>Share publicly</strong> for others to pray
              </label>
              <p style="margin-top: 5px; font-size: 0.9em;">
                If unchecked, only our ministry team will see your prayer request
              </p>
            </div>

            <button type="submit" class="btn" style="width: 100%;">
              Submit Prayer Request
            </button>
          </form>

          <div style="margin-top: 40px; padding: 20px; border: 1px solid #000;">
            <h3>📖 Scripture</h3>
            <blockquote>
              "Do not be anxious about anything, but in every situation, by prayer and petition,
              with thanksgiving, present your requests to God. And the peace of God, which transcends
              all understanding, will guard your hearts and your minds in Christ Jesus."
              <cite>- Philippians 4:6-7</cite>
            </blockquote>
          </div>
        ` : ""}
      </div>
    </section>
  `;

  return renderLayout({
    title: "Submit Prayer Request",
    content,
    activeNav: "",
  });
}
