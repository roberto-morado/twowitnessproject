/**
 * SEO Controller
 * Handles sitemap.xml and robots.txt
 */

import type { Controller, Route } from "@core/types.ts";

export class SEOController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/sitemap.xml",
        handler: this.serveSitemap.bind(this),
      },
      {
        method: "GET",
        pattern: "/robots.txt",
        handler: this.serveRobots.bind(this),
      },
    ];
  }

  /**
   * GET /sitemap.xml - Serve XML sitemap
   */
  private serveSitemap(): Response {
    const baseUrl = "https://twowitnessproject.org";
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/videos</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/donate</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/pray</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/prayers</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  }

  /**
   * GET /robots.txt - Serve robots.txt
   */
  private serveRobots(): Response {
    const baseUrl = "https://twowitnessproject.org";

    const robots = `# Two Witness Project - Robots.txt
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /login

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml`;

    return new Response(robots, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    });
  }
}
