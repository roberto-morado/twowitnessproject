/**
 * Analytics Service
 * Tracks page views, events, and provides query/aggregation functions
 */

import { db, KvKeys } from "./db.service.ts";

export interface PageView {
  id: string;
  path: string;
  referrer: string | null;
  userAgent: string | null;
  device: "mobile" | "tablet" | "desktop" | "unknown";
  browser: string;
  timestamp: number;
  anonymizedIp: string;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  page: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface AnalyticsOverview {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
}

export class AnalyticsService {
  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Anonymize IP address by hashing
   */
  private static async anonymizeIp(ip: string | null): Promise<string> {
    if (!ip) return "unknown";

    // Hash the IP for privacy
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + "salt-twp"); // Add salt for extra privacy
    try {
      const buffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
    } catch {
      return "unknown";
    }
  }

  /**
   * Parse user agent to determine device type
   */
  private static parseDevice(userAgent: string | null): "mobile" | "tablet" | "desktop" | "unknown" {
    if (!userAgent) return "unknown";

    const ua = userAgent.toLowerCase();

    if (/tablet|ipad/i.test(ua)) return "tablet";
    if (/mobile|android|iphone/i.test(ua)) return "mobile";
    if (/windows|mac|linux/i.test(ua)) return "desktop";

    return "unknown";
  }

  /**
   * Parse user agent to determine browser
   */
  private static parseBrowser(userAgent: string | null): string {
    if (!userAgent) return "unknown";

    const ua = userAgent.toLowerCase();

    if (ua.includes("firefox")) return "Firefox";
    if (ua.includes("chrome") && !ua.includes("edge")) return "Chrome";
    if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
    if (ua.includes("edge")) return "Edge";
    if (ua.includes("opera") || ua.includes("opr")) return "Opera";

    return "Other";
  }

  /**
   * Track a page view
   */
  static async trackPageView(
    path: string,
    referrer: string | null,
    userAgent: string | null,
    ip: string | null
  ): Promise<void> {
    const id = this.generateId();
    const timestamp = Date.now();
    const anonymizedIp = await this.anonymizeIp(ip);

    const pageView: PageView = {
      id,
      path,
      referrer,
      userAgent,
      device: this.parseDevice(userAgent),
      browser: this.parseBrowser(userAgent),
      timestamp,
      anonymizedIp,
    };

    await db.set(KvKeys.pageView(timestamp, id), pageView);
  }

  /**
   * Track an event
   */
  static async trackEvent(
    name: string,
    page: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const id = this.generateId();
    const timestamp = Date.now();

    const event: AnalyticsEvent = {
      id,
      name,
      page,
      data,
      timestamp,
    };

    await db.set(KvKeys.event(timestamp, id), event);
  }

  /**
   * Get all page views in date range
   */
  static async getPageViews(startDate: number, endDate: number): Promise<PageView[]> {
    const allPageViews = await db.list<PageView>(KvKeys.allPageViews());

    return allPageViews
      .map(entry => entry.value)
      .filter(pv => pv.timestamp >= startDate && pv.timestamp <= endDate)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get all events in date range
   */
  static async getEvents(startDate: number, endDate: number): Promise<AnalyticsEvent[]> {
    const allEvents = await db.list<AnalyticsEvent>(KvKeys.allEvents());

    return allEvents
      .map(entry => entry.value)
      .filter(e => e.timestamp >= startDate && e.timestamp <= endDate)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get analytics overview for date range
   */
  static async getOverview(startDate: number, endDate: number): Promise<AnalyticsOverview> {
    const pageViews = await this.getPageViews(startDate, endDate);

    // Total page views
    const totalPageViews = pageViews.length;

    // Unique visitors (based on anonymized IP)
    const uniqueIps = new Set(pageViews.map(pv => pv.anonymizedIp));
    const uniqueVisitors = uniqueIps.size;

    // Top pages
    const pageCounts = new Map<string, number>();
    for (const pv of pageViews) {
      pageCounts.set(pv.path, (pageCounts.get(pv.path) || 0) + 1);
    }
    const topPages = Array.from(pageCounts.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Top referrers
    const referrerCounts = new Map<string, number>();
    for (const pv of pageViews) {
      const ref = pv.referrer || "Direct";
      referrerCounts.set(ref, (referrerCounts.get(ref) || 0) + 1);
    }
    const topReferrers = Array.from(referrerCounts.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Device breakdown
    const deviceBreakdown: Record<string, number> = {};
    for (const pv of pageViews) {
      deviceBreakdown[pv.device] = (deviceBreakdown[pv.device] || 0) + 1;
    }

    // Browser breakdown
    const browserBreakdown: Record<string, number> = {};
    for (const pv of pageViews) {
      browserBreakdown[pv.browser] = (browserBreakdown[pv.browser] || 0) + 1;
    }

    return {
      totalPageViews,
      uniqueVisitors,
      topPages,
      topReferrers,
      deviceBreakdown,
      browserBreakdown,
    };
  }

  /**
   * Get page views grouped by day for chart
   */
  static async getPageViewsByDay(startDate: number, endDate: number): Promise<Array<{ date: string; views: number }>> {
    const pageViews = await this.getPageViews(startDate, endDate);

    const dayMap = new Map<string, number>();

    for (const pv of pageViews) {
      const date = new Date(pv.timestamp);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + 1);
    }

    return Array.from(dayMap.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get event counts grouped by name
   */
  static async getEventCounts(startDate: number, endDate: number): Promise<Array<{ name: string; count: number }>> {
    const events = await this.getEvents(startDate, endDate);

    const eventMap = new Map<string, number>();

    for (const event of events) {
      eventMap.set(event.name, (eventMap.get(event.name) || 0) + 1);
    }

    return Array.from(eventMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Export analytics data as CSV
   */
  static async exportToCSV(startDate: number, endDate: number): Promise<string> {
    const pageViews = await this.getPageViews(startDate, endDate);
    const events = await this.getEvents(startDate, endDate);

    let csv = "Type,Timestamp,Path/Name,Referrer,Device,Browser,Data\n";

    // Add page views
    for (const pv of pageViews) {
      const timestamp = new Date(pv.timestamp).toISOString();
      csv += `PageView,${timestamp},${pv.path},${pv.referrer || ""},${pv.device},${pv.browser},\n`;
    }

    // Add events
    for (const event of events) {
      const timestamp = new Date(event.timestamp).toISOString();
      const data = event.data ? JSON.stringify(event.data) : "";
      csv += `Event,${timestamp},${event.name},,,,"${data}"\n`;
    }

    return csv;
  }

  /**
   * Delete analytics data older than X days
   */
  static async deleteOldData(daysToKeep: number): Promise<number> {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    let deleted = 0;

    // Delete old page views
    const allPageViews = await db.list<PageView>(KvKeys.allPageViews());
    for (const entry of allPageViews) {
      if (entry.value.timestamp < cutoffDate) {
        await db.delete(entry.key);
        deleted++;
      }
    }

    // Delete old events
    const allEvents = await db.list<AnalyticsEvent>(KvKeys.allEvents());
    for (const entry of allEvents) {
      if (entry.value.timestamp < cutoffDate) {
        await db.delete(entry.key);
        deleted++;
      }
    }

    return deleted;
  }
}
