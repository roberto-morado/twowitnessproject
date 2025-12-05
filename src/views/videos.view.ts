/**
 * Videos View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";
import type { YouTubeVideo } from "../services/youtube.service.ts";

export interface VideosViewData {
  videos: YouTubeVideo[];
}

export function renderVideos(data: VideosViewData = { videos: [] }): string {
  const { videos } = data;
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
              <h3>▶️ YouTube</h3>
              <p>Full-length videos and vlogs</p>
            </a>
            <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener" class="platform-card">
              <h3>📷 Instagram</h3>
              <p>Daily updates and stories</p>
            </a>
            <a href="${AppConfig.socialMedia.discord}" target="_blank" rel="noopener" class="platform-card">
              <h3>💬 Discord</h3>
              <p>Join our community server</p>
            </a>
            <a href="${AppConfig.socialMedia.tiktok}" target="_blank" rel="noopener" class="platform-card">
              <h3>🎵 TikTok</h3>
              <p>Short clips and highlights</p>
            </a>
            <a href="${AppConfig.socialMedia.threads}" target="_blank" rel="noopener" class="platform-card">
              <h3>🧵 Threads</h3>
              <p>Updates and conversations</p>
            </a>
          </div>
        </div>

        <div class="latest-videos">
          <h2>🎬 Latest Videos</h2>
          ${videos.length > 0 ? `
            <div class="video-grid">
              ${videos.map(video => `
                <a href="${video.link}" target="_blank" rel="noopener" class="video-card">
                  <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                  <h3>${video.title}</h3>
                  <p>${formatDate(video.published)}</p>
                </a>
              `).join("")}
            </div>
            <div class="videos-footer">
              <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener" class="btn btn-primary">
                View All on YouTube
              </a>
            </div>
          ` : `
            <div class="placeholder-message">
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
          `}
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

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
