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
    <header>
      <h1>Our Videos</h1>
      <p>Watch our evangelism encounters and journey</p>
    </header>

    <section>
      <p>
        We document our evangelism encounters and life on the road to share with you
        the amazing ways God is working. Check out our latest videos below, or
        <a href="/connect">visit our Connect page</a> to follow us on social media.
      </p>
    </section>

    <section>
      <h2>🎬 Latest Videos</h2>
      ${videos.length > 0 ? `
        ${videos.map(video => `
          <article>
            <h3><a href="${video.link}" target="_blank" rel="noopener">${video.title}</a></h3>
            <figure>
              <a href="${video.link}" target="_blank" rel="noopener">
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
              </a>
              <figcaption><time>${formatDate(video.published)}</time></figcaption>
            </figure>
          </article>
        `).join("")}
        <p><a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener">View All on YouTube</a></p>
      ` : `
        <p>
          We're just getting started on our journey! Our first videos are coming soon.
          In the meantime, follow us on social media to see behind-the-scenes content
          and updates as we prepare to hit the road.
        </p>
        <nav>
          <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener">Subscribe on YouTube</a> |
          <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener">Follow on Instagram</a>
        </nav>
      `}
    </section>

    <section>
      <h2>Want to Stay Updated?</h2>
      <p>
        <a href="/connect">Connect with us on social media</a> to never miss a video.
        We post regularly about our encounters, testimonies, and life on the road serving Jesus.
      </p>
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
