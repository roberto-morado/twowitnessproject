/**
 * Email Settings View
 * Admin dashboard page for configuring SMTP email settings
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";
import { escapeHtml } from "@utils/html.ts";
import type { EmailConfig } from "../../models/email.model.ts";

export interface EmailSettingsViewData {
  username: string;
  config: EmailConfig | null;
  successMessage?: string;
  errorMessage?: string;
}

export function renderEmailSettings(data: EmailSettingsViewData): string {
  const { username, config, successMessage, errorMessage } = data;

  const content = `
    <h1>📧 Email Settings</h1>

    ${successMessage ? `
      <div style="background: #d1fae5; padding: 1rem; border-left: 4px solid #10b981; margin-bottom: 1rem;">
        <strong>✓ ${escapeHtml(successMessage)}</strong>
      </div>
    ` : ""}

    ${errorMessage ? `
      <div style="background: #fee2e2; padding: 1rem; border-left: 4px solid #ef4444; margin-bottom: 1rem;">
        <strong>✗ ${escapeHtml(errorMessage)}</strong>
      </div>
    ` : ""}

    <p>
      Configure SMTP settings to send automated emails for prayer confirmations,
      testimonial receipts, and other ministry communications.
    </p>

    ${config ? `
      <section style="background: #f9fafb; padding: 1rem; margin-bottom: 2rem;">
        <h2>Current Configuration</h2>
        <dl>
          <dt><strong>Status:</strong></dt>
          <dd>${config.isEnabled ? "✓ Enabled" : "✗ Disabled"}</dd>

          <dt><strong>SMTP Host:</strong></dt>
          <dd>${escapeHtml(config.smtpHost)}</dd>

          <dt><strong>SMTP Port:</strong></dt>
          <dd>${config.smtpPort}</dd>

          <dt><strong>Username:</strong></dt>
          <dd>${escapeHtml(config.smtpUsername)}</dd>

          <dt><strong>From Email:</strong></dt>
          <dd>${escapeHtml(config.fromEmail)}</dd>

          <dt><strong>From Name:</strong></dt>
          <dd>${escapeHtml(config.fromName)}</dd>

          <dt><strong>TLS Enabled:</strong></dt>
          <dd>${config.useTLS ? "Yes" : "No"}</dd>

          <dt><strong>Last Updated:</strong></dt>
          <dd>${config.updatedAt.toLocaleString()} by ${escapeHtml(config.updatedBy)}</dd>
        </dl>
      </section>
    ` : `
      <section style="background: #fef3c7; padding: 1rem; margin-bottom: 2rem;">
        <p><strong>⚠️ Email not configured yet.</strong> Fill out the form below to enable email sending.</p>
      </section>
    `}

    <!-- Email Configuration Form -->
    <section>
      <h2>${config ? "Update Email Settings" : "Configure Email Settings"}</h2>

      <form method="POST" action="/dashboard/email-settings/save">
        <fieldset>
          <legend>SMTP Server Settings</legend>

          <div>
            <label for="smtpHost">SMTP Host: *</label>
            <input
              type="text"
              id="smtpHost"
              name="smtpHost"
              required
              value="${config ? escapeHtml(config.smtpHost) : "mail.postale.io"}"
              placeholder="mail.postale.io"
            >
            <small>Your SMTP server address (e.g., mail.postale.io, smtp.gmail.com)</small>
          </div>

          <div>
            <label for="smtpPort">SMTP Port: *</label>
            <input
              type="number"
              id="smtpPort"
              name="smtpPort"
              required
              min="1"
              max="65535"
              value="${config ? config.smtpPort : 587}"
              placeholder="587"
            >
            <small>Common ports: 587 (TLS), 465 (SSL), 25 (unsecured)</small>
          </div>

          <div>
            <label for="smtpUsername">SMTP Username: *</label>
            <input
              type="text"
              id="smtpUsername"
              name="smtpUsername"
              required
              value="${config ? escapeHtml(config.smtpUsername) : ""}"
              placeholder="ministry@twowitnessproject.org"
            >
            <small>Usually your email address</small>
          </div>

          <div>
            <label for="smtpPassword">SMTP Password: *</label>
            <input
              type="password"
              id="smtpPassword"
              name="smtpPassword"
              ${config ? "" : "required"}
              placeholder="${config ? "••••••••••••" : "Enter password"}"
            >
            <small>${config ? "Leave blank to keep current password" : "Your email password or app-specific password"}</small>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                name="useTLS"
                value="true"
                ${config?.useTLS !== false ? "checked" : ""}
              >
              Use TLS (recommended for security)
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Sender Information</legend>

          <div>
            <label for="fromEmail">From Email Address: *</label>
            <input
              type="email"
              id="fromEmail"
              name="fromEmail"
              required
              value="${config ? escapeHtml(config.fromEmail) : ""}"
              placeholder="ministry@twowitnessproject.org"
            >
            <small>Email address that will appear as sender</small>
          </div>

          <div>
            <label for="fromName">From Name: *</label>
            <input
              type="text"
              id="fromName"
              name="fromName"
              required
              value="${config ? escapeHtml(config.fromName) : "Two Witness Project"}"
              placeholder="Two Witness Project"
            >
            <small>Name that will appear as sender</small>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                name="isEnabled"
                value="true"
                ${config?.isEnabled !== false ? "checked" : ""}
              >
              Enable email sending
            </label>
            <small>Uncheck to temporarily disable all automated emails</small>
          </div>
        </fieldset>

        <div>
          <button type="submit">💾 Save Settings</button>
        </div>
      </form>
    </section>

    <!-- Test Email Section -->
    ${config ? `
    <section>
      <h2>Test Email Configuration</h2>
      <p>Send a test email to verify your SMTP settings are working correctly.</p>

      <form method="POST" action="/dashboard/email-settings/test">
        <div>
          <label for="testEmail">Send test email to:</label>
          <input
            type="email"
            id="testEmail"
            name="testEmail"
            required
            value="${escapeHtml(config.fromEmail)}"
            placeholder="your-email@example.com"
          >
        </div>

        <div>
          <button type="submit">📨 Send Test Email</button>
        </div>
      </form>
    </section>
    ` : ""}

    <details>
      <summary>Help: Setting up Postale.io SMTP</summary>
      <p>If you're using Postale.io, use these settings:</p>
      <ul>
        <li><strong>SMTP Host:</strong> mail.postale.io</li>
        <li><strong>SMTP Port:</strong> 587</li>
        <li><strong>Username:</strong> Your email address (e.g., ministry@twowitnessproject.org)</li>
        <li><strong>Password:</strong> Your Postale.io password</li>
        <li><strong>TLS:</strong> Enabled (checked)</li>
      </ul>
      <p>You can find these settings in your Postale.io dashboard.</p>
    </details>
  `;

  return renderDashboardLayout({
    title: "Email Settings",
    content,
    activeTab: "settings",
    username,
  });
}
