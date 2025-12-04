/**
 * Layout View - Template Pattern
 * Provides consistent layout wrapper for all pages with SEO optimization
 */

import { AppConfig } from "@config/app.config.ts";

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

  <!-- Stylesheet -->
  <link rel="stylesheet" href="/css/styles.css">

  <!-- Stripe (only on donate page, moved conditionally) -->
  ${activeNav === "donate" ? '<script async src="https://js.stripe.com/v3/buy-button.js"></script>' : ""}
</head>
<body>
  <header>
    <nav class="navbar">
      <div class="container">
        <a href="/" class="logo">
          <h1>${AppConfig.ministry.name}</h1>
        </a>
        <ul class="nav-menu">
          <li><a href="/" class="${activeNav === "home" ? "active" : ""}">Home</a></li>
          <li><a href="/about" class="${activeNav === "about" ? "active" : ""}">About</a></li>
          <li><a href="/videos" class="${activeNav === "videos" ? "active" : ""}">Videos</a></li>
          <li><a href="/donate" class="${activeNav === "donate" ? "active" : ""}">Donate</a></li>
        </ul>
      </div>
    </nav>
  </header>

  <main>
    ${content}
  </main>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>${AppConfig.ministry.name}</h3>
          <p>${AppConfig.ministry.tagline}</p>
          <p><a href="mailto:${AppConfig.contact.email}">${AppConfig.contact.email}</a></p>
        </div>
        <div class="footer-section">
          <h3>Follow Us</h3>
          <div class="social-links">
            <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener">YouTube</a>
            <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener">Instagram</a>
            <a href="${AppConfig.socialMedia.discord}" target="_blank" rel="noopener">Discord</a>
            <a href="${AppConfig.socialMedia.threads}" target="_blank" rel="noopener">Threads</a>
            <a href="${AppConfig.socialMedia.tiktok}" target="_blank" rel="noopener">TikTok</a>
          </div>
        </div>
        <div class="footer-section">
          <h3>Support Our Ministry</h3>
          <p>Help us spread the Gospel</p>
          <a href="/donate" class="btn">Donate</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${AppConfig.ministry.name}. All rights reserved. | <a href="/privacy">Privacy Policy</a></p>
      </div>
    </div>
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
