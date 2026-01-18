/**
 * Linktree Home Controller
 * Displays public homepage with links
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "../core/response.ts";
import { LinkService } from "../services/link.service.ts";
import { renderLinktreeHome } from "../views/linktree-home.view.ts";

export class LinktreeHomeController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/",
        handler: this.showHome.bind(this),
      },
    ];
  }

  /**
   * Display homepage with all active links
   */
  private async showHome(request: Request): Promise<Response> {
    // Get only active links
    const links = await LinkService.getAllLinks(false);

    const html = renderLinktreeHome({ links });
    return ResponseFactory.html(html);
  }
}
