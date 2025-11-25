/**
 * Home View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";

export function renderHome(): string {
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
            <div class="feature-icon">🚐</div>
            <h3>Life on the Road</h3>
            <p>We've transformed a van into our home, allowing us to travel wherever God calls us to share His word.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📖</div>
            <h3>Street Evangelism</h3>
            <p>Meeting people where they are, sharing the Gospel in cities and towns across the nation.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎥</div>
            <h3>Documenting the Journey</h3>
            <p>Sharing our experiences and encounters through videos on social media to inspire others.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🙏</div>
            <h3>Faith in Action</h3>
            <p>Living by faith, trusting God to provide as we dedicate our lives to His service.</p>
          </div>
        </div>
      </div>
    </section>

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
  });
}
