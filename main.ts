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

// Import controllers
import { HomeController } from "./src/controllers/home.controller.ts";
import { AboutController } from "./src/controllers/about.controller.ts";
import { VideosController } from "./src/controllers/videos.controller.ts";
import { DonateController } from "./src/controllers/donate.controller.ts";

/**
 * Bootstrap the application
 * Dependency Injection: Controllers are instantiated and injected into the router
 */
function bootstrap(): Router {
  const router = new Router();

  // Register controllers (Dependency Injection)
  router.registerController(new HomeController());
  router.registerController(new AboutController());
  router.registerController(new VideosController());
  router.registerController(new DonateController());

  return router;
}

/**
 * Main server function
 */
async function main() {
  const router = bootstrap();

  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║         Two Witness Project - Website Server          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Server running at: http://${AppConfig.server.hostname}:${AppConfig.server.port}
Environment: ${Deno.env.get("DENO_ENV") || "development"}

Press Ctrl+C to stop the server
  `);

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
