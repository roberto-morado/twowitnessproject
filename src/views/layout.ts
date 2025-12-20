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
    // Load Water.css if user has enabled styling
    if (localStorage.getItem('useStyles') === 'true') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/water.css@2/out/water.min.css';
      document.head.appendChild(link);
    }
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
      <small>&copy; ${new Date().getFullYear()} ${AppConfig.ministry.name}. All rights reserved. | <a href="/privacy">Privacy Policy</a> | <a href="#" id="style-toggle">Enable Styles</a></small>
    </p>
    <script>
      (function() {
        const toggle = document.getElementById('style-toggle');
        const enabled = localStorage.getItem('useStyles') === 'true';

        // Update link text
        toggle.textContent = enabled ? 'Disable Styles' : 'Enable Styles';

        // Toggle handler
        toggle.addEventListener('click', function(e) {
          e.preventDefault();
          localStorage.setItem('useStyles', String(!enabled));
          location.reload();
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
