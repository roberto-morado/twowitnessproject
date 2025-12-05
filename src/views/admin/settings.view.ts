/**
 * Admin Settings View
 * Configure Discord webhooks and other settings
 */

import { AppConfig } from "@config/app.config.ts";
import { CsrfService } from "../../services/csrf.service.ts";
import type { DiscordWebhook } from "../../services/discord.service.ts";

export interface SettingsViewData {
  username: string;
  adminWebhook?: DiscordWebhook | null;
  communityWebhook?: DiscordWebhook | null;
  csrfToken?: string;
  success?: boolean;
}

export function renderSettings(data: SettingsViewData): string {
  const { username, adminWebhook, communityWebhook, csrfToken, success } = data;
  const url = new URL("http://localhost");
  const showSuccess = success || url.searchParams.get("success") === "1";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Settings - ${AppConfig.ministry.name}</title>
  <link rel="stylesheet" href="/css/styles.css">
  <style>
    .settings-section {
      margin-bottom: 40px;
      padding: 20px;
      border: 2px solid #000;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-group label {
      display: block;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .form-group input[type="text"],
    .form-group input[type="url"] {
      width: 100%;
      padding: 10px;
      border: 2px solid #000;
      font-size: 16px;
      font-family: Times, serif;
    }
    .form-group small {
      display: block;
      margin-top: 5px;
      font-size: 0.9em;
    }
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .test-button {
      background: #666;
      color: #fff;
      border: 2px solid #000;
      padding: 8px 16px;
      cursor: pointer;
      font-family: Times, serif;
      font-size: 16px;
    }
    .test-button:hover {
      background: #555;
    }
    .success-message {
      background: #d4edda;
      border: 2px solid #000;
      padding: 15px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <main>
    <div class="container">
      <div class="content-section">
        <h1>⚙️ Admin Settings</h1>
        <p>Logged in as: <strong>${username}</strong> | <a href="/dashboard/prayers">← Back to Dashboard</a></p>

        ${showSuccess ? `
          <div class="success-message">
            <strong>✓ Settings saved successfully!</strong>
          </div>
        ` : ""}

        <!-- Discord Webhooks Section -->
        <form method="POST" action="/dashboard/settings/webhooks">
          ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}

          <div class="settings-section">
            <h2>🔔 Discord Webhooks</h2>
            <p>Configure Discord webhooks to receive notifications about prayer requests and testimonials.</p>

            <h3 style="margin-top: 30px;">Admin Webhook (Private)</h3>
            <p>Receives all prayer requests (public and private) and testimonial submissions.</p>

            <div class="form-group">
              <label for="admin_webhook_url">Webhook URL:</label>
              <input
                type="url"
                id="admin_webhook_url"
                name="admin_webhook_url"
                value="${adminWebhook?.url || ""}"
                placeholder="https://discord.com/api/webhooks/..."
              >
              <small>
                Get this from Discord: Server Settings → Integrations → Webhooks → New Webhook
              </small>
            </div>

            <div class="form-group checkbox-group">
              <input
                type="checkbox"
                id="admin_webhook_enabled"
                name="admin_webhook_enabled"
                value="true"
                ${adminWebhook?.enabled ? "checked" : ""}
              >
              <label for="admin_webhook_enabled">Enable admin webhook</label>
            </div>

            <button type="button" class="test-button" onclick="testWebhook('admin')">
              Test Admin Webhook
            </button>

            <h3 style="margin-top: 40px;">Community Webhook (Public)</h3>
            <p>Receives only public prayer requests for community prayer channels.</p>

            <div class="form-group">
              <label for="community_webhook_url">Webhook URL:</label>
              <input
                type="url"
                id="community_webhook_url"
                name="community_webhook_url"
                value="${communityWebhook?.url || ""}"
                placeholder="https://discord.com/api/webhooks/..."
              >
              <small>
                This webhook should point to a public community prayer channel
              </small>
            </div>

            <div class="form-group checkbox-group">
              <input
                type="checkbox"
                id="community_webhook_enabled"
                name="community_webhook_enabled"
                value="true"
                ${communityWebhook?.enabled ? "checked" : ""}
              >
              <label for="community_webhook_enabled">Enable community webhook</label>
            </div>

            <button type="button" class="test-button" onclick="testWebhook('community')">
              Test Community Webhook
            </button>
          </div>

          <button type="submit" class="btn" style="width: 100%; max-width: 300px;">
            💾 Save Settings
          </button>
        </form>
      </div>
    </div>
  </main>

  <script>
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
  </script>
</body>
</html>`;
}
