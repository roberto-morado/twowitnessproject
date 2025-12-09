/**
 * Testimonial Submission View
 * Form for submitting testimonials with a valid key
 */

import { AppConfig } from "@config/app.config.ts";
import { escapeHtml } from "@utils/html.ts";
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
    <header>
      <h1>Share Your Testimony</h1>
      <p>Tell us how God has worked in your life</p>
    </header>

    <section>
      ${keyError ? `
        <details open>
          <summary>Invalid Link</summary>
          <p>${keyError}</p>
          <nav>
            <a href="/testimonials">View Testimonials</a>
          </nav>
        </details>
      ` : success ? `
        <details open>
          <summary>Testimony Submitted!</summary>
          <p>
            Thank you for sharing your testimony with us! Your submission has been received and will be reviewed by our team for approval.
          </p>
          <p>
            Once approved, your testimony will be published on our testimonials page to encourage others in their faith journey.
          </p>
          <nav>
            <a href="/testimonials">View Testimonials</a>
            <a href="/">Return Home</a>
          </nav>
        </details>
      ` : `
        ${error ? `
          <details open>
            <summary>Error</summary>
            <p>${error}</p>
          </details>
        ` : ""}

        ${keyName ? `
          <aside>
            <p>
              You're using the invitation: <strong>${escapeHtml(keyName)}</strong>
            </p>
          </aside>
        ` : ""}

        <form method="POST" action="/testimonials/submit">
          ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}
          ${keyId ? `<input type="hidden" name="key_id" value="${escapeHtml(keyId)}">` : ""}

          <fieldset>
            <legend>Your Testimony</legend>

            <p>
              <label for="name">
                <strong>Your Name (required):</strong>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                autofocus
                placeholder="John Doe"
              >
              <small>This will be displayed with your testimony</small>
            </p>

            <p>
              <label for="location">
                <strong>Location (optional):</strong>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="City, State"
              >
              <small>e.g., "Los Angeles, CA" or leave blank</small>
            </p>

            <p>
              <label for="testimony">
                <strong>Your Testimony (required):</strong>
              </label>
              <textarea
                id="testimony"
                name="testimony"
                required
                rows="12"
                placeholder="Share your story of faith, transformation, or how God has worked in your life..."
              ></textarea>
              <small>
                Share as much detail as you're comfortable with. Your story could encourage someone else!
              </small>
            </p>
          </fieldset>

          <details>
            <summary>Before Submitting</summary>
            <ul>
              <li>Your testimony will be reviewed by our team before being published</li>
              <li>We may edit for length or clarity while preserving your message</li>
              <li>By submitting, you give permission for your story to be shared publicly</li>
            </ul>
          </details>

          <button type="submit">
            Submit Testimony
          </button>
        </form>

        <aside>
          <h3>Tips for Writing Your Testimony</h3>
          <ul>
            <li><strong>Be specific:</strong> Share concrete examples of how your faith has impacted your life</li>
            <li><strong>Be authentic:</strong> Your genuine story is more powerful than trying to sound "spiritual"</li>
            <li><strong>Include transformation:</strong> How has your relationship with God changed you?</li>
            <li><strong>Give hope:</strong> What would you want others facing similar situations to know?</li>
          </ul>
        </aside>
      `}
    </section>
  `;

  return renderLayout({
    title: "Submit Testimony",
    content,
    activeNav: "",
  });
}


