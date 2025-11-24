/**
 * Donate Controller
 * Follows Single Responsibility Principle - handles donations page logic only
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderDonate } from "@views/donate.view.ts";

export class DonateController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/donate",
        handler: this.index.bind(this),
      },
    ];
  }

  private index(): Response {
    const html = renderDonate();
    return ResponseFactory.html(html);
  }
}
