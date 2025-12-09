/**
 * About View
 */

import { AppConfig } from "@config/app.config.ts";
import { renderLayout } from "./layout.ts";

export function renderAbout(): string {
  const content = `
    <header>
      <h1>About Our Ministry</h1>
      <p>Our story, mission, and calling</p>
    </header>

    <article>
      <section>
        <h2>Our Mission</h2>
        <p>${AppConfig.ministry.mission}</p>
      </section>

      <section>
        <h2>Our Story</h2>
        <p>
          The Two Witness Project began when two friends received God's unmistakable call
          to abandon their conventional lives and dedicate themselves fully to
          evangelism. In obedience to this calling, we left everything behind, purchased
          a van, and transformed it into our mobile home. This step of faith required
          taking on debt, trusting that God will provide according to His will.
        </p>
        <p>
          Now, we travel from city to city, state to state, bringing the message of
          Jesus Christ to those we encounter. Every day is an adventure in faith as we
          trust God to provide and guide our steps.
        </p>
      </section>

      <section>
        <h2>Why "Two Witness"?</h2>
        <p>
          Our name is inspired by Revelation 11:3 - "And I will appoint my two witnesses,
          and they will prophesy for 1,260 days, clothed in sackcloth." While we don't
          claim to be the two witnesses of Revelation, we understand this calling to be
          one that will continue for the rest of our earthly lives, until our Father calls
          us home. This ministry is not a season or a phase—it is our lifelong commitment
          to proclaim the Gospel faithfully until the end.
        </p>
      </section>

      <section>
        <h2>What We Do</h2>
        <ul>
          <li>Street evangelism in cities across the country</li>
          <li>One-on-one conversations about faith and Jesus</li>
          <li>Prayer for those we meet who are in need</li>
          <li>Documenting our journey to encourage and inspire others</li>
          <li>Building community among believers we meet along the way</li>
        </ul>
      </section>

      <section>
        <h2>Our Beliefs</h2>
        <p>
          We have been chosen according to the foreknowledge of God the Father, by the
          sanctifying work of the Spirit, to obedience to Jesus Christ and the sprinkling
          of His blood. <em>(1 Peter 1:2)</em>
        </p>
        <p>
          We believe in the Bible as the inspired Word of God, salvation through Jesus
          Christ alone, and the power of the Holy Spirit. We are committed to sharing
          the Gospel with love, compassion, and truth.
        </p>
      </section>
    </article>

    <aside>
      <section>
        <h2>Our Van Life</h2>
        <p>
          Our van isn't just transportation—it's our home. We built it ourselves,
          designing a space that allows us to live simply while we pursue our calling.
        </p>
      </section>

      <section>
        <h2>Join Us</h2>
        <p>
          Follow our journey on social media and see where God takes us. Your prayers
          and support mean the world to us.
        </p>
        <p><a href="/videos">Watch Our Videos</a></p>
      </section>

      <section>
        <h2>Support Our Ministry</h2>
        <p>
          We rely on God's provision through the generosity of supporters like you.
        </p>
        <p><a href="/donate">Donate</a></p>
      </section>
    </aside>
  `;

  return renderLayout({
    title: "About",
    content,
    activeNav: "about",
  });
}
