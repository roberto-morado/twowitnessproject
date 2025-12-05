/**
 * Redirect Utilities
 * Helper functions for redirects with notification messages
 */

/**
 * Create redirect URL with notification message
 */
export function redirectWithNotification(
  path: string,
  message: string,
  type: "success" | "error" | "info" | "warning" = "info"
): string {
  const url = new URL(path, "http://localhost"); // Base URL doesn't matter for relative paths
  url.searchParams.set("message", message);
  url.searchParams.set("type", type);
  return url.pathname + url.search;
}

/**
 * Create redirect response with notification message
 */
export function createNotificationRedirect(
  path: string,
  message: string,
  type: "success" | "error" | "info" | "warning" = "info"
): Response {
  const redirectUrl = redirectWithNotification(path, message, type);
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
    },
  });
}
