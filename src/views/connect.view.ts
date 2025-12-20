/**
 * Connect View
 * Social media links and ways to connect with the ministry
 */

import { renderLayout } from "./layout.ts";
import { AppConfig } from "@config/app.config.ts";

export function renderConnect(): string {
  const content = `
    <h1>🌐 Connect With Us</h1>
    <p>Follow our ministry journey and stay connected with us on social media.</p>

    <section>
      <h2>Follow Our Journey</h2>

      <div style="margin: 2rem 0;">
        <h3 style="margin-bottom: 0.5rem;">
          <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener" style="font-size: 1.5rem; text-decoration: none;">
            📺 YouTube
          </a>
        </h3>
        <p style="margin-left: 2rem; color: #555;">
          Watch our evangelism encounters and ministry videos as we share the Gospel across the nation.
        </p>
      </div>

      <div style="margin: 2rem 0;">
        <h3 style="margin-bottom: 0.5rem;">
          <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener" style="font-size: 1.5rem; text-decoration: none;">
            📸 Instagram
          </a>
        </h3>
        <p style="margin-left: 2rem; color: #555;">
          Daily Gospel moments and personal encounters with people. Follow for real, unfiltered ministry life on the road.
        </p>
      </div>

      <div style="margin: 2rem 0;">
        <h3 style="margin-bottom: 0.5rem;">
          <a href="${AppConfig.socialMedia.threads}" target="_blank" rel="noopener" style="font-size: 1.5rem; text-decoration: none;">
            🧵 Threads
          </a>
        </h3>
        <p style="margin-left: 2rem; color: #555;">
          Written updates, reflections, and testimonies from the road. Read about what God is doing in our ministry.
        </p>
      </div>

      <div style="margin: 2rem 0;">
        <h3 style="margin-bottom: 0.5rem;">
          <a href="${AppConfig.socialMedia.tiktok}" target="_blank" rel="noopener" style="font-size: 1.5rem; text-decoration: none;">
            🎵 TikTok
          </a>
        </h3>
        <p style="margin-left: 2rem; color: #555;">
          Short videos of Gospel moments and street ministry encounters from our journey.
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
