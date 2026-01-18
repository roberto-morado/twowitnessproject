/**
 * Middleware system for request/response processing
 * Minimal middleware for Linktree-style site
 */

import { AuthService } from "../services/auth.service.ts";

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

    // Content Security Policy - Simple policy for Linktree site
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data:;"
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
 * Cache Headers Middleware for static files
 */
export const cacheHeadersMiddleware: MiddlewareFunction = async (
  request,
  context
) => {
  const url = new URL(request.url);
  const response = await context.next();

  // Add cache headers for static files
  if (response && url.pathname.startsWith("/css/")) {
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "public, max-age=3600"); // 1 hour

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
};
