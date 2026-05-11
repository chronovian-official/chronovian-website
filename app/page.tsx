"use client";

import { useEffect, useState } from "react";

const LAUNCH_DATE = new Date("2026-06-25T00:00:00");

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = LAUNCH_DATE.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

export default function Home() {
  const { days, hours, minutes, seconds } = useCountdown();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@200;300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #C9A84C;
          --gold-light: #E8D5A3;
          --gold-dark: #8B6914;
          --silver: #C0C0C0;
          --silver-light: #E8E8E8;
          --black: #080808;
          --black-soft: #111111;
          --black-mid: #1A1A1A;
          --white: #F5F0E8;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--black);
          color: var(--white);
          font-family: 'Montserrat', sans-serif;
          font-weight: 300;
          overflow-x: hidden;
        }

        /* NAV */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 1.5rem 3rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.4s, backdrop-filter 0.4s;
        }
        nav.scrolled {
          background: rgba(8,8,8,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(201,168,76,0.15);
        }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 300;
          letter-spacing: 0.3em;
          color: var(--gold);
          text-transform: uppercase;
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          gap: 2.5rem;
          list-style: none;
        }
        .nav-links a {
          color: var(--silver-light);
          text-decoration: none;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          transition: color 0.3s;
        }
        .nav-links a:hover { color: var(--gold); }
        .nav-cta {
          background: transparent;
          border: 1px solid var(--gold);
          color: var(--gold);
          padding: 0.6rem 1.5rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
        .nav-cta:hover {
          background: var(--gold);
          color: var(--black);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          padding: 6rem 2rem 4rem;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(192,192,192,0.04) 0%, transparent 60%),
            linear-gradient(180deg, #080808 0%, #0f0d09 100%);
        }
        .hero-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%);
        }
        .hero-ornament {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          border: 1px solid rgba(201,168,76,0.06);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-ornament::before {
          content: '';
          position: absolute;
          inset: 40px;
          border: 1px solid rgba(201,168,76,0.05);
          border-radius: 50%;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }
        .hero-eyebrow {
          font-size: 0.65rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 2rem;
          animation: fadeUp 1s ease both;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.5rem, 8vw, 7rem);
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.05em;
          color: var(--white);
          margin-bottom: 1.5rem;
          animation: fadeUp 1s ease 0.2s both;
        }
        .hero-title em {
          font-style: italic;
          color: var(--gold);
        }
        .hero-subtitle {
          font-size: 0.75rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--silver);
          margin-bottom: 3rem;
          animation: fadeUp 1s ease 0.4s both;
        }
        .hero-divider {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          margin: 0 auto 3rem;
          animation: fadeUp 1s ease 0.5s both;
        }

        /* COUNTDOWN */
        .countdown {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-bottom: 3.5rem;
          animation: fadeUp 1s ease 0.6s both;
        }
        .countdown-unit {
          text-align: center;
          min-width: 70px;
        }
        .countdown-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 300;
          color: var(--gold);
          line-height: 1;
          display: block;
        }
        .countdown-label {
          font-size: 0.55rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--silver);
          margin-top: 0.5rem;
          display: block;
        }
        .countdown-sep {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          color: rgba(201,168,76,0.3);
          line-height: 1;
          align-self: flex-start;
          padding-top: 0.2rem;
        }
        .hero-launch-date {
          font-size: 0.65rem;
          letter-spacing: 0.3em;
          color: var(--silver);
          text-transform: uppercase;
          margin-bottom: 3rem;
          animation: fadeUp 1s ease 0.7s both;
        }
        .hero-launch-date span {
          color: var(--gold);
        }
        .hero-cta-group {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeUp 1s ease 0.8s both;
        }
        .btn-primary {
          background: var(--gold);
          color: var(--black);
          border: none;
          padding: 1rem 2.5rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary:hover {
          background: var(--gold-light);
          transform: translateY(-2px);
        }
        .btn-secondary {
          background: transparent;
          color: var(--white);
          border: 1px solid rgba(192,192,192,0.4);
          padding: 1rem 2.5rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
        }
        .btn-secondary:hover {
          border-color: var(--silver);
          color: var(--silver-light);
          transform: translateY(-2px);
        }

        /* MARQUEE */
        .marquee-wrap {
          border-top: 1px solid rgba(201,168,76,0.15);
          border-bottom: 1px solid rgba(201,168,76,0.15);
          padding: 1rem 0;
          overflow: hidden;
          background: rgba(201,168,76,0.03);
        }
        .marquee-track {
          display: flex;
          gap: 4rem;
          animation: marquee 30s linear infinite;
          width: max-content;
        }
        .marquee-item {
          font-size: 0.6rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--gold);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .marquee-item::after {
          content: '◆';
          font-size: 0.4rem;
          color: rgba(201,168,76,0.4);
        }

        /* ABOUT */
        .about {
          padding: 8rem 3rem;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }
        .section-eyebrow {
          font-size: 0.6rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1.5rem;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 300;
          line-height: 1.2;
          margin-bottom: 2rem;
          color: var(--white);
        }
        .section-title em {
          font-style: italic;
          color: var(--gold);
        }
        .section-body {
          font-size: 0.85rem;
          line-height: 2;
          color: var(--silver);
          max-width: 600px;
          margin: 0 auto 3rem;
        }
        .gold-line {
          width: 40px;
          height: 1px;
          background: var(--gold);
          margin: 2rem auto;
        }

        /* CATEGORIES */
        .categories {
          padding: 4rem 3rem 8rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .categories-header {
          text-align: center;
          margin-bottom: 4rem;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
        }
        .category-card {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          aspect-ratio: 4/5;
          background: var(--black-mid);
        }
        .category-card:first-child {
          aspect-ratio: 3/4;
        }
        .category-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 8rem;
          color: rgba(201,168,76,0.08);
          transition: transform 0.6s ease;
        }
        .category-card:hover .category-placeholder {
          transform: scale(1.05);
        }
        .category-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(8,8,8,0.9) 100%);
        }
        .category-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2.5rem;
        }
        .category-tag {
          font-size: 0.55rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.75rem;
          display: block;
        }
        .category-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 300;
          color: var(--white);
          display: block;
          margin-bottom: 1rem;
        }
        .category-link {
          font-size: 0.6rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--silver);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: color 0.3s;
        }
        .category-link::after {
          content: '→';
          transition: transform 0.3s;
        }
        .category-card:hover .category-link {
          color: var(--gold);
        }
        .category-card:hover .category-link::after {
          transform: translateX(4px);
        }
        .category-border {
          position: absolute;
          inset: 16px;
          border: 1px solid rgba(201,168,76,0);
          transition: border-color 0.4s;
          pointer-events: none;
        }
        .category-card:hover .category-border {
          border-color: rgba(201,168,76,0.2);
        }

        /* PILLARS */
        .pillars {
          padding: 8rem 3rem;
          background: var(--black-soft);
          border-top: 1px solid rgba(201,168,76,0.1);
          border-bottom: 1px solid rgba(201,168,76,0.1);
        }
        .pillars-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .pillars-header {
          text-align: center;
          margin-bottom: 5rem;
        }
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3rem;
        }
        .pillar {
          text-align: center;
          padding: 2.5rem 1.5rem;
          border: 1px solid rgba(201,168,76,0.1);
          transition: border-color 0.3s, background 0.3s;
        }
        .pillar:hover {
          border-color: rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.03);
        }
        .pillar-icon {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          display: block;
        }
        .pillar-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 400;
          color: var(--gold);
          margin-bottom: 1rem;
        }
        .pillar-body {
          font-size: 0.75rem;
          line-height: 1.9;
          color: var(--silver);
        }

        /* APPOINTMENT */
        .appointment {
          padding: 10rem 3rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .appointment-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%);
        }
        .appointment-content {
          position: relative;
          z-index: 1;
          max-width: 700px;
          margin: 0 auto;
        }
        .appointment-form {
          display: flex;
          gap: 0;
          max-width: 480px;
          margin: 2.5rem auto 0;
        }
        .appointment-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(201,168,76,0.2);
          border-right: none;
          color: var(--white);
          padding: 1rem 1.25rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          outline: none;
          transition: border-color 0.3s;
        }
        .appointment-input::placeholder {
          color: rgba(192,192,192,0.4);
        }
        .appointment-input:focus {
          border-color: rgba(201,168,76,0.5);
        }
        .appointment-submit {
          background: var(--gold);
          color: var(--black);
          border: none;
          padding: 1rem 1.5rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s;
          white-space: nowrap;
        }
        .appointment-submit:hover {
          background: var(--gold-light);
        }

        /* FOOTER */
        footer {
          padding: 4rem 3rem 2rem;
          border-top: 1px solid rgba(201,168,76,0.1);
          background: var(--black);
        }
        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }
        .footer-brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 300;
          letter-spacing: 0.3em;
          color: var(--gold);
          text-transform: uppercase;
          margin-bottom: 1rem;
          display: block;
        }
        .footer-tagline {
          font-size: 0.7rem;
          line-height: 1.8;
          color: var(--silver);
          max-width: 250px;
        }
        .footer-col-title {
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1.5rem;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .footer-links a {
          color: var(--silver);
          text-decoration: none;
          font-size: 0.75rem;
          transition: color 0.3s;
        }
        .footer-links a:hover { color: var(--gold); }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .footer-copy {
          font-size: 0.65rem;
          color: rgba(192,192,192,0.4);
          letter-spacing: 0.1em;
        }
        .footer-social {
          display: flex;
          gap: 1.5rem;
        }
        .footer-social a {
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(192,192,192,0.5);
          text-decoration: none;
          transition: color 0.3s;
        }
        .footer-social a:hover { color: var(--gold); }

        /* ANIMATIONS */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (max-width: 768px) {
          nav { padding: 1.25rem 1.5rem; }
          .nav-links { display: none; }
          .hero { padding: 5rem 1.5rem 3rem; }
          .countdown { gap: 1rem; }
          .categories-grid { grid-template-columns: 1fr; }
          .pillars-grid { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; }
          .appointment-form { flex-direction: column; }
          .appointment-input { border-right: 1px solid rgba(201,168,76,0.2); border-bottom: none; }
          .about, .categories, .appointment { padding-left: 1.5rem; padding-right: 1.5rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href="#" className="nav-logo">Chronovian</a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#collections">Collections</a></li>
          <li><a href="#appointment">Appointment</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <a href="#appointment" className="nav-cta">Book a Visit</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-lines" />
        <div className="hero-ornament" />
        <div className="hero-content">
          <p className="hero-eyebrow">Est. 2025 — By Appointment Only</p>
          <h1 className="hero-title">
            Where Time<br />
            Becomes <em>Art</em>
          </h1>
          <p className="hero-subtitle">Premium Watches & Fine Jewellery</p>
          <div className="hero-divider" />
          <div className="countdown">
            <div className="countdown-unit">
              <span className="countdown-number">{String(days).padStart(2, "0")}</span>
              <span className="countdown-label">Days</span>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit">
              <span className="countdown-number">{String(hours).padStart(2, "0")}</span>
              <span className="countdown-label">Hours</span>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit">
              <span className="countdown-number">{String(minutes).padStart(2, "0")}</span>
              <span className="countdown-label">Minutes</span>
            </div>
            <span className="countdown-sep">:</span>
            <div className="countdown-unit">
              <span className="countdown-number">{String(seconds).padStart(2, "0")}</span>
              <span className="countdown-label">Seconds</span>
            </div>
          </div>
          <p className="hero-launch-date">
            Opening <span>June 25, 2025</span> — Hyderabad, Telangana, India
          </p>
          <div className="hero-cta-group">
            <a href="#appointment" className="btn-primary">Request Early Access</a>
            <a href="#collections" className="btn-secondary">Explore Collections</a>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) =>
            ["Haute Horlogerie", "Fine Jewellery", "By Appointment Only", "Premium Timepieces", "Exclusive Curation", "Dubai — UAE", "Bespoke Experience", "Investment Pieces"].map((t, j) => (
              <span key={`${i}-${j}`} className="marquee-item">{t}</span>
            ))
          )}
        </div>
      </div>

      {/* ABOUT */}
      <section className="about" id="about">
        <p className="section-eyebrow">Our Philosophy</p>
        <h2 className="section-title">
          An Experience <em>Beyond</em><br />the Ordinary
        </h2>
        <div className="gold-line" />
        <p className="section-body">
          Chronovian is not merely a store — it is a sanctuary for those who understand
          that true luxury is measured not in price, but in provenance, craftsmanship,
          and the singular joy of owning something extraordinary. Every piece in our
          collection is hand-selected for its heritage, artistry, and investment value.
        </p>
        <a href="#appointment" className="btn-primary">Schedule a Private Viewing</a>
      </section>

      {/* CATEGORIES */}
      <section className="categories" id="collections">
        <div className="categories-header">
          <p className="section-eyebrow">Our Collections</p>
          <h2 className="section-title">Curated for the <em>Discerning</em></h2>
        </div>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-placeholder">⌚</div>
            <div className="category-overlay" />
            <div className="category-border" />
            <div className="category-content">
              <span className="category-tag">Haute Horlogerie</span>
              <span className="category-name">Timepieces</span>
              <a href="#" className="category-link">Explore Collection</a>
            </div>
          </div>
          <div className="category-card">
            <div className="category-placeholder">💎</div>
            <div className="category-overlay" />
            <div className="category-border" />
            <div className="category-content">
              <span className="category-tag">Fine Jewellery</span>
              <span className="category-name">Jewellery</span>
              <a href="#" className="category-link">Explore Collection</a>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="pillars">
        <div className="pillars-inner">
          <div className="pillars-header">
            <p className="section-eyebrow">The Chronovian Difference</p>
            <h2 className="section-title">Why Our Clients <em>Choose</em> Us</h2>
          </div>
          <div className="pillars-grid">
            {[
              { icon: "🔒", title: "Absolute Privacy", body: "Every visit is conducted with the utmost discretion. Your experience, your collection, your story — kept entirely confidential." },
              { icon: "✦", title: "Curated Excellence", body: "Each piece is individually authenticated, assessed for investment merit, and selected to meet our uncompromising standards of provenance." },
              { icon: "🤝", title: "Personal Service", body: "Your dedicated advisor guides you through every acquisition — from discovery to delivery — ensuring a seamless, bespoke journey." },
            ].map((p) => (
              <div key={p.title} className="pillar">
                <span className="pillar-icon">{p.icon}</span>
                <h3 className="pillar-title">{p.title}</h3>
                <p className="pillar-body">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPOINTMENT */}
      <section className="appointment" id="appointment">
        <div className="appointment-bg" />
        <div className="appointment-content">
          <p className="section-eyebrow">Private Viewings</p>
          <h2 className="section-title">
            Begin Your <em>Journey</em>
          </h2>
          <div className="gold-line" />
          <p className="section-body">
            Register your interest and be among the first to experience Chronovian.
            Our team will reach out to schedule your private viewing ahead of our
            June 25 opening.
          </p>
          <div className="appointment-form">
            <input
              type="email"
              className="appointment-input"
              placeholder="Your email address"
            />
            <button className="appointment-submit">Request Access</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <span className="footer-brand-name">Chronovian</span>
              <p className="footer-tagline">
                A sanctuary for extraordinary timepieces and fine jewellery.
                By appointment only.
              </p>
            </div>
            <div>
              <p className="footer-col-title">Collections</p>
              <ul className="footer-links">
                <li><a href="#">Timepieces</a></li>
                <li><a href="#">Jewellery</a></li>
                <li><a href="#">New Arrivals</a></li>
                <li><a href="#">Investment Pieces</a></li>
              </ul>
            </div>
            <div>
              <p className="footer-col-title">Visit Us</p>
              <ul className="footer-links">
                <li><a href="#">Book Appointment</a></li>
                <li><a href="#">Our Location</a></li>
                <li><a href="#">Opening Hours</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <p className="footer-col-title">Company</p>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Authentication</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2025 Chronovian. All rights reserved.</p>
            <div className="footer-social">
              <a href="#">Instagram</a>
              <a href="#">WhatsApp</a>
              <a href="#">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
