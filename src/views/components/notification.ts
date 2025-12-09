/**
 * Notification Component
 * Displays success/error messages with auto-dismiss
 */

import { escapeHtml } from "@utils/html.ts";

export interface NotificationOptions {
  message?: string;
  type?: "success" | "error" | "info" | "warning";
}

/**
 * Render notification component
 * Used in views to display flash messages from URL params
 * Zero-CSS version: Uses semantic HTML with no styling or JavaScript
 */
export function renderNotification(options: NotificationOptions = {}): string {
  const { message, type = "info" } = options;

  if (!message) {
    return "";
  }

  const icons = {
    success: "✓",
    error: "✗",
    info: "ℹ",
    warning: "⚠",
  };

  const labels = {
    success: "Success",
    error: "Error",
    info: "Information",
    warning: "Warning",
  };

  // Use details/summary for dismissible notification (no JavaScript needed)
  return `
    <details open role="alert">
      <summary><strong>${icons[type]} ${labels[type]}</strong></summary>
      <p>${escapeHtml(message)}</p>
    </details>
  `;
}

/**
 * Extract notification from URL query parameters
 */
export function getNotificationFromUrl(url: string): NotificationOptions {
  try {
    const urlObj = new URL(url);
    const message = urlObj.searchParams.get("message");
    const type = urlObj.searchParams.get("type") as "success" | "error" | "info" | "warning" | null;

    if (!message) {
      return {};
    }

    return {
      message,
      type: type || "info",
    };
  } catch {
    return {};
  }
}


