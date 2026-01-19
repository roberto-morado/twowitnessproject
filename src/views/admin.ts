import { Link } from "../links.ts";
import { ColorTheme } from "../colors.ts";

export function renderAdmin(links: Link[], baseColor: string, theme: ColorTheme, message?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard</title>
  <link rel="stylesheet" href="/styles.css">
  <style>
    :root {
      --color-primary: ${theme.primary};
      --color-secondary: ${theme.secondary};
      --color-accent: ${theme.accent};
    }
  </style>
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
      <h2>Theme Customization</h2>
      <p style="margin-bottom: 1.5rem; color: #666;">Choose a base color and we'll automatically generate a harmonious color scheme using color theory.</p>
      <form method="POST" action="/admin/theme" class="admin-form">
        <div class="theme-row">
          <div class="form-group">
            <label for="baseColor">Base Color</label>
            <div class="color-input-group">
              <input type="color" id="baseColor" name="baseColor" value="${baseColor}" required>
              <input type="text" id="baseColorHex" value="${baseColor}" pattern="^#[0-9A-Fa-f]{6}$" placeholder="#667eea">
            </div>
          </div>
          <div class="color-preview">
            <div class="color-swatch" style="background: ${theme.primary};" title="Primary (base color)"></div>
            <div class="color-swatch" style="background: ${theme.secondary};" title="Secondary (gradient pair)"></div>
            <div class="color-swatch" style="background: ${theme.accent};" title="Accent (text & buttons)"></div>
          </div>
        </div>
        <button type="submit">Save Theme</button>
      </form>
    </section>

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
    // Link editing functions
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

    // Color picker sync
    const colorPicker = document.getElementById('baseColor');
    const colorHex = document.getElementById('baseColorHex');

    colorPicker.addEventListener('input', (e) => {
      colorHex.value = e.target.value;
    });

    colorHex.addEventListener('input', (e) => {
      const value = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        colorPicker.value = value;
      }
    });
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
