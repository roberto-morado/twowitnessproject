/**
 * Videos Controller
 * Follows Single Responsibility Principle - handles videos page logic only
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderVideos } from "@views/videos.view.ts";

export class VideosController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/videos",
        handler: this.index.bind(this),
      },
    ];
  }

  private index(): Response {
    const html = renderVideos();
    return ResponseFactory.html(html);
  }
}
