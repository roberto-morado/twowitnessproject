/**
 * Home Controller
 * Follows Single Responsibility Principle - handles home page logic only
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderHome } from "@views/home.view.ts";

export class HomeController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/",
        handler: this.index.bind(this),
      },
    ];
  }

  private index(): Response {
    const html = renderHome();
    return ResponseFactory.html(html);
  }
}
