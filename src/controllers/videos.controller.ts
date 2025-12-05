/**
 * Videos Controller
 * Follows Single Responsibility Principle - handles videos page logic only
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderVideos } from "@views/videos.view.ts";
import { YouTubeService } from "../services/youtube.service.ts";

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

  private async index(): Promise<Response> {
    // Fetch latest videos from YouTube RSS feed
    const videos = await YouTubeService.getLatestVideos(6);

    const html = renderVideos({ videos });
    return ResponseFactory.html(html);
  }
}
