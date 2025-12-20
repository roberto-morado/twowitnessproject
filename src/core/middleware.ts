/**
 * Middleware system for request/response processing
 * Follows Chain of Responsibility pattern
 */

import { AuthService } from "../services/auth.service.ts";
import { AnalyticsService } from "../services/analytics.service.ts";

export type MiddlewareFunction = (
  request: Request,
  context: MiddlewareContext
) => Promise<Response | null>;

export interface MiddlewareContext {
  /** Authenticated username (if authenticated) */
  username?: string;
  /** Continue to next handler */
  next: () => Promise<Response | null>;
  /** Store arbitrary data */
  data: Map<string, unknown>;
}

/**
 * Middleware chain executor
 */
export class MiddlewareChain {
  private middlewares: MiddlewareFunction[] = [];

  /**
   * Add middleware to chain
   */
  use(middleware: MiddlewareFunction): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Execute middleware chain
   */
  async execute(request: Request, finalHandler: () => Promise<Response>): Promise<Response> {
    let index = 0;
    const data = new Map<string, unknown>();
    let username: string | undefined;

    const next = async (): Promise<Response | null> => {
      if (index >= this.middlewares.length) {
        // All middleware executed, call final handler
        return await finalHandler();
      }

      const middleware = this.middlewares[index++];
      const context: MiddlewareContext = { username, next, data };
      const response = await middleware(request, context);

      // Middleware can modify username (e.g., auth middleware)
      username = context.username;

      return response;
    };

    const response = await next();
    return response!; // Should always return a response
  }
}

/**
 * Security Headers Middleware
 * Adds security headers to all responses
 */
export const securityHeadersMiddleware: MiddlewareFunction = async (
  request,
  context
) => {
  const response = await context.next();

  if (response) {
    const headers = new Headers(response.headers);

    // Content Security Policy - Allow Stripe, YouTube thumbnails, and optional styling
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://js.stripe.com; " +
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
      "frame-src https://js.stripe.com; " +
      "connect-src 'self' https://api.stripe.com; " +
      "img-src 'self' data: https://i.ytimg.com;"
    );

    // Other security headers
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()"
    );

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
};

/**
 * Authentication Middleware
 * Checks if user is authenticated via session cookie
 * Sets context.username if authenticated
 */
export const authMiddleware: MiddlewareFunction = async (request, context) => {
  const cookieHeader = request.headers.get("Cookie");
  const sessionId = AuthService.getSessionFromCookie(cookieHeader);

  if (sessionId) {
    const username = await AuthService.validateSession(sessionId);
    if (username) {
      context.username = username;
    }
  }

  return await context.next();
};

/**
 * Require Auth Middleware
 * Redirects to /login if not authenticated
 */
export const requireAuthMiddleware: MiddlewareFunction = async (
  request,
  context
) => {
  if (!context.username) {
    // Not authenticated, redirect to login
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login",
      },
    });
  }

  return await context.next();
};

/**
 * Analytics Tracking Middleware
 * Tracks page views for analytics (skips admin routes)
 */
export const analyticsMiddleware: MiddlewareFunction = async (
  request,
  context
) => {
  const url = new URL(request.url);

  // Don't track admin routes or login
  const skipPaths = ["/login", "/dashboard"];
  const shouldTrack = !skipPaths.some(path => url.pathname.startsWith(path));

  if (shouldTrack && request.method === "GET") {
    // Store analytics data in context for later processing
    context.data.set("trackPageView", {
      path: url.pathname,
      referrer: request.headers.get("Referer") || null,
      userAgent: request.headers.get("User-Agent") || null,
      timestamp: Date.now(),
    });
  }

  const response = await context.next();

  // After response is generated, save analytics asynchronously (don't await to avoid blocking)
  if (shouldTrack && context.data.has("trackPageView")) {
    const analyticsData = context.data.get("trackPageView") as {
      path: string;
      referrer: string | null;
      userAgent: string | null;
    };

    // Get IP from connection info (if available)
    const ip = request.headers.get("X-Forwarded-For")?.split(",")[0].trim() ||
               request.headers.get("X-Real-IP") ||
               null;

    // Save analytics in background (don't block response)
    AnalyticsService.trackPageView(
      analyticsData.path,
      analyticsData.referrer,
      analyticsData.userAgent,
      ip
    ).catch(err => console.error("Analytics tracking error:", err));
  }

  return response;
};

/**
 * Cache Headers Middleware for static files
 * Note: No longer needed with zero CSS approach (no static files)
 * Keeping for potential future use (e.g., robots.txt, sitemap.xml)
 */
export const cacheHeadersMiddleware: MiddlewareFunction = async (
  request,
  context
) => {
  // No static files to cache in zero-CSS approach
  return await context.next();
};
