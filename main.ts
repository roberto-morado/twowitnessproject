/// <reference lib="deno.unstable" />

/**
 * Two Witness Project - Main Entry Point
 *
 * This application follows SOLID principles and design patterns:
 * - Single Responsibility: Each component has one clear purpose
 * - Open/Closed: Easy to extend without modifying existing code
 * - Liskov Substitution: Proper abstraction and interfaces
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Dependencies injected, not hard-coded
 *
 * Patterns used:
 * - Router Pattern: Clean URL routing
 * - Controller Pattern: Separation of concerns
 * - Factory Pattern: Response creation
 * - Template Pattern: Consistent HTML rendering
 */

import { Router } from "./src/core/router.ts";
import { AppConfig } from "./src/config/app.config.ts";
import { db } from "./src/services/db.service.ts";
import { AuthService } from "./src/services/auth.service.ts";
import { CleanupService } from "./src/services/cleanup.service.ts";
import {
  securityHeadersMiddleware,
  cacheHeadersMiddleware,
  analyticsMiddleware,
} from "./src/core/middleware.ts";

// Import controllers
import { HomeController } from "./src/controllers/home.controller.ts";
import { AboutController } from "./src/controllers/about.controller.ts";
import { VideosController } from "./src/controllers/videos.controller.ts";
import { DonateController } from "./src/controllers/donate.controller.ts";
import { AuthController } from "./src/controllers/auth.controller.ts";
import { PrayerController } from "./src/controllers/prayer.controller.ts";
import { AnalyticsController } from "./src/controllers/analytics.controller.ts";
import { SEOController } from "./src/controllers/seo.controller.ts";
import { PrivacyController } from "./src/controllers/privacy.controller.ts";
import { SettingsController } from "./src/controllers/settings.controller.ts";
import { TestimonialController } from "./src/controllers/testimonial.controller.ts";

/**
 * Bootstrap the application
 * Dependency Injection: Controllers are instantiated and injected into the router
 */
async function bootstrap(): Promise<Router> {
  // Initialize Deno KV connection
  await db.connect();

  // Initialize admin user from environment variables
  await AuthService.initializeAdmin();

  const router = new Router();

  // Register global middleware (order matters!)
  router
    .use(cacheHeadersMiddleware)
    .use(analyticsMiddleware)
    .use(securityHeadersMiddleware);

  // Register controllers (Dependency Injection)
  router.registerController(new HomeController());
  router.registerController(new AboutController());
  router.registerController(new VideosController());
  router.registerController(new DonateController());
  router.registerController(new AuthController());
  router.registerController(new PrayerController());
  router.registerController(new TestimonialController());
  router.registerController(new AnalyticsController());
  router.registerController(new SEOController());
  router.registerController(new PrivacyController());
  router.registerController(new SettingsController());

  return router;
}

/**
 * Setup Deno cron jobs
 */
function setupCronJobs() {
  // Daily cleanup job at 2:00 AM
  Deno.cron("Daily cleanup", "0 2 * * *", async () => {
    await CleanupService.runCleanup(
      AppConfig.dataRetention.analytics,
      AppConfig.dataRetention.prayedPrayers
    );
  });

  console.log("✓ Cron jobs scheduled (daily cleanup at 2:00 AM)");
}

/**
 * Main server function
 */
async function main() {
  const router = await bootstrap();

  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║         Two Witness Project - Website Server          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Server running at: http://${AppConfig.server.hostname}:${AppConfig.server.port}
Environment: ${Deno.env.get("DENO_ENV") || "development"}
Data Retention: Analytics ${AppConfig.dataRetention.analytics} days, Prayers ${AppConfig.dataRetention.prayedPrayers} days

Press Ctrl+C to stop the server
  `);

  // Setup automated cleanup
  setupCronJobs();

  // Start the server using Deno.serve()
  await Deno.serve(
    {
      port: AppConfig.server.port,
      hostname: AppConfig.server.hostname,
      onListen: ({ hostname, port }) => {
        console.log(`✓ Listening on http://${hostname}:${port}`);
      },
    },
    (request) => router.handle(request)
  );
}

// Run the server
if (import.meta.main) {
  main();
}
