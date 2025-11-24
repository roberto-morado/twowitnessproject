/**
 * Router - Router Pattern with Strategy Pattern for route matching
 * Follows Single Responsibility Principle - only handles routing
 * Follows Open/Closed Principle - easy to add new routes without modification
 */

import type { Route, RouteHandler, Controller } from "./types.ts";
import { ResponseFactory } from "./response.ts";

export class Router {
  private routes: Route[] = [];

  /**
   * Register a controller (Dependency Injection)
   */
  registerController(controller: Controller): void {
    const routes = controller.getRoutes();
    this.routes.push(...routes);
  }

  /**
   * Register a single route
   */
  register(method: string, pattern: string | RegExp, handler: RouteHandler): void {
    this.routes.push({ method, pattern, handler });
  }

  /**
   * Handle incoming request
   */
  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // Handle static files
    if (url.pathname.startsWith("/css/") || url.pathname.startsWith("/images/")) {
      return await ResponseFactory.file(`./public${url.pathname}`);
    }

    // Find matching route
    for (const route of this.routes) {
      if (route.method !== method && route.method !== "ALL") {
        continue;
      }

      const params = this.matchRoute(url.pathname, route.pattern);
      if (params !== null) {
        try {
          return await route.handler(request, params);
        } catch (error) {
          console.error("Route handler error:", error);
          return ResponseFactory.error(
            "An error occurred while processing your request"
          );
        }
      }
    }

    return ResponseFactory.notFound();
  }

  /**
   * Match URL pathname against route pattern
   * Returns null if no match, or object with extracted parameters
   */
  private matchRoute(
    pathname: string,
    pattern: string | RegExp
  ): Record<string, string> | null {
    if (typeof pattern === "string") {
      // Simple string comparison
      if (pattern === pathname) {
        return {};
      }

      // Pattern with parameters (e.g., "/post/:id")
      const patternParts = pattern.split("/");
      const pathnameParts = pathname.split("/");

      if (patternParts.length !== pathnameParts.length) {
        return null;
      }

      const params: Record<string, string> = {};
      for (let i = 0; i < patternParts.length; i++) {
        const patternPart = patternParts[i];
        const pathnamePart = pathnameParts[i];

        if (patternPart.startsWith(":")) {
          // Extract parameter
          const paramName = patternPart.slice(1);
          params[paramName] = pathnamePart;
        } else if (patternPart !== pathnamePart) {
          // Parts don't match
          return null;
        }
      }

      return params;
    } else {
      // RegExp pattern
      const match = pathname.match(pattern);
      if (match) {
        return { ...match.groups };
      }
    }

    return null;
  }
}
