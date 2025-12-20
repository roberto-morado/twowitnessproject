/**
 * Layout View - Template Pattern
 * Provides consistent layout wrapper for all pages with SEO optimization
 */

import { AppConfig } from "@config/app.config.ts";
import { renderNotification, type NotificationOptions } from "./components/notification.ts";

export interface LayoutData {
  title: string;
  content: string;
  activeNav?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  structuredData?: object;
  notification?: NotificationOptions;
}

export function renderLayout(data: LayoutData): string {
  const {
    title,
    content,
    activeNav = "",
    description = AppConfig.ministry.description,
    ogTitle = `${title} - ${AppConfig.ministry.name}`,
    ogDescription = description,
    ogImage = "",
    ogType = "website",
    canonicalUrl = "",
    structuredData,
    notification,
  } = data;

  // Generate emoji favicon SVG
  const faviconSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>👥</text></svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${title} - ${AppConfig.ministry.name}</title>
  <meta name="title" content="${ogTitle}">
  <meta name="description" content="${description}">
  ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">` : ""}

  <!-- Favicon -->
  <link rel="icon" href="${faviconSvg}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDescription}">
  <meta property="og:site_name" content="${AppConfig.ministry.name}">
  ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ""}
  ${canonicalUrl ? `<meta property="og:url" content="${canonicalUrl}">` : ""}

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:title" content="${ogTitle}">
  <meta property="twitter:description" content="${ogDescription}">
  ${ogImage ? `<meta property="twitter:image" content="${ogImage}">` : ""}

  <!-- Additional Meta -->
  <meta name="author" content="${AppConfig.ministry.name}">
  <meta name="keywords" content="christian ministry, evangelism, street evangelism, van life ministry, gospel, faith, two witness project">

  <!-- Structured Data (JSON-LD) -->
  ${structuredData ? `
  <script type="application/ld+json">
    ${JSON.stringify(structuredData)}
  </script>
  ` : ""}

  <!-- Stripe (only on donate page, moved conditionally) -->
  ${activeNav === "donate" ? '<script async src="https://js.stripe.com/v3/buy-button.js"></script>' : ""}

  <!-- Optional styling toggle -->
  <script>
    // Check if user has enabled styling
    const useStyles = localStorage.getItem('useStyles') === 'true';
    console.log('[Style Toggle] Page loaded. useStyles =', useStyles);

    // Apply styles if enabled
    if (useStyles) {
      console.log('[Style Toggle] Loading Water.css...');
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/water.css@2/out/water.min.css';
      link.id = 'optional-styles';
      document.head.appendChild(link);
      console.log('[Style Toggle] Water.css link added to head');
    } else {
      console.log('[Style Toggle] Styles disabled, loading semantic HTML only');
    }

    // Toggle function with mobile-friendly feedback
    window.toggleStyles = function() {
      console.log('[Style Toggle] Toggle clicked');
      const currentState = localStorage.getItem('useStyles') === 'true';
      const newState = !currentState;
      console.log('[Style Toggle] Current state:', currentState, '→ New state:', newState);

      try {
        localStorage.setItem('useStyles', String(newState));
        console.log('[Style Toggle] Saved to localStorage, reloading page...');
        alert('Styles ' + (newState ? 'enabled' : 'disabled') + '. Page will reload.');
        location.reload();
      } catch (error) {
        alert('Error: ' + error.message);
        console.error('[Style Toggle] Error:', error);
      }
    };
  </script>
</head>
<body>
  <header>
    <h1><a href="/">${AppConfig.ministry.name}</a></h1>
    <p><em>${AppConfig.ministry.tagline}</em></p>
  </header>

  <nav>
    <a href="/" ${activeNav === "home" ? 'aria-current="page"' : ""}>Home</a> |
    <a href="/about" ${activeNav === "about" ? 'aria-current="page"' : ""}>About</a> |
    <a href="/map" ${activeNav === "map" ? 'aria-current="page"' : ""}>Map</a> |
    <a href="/videos" ${activeNav === "videos" ? 'aria-current="page"' : ""}>Videos</a> |
    <a href="/testimonials" ${activeNav === "testimonials" ? 'aria-current="page"' : ""}>Testimonials</a> |
    <a href="/connect" ${activeNav === "connect" ? 'aria-current="page"' : ""}>Connect</a> |
    <a href="/donate" ${activeNav === "donate" ? 'aria-current="page"' : ""}>Donate</a>
  </nav>

  ${notification ? renderNotification(notification) : ""}

  <main>
    ${content}
  </main>

  <hr>

  <footer>
    <p>
      <strong>Follow us:</strong>
      <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener">YouTube</a> |
      <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener">Instagram</a> |
      <a href="${AppConfig.socialMedia.discord}" target="_blank" rel="noopener">Discord</a> |
      <a href="${AppConfig.socialMedia.threads}" target="_blank" rel="noopener">Threads</a> |
      <a href="${AppConfig.socialMedia.tiktok}" target="_blank" rel="noopener">TikTok</a>
    </p>
    <p>
      <strong>Contact:</strong> <a href="mailto:${AppConfig.contact.email}">${AppConfig.contact.email}</a> |
      <a href="/donate">Support our ministry</a>
    </p>
    <p>
      <small>&copy; ${new Date().getFullYear()} ${AppConfig.ministry.name}. All rights reserved. | <a href="/privacy">Privacy Policy</a> | <button id="style-toggle" style="background:none;border:none;color:inherit;text-decoration:underline;cursor:pointer;padding:0;font:inherit;">Enable Styles</button></small>
    </p>
    <script>
      // Update toggle button and attach click handler
      (function() {
        const styleToggle = document.getElementById('style-toggle');
        const currentStyleState = localStorage.getItem('useStyles') === 'true';
        console.log('[Style Toggle] Footer script running. Current state:', currentStyleState);

        // Update button text
        if (currentStyleState) {
          styleToggle.textContent = 'Disable Styles';
          console.log('[Style Toggle] Updated button text to "Disable Styles"');
        } else {
          console.log('[Style Toggle] Button text remains "Enable Styles"');
        }

        // Attach click handler
        styleToggle.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('[Style Toggle] Button clicked');

          const current = localStorage.getItem('useStyles') === 'true';
          const newState = !current;

          // Change button text immediately for visual feedback
          styleToggle.textContent = newState ? 'Loading styles...' : 'Removing styles...';

          try {
            localStorage.setItem('useStyles', String(newState));
            console.log('[Style Toggle] Saved:', newState);

            // Reload after a brief delay
            setTimeout(function() {
              location.reload();
            }, 100);
          } catch (error) {
            styleToggle.textContent = 'Error: ' + error.message;
            console.error('[Style Toggle] Error:', error);
          }
        });
      })();
    </script>
  </footer>
</body>
</html>`;
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": AppConfig.ministry.name,
    "description": AppConfig.ministry.description,
    "url": "https://twowitnessproject.org",
    "logo": "",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": AppConfig.contact.email,
      "contactType": "General Inquiry",
    },
    "sameAs": [
      AppConfig.socialMedia.youtube,
      AppConfig.socialMedia.instagram,
      AppConfig.socialMedia.discord,
      AppConfig.socialMedia.threads,
      AppConfig.socialMedia.tiktok,
    ],
  };
}
