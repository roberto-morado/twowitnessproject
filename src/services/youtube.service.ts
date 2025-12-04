/**
 * YouTube Service
 * Fetches latest videos from YouTube RSS feed (privacy-friendly, no API key needed)
 */

import { AppConfig } from "@config/app.config.ts";
import { db, KvKeys } from "./db.service.ts";

export interface YouTubeVideo {
  id: string;
  title: string;
  link: string;
  published: Date;
  thumbnail: string;
  author: string;
}

export class YouTubeService {
  private static readonly CACHE_KEY = ["youtube", "videos"];
  private static readonly CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour

  /**
   * Get latest videos from YouTube RSS feed
   * Cached for 1 hour to avoid excessive requests
   */
  static async getLatestVideos(limit = 6): Promise<YouTubeVideo[]> {
    const channelId = AppConfig.socialMedia.youtubeChannelId;

    // Return empty array if channel ID not configured
    if (!channelId || channelId.trim() === "") {
      console.warn("⚠️ YouTube Channel ID not configured");
      return [];
    }

    // Check cache first
    const cached = await db.get<{ videos: YouTubeVideo[]; timestamp: number }>(
      this.CACHE_KEY
    );

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION_MS) {
      console.log("✓ Using cached YouTube videos");
      return cached.videos.slice(0, limit);
    }

    // Fetch from RSS feed
    try {
      const videos = await this.fetchFromRSS(channelId);

      // Cache the results
      await db.set(this.CACHE_KEY, {
        videos,
        timestamp: Date.now(),
      });

      console.log(`✓ Fetched ${videos.length} videos from YouTube RSS`);
      return videos.slice(0, limit);
    } catch (error) {
      console.error("YouTube RSS fetch error:", error);

      // Return cached data if available, even if expired
      if (cached) {
        console.log("⚠️ Using stale cache due to fetch error");
        return cached.videos.slice(0, limit);
      }

      return [];
    }
  }

  /**
   * Fetch and parse YouTube RSS feed
   */
  private static async fetchFromRSS(channelId: string): Promise<YouTubeVideo[]> {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "TwoWitnessProject/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status}`);
    }

    const xmlText = await response.text();
    return this.parseRSS(xmlText);
  }

  /**
   * Parse YouTube RSS XML
   * Simple regex-based parsing (no XML parser needed)
   */
  private static parseRSS(xml: string): YouTubeVideo[] {
    const videos: YouTubeVideo[] = [];

    // Match each <entry> element
    const entryRegex = /<entry>(.*?)<\/entry>/gs;
    const entries = xml.match(entryRegex) || [];

    for (const entry of entries) {
      try {
        // Extract video ID
        const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const videoId = videoIdMatch ? videoIdMatch[1] : "";

        // Extract title
        const titleMatch = entry.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? this.decodeHTML(titleMatch[1]) : "";

        // Extract published date
        const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
        const published = publishedMatch ? new Date(publishedMatch[1]) : new Date();

        // Extract author
        const authorMatch = entry.match(/<name>(.*?)<\/name>/);
        const author = authorMatch ? this.decodeHTML(authorMatch[1]) : "Two Witness Project";

        if (videoId && title) {
          videos.push({
            id: videoId,
            title,
            link: `https://www.youtube.com/watch?v=${videoId}`,
            published,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
            author,
          });
        }
      } catch (error) {
        console.error("Error parsing RSS entry:", error);
        continue;
      }
    }

    return videos;
  }

  /**
   * Decode HTML entities in RSS feed
   */
  private static decodeHTML(text: string): string {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  /**
   * Clear video cache (useful for testing or manual refresh)
   */
  static async clearCache(): Promise<void> {
    await db.delete(this.CACHE_KEY);
    console.log("✓ YouTube video cache cleared");
  }
}
