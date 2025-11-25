/**
 * Videos View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";

export function renderVideos(): string {
  const content = `
    <section class="page-header">
      <div class="container">
        <h1>Our Videos</h1>
        <p>Watch our evangelism encounters and journey</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="videos-intro">
          <p>
            We document our evangelism encounters and life on the road to share with you
            the amazing ways God is working. Check out our latest videos below, or follow
            us on social media to see new content as soon as it's posted.
          </p>
        </div>

        <div class="social-platforms">
          <h2>Find Us On</h2>
          <div class="platform-grid">
            <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener" class="platform-card">
              <div class="platform-icon">▶️</div>
              <h3>YouTube</h3>
              <p>Full-length videos and vlogs</p>
            </a>
            <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener" class="platform-card">
              <div class="platform-icon">📷</div>
              <h3>Instagram</h3>
              <p>Daily updates and stories</p>
            </a>
            <a href="${AppConfig.socialMedia.facebook}" target="_blank" rel="noopener" class="platform-card">
              <div class="platform-icon">👥</div>
              <h3>Facebook</h3>
              <p>Connect with our community</p>
            </a>
            <a href="${AppConfig.socialMedia.tiktok}" target="_blank" rel="noopener" class="platform-card">
              <div class="platform-icon">🎵</div>
              <h3>TikTok</h3>
              <p>Short clips and highlights</p>
            </a>
            <a href="${AppConfig.socialMedia.threads}" target="_blank" rel="noopener" class="platform-card">
              <div class="platform-icon">🧵</div>
              <h3>Threads</h3>
              <p>Updates and conversations</p>
            </a>
          </div>
        </div>

        <div class="video-placeholder">
          <h2>Latest Videos</h2>
          <div class="placeholder-message">
            <div class="placeholder-icon">🎬</div>
            <p>
              We're just getting started on our journey! Our first videos are coming soon.
              In the meantime, follow us on social media to see behind-the-scenes content
              and updates as we prepare to hit the road.
            </p>
            <div class="placeholder-actions">
              <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener" class="btn btn-primary">
                Subscribe on YouTube
              </a>
              <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener" class="btn btn-secondary">
                Follow on Instagram
              </a>
            </div>
          </div>
        </div>

        <div class="videos-cta">
          <h2>Want to Stay Updated?</h2>
          <p>
            Follow us on your favorite platform to never miss a video. We post regularly
            about our encounters, testimonies, and life on the road serving Jesus.
          </p>
        </div>
      </div>
    </section>
  `;

  return renderLayout({
    title: "Videos",
    content,
    activeNav: "videos",
  });
}
