import { getDB } from "./db.ts";

export interface Link {
  id: string;
  name: string;
  url: string;
  order: number;
}

export async function getAllLinks(): Promise<Link[]> {
  const db = getDB();
  const entries = db.list<Link>({ prefix: ["links"] });
  const links: Link[] = [];

  for await (const entry of entries) {
    links.push(entry.value);
  }

  return links.sort((a, b) => a.order - b.order);
}

export async function getLink(id: string): Promise<Link | null> {
  const db = getDB();
  const result = await db.get<Link>(["links", id]);
  return result.value;
}

export async function createLink(name: string, url: string): Promise<Link> {
  const db = getDB();
  const links = await getAllLinks();
  const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.order)) : 0;

  const link: Link = {
    id: crypto.randomUUID(),
    name,
    url,
    order: maxOrder + 1,
  };

  await db.set(["links", link.id], link);
  return link;
}

export async function updateLink(id: string, name: string, url: string): Promise<Link | null> {
  const db = getDB();
  const existing = await getLink(id);
  if (!existing) return null;

  const updated: Link = {
    ...existing,
    name,
    url,
  };

  await db.set(["links", id], updated);
  return updated;
}

export async function deleteLink(id: string): Promise<boolean> {
  const db = getDB();
  const existing = await getLink(id);
  if (!existing) return false;

  await db.delete(["links", id]);
  return true;
}
