/// <reference lib="deno.unstable" />

/**
 * Two Witness Project - Linktree Style
 *
 * Simple link aggregator with admin management
 * - Public homepage displaying links
 * - Admin dashboard for link CRUD operations
 * - Minimal, focused functionality
 */

import { Router } from "./src/core/router.ts";
import { AppConfig } from "./src/config/app.config.ts";
import { validateEnvironment } from "./src/config/env.ts";
import { db } from "./src/services/db.service.ts";
import { MigrationService } from "./src/services/migration.service.ts";
import {
  securityHeadersMiddleware,
  cacheHeadersMiddleware,
} from "./src/core/middleware.ts";

// Import controllers
import { LinktreeHomeController } from "./src/controllers/linktree-home.controller.ts";
import { AuthController } from "./src/controllers/auth.controller.ts";
import { DashboardController } from "./src/controllers/dashboard.controller.ts";
import { LinkAdminController } from "./src/controllers/link-admin.controller.ts";

/**
 * Bootstrap the application
 */
async function bootstrap(): Promise<Router> {
  // Initialize Deno KV connection
  await db.connect();

  // Run one-time migration to clean up old data
  await MigrationService.runMigration();

  const router = new Router();

  // Register global middleware
  router
    .use(cacheHeadersMiddleware)
    .use(securityHeadersMiddleware);

  // Register controllers
  router.registerController(new LinktreeHomeController());
  router.registerController(new AuthController());
  router.registerController(new DashboardController());
  router.registerController(new LinkAdminController());

  return router;
}

/**
 * Main server function
 */
async function main() {
  // Validate environment variables before starting
  validateEnvironment();

  const router = await bootstrap();

  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║         Two Witness Project - Linktree Style          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Server running at: http://${AppConfig.server.hostname}:${AppConfig.server.port}
Environment: ${Deno.env.get("DENO_ENV") || "development"}

Press Ctrl+C to stop the server
  `);

  // Start the server
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
