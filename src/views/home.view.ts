/**
 * Home View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";
import type { Testimonial } from "../services/testimonial.service.ts";

export interface HomeViewData {
  testimonials?: Testimonial[];
}

export function renderHome(data: HomeViewData = {}): string {
  const { testimonials = [] } = data;
  const content = `
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>${AppConfig.ministry.name}</h1>
          <p class="hero-tagline">${AppConfig.ministry.tagline}</p>
          <p class="hero-description">${AppConfig.ministry.description}</p>
          <div class="hero-actions">
            <a href="/about" class="btn btn-primary">Learn More</a>
            <a href="/donate" class="btn btn-secondary">Support Us</a>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="feature-grid">
          <div class="feature-card">
            <h3>🚐 Life on the Road</h3>
            <p>We've transformed a van into our home, allowing us to travel wherever God calls us to share His word.</p>
          </div>
          <div class="feature-card">
            <h3>📖 Street Evangelism</h3>
            <p>Meeting people where they are, sharing the Gospel in cities and towns across the nation.</p>
          </div>
          <div class="feature-card">
            <h3>🎥 Documenting the Journey</h3>
            <p>Sharing our experiences and encounters through videos on social media to inspire others.</p>
          </div>
          <div class="feature-card">
            <h3>🙏 Faith in Action</h3>
            <p>Living by faith, trusting God to provide as we dedicate our lives to His service.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="prayer-invitation">
      <div class="container">
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
        <div class="hero-actions">
          <a href="/pray" class="btn btn-primary">Submit a Prayer Request</a>
          <a href="/prayers" class="btn btn-secondary">View Community Prayers</a>
        </div>
      </div>
    </section>

    ${testimonials.length > 0 ? `
    <section class="testimonials-preview">
      <div class="container">
        <h2>✨ Stories of Faith</h2>
        <p>Hear from those who have encountered God's love through our ministry</p>

        <div style="display: grid; gap: 30px; margin-top: 40px;">
          ${testimonials.slice(0, 3).map(testimonial => `
            <div style="padding: 30px; border: 2px solid #000; background: #f9f9f9;">
              <div style="margin-bottom: 15px;">
                <strong style="font-size: 1.2em;">${escapeHtml(testimonial.name)}</strong>
                ${testimonial.location ? `<span style="color: #666; font-size: 0.9em;"> • ${escapeHtml(testimonial.location)}</span>` : ""}
              </div>
              <p style="font-style: italic; line-height: 1.8; white-space: pre-wrap;">
                "${escapeHtml(testimonial.testimony.substring(0, 300))}${testimonial.testimony.length > 300 ? '...' : ''}"
              </p>
            </div>
          `).join("")}
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <a href="/testimonials" class="btn btn-primary">Read More Testimonials</a>
        </div>
      </div>
    </section>
    ` : ""}

    <section class="cta">
      <div class="container">
        <h2>Join Us on This Journey</h2>
        <p>Follow our ministry on social media and see where God leads us next</p>
        <div class="social-buttons">
          <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener" class="btn btn-social">YouTube</a>
          <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener" class="btn btn-social">Instagram</a>
          <a href="${AppConfig.socialMedia.discord}" target="_blank" rel="noopener" class="btn btn-social">Discord</a>
        </div>
      </div>
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

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
