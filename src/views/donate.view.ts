/**
 * Donate View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";

export function renderDonate(): string {
  const content = `
    <header>
      <h1>Support Our Ministry</h1>
      <p>Partner with us in spreading the Gospel</p>
    </header>

    <section>
      <h2>Why We Need Your Support</h2>
      <p>${AppConfig.donations.message}</p>
      <p>
        We've left behind traditional employment to follow God's calling full-time.
        We live by faith, trusting that He will provide through the generosity of
        believers who share our vision for reaching the lost with the Gospel.
      </p>
    </section>

    <section>
      <h2>Make a Donation</h2>
      <p>
        Support our ministry with a secure donation through Stripe.
        You can use any major credit card, debit card, or digital wallet.
      </p>
      <stripe-buy-button
        buy-button-id="buy_btn_1SY5XAIMgZeCxahQcT2rJ7FW"
        publishable-key="pk_live_51SXuJ2IMgZeCxahQOmE9llI6AYzHStXcGnyKGIRd9Y3a9evnWTKY9KdLh6yOYbNMp20JvsjAZIbVpu0W5QWjBj2U00NEnK31rB">
      </stripe-buy-button>
      <p>
        🔒 Secure payment powered by Stripe
      </p>
    </section>

    <section>
      <h2>How Your Donation Helps</h2>
      <dl>
        <dt>⛽ Fuel & Travel</dt>
        <dd>Enables us to reach new cities and communities across the country</dd>

        <dt>🍽️ Food & Necessities</dt>
        <dd>Allows us to focus on ministry without worrying about basic needs</dd>

        <dt>🛠️ Van Maintenance</dt>
        <dd>Keeps our mobile home running so we can continue our mission</dd>

        <dt>📚 Ministry Materials</dt>
        <dd>Provides Bibles, tracts, and resources to share with those we meet</dd>
      </dl>
    </section>

    <blockquote>
      "And do not forget to do good and to share with others,
      for with such sacrifices God is pleased."
      <cite>- Hebrews 13:16</cite>
    </blockquote>

    <section>
      <h2>Other Ways to Support</h2>
      <ul>
        <li><strong>Pray for us:</strong> Your prayers are invaluable as we face challenges and opportunities on the road</li>
        <li><strong>Share our content:</strong> Help spread the word by sharing our videos and posts with your friends</li>
        <li><strong>Follow our journey:</strong> Engage with our content on social media to encourage us</li>
      </ul>
      <p>
        Thank you for partnering with us in this ministry. May God bless you abundantly!
      </p>
    </section>
  `;

  return renderLayout({
    title: "Donate",
    content,
    activeNav: "donate",
  });
}
