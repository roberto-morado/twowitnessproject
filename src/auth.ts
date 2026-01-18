import { getDB } from "./db.ts";

const ADMIN_USERNAME = Deno.env.get("ADMIN_USERNAME") || "admin";
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") || "password";

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function createSession(username: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const db = getDB();
  await db.set(["sessions", sessionId], {
    username,
    createdAt: Date.now(),
  });
  return sessionId;
}

export async function getSession(sessionId: string): Promise<string | null> {
  const db = getDB();
  const result = await db.get<{ username: string }>(["sessions", sessionId]);
  return result.value?.username || null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = getDB();
  await db.delete(["sessions", sessionId]);
}

export function getSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/session=([^;]+)/);
  return match ? match[1] : null;
}
