/**
 * Home View - Redesigned
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";
import type { Testimonial } from "../services/testimonial.service.ts";
import type { Location } from "../models/location.model.ts";
import { escapeHtml } from "@utils/html.ts";
import { renderCurrentLocationBadge } from "../components/usa-map.component.ts";

export interface HomeViewData {
  testimonials?: Testimonial[];
  currentLocation?: Location | null;
}

export function renderHome(data: HomeViewData = {}): string {
  const { testimonials = [], currentLocation } = data;
  const content = `
    <!-- Hero Section -->
    <header class="text-center">
      <h1>${AppConfig.ministry.tagline}</h1>
      <p style="font-size: 1.25rem; color: var(--color-text-light); margin-bottom: 2rem;">
        ${AppConfig.ministry.description}
      </p>
      ${currentLocation !== undefined ? renderCurrentLocationBadge(currentLocation) : ""}
      <nav style="margin-top: 2rem;">
        <a href="/pray" class="btn">🙏 Pray With Us</a>
        <a href="/donate" class="btn btn-secondary">❤️ Support Our Ministry</a>
      </nav>
    </header>

    <!-- Who We Are -->
    <section>
      <h2>Who We Are</h2>
      <p>
        We're two friends who answered God's unmistakable call to leave everything behind and dedicate our lives to sharing the Gospel.
        We sold our belongings, bought a van, and transformed it into our home on wheels. Now we travel from city to city,
        meeting people where they are and sharing the life-changing message of Jesus Christ.
      </p>
      <p>
        Our name comes from Revelation 11:3—"And I will appoint my two witnesses, and they will prophesy for 1,260 days,
        clothed in sackcloth." This is not a temporary mission or a phase. This is our calling until the day God calls us home.
      </p>
    </section>

    <!-- What We Do -->
    <section>
      <h2>What We Do</h2>
      <dl>
        <dt>📖 Street Evangelism</dt>
        <dd>Meeting people face-to-face in cities across America, sharing the Gospel through genuine conversations and bold proclamation.</dd>

        <dt>🙏 Prayer & Ministry</dt>
        <dd>Praying for those we meet who are hurting, lost, or seeking hope. Every encounter matters.</dd>

        <dt>🎥 Documenting the Journey</dt>
        <dd>Sharing our experiences on social media to inspire others and show how God moves through ordinary people.</dd>

        <dt>🚐 Living by Faith</dt>
        <dd>Trusting God daily for provision as we live simply in our van, going wherever He leads us.</dd>
      </dl>
    </section>

    <!-- Prayer Section -->
    <section style="background: linear-gradient(135deg, #E74C3C 0%, #F39C12 100%); color: white; text-align: center;">
      <h2 style="color: white; border-bottom: 2px solid white;">🙏 We'd Love to Pray for You</h2>
      <p>
        As we travel this journey, one of our greatest privileges is lifting others up in prayer.
        Whether you're facing a challenge, celebrating a blessing, or simply need someone to stand
        with you in faith—we're here for you.
      </p>
      <p>
        Share your prayer request anonymously or with your name. Make it public so our community can pray with you,
        or keep it private between you and God.
      </p>
      <nav style="margin-top: 1.5rem;">
        <a href="/pray" class="btn" style="background: white; color: var(--color-primary);">Submit a Prayer Request</a>
        <a href="/prayers" class="btn-secondary" style="background: var(--color-secondary); color: white;">View Community Prayers</a>
      </nav>
    </section>

    ${testimonials.length > 0 ? `
    <!-- Testimonials -->
    <section>
      <h2>✨ Stories of Faith</h2>
      <p style="text-align: center; font-size: 1.1rem;">Hear from those who have encountered God's love through our ministry</p>

      ${testimonials.slice(0, 3).map(testimonial => `
        <article>
          <h3>${escapeHtml(testimonial.name)}${testimonial.location ? ` • ${escapeHtml(testimonial.location)}` : ""}</h3>
          <blockquote>
            "${escapeHtml(testimonial.testimony.substring(0, 250))}${testimonial.testimony.length > 250 ? '...' : ''}"
          </blockquote>
        </article>
      `).join("")}

      <p style="text-align: center; margin-top: 2rem;">
        <a href="/testimonials" class="btn">Read More Testimonials →</a>
      </p>
    </section>
    ` : ""}

    <!-- Connect & Support -->
    <section style="text-align: center; background: var(--color-bg-alt);">
      <h2>Join Us on This Journey</h2>
      <p style="font-size: 1.1rem;">
        Follow our ministry on social media and see where God leads us next.
        Watch our encounters, behind-the-scenes moments, and daily life on the road.
      </p>
      <nav style="margin-top: 1.5rem;">
        <a href="${AppConfig.socialMedia.youtube}" target="_blank" rel="noopener" class="btn">📺 YouTube</a>
        <a href="${AppConfig.socialMedia.instagram}" target="_blank" rel="noopener" class="btn">📷 Instagram</a>
        <a href="${AppConfig.socialMedia.tiktok}" target="_blank" rel="noopener" class="btn">🎵 TikTok</a>
      </nav>
      <p style="margin-top: 2rem;">
        <a href="/connect">View all our social media →</a>
      </p>
    </section>

    <!-- Support CTA -->
    <section style="background: var(--color-secondary); color: white; text-align: center;">
      <h2 style="color: white; border-bottom: 2px solid var(--color-accent);">Support Our Ministry</h2>
      <p style="font-size: 1.1rem;">
        We live by faith, trusting God to provide through the generosity of supporters like you.
        Your donation helps us continue traveling, sharing the Gospel, and reaching more people with the message of Jesus.
      </p>
      <nav style="margin-top: 1.5rem;">
        <a href="/donate" class="btn" style="background: var(--color-primary); color: white; font-size: 1.25rem; padding: 1rem 2rem;">❤️ Donate Now</a>
      </nav>
      <p style="margin-top: 1rem; opacity: 0.9;">
        Every gift, no matter the size, makes an eternal difference.
      </p>
    </section>
  `;

  return renderLayout({
    title: "Home",
    content,
    activeNav: "home",
    description: "Two friends living in a van, traveling across America to share the Gospel through street evangelism. Join us on our faith journey.",
    ogTitle: "Two Witness Project - Street Evangelism Across America",
    ogDescription: "Living by faith in a van, bringing the Gospel to cities across the nation. Watch our journey and support our ministry.",
    canonicalUrl: "https://twowitnessproject.org/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": AppConfig.ministry.name,
      "description": AppConfig.ministry.description,
      "url": "https://twowitnessproject.org",
      "sameAs": [
        AppConfig.socialMedia.youtube,
        AppConfig.socialMedia.instagram,
        AppConfig.socialMedia.tiktok,
        AppConfig.socialMedia.discord,
        AppConfig.socialMedia.threads,
      ],
    },
  });
}
