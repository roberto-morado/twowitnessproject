/**
 * Public Testimonials View
 * Displays approved testimonials with pagination
 */

import { AppConfig } from "@config/app.config.ts";
import { escapeHtml } from "@utils/html.ts";
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
    <header>
      <h1>Testimonials</h1>
      <p>Read stories of faith and transformation from our community</p>
    </header>

    <section>
      ${total === 0 ? `
        <article>
          <p>No testimonials have been published yet. Check back soon!</p>
        </article>
      ` : `
        ${testimonials.map(testimonial => `
          <article>
            <header>
              <h2>${escapeHtml(testimonial.name)}</h2>
              ${testimonial.location ? `<p><small>${escapeHtml(testimonial.location)}</small></p>` : ""}
            </header>
            <p>${escapeHtml(testimonial.testimony)}</p>
          </article>
        `).join("")}

        ${totalPages > 1 ? `
          <nav>
            ${page > 1 ? `
              <a href="/testimonials?page=${page - 1}">← Previous</a>
            ` : ""}

            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
              <a
                href="/testimonials?page=${p}"
                ${p === page ? 'aria-current="page"' : ""}
              >
                ${p}
              </a>
            `).join("")}

            ${page < totalPages ? `
              <a href="/testimonials?page=${page + 1}">Next →</a>
            ` : ""}
          </nav>
        ` : ""}
      `}

      <aside>
        <h3>Share Your Testimony</h3>
        <p>Have a story of how God has worked in your life? We'd love to hear from you!</p>
        <p>Testimonies are submitted by invitation only. Please contact us to receive a submission link.</p>
      </aside>
    </section>
  `;

  return renderLayout({
    title: "Testimonials",
    content,
    activeNav: "testimonials",
  });
}


