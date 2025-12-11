/**
 * Admin Settings View
 * Configure Discord webhooks, Email SMTP, and other settings
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";
import { CsrfService } from "../../services/csrf.service.ts";
import { escapeHtml } from "@utils/html.ts";
import type { DiscordWebhook } from "../../services/discord.service.ts";
import type { EmailConfig } from "../../models/email.model.ts";

export interface SettingsViewData {
  username: string;
  adminWebhook?: DiscordWebhook | null;
  communityWebhook?: DiscordWebhook | null;
  emailConfig?: EmailConfig | null;
  csrfToken?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function renderSettings(data: SettingsViewData): string {
  const { username, adminWebhook, communityWebhook, emailConfig, csrfToken, successMessage, errorMessage } = data;

  const content = `
    <h1>⚙️ Settings</h1>

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

    <!-- Email Settings Section -->
    <section>
      <h2>📧 Email Settings</h2>
      <p>Configure SMTP settings to send automated emails for prayer confirmations, testimonial receipts, and other ministry communications.</p>

      ${emailConfig ? `
        <details>
          <summary>Current Email Configuration</summary>
          <dl>
            <dt><strong>Status:</strong></dt>
            <dd>${emailConfig.isEnabled ? "✓ Enabled" : "✗ Disabled"}</dd>

            <dt><strong>SMTP Host:</strong></dt>
            <dd>${escapeHtml(emailConfig.smtpHost)}</dd>

            <dt><strong>SMTP Port:</strong></dt>
            <dd>${emailConfig.smtpPort}</dd>

            <dt><strong>Username:</strong></dt>
            <dd>${escapeHtml(emailConfig.smtpUsername)}</dd>

            <dt><strong>From Email:</strong></dt>
            <dd>${escapeHtml(emailConfig.fromEmail)}</dd>

            <dt><strong>From Name:</strong></dt>
            <dd>${escapeHtml(emailConfig.fromName)}</dd>

            <dt><strong>Last Updated:</strong></dt>
            <dd>${emailConfig.updatedAt.toLocaleString()} by ${escapeHtml(emailConfig.updatedBy)}</dd>
          </dl>
        </details>
      ` : `
        <p><strong>⚠️ Email not configured yet.</strong> Fill out the form below to enable email sending.</p>
      `}

      <form method="POST" action="/dashboard/settings/email">
        ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}

        <fieldset>
          <legend>SMTP Server Settings</legend>

          <div>
            <label for="smtpHost">SMTP Host: *</label>
            <input
              type="text"
              id="smtpHost"
              name="smtpHost"
              required
              value="${emailConfig ? escapeHtml(emailConfig.smtpHost) : "mail.postale.io"}"
              placeholder="mail.postale.io"
            >
            <small>Your SMTP server address</small>
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
              value="${emailConfig ? emailConfig.smtpPort : 587}"
              placeholder="587"
            >
            <small>Common: 587 (TLS), 465 (SSL)</small>
          </div>

          <div>
            <label for="smtpUsername">SMTP Username: *</label>
            <input
              type="text"
              id="smtpUsername"
              name="smtpUsername"
              required
              value="${emailConfig ? escapeHtml(emailConfig.smtpUsername) : ""}"
              placeholder="ministry@twowitnessproject.org"
            >
          </div>

          <div>
            <label for="smtpPassword">SMTP Password: *</label>
            <input
              type="password"
              id="smtpPassword"
              name="smtpPassword"
              ${emailConfig ? "" : "required"}
              placeholder="${emailConfig ? "Leave blank to keep current password" : "Enter password"}"
            >
            ${emailConfig ? "<small>Leave blank to keep current password</small>" : ""}
          </div>

          <div>
            <label for="fromEmail">From Email: *</label>
            <input
              type="email"
              id="fromEmail"
              name="fromEmail"
              required
              value="${emailConfig ? escapeHtml(emailConfig.fromEmail) : ""}"
              placeholder="ministry@twowitnessproject.org"
            >
          </div>

          <div>
            <label for="fromName">From Name: *</label>
            <input
              type="text"
              id="fromName"
              name="fromName"
              required
              value="${emailConfig ? escapeHtml(emailConfig.fromName) : "Two Witness Project"}"
              placeholder="Two Witness Project"
            >
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                name="useTLS"
                value="true"
                ${emailConfig?.useTLS !== false ? "checked" : ""}
              >
              Use TLS (recommended)
            </label>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                name="isEnabled"
                value="true"
                ${emailConfig?.isEnabled !== false ? "checked" : ""}
              >
              Enable email sending
            </label>
          </div>
        </fieldset>

        <button type="submit">💾 Save Email Settings</button>
      </form>

      ${emailConfig ? `
        <h3>Test Email</h3>
        <p>Send a test email to verify your SMTP settings.</p>
        <div>
          <label for="testEmail">Test email address:</label>
          <input
            type="email"
            id="testEmail"
            value="${escapeHtml(emailConfig.fromEmail)}"
            placeholder="your-email@example.com"
          >
          <button type="button" onclick="sendTestEmail()">📨 Send Test Email</button>
        </div>
      ` : ""}
    </section>

    <hr>

    <!-- Discord Webhooks Section -->
    <section>
      <h2>🔔 Discord Webhooks</h2>
      <p>Configure Discord webhooks to receive notifications about prayer requests and testimonials.</p>

      <form method="POST" action="/dashboard/settings/webhooks">
        ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}

        <fieldset>
          <legend>Admin Webhook (Private)</legend>
          <p>Receives all prayer requests (public and private) and testimonial submissions.</p>

          <div>
            <label for="admin_webhook_url">Webhook URL:</label>
            <input
              type="url"
              id="admin_webhook_url"
              name="admin_webhook_url"
              value="${adminWebhook?.url || ""}"
              placeholder="https://discord.com/api/webhooks/..."
            >
            <small>Get this from Discord: Server Settings → Integrations → Webhooks → New Webhook</small>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                id="admin_webhook_enabled"
                name="admin_webhook_enabled"
                value="true"
                ${adminWebhook?.enabled ? "checked" : ""}
              >
              Enable admin webhook
            </label>
          </div>

          <button type="button" onclick="testWebhook('admin')">Test Admin Webhook</button>
        </fieldset>

        <fieldset>
          <legend>Community Webhook (Public)</legend>
          <p>Receives only public prayer requests for community prayer channels.</p>

          <div>
            <label for="community_webhook_url">Webhook URL:</label>
            <input
              type="url"
              id="community_webhook_url"
              name="community_webhook_url"
              value="${communityWebhook?.url || ""}"
              placeholder="https://discord.com/api/webhooks/..."
            >
            <small>This webhook should point to a public community prayer channel</small>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                id="community_webhook_enabled"
                name="community_webhook_enabled"
                value="true"
                ${communityWebhook?.enabled ? "checked" : ""}
              >
              Enable community webhook
            </label>
          </div>

          <button type="button" onclick="testWebhook('community')">Test Community Webhook</button>
        </fieldset>

        <button type="submit">💾 Save Webhook Settings</button>
      </form>
    </section>

    <script>
      // Test webhook function
      async function testWebhook(type) {
        const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
        if (!csrfToken) {
          alert('Security token missing. Please refresh the page.');
          return;
        }

        const button = event.target;
        button.disabled = true;
        button.textContent = 'Sending...';

        try {
          const formData = new FormData();
          formData.append('csrf_token', csrfToken);
          formData.append('type', type);

          const response = await fetch('/dashboard/settings/test-webhook', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            alert('✓ ' + result.message);
          } else {
            alert('✗ ' + (result.error || result.message || 'Test failed'));
          }
        } catch (error) {
          alert('✗ Error: ' + error.message);
        } finally {
          button.disabled = false;
          button.textContent = type === 'admin' ? 'Test Admin Webhook' : 'Test Community Webhook';
        }
      }

      // Test email function
      async function sendTestEmail() {
        const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;
        if (!csrfToken) {
          alert('Security token missing. Please refresh the page.');
          return;
        }

        const emailInput = document.getElementById('testEmail');
        const testEmail = emailInput.value;

        if (!testEmail) {
          alert('Please enter an email address');
          return;
        }

        const button = event.target;
        button.disabled = true;
        button.textContent = 'Sending...';

        try {
          const formData = new FormData();
          formData.append('csrf_token', csrfToken);
          formData.append('testEmail', testEmail);

          const response = await fetch('/dashboard/settings/test-email', {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            alert('✓ ' + result.message);
          } else {
            alert('✗ ' + (result.error || result.message || 'Test failed'));
          }
        } catch (error) {
          alert('✗ Error: ' + error.message);
        } finally {
          button.disabled = false;
          button.textContent = '📨 Send Test Email';
        }
      }
    </script>
  `;

  return renderDashboardLayout({
    title: "Settings",
    content,
    activeTab: "settings",
    username,
  });
}
