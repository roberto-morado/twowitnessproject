/**
 * Privacy Policy View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";

export function renderPrivacy(): string {
  const content = `
    <section class="page-header">
      <div class="container">
        <h1>Privacy Policy</h1>
        <p>How we handle your information</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container" style="max-width: 800px;">
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>

        <h2>Our Commitment to Privacy</h2>
        <p>
          At Two Witness Project, we are committed to protecting your privacy. This policy explains
          how we collect, use, and protect your information when you use our website.
        </p>

        <h2>Information We Collect</h2>

        <h3>Prayer Requests</h3>
        <p>When you submit a prayer request, we collect:</p>
        <ul>
          <li>Your name (optional)</li>
          <li>Your email address (optional)</li>
          <li>Your prayer request text</li>
          <li>Whether you want the prayer to be public or private</li>
          <li>Timestamp of submission</li>
        </ul>
        <p>
          <strong>Private prayers</strong> are only visible to our ministry team.
          <strong>Public prayers</strong> are displayed on our website for community prayer support.
        </p>

        <h3>Analytics Data</h3>
        <p>We collect anonymous usage data to understand how visitors use our website:</p>
        <ul>
          <li><strong>Page visits:</strong> Which pages you view</li>
          <li><strong>Device type:</strong> Mobile, tablet, or desktop</li>
          <li><strong>Browser:</strong> Which browser you use</li>
          <li><strong>Referrer:</strong> Where you came from</li>
          <li><strong>Anonymized IP:</strong> Your IP address is hashed and cannot be traced back to you</li>
        </ul>

        <p><strong>Important:</strong> We do NOT use cookies or client-side tracking. All analytics are server-side only.</p>

        <h2>How We Use Your Information</h2>

        <h3>Prayer Requests</h3>
        <ul>
          <li>To pray for your needs</li>
          <li>To display public prayers for community support (if you opted in)</li>
          <li>To potentially contact you for follow-up (only if you provided an email)</li>
        </ul>

        <h3>Analytics</h3>
        <ul>
          <li>To understand which content is most helpful</li>
          <li>To improve our website's user experience</li>
          <li>To see where visitors come from</li>
        </ul>

        <h2>Data Retention</h2>
        <ul>
          <li><strong>Analytics data:</strong> Kept for 90 days, then automatically deleted</li>
          <li><strong>Prayed prayers:</strong> Kept for 30 days after being marked as prayed, then automatically deleted</li>
          <li><strong>Unprayed prayers:</strong> Kept indefinitely until we pray for them</li>
          <li><strong>Admin sessions:</strong> Expire after 7 days of inactivity</li>
        </ul>

        <h2>Data Security</h2>
        <p>We take reasonable measures to protect your information:</p>
        <ul>
          <li>IP addresses are anonymized using SHA-256 hashing with a salt</li>
          <li>All data is stored securely in Deno KV (key-value database)</li>
          <li>Admin access is protected with secure, HTTP-only cookies</li>
          <li>No third-party tracking or advertising</li>
        </ul>

        <h2>Third-Party Services</h2>

        <h3>Stripe (Donations)</h3>
        <p>
          When you donate, your payment information is processed by <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Stripe</a>.
          We do not store your credit card information. Stripe's privacy policy governs their data handling.
        </p>

        <h3>Social Media</h3>
        <p>
          Links to our social media accounts (YouTube, Instagram, Discord, Threads, TikTok) are governed
          by their respective privacy policies.
        </p>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request what information we have about you</li>
          <li><strong>Deletion:</strong> Request deletion of your prayer request</li>
          <li><strong>Correction:</strong> Request correction of inaccurate information</li>
        </ul>
        <p>To exercise these rights, email us at <a href="mailto:${AppConfig.contact.email}">${AppConfig.contact.email}</a></p>

        <h2>Children's Privacy</h2>
        <p>
          Our website is not directed at children under 13. We do not knowingly collect information
          from children. If you believe a child has submitted information, please contact us.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Changes will be posted on this page
          with an updated "Last Updated" date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this privacy policy or how we handle your information,
          please contact us:
        </p>
        <p>
          <strong>Email:</strong> <a href="mailto:${AppConfig.contact.email}">${AppConfig.contact.email}</a>
        </p>
      </div>
    </section>
  `;

  return renderLayout({
    title: "Privacy Policy",
    content,
    description: "Learn how Two Witness Project collects, uses, and protects your information.",
    canonicalUrl: "https://twowitnessproject.org/privacy",
  });
}
