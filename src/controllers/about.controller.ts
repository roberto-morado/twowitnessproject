/**
 * About Controller
 * Follows Single Responsibility Principle - handles about page logic only
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderAbout } from "@views/about.view.ts";

export class AboutController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/about",
        handler: this.index.bind(this),
      },
    ];
  }

  private index(): Response {
    const html = renderAbout();
    return ResponseFactory.html(html);
  }
}
