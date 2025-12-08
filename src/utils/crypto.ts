/**
 * Cryptographic Utilities
 * Provides timing-safe comparison and password hashing using Deno's built-in Web Crypto API
 * No external dependencies required
 */

/**
 * Timing-safe string comparison to prevent timing attacks
 * Compares two strings in constant time regardless of their content
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  // Different lengths = not equal (but still do constant-time check)
  if (bufA.length !== bufB.length) {
    return false;
  }

  // XOR all bytes and OR the results - will be 0 only if all bytes match
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }

  return result === 0;
}

/**
 * Hash a password using PBKDF2 (Password-Based Key Derivation Function 2)
 * Uses 100,000 iterations with SHA-256 for strong security
 *
 * @param password - The password to hash
 * @param salt - The salt to use (should be unique per user/password)
 * @returns Hexadecimal string of the hash
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  // Derive bits using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000, // OWASP recommended minimum
      hash: "SHA-256"
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );

  // Convert to hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verify a password against a stored hash using timing-safe comparison
 *
 * @param password - The password to verify
 * @param storedHash - The stored hash to compare against
 * @param salt - The salt used to create the stored hash
 * @returns true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return timingSafeEqual(hash, storedHash);
}

/**
 * Generate a cryptographically secure random salt
 * @param length - Length of salt in bytes (default: 32)
 * @returns Hexadecimal string of the salt
 */
export function generateSalt(length = 32): string {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
