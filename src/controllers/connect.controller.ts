/**
 * Connect Controller
 * Displays social media links and connection options
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderConnect } from "@views/connect.view.ts";

export class ConnectController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/connect",
        handler: this.showConnect.bind(this),
      },
    ];
  }

  private async showConnect(): Promise<Response> {
    const html = renderConnect();
    return ResponseFactory.html(html);
  }
}
