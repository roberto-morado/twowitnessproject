/**
 * Environment Variable Validation
 * Validates required environment variables at application startup
 * Prevents runtime errors due to missing configuration
 */

export interface EnvironmentConfig {
  // Required variables
  adminUser: string;
  adminPass: string;

  // Optional variables with defaults
  denoEnv: string;

  // Optional password hashing (if using hashed passwords)
  adminPassHash?: string;
  adminPassSalt?: string;

  // Optional analytics salt (recommended)
  analyticsSalt?: string;
}

/**
 * Validate that all required environment variables are set
 * Exits the process if any required variables are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  console.log("🔍 Validating environment variables...");

  // Required variables
  const required = [
    "ADMIN_USER",
    "ADMIN_PASS",
  ];

  // Check for missing required variables
  const missing = required.filter(key => !Deno.env.get(key));

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
    console.error("\nRequired environment variables:");
    console.error("  ADMIN_USER - Admin username for dashboard access");
    console.error("  ADMIN_PASS - Admin password for dashboard access");
    console.error("\nOptional environment variables:");
    console.error("  ADMIN_PASS_HASH - Pre-hashed admin password (alternative to ADMIN_PASS)");
    console.error("  ADMIN_PASS_SALT - Salt for password hashing");
    console.error("  ANALYTICS_SALT - Salt for IP anonymization (recommended)");
    console.error("  DENO_ENV - Environment name (development/production)");
    Deno.exit(1);
  }

  // Get environment configuration
  const config: EnvironmentConfig = {
    adminUser: Deno.env.get("ADMIN_USER")!,
    adminPass: Deno.env.get("ADMIN_PASS")!,
    denoEnv: Deno.env.get("DENO_ENV") || "development",
    adminPassHash: Deno.env.get("ADMIN_PASS_HASH"),
    adminPassSalt: Deno.env.get("ADMIN_PASS_SALT"),
    analyticsSalt: Deno.env.get("ANALYTICS_SALT"),
  };

  // Validate password configuration
  if (config.adminPassHash && !config.adminPassSalt) {
    console.error("❌ ADMIN_PASS_HASH is set but ADMIN_PASS_SALT is missing");
    console.error("   Both must be set to use hashed passwords");
    Deno.exit(1);
  }

  // Warn about plain text password
  if (!config.adminPassHash && config.adminPass) {
    console.warn("⚠️  Using plain text password comparison (ADMIN_PASS)");
    console.warn("   Consider using ADMIN_PASS_HASH and ADMIN_PASS_SALT for better security");
  }

  // Warn about analytics salt
  if (!config.analyticsSalt) {
    console.warn("⚠️  ANALYTICS_SALT not set - using random salt (will change on restart)");
    console.warn("   Set ANALYTICS_SALT for consistent IP anonymization across restarts");
  }

  console.log("✓ Environment variables validated");
  console.log(`  Environment: ${config.denoEnv}`);
  console.log(`  Admin user: ${config.adminUser}`);
  console.log(`  Password mode: ${config.adminPassHash ? "hashed" : "plain text"}`);

  return config;
}

/**
 * Get environment configuration (call after validateEnvironment)
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    adminUser: Deno.env.get("ADMIN_USER")!,
    adminPass: Deno.env.get("ADMIN_PASS")!,
    denoEnv: Deno.env.get("DENO_ENV") || "development",
    adminPassHash: Deno.env.get("ADMIN_PASS_HASH"),
    adminPassSalt: Deno.env.get("ADMIN_PASS_SALT"),
    analyticsSalt: Deno.env.get("ANALYTICS_SALT"),
  };
}
