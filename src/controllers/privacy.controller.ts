/**
 * Privacy Controller
 * Handles privacy policy page
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderPrivacy } from "../views/privacy.view.ts";

export class PrivacyController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/privacy",
        handler: this.handlePrivacy.bind(this),
      },
    ];
  }

  private handlePrivacy(): Response {
    return ResponseFactory.html(renderPrivacy());
  }
}
