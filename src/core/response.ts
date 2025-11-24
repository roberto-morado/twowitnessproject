/**
 * Response Factory - Factory Pattern
 * Creates consistent HTTP responses
 * Follows Open/Closed Principle - easy to extend with new response types
 */

import type { ResponseConfig } from "./types.ts";

export class ResponseFactory {
  /**
   * Create HTML response
   */
  static html(content: string, config: ResponseConfig = {}): Response {
    return new Response(content, {
      status: config.status || 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...config.headers,
      },
    });
  }

  /**
   * Create JSON response
   */
  static json(data: unknown, config: ResponseConfig = {}): Response {
    return new Response(JSON.stringify(data), {
      status: config.status || 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...config.headers,
      },
    });
  }

  /**
   * Create redirect response
   */
  static redirect(location: string, status = 302): Response {
    return new Response(null, {
      status,
      headers: {
        Location: location,
      },
    });
  }

  /**
   * Create 404 Not Found response
   */
  static notFound(message = "Page not found"): Response {
    return ResponseFactory.html(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Not Found</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="container error-page">
    <h1>404</h1>
    <p>${message}</p>
    <a href="/" class="btn">Go Home</a>
  </div>
</body>
</html>`,
      { status: 404 }
    );
  }

  /**
   * Create error response
   */
  static error(message = "Internal Server Error", status = 500): Response {
    return ResponseFactory.html(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="container error-page">
    <h1>Error</h1>
    <p>${message}</p>
    <a href="/" class="btn">Go Home</a>
  </div>
</body>
</html>`,
      { status }
    );
  }

  /**
   * Serve static file
   */
  static async file(path: string): Promise<Response> {
    try {
      const file = await Deno.readFile(path);
      const contentType = ResponseFactory.getContentType(path);

      return new Response(file, {
        status: 200,
        headers: {
          "Content-Type": contentType,
        },
      });
    } catch {
      return ResponseFactory.notFound("File not found");
    }
  }

  /**
   * Get content type from file extension
   */
  private static getContentType(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase();
    const types: Record<string, string> = {
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      json: "application/json",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      svg: "image/svg+xml",
      ico: "image/x-icon",
      txt: "text/plain",
    };
    return types[ext || ""] || "application/octet-stream";
  }
}
