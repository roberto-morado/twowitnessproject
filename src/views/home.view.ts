/**
 * Home View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";
import type { Testimonial } from "../services/testimonial.service.ts";
import { escapeHtml } from "@utils/html.ts";

export interface HomeViewData {
  testimonials?: Testimonial[];
}

export function renderHome(data: HomeViewData = {}): string {
  const { testimonials = [] } = data;
  const content = `
    <header>
      <h1>${AppConfig.ministry.name}</h1>
      <p><strong>${AppConfig.ministry.tagline}</strong></p>
      <p>${AppConfig.ministry.description}</p>
      <nav>
        <a href="/about">Learn More</a> |
        <a href="/donate">Support Us</a>
      </nav>
    </header>

    <section>
      <h2>Our Ministry</h2>
      <ul>
        <li>
          <strong>🚐 Life on the Road</strong>
          <p>We've transformed a van into our home, allowing us to travel wherever God calls us to share His word.</p>
        </li>
        <li>
          <strong>📖 Street Evangelism</strong>
          <p>Meeting people where they are, sharing the Gospel in cities and towns across the nation.</p>
        </li>
        <li>
          <strong>🎥 Documenting the Journey</strong>
          <p>Sharing our experiences and encounters through videos on social media to inspire others.</p>
        </li>
        <li>
          <strong>🙏 Faith in Action</strong>
          <p>Living by faith, trusting God to provide as we dedicate our lives to His service.</p>
        </li>
      </ul>
    </section>

    <section>
      <h2>🙏 We'd Love to Pray for You</h2>
      <p>
        As we travel this journey, one of our greatest privileges is lifting others up in prayer.
        Whether you're facing a challenge, celebrating a blessing, or simply need someone to stand
        with you in faith—we're here for you.
      </p>
      <p>
        You can share your prayer request anonymously or include your name. Choose to make it public
        so our community can pray with you, or keep it private between you and God. Every request
        matters, and we take each one seriously.
      </p>
      <nav>
        <a href="/pray">Submit a Prayer Request</a> |
        <a href="/prayers">View Community Prayers</a>
      </nav>
    </section>

    ${testimonials.length > 0 ? `
    <section>
      <h2>✨ Stories of Faith</h2>
      <p>Hear from those who have encountered God's love through our ministry</p>

      ${testimonials.slice(0, 3).map(testimonial => `
        <article>
          <h3>${escapeHtml(testimonial.name)}${testimonial.location ? ` • ${escapeHtml(testimonial.location)}` : ""}</h3>
          <blockquote>
            ${escapeHtml(testimonial.testimony.substring(0, 300))}${testimonial.testimony.length > 300 ? '...' : ''}
          </blockquote>
        </article>
      `).join("")}

      <p><a href="/testimonials">Read More Testimonials</a></p>
    </section>
    ` : ""}

    <section>
      <h2>Join Us on This Journey</h2>
      <p>Follow our ministry on social media and see where God leads us next</p>
      <ul>
        <li><a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener">YouTube</a></li>
        <li><a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener">Instagram</a></li>
        <li><a href="${AppConfig.socialMedia.discord}" target="_blank" rel="noopener">Discord</a></li>
      </ul>
    </section>
  `;

  return renderLayout({
    title: "Home",
    content,
    activeNav: "home",
    description: "Two friends living in a van, traveling across America to share the Gospel through street evangelism. Join us on our faith journey.",
    ogTitle: "Two Witness Project - Street Evangelism Across America",
    ogDescription: "Living by faith in a van, bringing the Gospel to cities across the nation. Watch our journey and support our ministry.",
    canonicalUrl: "https://twowitnessproject.org/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": AppConfig.ministry.name,
      "description": AppConfig.ministry.description,
      "url": "https://twowitnessproject.org",
      "sameAs": [
        AppConfig.socialMedia.youtube,
        AppConfig.socialMedia.instagram,
        AppConfig.socialMedia.tiktok,
        AppConfig.socialMedia.discord,
        AppConfig.socialMedia.threads,
      ],
    },
  });
}
