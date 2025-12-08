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

  return `
    <div class="notification notification-${type}" id="notification" role="alert">
      <div class="notification-content">
        <span class="notification-icon">${icons[type]}</span>
        <span class="notification-message">${escapeHtml(message)}</span>
        <button class="notification-close" onclick="closeNotification()" aria-label="Close notification">×</button>
      </div>
    </div>
    <script>
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => {
        closeNotification();
      }, 5000);

      function closeNotification() {
        const notification = document.getElementById('notification');
        if (notification) {
          notification.style.opacity = '0';
          setTimeout(() => {
            notification.style.display = 'none';
          }, 300);
        }
      }
    </script>
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


