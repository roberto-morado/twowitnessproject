import { initDB } from "./src/db.ts";
import {
  createSession,
  deleteSession,
  getSession,
  getSessionFromCookie,
  validateCredentials,
} from "./src/auth.ts";
import {
  createLink,
  deleteLink,
  getAllLinks,
  getLink,
  updateLink,
} from "./src/links.ts";
import { renderHome } from "./src/views/home.ts";
import { renderLogin } from "./src/views/login.ts";
import { renderAdmin } from "./src/views/admin.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000");

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  // Serve static files
  if (path === "/styles.css") {
    try {
      const file = await Deno.readTextFile("./public/styles.css");
      return new Response(file, {
        headers: { "Content-Type": "text/css" },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  // Public homepage
  if (path === "/" && method === "GET") {
    const links = await getAllLinks();
    const html = renderHome(links);
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Admin login page
  if (path === "/admin/login" && method === "GET") {
    const html = renderLogin();
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Admin login POST
  if (path === "/admin/login" && method === "POST") {
    const formData = await req.formData();
    const username = formData.get("username")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    if (validateCredentials(username, password)) {
      const sessionId = await createSession(username);
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "/admin",
          "Set-Cookie": `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
        },
      });
    } else {
      const html = renderLogin("Invalid username or password");
      return new Response(html, {
        status: 401,
        headers: { "Content-Type": "text/html" },
      });
    }
  }

  // Admin logout
  if (path === "/admin/logout" && method === "GET") {
    const sessionId = getSessionFromCookie(req.headers.get("Cookie"));
    if (sessionId) {
      await deleteSession(sessionId);
    }
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/",
        "Set-Cookie": "session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
      },
    });
  }

  // Check authentication for admin routes
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const sessionId = getSessionFromCookie(req.headers.get("Cookie"));
    const username = sessionId ? await getSession(sessionId) : null;

    if (!username) {
      return new Response(null, {
        status: 302,
        headers: { "Location": "/admin/login" },
      });
    }
  }

  // Admin dashboard
  if (path === "/admin" && method === "GET") {
    const links = await getAllLinks();
    const html = renderAdmin(links);
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Create link
  if (path === "/admin/links/create" && method === "POST") {
    const formData = await req.formData();
    const name = formData.get("name")?.toString() || "";
    const url = formData.get("url")?.toString() || "";

    if (name && url) {
      await createLink(name, url);
    }

    return new Response(null, {
      status: 302,
      headers: { "Location": "/admin" },
    });
  }

  // Update link
  if (path === "/admin/links/update" && method === "POST") {
    const formData = await req.formData();
    const id = formData.get("id")?.toString() || "";
    const name = formData.get("name")?.toString() || "";
    const url = formData.get("url")?.toString() || "";

    if (id && name && url) {
      await updateLink(id, name, url);
    }

    return new Response(null, {
      status: 302,
      headers: { "Location": "/admin" },
    });
  }

  // Delete link
  if (path === "/admin/links/delete" && method === "POST") {
    const formData = await req.formData();
    const id = formData.get("id")?.toString() || "";

    if (id) {
      await deleteLink(id);
    }

    return new Response(null, {
      status: 302,
      headers: { "Location": "/admin" },
    });
  }

  // 404
  return new Response("Not Found", { status: 404 });
}

async function main() {
  await initDB();

  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Admin: http://localhost:${PORT}/admin/login`);

  await Deno.serve({ port: PORT }, handleRequest);
}

main();
