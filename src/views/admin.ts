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
        <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">💡 Drag and drop to reorder</p>
        <div class="links-list" id="linksList">
          ${links.map(link => `
            <div class="link-item" draggable="true" data-id="${link.id}">
              <div class="drag-handle" title="Drag to reorder">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="8" x2="20" y2="8"></line>
                  <line x1="4" y1="16" x2="20" y2="16"></line>
                </svg>
              </div>
              <div class="link-info">
                <strong>${escapeHtml(link.name)}</strong>
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

    if (colorPicker && colorHex) {
      colorPicker.addEventListener('input', (e) => {
        colorHex.value = e.target.value;
      });

      colorHex.addEventListener('input', (e) => {
        const value = e.target.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
          colorPicker.value = value;
        }
      });
    }

    // Drag and drop reordering (desktop and mobile)
    const linksList = document.getElementById('linksList');
    if (linksList) {
      let draggedElement = null;
      let touchY = 0;

      // Save order to server
      async function saveOrder() {
        const items = Array.from(linksList.querySelectorAll('.link-item'));
        const orderedIds = items.map(item => item.getAttribute('data-id'));

        try {
          const response = await fetch('/admin/links/reorder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderedIds }),
          });

          if (!response.ok) {
            console.error('Failed to save order');
          }
        } catch (error) {
          console.error('Error saving order:', error);
        }
      }

      function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.link-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;

          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
          } else {
            return closest;
          }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
      }

      // Desktop drag and drop
      linksList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('link-item')) {
          draggedElement = e.target;
          e.target.classList.add('dragging');
          e.target.style.opacity = '0.5';
        }
      });

      linksList.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('link-item')) {
          e.target.classList.remove('dragging');
          e.target.style.opacity = '';
          saveOrder();
        }
      });

      linksList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(linksList, e.clientY);
        if (afterElement == null) {
          linksList.appendChild(draggedElement);
        } else {
          linksList.insertBefore(draggedElement, afterElement);
        }
      });

      // Mobile touch events
      linksList.addEventListener('touchstart', (e) => {
        const target = e.target.closest('.link-item');
        if (target) {
          draggedElement = target;
          draggedElement.classList.add('dragging');
          touchY = e.touches[0].clientY;
        }
      }, { passive: true });

      linksList.addEventListener('touchmove', (e) => {
        if (!draggedElement) return;

        e.preventDefault();
        const touch = e.touches[0];
        touchY = touch.clientY;

        const afterElement = getDragAfterElement(linksList, touchY);
        if (afterElement == null) {
          linksList.appendChild(draggedElement);
        } else {
          linksList.insertBefore(draggedElement, afterElement);
        }
      });

      linksList.addEventListener('touchend', (e) => {
        if (draggedElement) {
          draggedElement.classList.remove('dragging');
          draggedElement = null;
          saveOrder();
        }
      }, { passive: true });
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
