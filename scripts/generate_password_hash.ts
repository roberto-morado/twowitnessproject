#!/usr/bin/env -S deno run --allow-env
/**
 * Password Hash Generator
 *
 * Generates a secure PBKDF2 hash for admin password authentication.
 * This allows you to use hashed passwords instead of plain text.
 *
 * Usage:
 *   deno run --allow-env scripts/generate_password_hash.ts <your_password>
 *
 * Or make it executable:
 *   chmod +x scripts/generate_password_hash.ts
 *   ./scripts/generate_password_hash.ts <your_password>
 */

import { hashPassword, generateSalt } from "../src/utils/crypto.ts";

// Get password from command line argument
const password = Deno.args[0];

if (!password) {
  console.error("❌ Error: Password is required\n");
  console.log("Usage:");
  console.log("  deno run --allow-env scripts/generate_password_hash.ts <your_password>");
  console.log("\nExample:");
  console.log('  deno run --allow-env scripts/generate_password_hash.ts "MySecurePassword123"\n');
  Deno.exit(1);
}

// Validate password strength (optional - add your own rules)
if (password.length < 8) {
  console.error("⚠️  Warning: Password is less than 8 characters. Consider using a stronger password.\n");
}

// Generate salt and hash
console.log("🔐 Generating password hash...\n");
const salt = generateSalt();
const hash = await hashPassword(password, salt);

// Display results
console.log("✅ Password hash generated successfully!\n");
console.log("═══════════════════════════════════════════════════════════");
console.log("Add these to your Deno Deploy environment variables:");
console.log("═══════════════════════════════════════════════════════════\n");
console.log(`ADMIN_PASS_SALT=${salt}`);
console.log(`ADMIN_PASS_HASH=${hash}\n`);
console.log("═══════════════════════════════════════════════════════════");
console.log("\n📝 Migration Steps:\n");
console.log("1. Go to your Deno Deploy project settings");
console.log("2. Navigate to 'Environment Variables'");
console.log("3. Add ADMIN_PASS_SALT with the salt value above");
console.log("4. Add ADMIN_PASS_HASH with the hash value above");
console.log("5. Deploy and test login");
console.log("6. Once confirmed working, remove ADMIN_PASS (optional)\n");
console.log("💡 Note: The app supports both plain text and hashed passwords.");
console.log("   If both are set, hashed password takes precedence.\n");
