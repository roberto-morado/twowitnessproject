/**
 * Testimonial Controller
 * Handles testimonial submission, public display, and admin management
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { RateLimitService } from "../services/ratelimit.service.ts";
import { CsrfService } from "../services/csrf.service.ts";
import { TestimonialService, type TestimonialSubmission } from "../services/testimonial.service.ts";
import { renderTestimonials } from "../views/testimonials.view.ts";
import { renderTestimonialSubmit } from "../views/testimonial-submit.view.ts";
import { renderAdminTestimonials } from "../views/admin/testimonials.view.ts";
import { validateTestimonialSubmission, sanitizeString } from "@utils/validation.ts";

export class TestimonialController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/testimonials",
        handler: this.showTestimonials.bind(this),
      },
      {
        method: "POST",
        pattern: "/testimonials/submit",
        handler: this.submitTestimonial.bind(this),
      },
      {
        method: "GET",
        pattern: "/dashboard/testimonials",
        handler: this.showAdminTestimonials.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/testimonials\/([^\/]+)\/approve$/,
        handler: this.approveTestimonial.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/testimonials\/([^\/]+)\/delete$/,
        handler: this.deleteTestimonial.bind(this),
      },
      {
        method: "POST",
        pattern: "/dashboard/testimonials/create-key",
        handler: this.createKey.bind(this),
      },
    ];
  }

  /**
   * GET /testimonials - Show public testimonials (or submission form with key)
   */
  private async showTestimonials(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const keyId = url.searchParams.get("key");

      // If key provided, show submission form
      if (keyId) {
        const key = await TestimonialService.validateKey(keyId);

        if (!key) {
          // Invalid/expired/used key - show error
          const csrfToken = CsrfService.generateToken();
          const html = renderTestimonialSubmit({
            keyError: "This testimonial link is invalid, has expired, or has already been used. Please contact the ministry for a new link.",
            csrfToken,
          });
          return new Response(html, {
            status: 400,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
            },
          });
        }

        // Valid key - show submission form
        const csrfToken = CsrfService.generateToken();
        const html = renderTestimonialSubmit({
          keyId,
          keyName: key.name,
          csrfToken,
        });
        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      // No key - show public testimonials list
      const page = parseInt(url.searchParams.get("page") || "1");
      const perPage = 10;

      const { testimonials, total, pages } = await TestimonialService.getTestimonialsPage(
        page,
        perPage,
        true // approved only
      );

      const html = renderTestimonials({
        testimonials,
        page,
        totalPages: pages,
        total,
      });

      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Testimonials error:", error);
      return ResponseFactory.error("An error occurred while loading testimonials");
    }
  }

  /**
   * POST /testimonials/submit - Submit testimonial with key
   */
  private async submitTestimonial(request: Request): Promise<Response> {
    try {
      const formData = await request.formData();

      // Validate CSRF token
      const csrfValid = await CsrfService.validateFromRequest(request, formData);
      if (!csrfValid) {
        const csrfToken = CsrfService.generateToken();
        const html = renderTestimonialSubmit({
          error: "Invalid security token. Please try again.",
          csrfToken,
        });
        return new Response(html, {
          status: 403,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      // Get IP for rate limiting
      const ip = RateLimitService.getIpFromRequest(request);

      // Check rate limit
      const rateLimitResult = await RateLimitService.checkAndRecord(ip, "testimonial", "form");
      if (!rateLimitResult.allowed) {
        const info = RateLimitService.getRateLimitInfo("form");
        const retryMessage = rateLimitResult.retryAfter
          ? ` Please try again in ${rateLimitResult.retryAfter} seconds.`
          : "";
        const csrfToken = CsrfService.generateToken();
        const html = renderTestimonialSubmit({
          error: `Too many submissions. Maximum ${info.maxAttempts} submissions per ${info.windowMinutes} minutes.${retryMessage}`,
          csrfToken,
        });
        return new Response(html, {
          status: 429,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      const keyId = formData.get("key_id")?.toString();
      const name = formData.get("name")?.toString();
      const testimony = formData.get("testimony")?.toString();
      const location = formData.get("location")?.toString();

      // Validate key ID
      if (!keyId) {
        const csrfToken = CsrfService.generateToken();
        const html = renderTestimonialSubmit({
          error: "Invalid submission key",
          csrfToken,
        });
        return new Response(html, {
          status: 400,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      // Validate input using centralized validation
      const validationResult = validateTestimonialSubmission({
        name: name || "",
        testimony: testimony || "",
        location: location || undefined,
      });

      if (!validationResult.valid) {
        const csrfToken = CsrfService.generateToken();
        const html = renderTestimonialSubmit({
          error: validationResult.error,
          keyId,
          csrfToken,
        });
        return new Response(html, {
          status: 400,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      // Sanitize inputs to remove control characters
      const submission: TestimonialSubmission = {
        keyId,
        name: sanitizeString(name!),
        testimony: sanitizeString(testimony!),
        location: location ? sanitizeString(location) : undefined,
      };

      const testimonialId = await TestimonialService.submitTestimonial(submission);

      if (!testimonialId) {
        const csrfToken = CsrfService.generateToken();
        const html = renderTestimonialSubmit({
          keyError: "This testimonial link is invalid, has expired, or has already been used.",
          csrfToken,
        });
        return new Response(html, {
          status: 400,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
          },
        });
      }

      // Success - show success page
      const csrfToken = CsrfService.generateToken();
      const html = renderTestimonialSubmit({
        success: true,
        csrfToken,
      });
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
        },
      });
    } catch (error) {
      console.error("Testimonial submission error:", error);
      const csrfToken = CsrfService.generateToken();
      const html = renderTestimonialSubmit({
        error: "An error occurred while submitting your testimonial",
        csrfToken,
      });
      return new Response(html, {
        status: 500,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
        },
      });
    }
  }

  /**
   * GET /dashboard/testimonials - Admin testimonial management
   */
  private async showAdminTestimonials(request: Request): Promise<Response> {
    // Check authentication
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);

    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const url = new URL(request.url);
      const filter = url.searchParams.get("filter") as "all" | "pending" | "approved" || "all";

      const testimonials = await TestimonialService.getAllTestimonials();
      const keys = await TestimonialService.getAllKeys();

      // Generate CSRF token for forms
      const csrfToken = CsrfService.generateToken();

      const html = renderAdminTestimonials({
        testimonials,
        keys,
        filter,
        username,
        csrfToken,
        siteUrl: new URL(request.url).origin,
      });

      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Set-Cookie": CsrfService.createTokenCookie(csrfToken),
        },
      });
    } catch (error) {
      console.error("Admin testimonials error:", error);
      return ResponseFactory.error("An error occurred while loading testimonials");
    }
  }

  /**
   * POST /dashboard/testimonials/:id/approve - Approve testimonial
   */
  private async approveTestimonial(
    request: Request,
    params?: Record<string, string>
  ): Promise<Response> {
    // Check authentication
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);

    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const formData = await request.formData();

      // Validate CSRF token
      const csrfValid = await CsrfService.validateFromRequest(request, formData);
      if (!csrfValid) {
        return ResponseFactory.error("Invalid security token", 403);
      }

      const testimonialId = params?.["0"];
      if (!testimonialId) {
        return ResponseFactory.error("Invalid testimonial ID", 400);
      }

      const success = await TestimonialService.approveTestimonial(testimonialId);

      if (!success) {
        return ResponseFactory.error("Testimonial not found", 404);
      }

      return ResponseFactory.redirect("/dashboard/testimonials");
    } catch (error) {
      console.error("Approve testimonial error:", error);
      return ResponseFactory.error("An error occurred while approving testimonial");
    }
  }

  /**
   * POST /dashboard/testimonials/:id/delete - Delete testimonial
   */
  private async deleteTestimonial(
    request: Request,
    params?: Record<string, string>
  ): Promise<Response> {
    // Check authentication
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);

    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const formData = await request.formData();

      // Validate CSRF token
      const csrfValid = await CsrfService.validateFromRequest(request, formData);
      if (!csrfValid) {
        return ResponseFactory.error("Invalid security token", 403);
      }

      const testimonialId = params?.["0"];
      if (!testimonialId) {
        return ResponseFactory.error("Invalid testimonial ID", 400);
      }

      const success = await TestimonialService.deleteTestimonial(testimonialId);

      if (!success) {
        return ResponseFactory.error("Testimonial not found", 404);
      }

      return ResponseFactory.redirect("/dashboard/testimonials");
    } catch (error) {
      console.error("Delete testimonial error:", error);
      return ResponseFactory.error("An error occurred while deleting testimonial");
    }
  }

  /**
   * POST /dashboard/testimonials/create-key - Create testimonial submission key
   */
  private async createKey(request: Request): Promise<Response> {
    // Check authentication
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return ResponseFactory.redirect("/login");
    }

    const username = await AuthService.validateSession(sessionId);

    if (!username) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const formData = await request.formData();

      // Validate CSRF token
      const csrfValid = await CsrfService.validateFromRequest(request, formData);
      if (!csrfValid) {
        return ResponseFactory.error("Invalid security token", 403);
      }

      const name = formData.get("key_name")?.toString();
      const expiresInDays = formData.get("expires_in_days")?.toString();

      if (!name) {
        return ResponseFactory.error("Key name is required", 400);
      }

      const expires = expiresInDays ? parseInt(expiresInDays) : undefined;

      await TestimonialService.createKey(name, username, expires);

      return ResponseFactory.redirect("/dashboard/testimonials");
    } catch (error) {
      console.error("Create key error:", error);
      return ResponseFactory.error("An error occurred while creating key");
    }
  }
}
