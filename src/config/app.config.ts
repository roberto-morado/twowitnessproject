/**
 * Application configuration
 * Centralized configuration following Single Responsibility Principle
 */

export const AppConfig = {
  // Server configuration
  server: {
    port: 8000,
    hostname: "0.0.0.0",
  },

  // Ministry information
  ministry: {
    name: "Two Witness Project",
    tagline: "Sharing the Gospel Across the Nation",
    description:
      "Two friends dedicated to evangelizing across the country, living a life of faith on the road.",
    mission:
      "Our mission is to bring the message of Jesus Christ to people in every corner of the nation. We've left behind our conventional lives to follow God's calling, traveling in our van and sharing the Gospel wherever He leads us.",
  },

  // Social media links
  socialMedia: {
    youtube: "https://youtube.com/@twowitnessproject",
    instagram: "https://www.instagram.com/twowitnessproject/",
    discord: "https://discord.gg/wASmHhjMna",
    threads: "https://www.threads.com/@twowitnessproject",
    tiktok: "https://www.tiktok.com/@twowitnessproject",
  },

  // Donation information
  donations: {
    message:
      "Your support helps us continue our ministry and reach more people with the Gospel. Every donation, no matter the size, makes a difference.",
  },
} as const;
