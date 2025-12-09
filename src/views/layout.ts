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
</head>
<body>
  ${notification ? renderNotification(notification) : ""}
  <header>
    <nav>
      <strong><a href="/">${AppConfig.ministry.name}</a></strong>
      <ul>
        <li><a href="/">${activeNav === "home" ? "<strong>Home</strong> (current page)" : "Home"}</a></li>
        <li><a href="/about">${activeNav === "about" ? "<strong>About</strong> (current page)" : "About"}</a></li>
        <li><a href="/videos">${activeNav === "videos" ? "<strong>Videos</strong> (current page)" : "Videos"}</a></li>
        <li><a href="/testimonials">${activeNav === "testimonials" ? "<strong>Testimonials</strong> (current page)" : "Testimonials"}</a></li>
        <li><a href="/donate">${activeNav === "donate" ? "<strong>Donate</strong> (current page)" : "Donate"}</a></li>
      </ul>
    </nav>
  </header>

  <main>
    ${content}
  </main>

  <footer>
    <hr>
    <section>
      <h2>${AppConfig.ministry.name}</h2>
      <p>${AppConfig.ministry.tagline}</p>
      <p>Contact: <a href="mailto:${AppConfig.contact.email}">${AppConfig.contact.email}</a></p>
    </section>
    <section>
      <h2>Follow Us</h2>
      <ul>
        <li><a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener">YouTube</a></li>
        <li><a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener">Instagram</a></li>
        <li><a href="${AppConfig.socialMedia.discord}" target="_blank" rel="noopener">Discord</a></li>
        <li><a href="${AppConfig.socialMedia.threads}" target="_blank" rel="noopener">Threads</a></li>
        <li><a href="${AppConfig.socialMedia.tiktok}" target="_blank" rel="noopener">TikTok</a></li>
      </ul>
    </section>
    <section>
      <h2>Support Our Ministry</h2>
      <p>Help us spread the Gospel - <a href="/donate">Donate</a></p>
    </section>
    <hr>
    <p><small>&copy; ${new Date().getFullYear()} ${AppConfig.ministry.name}. All rights reserved. | <a href="/privacy">Privacy Policy</a></small></p>
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
