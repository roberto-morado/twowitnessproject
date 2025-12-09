/**
 * Login Attempts View
 * Security monitoring - shows recent login attempts
 */

import { renderDashboardLayout } from "./dashboard.layout.ts";
import { escapeHtml } from "@utils/html.ts";
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
    <p>
      Security monitoring - Recent login attempts (${attempts.length} total)
      <br>
      <span>✓ ${successCount} successful</span> •
      <span>✗ ${failedCount} failed</span>
    </p>

    ${attempts.length === 0 ? `
      <div>
        <p>No login attempts recorded yet.</p>
      </div>
    ` : `
      <div>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Username</th>
              <th>IP Address</th>
              <th>Result</th>
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
                <tr>
                  <td>
                    ${formattedTime}
                    <br>
                    <small>${formatTimeAgo(attempt.timestamp)}</small>
                  </td>
                  <td>
                    ${escapeHtml(attempt.username)}
                  </td>
                  <td>
                    ${escapeHtml(attempt.ip)}
                  </td>
                  <td>
                    ${attempt.success
                      ? '<span>✓ Success</span>'
                      : '<span>✗ Failed</span>'
                    }
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <div>
        <h3>Security Tips</h3>
        <ul>
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


