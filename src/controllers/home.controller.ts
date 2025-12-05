/**
 * Home Controller
 * Follows Single Responsibility Principle - handles home page logic only
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderHome } from "@views/home.view.ts";
import { TestimonialService } from "../services/testimonial.service.ts";

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
      // Fetch latest 3 approved testimonials for home page
      const allTestimonials = await TestimonialService.getApprovedTestimonials();
      const testimonials = allTestimonials.slice(0, 3);

      const html = renderHome({ testimonials });
      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Home page error:", error);
      // Fallback to rendering without testimonials
      const html = renderHome();
      return ResponseFactory.html(html);
    }
  }
}
