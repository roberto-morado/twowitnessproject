/**
 * Core types and interfaces for the application
 * Follows Interface Segregation Principle (ISP)
 */

/**
 * Route handler function signature
 */
export type RouteHandler = (
  request: Request,
  params?: Record<string, string>
) => Response | Promise<Response>;

/**
 * Route definition
 */
export interface Route {
  method: string;
  pattern: string | RegExp;
  handler: RouteHandler;
}

/**
 * Controller interface - Single Responsibility Principle (SRP)
 * Each controller handles a specific domain
 */
export interface Controller {
  getRoutes(): Route[];
}

/**
 * View interface - renders HTML content
 */
export interface View {
  render(data?: Record<string, unknown>): string;
}

/**
 * HTTP response configuration
 */
export interface ResponseConfig {
  status?: number;
  headers?: HeadersInit;
}
