/**
 * Discord Webhook Service
 * Sends notifications to Discord channels via webhooks
 */

import { db, KvKeys } from "./db.service.ts";

export interface DiscordWebhook {
  name: string;
  url: string;
  enabled: boolean;
}

export interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
}

export class DiscordService {
  private static WEBHOOK_ADMIN = "webhook:admin";
  private static WEBHOOK_COMMUNITY = "webhook:community";

  /**
   * Get webhook configuration
   */
  static async getWebhook(type: "admin" | "community"): Promise<DiscordWebhook | null> {
    const key = type === "admin" ? this.WEBHOOK_ADMIN : this.WEBHOOK_COMMUNITY;
    return await db.get<DiscordWebhook>(KvKeys.setting(key));
  }

  /**
   * Save webhook configuration
   */
  static async saveWebhook(
    type: "admin" | "community",
    webhook: DiscordWebhook
  ): Promise<void> {
    const key = type === "admin" ? this.WEBHOOK_ADMIN : this.WEBHOOK_COMMUNITY;
    await db.set(KvKeys.setting(key), webhook);
  }

  /**
   * Send message to Discord webhook
   */
  static async sendMessage(
    type: "admin" | "community",
    message: DiscordMessage
  ): Promise<boolean> {
    try {
      const webhook = await this.getWebhook(type);

      if (!webhook || !webhook.enabled || !webhook.url) {
        console.log(`Discord webhook (${type}) not configured or disabled`);
        return false;
      }

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error(
          `Discord webhook error (${type}): ${response.status} ${response.statusText}`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Discord webhook error (${type}):`, error);
      return false;
    }
  }

  /**
   * Send prayer notification to admin webhook
   */
  static async notifyAdminNewPrayer(prayer: {
    id: string;
    name?: string;
    email?: string;
    prayer: string;
    isPublic: boolean;
  }): Promise<void> {
    const submitterName = prayer.name || "Anonymous";
    const visibility = prayer.isPublic ? "Public" : "Private";

    const message: DiscordMessage = {
      embeds: [
        {
          title: "🙏 New Prayer Request",
          description: prayer.prayer.substring(0, 1000), // Limit to 1000 chars
          color: 0x0099ff, // Blue
          fields: [
            {
              name: "Submitted By",
              value: submitterName,
              inline: true,
            },
            {
              name: "Visibility",
              value: visibility,
              inline: true,
            },
            {
              name: "Prayer ID",
              value: prayer.id,
              inline: true,
            },
          ],
          footer: {
            text: "Two Witness Project",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    if (prayer.email) {
      message.embeds![0].fields!.push({
        name: "Email",
        value: prayer.email,
        inline: false,
      });
    }

    await this.sendMessage("admin", message);
  }

  /**
   * Send public prayer notification to community webhook
   */
  static async notifyCommunityNewPrayer(prayer: {
    id: string;
    name?: string;
    prayer: string;
  }): Promise<void> {
    const submitterName = prayer.name || "Anonymous";

    const message: DiscordMessage = {
      embeds: [
        {
          title: "🙏 New Public Prayer Request",
          description: prayer.prayer.substring(0, 1000), // Limit to 1000 chars
          color: 0x00ff00, // Green
          fields: [
            {
              name: "Submitted By",
              value: submitterName,
              inline: true,
            },
          ],
          footer: {
            text: "Two Witness Project - Join us in prayer",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await this.sendMessage("community", message);
  }

  /**
   * Send testimonial notification to admin webhook
   */
  static async notifyAdminNewTestimonial(testimonial: {
    id: string;
    name: string;
    testimony: string;
  }): Promise<void> {
    const message: DiscordMessage = {
      embeds: [
        {
          title: "✨ New Testimonial Submitted",
          description: testimonial.testimony.substring(0, 1000),
          color: 0xffd700, // Gold
          fields: [
            {
              name: "Submitted By",
              value: testimonial.name,
              inline: true,
            },
            {
              name: "Testimonial ID",
              value: testimonial.id,
              inline: true,
            },
            {
              name: "Status",
              value: "Pending Approval",
              inline: true,
            },
          ],
          footer: {
            text: "Two Witness Project - Requires admin approval",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await this.sendMessage("admin", message);
  }

  /**
   * Test webhook by sending a test message
   */
  static async testWebhook(type: "admin" | "community"): Promise<boolean> {
    const message: DiscordMessage = {
      embeds: [
        {
          title: "🔔 Test Notification",
          description: "This is a test message from the Two Witness Project website.",
          color: 0xff9900, // Orange
          footer: {
            text: "Two Witness Project",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    return await this.sendMessage(type, message);
  }
}
