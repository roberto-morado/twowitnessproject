/**
 * Connect View
 * Social media links and ways to connect with the ministry
 */

import { renderLayout } from "./layout.ts";
import { AppConfig } from "@config/app.config.ts";

export function renderConnect(): string {
  const content = `
    <h1>🌐 Connect With Us</h1>
    <p>Stay connected with our ministry across multiple platforms. Each platform serves a unique purpose in sharing our journey and building community.</p>

    <section>
      <h2>Follow Our Journey</h2>

      <div style="margin: 2rem 0;">
        <h3 style="margin-bottom: 0.5rem;">
          <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener" style="font-size: 1.5rem; text-decoration: none;">
            📺 YouTube
          </a>
        </h3>
        <p style="margin-left: 2rem; color: #555;">
          Watch our evangelism livestreams and video content. Subscribe to catch us live as we share the Gospel across the nation.
        </p>
      </div>

      <div style="margin: 2rem 0;">
        <h3 style="margin-bottom: 0.5rem;">
          <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener" style="font-size: 1.5rem; text-decoration: none;">
            📸 Instagram
          </a>
        </h3>
        <p style="margin-left: 2rem; color: #555;">
          Short-form clips from our livestreams and personal encounters captured with our Meta glasses. Follow for daily Gospel moments and behind-the-scenes ministry life.
        </p>
      </div>

      <div style="margin: 2rem 0;">
        <h3 style="margin-bottom: 0.5rem;">
          <a href="${AppConfig.socialMedia.threads}" target="_blank" rel="noopener" style="font-size: 1.5rem; text-decoration: none;">
            🧵 Threads
          </a>
        </h3>
        <p style="margin-left: 2rem; color: #555;">
          Written updates, reflections, and ministry news. Our journalistic outlet for sharing thoughts, experiences, and resources as we travel.
        </p>
      </div>

      <div style="margin: 2rem 0;">
        <h3 style="margin-bottom: 0.5rem;">
          <a href="${AppConfig.socialMedia.tiktok}" target="_blank" rel="noopener" style="font-size: 1.5rem; text-decoration: none;">
            🎵 TikTok
          </a>
        </h3>
        <p style="margin-left: 2rem; color: #555;">
          Engaging short videos from our livestreams and personal encounters with our Meta glasses. Quick, impactful Gospel content for the TikTok community.
        </p>
      </div>
    </section>

    <section style="margin-top: 3rem;">
      <h2>Join Our Community</h2>

      <div style="margin: 2rem 0;">
        <h3 style="margin-bottom: 0.5rem;">
          <a href="${AppConfig.socialMedia.discord}" target="_blank" rel="noopener" style="font-size: 1.5rem; text-decoration: none;">
            💬 Discord Community
          </a>
        </h3>
        <p style="margin-left: 2rem; color: #555;">
          Join our community server to pray together, share testimonies, ask questions, and connect with other believers supporting this ministry.
        </p>
      </div>
    </section>

    <section style="margin-top: 3rem;">
      <h2>Get In Touch</h2>
      <p>Have questions or want to connect directly? Email us at <a href="mailto:${AppConfig.contact.email}">${AppConfig.contact.email}</a></p>
      <p>You can also <a href="/pray">submit a prayer request</a> or <a href="/donate">support our ministry</a>.</p>
    </section>
  `;

  return renderLayout({
    title: "Connect With Us",
    content,
    activeNav: "connect",
    description: "Connect with Two Witness Project on social media. Follow our ministry journey on YouTube, Instagram, Threads, TikTok, and join our Discord community.",
  });
}
