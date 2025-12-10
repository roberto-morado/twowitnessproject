/**
 * Location Dashboard Controller
 * Admin management for ministry journey locations
 */

import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { AuthService } from "../services/auth.service.ts";
import { LocationService } from "../services/location.service.ts";
import { renderAdminLocations } from "../views/admin/locations.view.ts";

export class LocationDashboardController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/dashboard/locations",
        handler: this.index.bind(this),
      },
      {
        method: "POST",
        pattern: "/dashboard/locations/create",
        handler: this.create.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/locations\/([^\/]+)\/edit$/,
        handler: this.edit.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/locations\/([^\/]+)\/update$/,
        handler: this.update.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/locations\/([^\/]+)\/set-current$/,
        handler: this.setCurrent.bind(this),
      },
      {
        method: "POST",
        pattern: /^\/dashboard\/locations\/([^\/]+)\/delete$/,
        handler: this.delete.bind(this),
      },
    ];
  }

  /**
   * GET /dashboard/locations - Location management page
   */
  private async index(request: Request): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const locations = await LocationService.getAll();
      const html = renderAdminLocations({
        locations,
        username: auth.username!,
      });
      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Location dashboard error:", error);
      return ResponseFactory.error("Failed to load locations");
    }
  }

  /**
   * POST /dashboard/locations/create - Create new location
   */
  private async create(request: Request): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const formData = await request.formData();

      const city = formData.get("city")?.toString();
      const state = formData.get("state")?.toString();
      const stateCode = formData.get("stateCode")?.toString()?.toUpperCase();
      const latitude = parseFloat(formData.get("latitude")?.toString() || "");
      const longitude = parseFloat(formData.get("longitude")?.toString() || "");
      const visitedDate = new Date(formData.get("visitedDate")?.toString() || "");
      const notes = formData.get("notes")?.toString();
      const isCurrent = formData.get("isCurrent") === "true";

      if (!city || !state || !stateCode || isNaN(latitude) || isNaN(longitude) || isNaN(visitedDate.getTime())) {
        return ResponseFactory.error("Invalid form data", 400);
      }

      await LocationService.create({
        city,
        state,
        stateCode,
        latitude,
        longitude,
        visitedDate,
        notes,
        isCurrent,
      });

      return ResponseFactory.redirect("/dashboard/locations");
    } catch (error) {
      console.error("Create location error:", error);
      return ResponseFactory.error("Failed to create location");
    }
  }

  /**
   * POST /dashboard/locations/:id/edit - Load location for editing
   */
  private async edit(request: Request, params?: Record<string, string>): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const locationId = params?.["0"];
      if (!locationId) {
        return ResponseFactory.error("Invalid location ID", 400);
      }

      const location = await LocationService.getById(locationId);
      if (!location) {
        return ResponseFactory.error("Location not found", 404);
      }

      const locations = await LocationService.getAll();
      const html = renderAdminLocations({
        locations,
        username: auth.username!,
        editingLocation: location,
      });
      return ResponseFactory.html(html);
    } catch (error) {
      console.error("Edit location error:", error);
      return ResponseFactory.error("Failed to load location");
    }
  }

  /**
   * POST /dashboard/locations/:id/update - Update location
   */
  private async update(request: Request, params?: Record<string, string>): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const locationId = params?.["0"];
      if (!locationId) {
        return ResponseFactory.error("Invalid location ID", 400);
      }

      const formData = await request.formData();

      const city = formData.get("city")?.toString();
      const state = formData.get("state")?.toString();
      const stateCode = formData.get("stateCode")?.toString()?.toUpperCase();
      const latitude = parseFloat(formData.get("latitude")?.toString() || "");
      const longitude = parseFloat(formData.get("longitude")?.toString() || "");
      const visitedDate = new Date(formData.get("visitedDate")?.toString() || "");
      const notes = formData.get("notes")?.toString();
      const isCurrent = formData.get("isCurrent") === "true";

      if (!city || !state || !stateCode || isNaN(latitude) || isNaN(longitude) || isNaN(visitedDate.getTime())) {
        return ResponseFactory.error("Invalid form data", 400);
      }

      await LocationService.update(locationId, {
        city,
        state,
        stateCode,
        latitude,
        longitude,
        visitedDate,
        notes,
        isCurrent,
      });

      return ResponseFactory.redirect("/dashboard/locations");
    } catch (error) {
      console.error("Update location error:", error);
      return ResponseFactory.error("Failed to update location");
    }
  }

  /**
   * POST /dashboard/locations/:id/set-current - Set as current location
   */
  private async setCurrent(request: Request, params?: Record<string, string>): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const locationId = params?.["0"];
      if (!locationId) {
        return ResponseFactory.error("Invalid location ID", 400);
      }

      await LocationService.update(locationId, { isCurrent: true });
      return ResponseFactory.redirect("/dashboard/locations");
    } catch (error) {
      console.error("Set current location error:", error);
      return ResponseFactory.error("Failed to set current location");
    }
  }

  /**
   * POST /dashboard/locations/:id/delete - Delete location
   */
  private async delete(request: Request, params?: Record<string, string>): Promise<Response> {
    const auth = await this.checkAuth(request);
    if (!auth.authenticated) {
      return ResponseFactory.redirect("/login");
    }

    try {
      const locationId = params?.["0"];
      if (!locationId) {
        return ResponseFactory.error("Invalid location ID", 400);
      }

      const success = await LocationService.delete(locationId);
      if (!success) {
        return ResponseFactory.error("Location not found", 404);
      }

      return ResponseFactory.redirect("/dashboard/locations");
    } catch (error) {
      console.error("Delete location error:", error);
      return ResponseFactory.error("Failed to delete location");
    }
  }

  /**
   * Check authentication helper
   */
  private async checkAuth(
    request: Request
  ): Promise<{ authenticated: boolean; username?: string }> {
    const cookieHeader = request.headers.get("Cookie");
    const sessionId = AuthService.getSessionFromCookie(cookieHeader);

    if (!sessionId) {
      return { authenticated: false };
    }

    const username = await AuthService.validateSession(sessionId);

    if (!username) {
      return { authenticated: false };
    }

    return { authenticated: true, username };
  }
}
