/**
 * Map Controller
 * Handles ministry journey map page
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderMapPage } from "@views/map.view.ts";
import { LocationService } from "../services/location.service.ts";

export class MapController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/map",
        handler: this.index.bind(this),
      },
    ];
  }

  private async index(): Promise<Response> {
    try {
      const locations = await LocationService.getAll();
      const html = renderMapPage(locations);
      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Map page error:", error);
      // Fallback to empty map
      const html = renderMapPage([]);
      return ResponseFactory.html(html);
    }
  }
}
