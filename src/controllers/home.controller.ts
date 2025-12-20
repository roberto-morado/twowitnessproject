/**
 * Home Controller
 * Follows Single Responsibility Principle - handles home page logic only
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderHome } from "@views/home.view.ts";
import { TestimonialService } from "../services/testimonial.service.ts";
import { LocationService } from "../services/location.service.ts";

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

  private async index(): Promise<Response> {
    try {
      // Fetch data for home page
      const [allTestimonials, currentLocation] = await Promise.all([
        TestimonialService.getApprovedTestimonials(),
        LocationService.getCurrent(),
      ]);

      const testimonials = allTestimonials.slice(0, 3);

      const html = renderHome({
        testimonials,
        currentLocation,
      });
      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Home page error:", error);
      // Fallback to rendering without optional data
      const html = renderHome();
      return ResponseFactory.html(html);
    }
  }
}
