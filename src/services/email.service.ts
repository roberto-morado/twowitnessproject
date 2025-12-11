/**
 * Email Service
 * Handles sending emails via SMTP (Postale.io or other providers)
 */

import { db } from "./db.service.ts";
import type { EmailConfig, EmailData } from "../models/email.model.ts";

/**
 * Email Configuration Service
 * Manages SMTP settings stored in Deno KV
 */
export class EmailConfigService {
  private static readonly CONFIG_KEY = ["email_config", "default"];

  /**
   * Get email configuration
   */
  static async getConfig(): Promise<EmailConfig | null> {
    const result = await db.kv.get<EmailConfig>(this.CONFIG_KEY);
    return result.value;
  }

  /**
   * Save email configuration
   */
  static async saveConfig(config: Omit<EmailConfig, "id" | "updatedAt">): Promise<void> {
    const emailConfig: EmailConfig = {
      ...config,
      id: "default",
      updatedAt: new Date(),
    };

    await db.kv.set(this.CONFIG_KEY, emailConfig);
  }

  /**
   * Check if email is configured and enabled
   */
  static async isConfigured(): Promise<boolean> {
    const config = await this.getConfig();
    return config !== null && config.isEnabled;
  }
}

/**
 * Email Sending Service
 * Uses SMTP to send emails via configured provider
 */
export class EmailService {
  /**
   * Send an email using SMTP
   * Uses denomailer library for SMTP support
   */
  static async send(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const config = await EmailConfigService.getConfig();

      if (!config || !config.isEnabled) {
        return {
          success: false,
          error: "Email is not configured or disabled",
        };
      }

      // Dynamic import of denomailer
      // Using dynamic import so the app works even if denomailer isn't installed
      let SmtpClient;
      try {
        const denomailer = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
        SmtpClient = denomailer.SmtpClient;
      } catch (error) {
        console.error("Failed to import denomailer:", error);
        return {
          success: false,
          error: "SMTP library not available. Please install denomailer.",
        };
      }

      // Create SMTP client
      const client = new SmtpClient();

      // Connect to SMTP server
      await client.connectTLS({
        hostname: config.smtpHost,
        port: config.smtpPort,
        username: config.smtpUsername,
        password: config.smtpPassword,
      });

      // Send email
      await client.send({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        content: emailData.text,
        html: emailData.html,
      });

      // Close connection
      await client.close();

      return { success: true };
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send a test email to verify configuration
   */
  static async sendTestEmail(toEmail: string): Promise<{ success: boolean; error?: string }> {
    return await this.send({
      to: toEmail,
      subject: "Test Email from Two Witness Project",
      text: "This is a test email to verify your SMTP configuration is working correctly.\n\nIf you received this, your email settings are configured properly!\n\n- Two Witness Project",
      html: `
        <p>This is a test email to verify your SMTP configuration is working correctly.</p>
        <p>If you received this, your email settings are configured properly!</p>
        <p><em>- Two Witness Project</em></p>
      `,
    });
  }

  /**
   * Send prayer request confirmation email
   */
  static async sendPrayerConfirmation(toEmail: string, name: string): Promise<{ success: boolean; error?: string }> {
    return await this.send({
      to: toEmail,
      subject: "We're Praying for You - Two Witness Project",
      text: `Dear ${name},\n\nThank you for sharing your prayer request with us. We want you to know that we have received it and are lifting you up in prayer.\n\nGod hears your prayers, and we believe He is working in your situation. We will be praying for you as we continue our ministry journey.\n\n"Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God." - Philippians 4:6\n\nMay God bless you abundantly.\n\nIn Christ,\nTwo Witness Project`,
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for sharing your prayer request with us. We want you to know that we have received it and are lifting you up in prayer.</p>
        <p>God hears your prayers, and we believe He is working in your situation. We will be praying for you as we continue our ministry journey.</p>
        <blockquote>
          <em>"Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God."</em> - Philippians 4:6
        </blockquote>
        <p>May God bless you abundantly.</p>
        <p><strong>In Christ,<br>Two Witness Project</strong></p>
      `,
    });
  }

  /**
   * Send testimonial confirmation email
   */
  static async sendTestimonialConfirmation(toEmail: string, name: string): Promise<{ success: boolean; error?: string }> {
    return await this.send({
      to: toEmail,
      subject: "Thank You for Sharing Your Testimony - Two Witness Project",
      text: `Dear ${name},\n\nThank you for sharing your testimony with us! Your story of faith is an encouragement and will help others see God's work in the lives of His people.\n\nWe have received your testimony and will review it. If approved, it will be shared on our website to encourage others in their faith journey.\n\n"Let the redeemed of the Lord say so, whom he has redeemed from trouble." - Psalm 107:2\n\nThank you for being part of our ministry.\n\nIn Christ,\nTwo Witness Project`,
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for sharing your testimony with us! Your story of faith is an encouragement and will help others see God's work in the lives of His people.</p>
        <p>We have received your testimony and will review it. If approved, it will be shared on our website to encourage others in their faith journey.</p>
        <blockquote>
          <em>"Let the redeemed of the Lord say so, whom he has redeemed from trouble."</em> - Psalm 107:2
        </blockquote>
        <p>Thank you for being part of our ministry.</p>
        <p><strong>In Christ,<br>Two Witness Project</strong></p>
      `,
    });
  }
}
