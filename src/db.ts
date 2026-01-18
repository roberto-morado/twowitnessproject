/// <reference lib="deno.unstable" />

let kv: Deno.Kv;

export async function initDB() {
  kv = await Deno.openKv();
  console.log("✓ Database connected");
}

export function getDB() {
  return kv;
}
