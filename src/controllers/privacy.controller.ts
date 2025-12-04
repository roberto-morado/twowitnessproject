/**
 * Privacy Controller
 * Handles privacy policy page
 */

import { Controller, Route } from "../core/router.ts";
import { ResponseFactory } from "../core/response.ts";
import { renderPrivacy } from "../views/privacy.view.ts";

export class PrivacyController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        path: "/privacy",
        method: "GET",
        handler: this.handlePrivacy.bind(this),
      },
    ];
  }

  private handlePrivacy(): Response {
    return ResponseFactory.html(renderPrivacy());
  }
}
