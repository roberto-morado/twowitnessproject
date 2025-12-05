/**
 * Testimonial Submission View
 * Form for submitting testimonials with a valid key
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";
import { CsrfService } from "../services/csrf.service.ts";

export interface TestimonialSubmitViewData {
  keyId?: string;
  keyName?: string;
  success?: boolean;
  error?: string;
  keyError?: string; // Special error for invalid/expired keys
  csrfToken?: string;
}

export function renderTestimonialSubmit(data: TestimonialSubmitViewData = {}): string {
  const { keyId, keyName, success, error, keyError, csrfToken } = data;

  const content = `
    <section class="page-header">
      <div class="container">
        <h1>Share Your Testimony</h1>
        <p>Tell us how God has worked in your life</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        ${keyError ? `
          <div style="border: 2px solid #000; padding: 30px; margin-bottom: 40px; background: #fff3cd;">
            <h2>⚠️ Invalid Link</h2>
            <p style="margin-top: 15px;">${keyError}</p>
            <p style="margin-top: 20px;">
              <a href="/testimonials" class="btn">View Testimonials</a>
            </p>
          </div>
        ` : success ? `
          <div style="border: 2px solid #000; padding: 30px; background: #d4edda;">
            <h2>✓ Testimony Submitted!</h2>
            <p style="margin-top: 15px;">
              Thank you for sharing your testimony with us! Your submission has been received and will be reviewed by our team for approval.
            </p>
            <p style="margin-top: 15px;">
              Once approved, your testimony will be published on our testimonials page to encourage others in their faith journey.
            </p>
            <p style="margin-top: 30px;">
              <a href="/testimonials" class="btn">View Testimonials</a>
              <a href="/" class="btn" style="margin-left: 10px;">Return Home</a>
            </p>
          </div>
        ` : `
          ${error ? `
            <div style="border: 2px solid #000; padding: 20px; margin-bottom: 30px; background: #f8d7da;">
              <strong>Error:</strong> ${error}
            </div>
          ` : ""}

          ${keyName ? `
            <div style="padding: 20px; border: 2px solid #000; margin-bottom: 30px; background: #d1ecf1;">
              <p style="margin: 0;">
                ℹ️ You're using the invitation: <strong>${escapeHtml(keyName)}</strong>
              </p>
            </div>
          ` : ""}

          <form method="POST" action="/testimonials/submit" style="max-width: 700px;">
            ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}
            ${keyId ? `<input type="hidden" name="key_id" value="${escapeHtml(keyId)}">` : ""}

            <div style="margin-bottom: 20px;">
              <label for="name" style="display: block; font-weight: bold; margin-bottom: 5px;">
                Your Name (required):
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                autofocus
                style="width: 100%; padding: 10px; border: 2px solid #000; font-size: 18px; font-family: Times, serif;"
                placeholder="John Doe"
              >
              <small style="display: block; margin-top: 5px;">This will be displayed with your testimony</small>
            </div>

            <div style="margin-bottom: 20px;">
              <label for="location" style="display: block; font-weight: bold; margin-bottom: 5px;">
                Location (optional):
              </label>
              <input
                type="text"
                id="location"
                name="location"
                style="width: 100%; padding: 10px; border: 2px solid #000; font-size: 18px; font-family: Times, serif;"
                placeholder="City, State"
              >
              <small style="display: block; margin-top: 5px;">e.g., "Los Angeles, CA" or leave blank</small>
            </div>

            <div style="margin-bottom: 20px;">
              <label for="testimony" style="display: block; font-weight: bold; margin-bottom: 5px;">
                Your Testimony (required):
              </label>
              <textarea
                id="testimony"
                name="testimony"
                required
                rows="12"
                style="width: 100%; padding: 10px; border: 2px solid #000; font-size: 18px; font-family: Times, serif; resize: vertical;"
                placeholder="Share your story of faith, transformation, or how God has worked in your life..."
              ></textarea>
              <small style="display: block; margin-top: 5px;">
                Share as much detail as you're comfortable with. Your story could encourage someone else!
              </small>
            </div>

            <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #000; background: #f9f9f9;">
              <h3 style="margin-top: 0;">📋 Before Submitting</h3>
              <ul style="margin: 10px 0; line-height: 1.8;">
                <li>Your testimony will be reviewed by our team before being published</li>
                <li>We may edit for length or clarity while preserving your message</li>
                <li>By submitting, you give permission for your story to be shared publicly</li>
              </ul>
            </div>

            <button type="submit" class="btn" style="width: 100%; font-size: 1.2em; padding: 15px;">
              ✨ Submit Testimony
            </button>
          </form>

          <div style="margin-top: 40px; padding: 20px; border: 1px solid #000;">
            <h3>💡 Tips for Writing Your Testimony</h3>
            <ul style="line-height: 1.8;">
              <li><strong>Be specific:</strong> Share concrete examples of how your faith has impacted your life</li>
              <li><strong>Be authentic:</strong> Your genuine story is more powerful than trying to sound "spiritual"</li>
              <li><strong>Include transformation:</strong> How has your relationship with God changed you?</li>
              <li><strong>Give hope:</strong> What would you want others facing similar situations to know?</li>
            </ul>
          </div>
        `}
      </div>
    </section>
  `;

  return renderLayout({
    title: "Submit Testimony",
    content,
    activeNav: "",
  });
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
