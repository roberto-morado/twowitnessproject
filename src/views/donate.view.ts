/**
 * Donate View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";

export function renderDonate(): string {
  const content = `
    <section class="page-header">
      <div class="container">
        <h1>Support Our Ministry</h1>
        <p>Partner with us in spreading the Gospel</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="donate-intro">
          <h2>Why We Need Your Support</h2>
          <p>${AppConfig.donations.message}</p>
          <p>
            We've left behind traditional employment to follow God's calling full-time.
            We live by faith, trusting that He will provide through the generosity of
            believers who share our vision for reaching the lost with the Gospel.
          </p>
        </div>

        <div class="donation-methods">
          <h2>Ways to Give</h2>
          <div class="method-grid">
            <div class="method-card">
              <div class="method-icon">💳</div>
              <h3>PayPal</h3>
              <p>Send a one-time or recurring donation</p>
              <div class="method-info">
                <code>${AppConfig.donations.paypalEmail}</code>
              </div>
              <a href="https://paypal.me/${AppConfig.donations.paypalEmail.split("@")[0]}"
                 target="_blank"
                 rel="noopener"
                 class="btn btn-primary">
                Donate via PayPal
              </a>
            </div>

            <div class="method-card">
              <div class="method-icon">📱</div>
              <h3>Venmo</h3>
              <p>Quick and easy mobile payments</p>
              <div class="method-info">
                <code>${AppConfig.donations.venmo}</code>
              </div>
              <a href="https://venmo.com/${AppConfig.donations.venmo.slice(1)}"
                 target="_blank"
                 rel="noopener"
                 class="btn btn-primary">
                Donate via Venmo
              </a>
            </div>

            <div class="method-card">
              <div class="method-icon">💰</div>
              <h3>Cash App</h3>
              <p>Support us through Cash App</p>
              <div class="method-info">
                <code>${AppConfig.donations.cashapp}</code>
              </div>
              <a href="https://cash.app/${AppConfig.donations.cashapp.slice(1)}"
                 target="_blank"
                 rel="noopener"
                 class="btn btn-primary">
                Donate via Cash App
              </a>
            </div>
          </div>
        </div>

        <div class="donation-impact">
          <h2>How Your Donation Helps</h2>
          <div class="impact-grid">
            <div class="impact-item">
              <h3>⛽ Fuel & Travel</h3>
              <p>Enables us to reach new cities and communities across the country</p>
            </div>
            <div class="impact-item">
              <h3>🍽️ Food & Necessities</h3>
              <p>Allows us to focus on ministry without worrying about basic needs</p>
            </div>
            <div class="impact-item">
              <h3>🛠️ Van Maintenance</h3>
              <p>Keeps our mobile home running so we can continue our mission</p>
            </div>
            <div class="impact-item">
              <h3>📚 Ministry Materials</h3>
              <p>Provides Bibles, tracts, and resources to share with those we meet</p>
            </div>
          </div>
        </div>

        <div class="donation-verse">
          <blockquote>
            "And do not forget to do good and to share with others,
            for with such sacrifices God is pleased."
            <cite>- Hebrews 13:16</cite>
          </blockquote>
        </div>

        <div class="donation-footer">
          <h2>Other Ways to Support</h2>
          <ul>
            <li><strong>Pray for us:</strong> Your prayers are invaluable as we face challenges and opportunities on the road</li>
            <li><strong>Share our content:</strong> Help spread the word by sharing our videos and posts with your friends</li>
            <li><strong>Follow our journey:</strong> Engage with our content on social media to encourage us</li>
          </ul>
          <p class="text-center" style="margin-top: 2rem;">
            Thank you for partnering with us in this ministry. May God bless you abundantly!
          </p>
        </div>
      </div>
    </section>
  `;

  return renderLayout({
    title: "Donate",
    content,
    activeNav: "donate",
  });
}
