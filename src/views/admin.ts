import { Link } from "../links.ts";

export function renderAdmin(links: Link[], message?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="container">
    <header class="admin-header">
      <h1>Admin Dashboard</h1>
      <div>
        <a href="/" target="_blank">View Site</a>
        <a href="/admin/logout">Logout</a>
      </div>
    </header>

    ${message ? `<div class="success">${message}</div>` : ""}

    <section class="admin-section">
      <h2>Add New Link</h2>
      <form method="POST" action="/admin/links/create" class="admin-form">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Link Name</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="url">URL</label>
            <input type="url" id="url" name="url" required placeholder="https://">
          </div>
        </div>
        <button type="submit">Add Link</button>
      </form>
    </section>

    <section class="admin-section">
      <h2>Manage Links</h2>
      ${links.length === 0 ? '<p class="empty-state">No links yet. Add one above!</p>' : `
        <div class="links-list">
          ${links.map(link => `
            <div class="link-item">
              <div class="link-info">
                <strong>${escapeHtml(link.name)}</strong>
                <span>${escapeHtml(link.url)}</span>
              </div>
              <div class="link-actions">
                <button onclick="editLink('${link.id}', '${escapeHtml(link.name)}', '${escapeHtml(link.url)}')">Edit</button>
                <form method="POST" action="/admin/links/delete" style="display: inline;">
                  <input type="hidden" name="id" value="${link.id}">
                  <button type="submit" class="delete" onclick="return confirm('Delete this link?')">Delete</button>
                </form>
              </div>
            </div>
          `).join("")}
        </div>
      `}
    </section>
  </div>

  <div id="editModal" class="modal">
    <div class="modal-content">
      <h2>Edit Link</h2>
      <form method="POST" action="/admin/links/update" class="admin-form">
        <input type="hidden" id="edit-id" name="id">
        <div class="form-group">
          <label for="edit-name">Link Name</label>
          <input type="text" id="edit-name" name="name" required>
        </div>
        <div class="form-group">
          <label for="edit-url">URL</label>
          <input type="url" id="edit-url" name="url" required>
        </div>
        <div class="modal-actions">
          <button type="submit">Save Changes</button>
          <button type="button" onclick="closeModal()">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function editLink(id, name, url) {
      document.getElementById('edit-id').value = id;
      document.getElementById('edit-name').value = name;
      document.getElementById('edit-url').value = url;
      document.getElementById('editModal').style.display = 'flex';
    }

    function closeModal() {
      document.getElementById('editModal').style.display = 'none';
    }

    window.onclick = function(event) {
      const modal = document.getElementById('editModal');
      if (event.target === modal) {
        closeModal();
      }
    }
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
