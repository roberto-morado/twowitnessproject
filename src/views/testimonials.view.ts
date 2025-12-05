/**
 * Public Testimonials View
 * Displays approved testimonials with pagination
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";
import type { Testimonial } from "../services/testimonial.service.ts";

export interface TestimonialsViewData {
  testimonials: Testimonial[];
  page: number;
  totalPages: number;
  total: number;
}

export function renderTestimonials(data: TestimonialsViewData): string {
  const { testimonials, page, totalPages, total } = data;

  const content = `
    <section class="page-header">
      <div class="container">
        <h1>Testimonials</h1>
        <p>Read stories of faith and transformation from our community</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        ${total === 0 ? `
          <div style="padding: 40px; border: 1px solid #000; text-align: center;">
            <p>No testimonials have been published yet. Check back soon!</p>
          </div>
        ` : `
          <div style="display: grid; gap: 30px;">
            ${testimonials.map(testimonial => `
              <article style="padding: 30px; border: 2px solid #000;">
                <div style="margin-bottom: 20px;">
                  <h2 style="margin: 0 0 5px 0; font-size: 1.5em;">${escapeHtml(testimonial.name)}</h2>
                  ${testimonial.location ? `<p style="margin: 0; font-size: 0.9em; color: #666;">${escapeHtml(testimonial.location)}</p>` : ""}
                </div>
                <div style="white-space: pre-wrap; line-height: 1.8; font-size: 1.1em;">
                  ${escapeHtml(testimonial.testimony)}
                </div>
              </article>
            `).join("")}
          </div>

          ${totalPages > 1 ? `
            <nav style="margin-top: 60px;">
              <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                ${page > 1 ? `
                  <a href="/testimonials?page=${page - 1}" class="btn">← Previous</a>
                ` : ""}

                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                  <a
                    href="/testimonials?page=${p}"
                    class="btn"
                    style="${p === page ? "background: #000; color: #fff;" : ""}"
                  >
                    ${p}
                  </a>
                `).join("")}

                ${page < totalPages ? `
                  <a href="/testimonials?page=${page + 1}" class="btn">Next →</a>
                ` : ""}
              </div>
            </nav>
          ` : ""}
        `}

        <div style="margin-top: 60px; padding: 30px; border: 2px solid #000; background: #f5f5f5;">
          <h3>Share Your Testimony</h3>
          <p>Have a story of how God has worked in your life? We'd love to hear from you!</p>
          <p>Testimonies are submitted by invitation only. Please contact us to receive a submission link.</p>
        </div>
      </div>
    </section>
  `;

  return renderLayout({
    title: "Testimonials",
    content,
    activeNav: "testimonials",
  });
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
