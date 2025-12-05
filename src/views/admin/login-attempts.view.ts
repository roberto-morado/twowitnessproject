/**
 * Login Attempts View
 * Security monitoring - shows recent login attempts
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";
import type { LoginAttempt } from "../../services/auth.service.ts";

export interface LoginAttemptsViewData {
  attempts: LoginAttempt[];
  username: string;
}

export function renderLoginAttempts(data: LoginAttemptsViewData): string {
  const { attempts, username } = data;

  const successCount = attempts.filter(a => a.success).length;
  const failedCount = attempts.filter(a => !a.success).length;

  const content = `
    <h1>🔒 Login Attempts</h1>
    <p style="margin-bottom: 40px;">
      Security monitoring - Recent login attempts (${attempts.length} total)
      <br>
      <span style="color: #28a745;">✓ ${successCount} successful</span> •
      <span style="color: #dc3545;">✗ ${failedCount} failed</span>
    </p>

    ${attempts.length === 0 ? `
      <div style="padding: 40px; border: 1px solid #000; text-align: center;">
        <p>No login attempts recorded yet.</p>
      </div>
    ` : `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #000;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 15px; border: 1px solid #000; text-align: left;">Time</th>
              <th style="padding: 15px; border: 1px solid #000; text-align: left;">Username</th>
              <th style="padding: 15px; border: 1px solid #000; text-align: left;">IP Address</th>
              <th style="padding: 15px; border: 1px solid #000; text-align: center;">Result</th>
            </tr>
          </thead>
          <tbody>
            ${attempts.map(attempt => {
              const date = new Date(attempt.timestamp);
              const formattedTime = formatDateTime(date);
              const rowStyle = attempt.success
                ? "background: #f0fff0;"
                : "background: #fff3f3;";

              return `
                <tr style="${rowStyle}">
                  <td style="padding: 12px; border: 1px solid #000; font-size: 0.9em;">
                    ${formattedTime}
                    <br>
                    <small style="color: #666;">${formatTimeAgo(attempt.timestamp)}</small>
                  </td>
                  <td style="padding: 12px; border: 1px solid #000; font-family: monospace;">
                    ${escapeHtml(attempt.username)}
                  </td>
                  <td style="padding: 12px; border: 1px solid #000; font-family: monospace; font-size: 0.9em;">
                    ${escapeHtml(attempt.ip)}
                  </td>
                  <td style="padding: 12px; border: 1px solid #000; text-align: center;">
                    ${attempt.success
                      ? '<span style="color: #28a745; font-weight: bold;">✓ Success</span>'
                      : '<span style="color: #dc3545; font-weight: bold;">✗ Failed</span>'
                    }
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 30px; padding: 20px; border: 2px solid #000; background: #f9f9f9;">
        <h3>Security Tips</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Multiple failed attempts from the same IP may indicate a brute force attack</li>
          <li>Failed attempts with correct username but wrong password suggest credential stuffing</li>
          <li>Monitor for unusual patterns in login times or IP addresses</li>
          <li>Rate limiting is active: 5 attempts per 15 minutes per IP</li>
        </ul>
      </div>
    `}
  `;

  return renderDashboardLayout({
    title: "Login Attempts",
    content,
    activeTab: "security",
    username,
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
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
