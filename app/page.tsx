"use client";

import { useEffect, useState } from "react";

const LAUNCH_DATE = new Date("2026-06-25T00:00:00");

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const update = () => {
      const diff = LAUNCH_DATE.getTime() - new Date().getTime();
      if (diff <= 0) return;
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

const heroSlides = [
  { img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600&q=85", headline: "Where Time", subheadline: "Becomes Art", sub: "Premium Watches & Fine Jewellery" },
  { img: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1600&q=85", headline: "Crafted for the", subheadline: "Discerning Few", sub: "By Appointment Only — Hyderabad, Telangana, India" },
  { img: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=1600&q=85", headline: "A Legacy", subheadline: "On Your Wrist", sub: "Opening June 25, 2026" },
];

const featuredWatches = [
  { img: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&q=80", brand: "Patek Philippe", model: "Nautilus", ref: "Ref. 5711/1A-010", status: "Available" },
  { img: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600&q=80", brand: "Audemars Piguet", model: "Royal Oak", ref: "Ref. 15500ST.OO", status: "Available" },
  { img: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&q=80", brand: "Rolex", model: "Cosmograph Daytona", ref: "Ref. 116500LN", status: "Sold" },
  { img: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=600&q=80", brand: "A. Lange & Söhne", model: "Datograph", ref: "Ref. 405.035", status: "Available" },
];

export default function Home() {
  const { days, hours, minutes, seconds } = useCountdown();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [slide, setSlide] = useState(0);
  const [page, setPage] = useState<"home" | "contact">("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #B8935A; --gold-light: #D4AA78; --black: #0A0A0A;
          --gray-dark: #2C2C2C; --gray-mid: #6B6B6B; --gray-light: #ADADAD;
          --gray-pale: #F5F3F0; --white: #FAFAF8; --border: rgba(0,0,0,0.09);
        }
        html { scroll-behavior: smooth; }
        body { background: var(--white); color: var(--black); font-family: 'Jost', sans-serif; font-weight: 300; overflow-x: hidden; }

        nav { position: sticky; top: 0; z-index: 200; background: rgba(250,250,248,0.97); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); padding: 0 2.5rem; height: 62px; display: flex; align-items: center; justify-content: space-between; transition: box-shadow 0.3s; }
        nav.scrolled { box-shadow: 0 1px 16px rgba(0,0,0,0.07); }
        .nav-left, .nav-right { display: flex; align-items: center; gap: 2rem; flex: 1; }
        .nav-right { justify-content: flex-end; }
        .nav-logo { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 400; letter-spacing: 0.22em; color: var(--black); text-decoration: none; text-transform: uppercase; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
        .nav-icon { background: none; border: none; cursor: pointer; color: var(--black); font-size: 1rem; display: flex; align-items: center; transition: color 0.2s; text-decoration: none; }
        .nav-icon:hover { color: var(--gold); }
        .nav-link { font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--black); text-decoration: none; background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 300; transition: color 0.2s; white-space: nowrap; padding: 0; }
        .nav-link:hover { color: var(--gold); }
        @media (max-width: 900px) { .nav-left .nav-link, .nav-right .nav-link { display: none; } .mobile-hamburger { display: flex !important; } }
        .mobile-hamburger { display: none; background: none; border: none; cursor: pointer; flex-direction: column; gap: 5px; padding: 6px; }
        .mobile-hamburger span { display: block; width: 20px; height: 1px; background: var(--black); transition: all 0.3s; }
        .mobile-hamburger.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .mobile-hamburger.open span:nth-child(2) { opacity: 0; }
        .mobile-hamburger.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
        .mobile-menu { display: none; position: fixed; inset: 0; top: 62px; background: var(--white); z-index: 150; flex-direction: column; padding: 2rem 2rem; overflow-y: auto; border-top: 1px solid var(--border); }
        .mobile-menu.open { display: flex; }
        .mobile-menu a, .mobile-menu button { display: block; padding: 1rem 0; font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 300; color: var(--black); text-decoration: none; background: none; border: none; border-bottom: 1px solid var(--border); cursor: pointer; text-align: left; width: 100%; transition: color 0.2s; }
        .mobile-menu a:hover, .mobile-menu button:hover { color: var(--gold); }

        .hero { position: relative; height: calc(100svh - 86px); min-height: 500px; overflow: hidden; background: #111; }
        .hero-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.4s ease; }
        .hero-slide.active { opacity: 1; }
        .hero-slide img { width: 100%; height: 100%; object-fit: cover; opacity: 0.72; }
        .hero-gradient { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%); }
        .hero-content { position: absolute; bottom: 3.5rem; left: 3rem; right: 3rem; color: white; }
        .hero-eyebrow { font-size: 0.58rem; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.65); margin-bottom: 1rem; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(2.8rem, 6vw, 5.5rem); font-weight: 300; line-height: 1.1; margin-bottom: 0.4rem; }
        .hero-title em { font-style: italic; color: #D4AA78; }
        .hero-sub { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: 2rem; margin-top: 0.75rem; }
        .hero-cta { display: inline-flex; align-items: center; gap: 0.75rem; font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase; color: white; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.5); padding-bottom: 2px; transition: color 0.2s, border-color 0.2s; }
        .hero-cta:hover { color: #D4AA78; border-color: #D4AA78; }
        .hero-dots { position: absolute; bottom: 2rem; right: 3rem; display: flex; gap: 0.5rem; }
        .hero-dot { width: 20px; height: 1px; background: rgba(255,255,255,0.35); cursor: pointer; transition: background 0.3s, width 0.3s; border: none; padding: 0; }
        .hero-dot.active { background: white; width: 36px; }

        .countdown-strip { background: var(--gray-pale); border-bottom: 1px solid var(--border); padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: center; gap: 3rem; flex-wrap: wrap; }
        .countdown-label-text { font-size: 0.6rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gray-mid); }
        .countdown-units { display: flex; gap: 2rem; align-items: center; }
        .countdown-unit { text-align: center; }
        .countdown-num { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 300; color: var(--black); display: block; line-height: 1; }
        .countdown-lbl { font-size: 0.5rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gray-mid); margin-top: 0.3rem; display: block; }
        .countdown-sep { color: var(--gray-light); font-size: 1.2rem; }

        .section-header { text-align: center; margin-bottom: 3rem; }
        .section-eyebrow { font-size: 0.58rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.75rem; display: block; }
        .section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 300; color: var(--black); line-height: 1.25; }
        .section-title em { font-style: italic; }
        .gold-rule { width: 32px; height: 1px; background: var(--gold); margin: 1.25rem auto 0; }

        .featured { padding: 5rem 2.5rem; max-width: 1300px; margin: 0 auto; }
        .featured-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .watch-card { cursor: pointer; }
        .watch-img-wrap { position: relative; overflow: hidden; background: var(--gray-pale); aspect-ratio: 3/4; margin-bottom: 1rem; }
        .watch-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .watch-card:hover .watch-img-wrap img { transform: scale(1.04); }
        .watch-status { position: absolute; top: 1rem; left: 1rem; font-size: 0.52rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 0.3rem 0.7rem; background: white; color: var(--black); }
        .watch-status.sold { background: var(--black); color: white; }
        .watch-brand { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.25rem; display: block; }
        .watch-model { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 400; color: var(--black); display: block; margin-bottom: 0.2rem; }
        .watch-ref { font-size: 0.65rem; color: var(--gray-mid); }
        .featured-footer { text-align: center; margin-top: 3rem; }
        .btn-outline { display: inline-block; border: 1px solid var(--black); color: var(--black); text-decoration: none; padding: 0.8rem 2.5rem; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; transition: all 0.3s; background: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 300; }
        .btn-outline:hover { background: var(--black); color: white; }
        .btn-gold { display: inline-block; background: var(--gold); color: white; text-decoration: none; padding: 0.8rem 2.5rem; font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; transition: background 0.3s; border: none; cursor: pointer; font-family: 'Jost', sans-serif; }
        .btn-gold:hover { background: var(--gold-light); }

        .categories { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: #ddd; }
        .cat-card { position: relative; overflow: hidden; aspect-ratio: 16/10; cursor: pointer; }
        .cat-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
        .cat-card:hover img { transform: scale(1.04); }
        .cat-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65) 100%); }
        .cat-content { position: absolute; bottom: 2rem; left: 2rem; color: white; }
        .cat-tag { font-size: 0.55rem; letter-spacing: 0.25em; text-transform: uppercase; color: #D4AA78; display: block; margin-bottom: 0.4rem; }
        .cat-name { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 300; display: block; margin-bottom: 0.75rem; }
        .cat-link { font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.7); text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 1px; transition: color 0.2s, border-color 0.2s; }
        .cat-card:hover .cat-link { color: #D4AA78; border-color: #D4AA78; }

        .about-strip { padding: 5rem 2.5rem; max-width: 700px; margin: 0 auto; text-align: center; }
        .about-body { font-size: 0.88rem; line-height: 2; color: var(--gray-mid); margin: 1.5rem 0 2.5rem; }

        .pillars { background: var(--black); padding: 5rem 2.5rem; }
        .pillars-inner { max-width: 1100px; margin: 0 auto; }
        .pillars-inner .section-title { color: white; }
        .pillars-inner .section-eyebrow { color: #D4AA78; }
        .pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.08); margin-top: 3rem; }
        .pillar { padding: 2.5rem 2rem; background: var(--black); transition: background 0.3s; }
        .pillar:hover { background: #111; }
        .pillar-num { font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--gold); opacity: 0.4; display: block; margin-bottom: 1.25rem; }
        .pillar-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 400; color: white; margin-bottom: 0.75rem; }
        .pillar-body { font-size: 0.75rem; line-height: 1.9; color: rgba(255,255,255,0.45); }

        .contact-page { min-height: 80vh; padding: 5rem 2.5rem; max-width: 900px; margin: 0 auto; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 3.5rem; }
        .contact-info h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 400; margin-bottom: 1.5rem; color: var(--black); }
        .contact-item { display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: flex-start; }
        .contact-item-icon { font-size: 1rem; margin-top: 2px; color: var(--gold); flex-shrink: 0; }
        .contact-item-text { font-size: 0.8rem; line-height: 1.7; color: var(--gray-mid); }
        .contact-item-text a { color: var(--black); text-decoration: none; transition: color 0.2s; }
        .contact-item-text a:hover { color: var(--gold); }
        .contact-item-label { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray-light); display: block; margin-bottom: 0.25rem; }
        .contact-form { display: flex; flex-direction: column; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-label { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray-mid); }
        .form-input, .form-select, .form-textarea { background: var(--gray-pale); border: 1px solid var(--border); padding: 0.85rem 1rem; font-family: 'Jost', sans-serif; font-size: 0.8rem; color: var(--black); outline: none; transition: border-color 0.2s; width: 100%; font-weight: 300; }
        .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--gold); }
        .form-textarea { resize: vertical; min-height: 120px; }

        footer { background: var(--gray-pale); border-top: 1px solid var(--border); padding: 3.5rem 2.5rem 2rem; }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
        .footer-brand { font-family: 'Playfair Display', serif; font-size: 1.1rem; letter-spacing: 0.2em; color: var(--black); text-transform: uppercase; display: block; margin-bottom: 0.75rem; }
        .footer-tagline { font-size: 0.72rem; line-height: 1.8; color: var(--gray-mid); max-width: 220px; }
        .footer-col-title { font-size: 0.55rem; letter-spacing: 0.25em; text-transform: uppercase; color: var(--black); margin-bottom: 1.25rem; display: block; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.65rem; }
        .footer-links a, .footer-links button { color: var(--gray-mid); text-decoration: none; font-size: 0.75rem; transition: color 0.2s; background: none; border: none; cursor: pointer; padding: 0; text-align: left; font-family: 'Jost', sans-serif; font-weight: 300; }
        .footer-links a:hover, .footer-links button:hover { color: var(--gold); }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 2rem; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 1rem; }
        .footer-copy { font-size: 0.62rem; color: var(--gray-light); letter-spacing: 0.05em; }
        .footer-social { display: flex; gap: 1.5rem; }
        .footer-social a { font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-mid); text-decoration: none; transition: color 0.2s; }
        .footer-social a:hover { color: var(--gold); }

        .whatsapp-fab { position: fixed; bottom: 1.5rem; right: 1.5rem; width: 52px; height: 52px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 1.4rem; box-shadow: 0 4px 16px rgba(37,211,102,0.35); z-index: 100; transition: transform 0.2s, box-shadow 0.2s; }
        .whatsapp-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(37,211,102,0.45); }

        @media (max-width: 768px) {
          .featured-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .categories { grid-template-columns: 1fr; }
          .pillars-grid { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; }
          .contact-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .hero-content { left: 1.5rem; right: 1.5rem; bottom: 2.5rem; }
          .countdown-strip { gap: 1.5rem; }
          nav { padding: 0 1.25rem; }
        }
      `}</style>

      <nav className={scrolled ? "scrolled" : ""}>
        <div className="nav-left">
          <a href="#featured" className="nav-link">Watches</a>
          <a href="#collections" className="nav-link">Jewellery</a>
          <a href="#collections" className="nav-link">Bags</a>
          <a href="mailto:info@chronovian.com?subject=Sell My Watch" className="nav-link">Sell</a>
        </div>
        <span className="nav-logo" onClick={() => setPage("home")}>Chronovian</span>
        <div className="nav-right">
          <a href="mailto:info@chronovian.com?subject=Book Appointment" className="nav-link">Book Appointment</a>
          <button className="nav-link" onClick={() => setPage("contact")}>Contact Us</button>
          <a href="https://wa.me/910000000000" target="_blank" className="nav-icon">💬</a>
          <button className={`mobile-hamburger${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <a href="#featured" onClick={() => setMenuOpen(false)}>Watches</a>
        <a href="#collections" onClick={() => setMenuOpen(false)}>Jewellery</a>
        <a href="#collections" onClick={() => setMenuOpen(false)}>Bags</a>
        <a href="mailto:info@chronovian.com?subject=Sell My Watch" onClick={() => setMenuOpen(false)}>Sell</a>
        <a href="mailto:info@chronovian.com?subject=Book Appointment" onClick={() => setMenuOpen(false)}>Book Appointment</a>
        <button onClick={() => { setPage("contact"); setMenuOpen(false); }}>Contact Us</button>
        <a href="https://wa.me/910000000000" target="_blank" onClick={() => setMenuOpen(false)}>WhatsApp</a>
      </div>

      {page === "contact" ? (
        <main>
          <div className="contact-page">
            <div className="section-header" style={{textAlign:"left"}}>
              <span className="section-eyebrow">Get in Touch</span>
              <h1 className="section-title">Contact <em>Chronovian</em></h1>
              <div className="gold-rule" style={{margin:"1.25rem 0 0"}} />
            </div>
            <div className="contact-grid">
              <div className="contact-info">
                <h3>We'd love to hear from you</h3>
                <div className="contact-item">
                  <span className="contact-item-icon">✉️</span>
                  <div className="contact-item-text">
                    <span className="contact-item-label">Email</span>
                    <a href="mailto:info@chronovian.com">info@chronovian.com</a>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-item-icon">💬</span>
                  <div className="contact-item-text">
                    <span className="contact-item-label">WhatsApp</span>
                    <a href="https://wa.me/910000000000" target="_blank">+91 00000 00000</a>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-item-icon">📍</span>
                  <div className="contact-item-text">
                    <span className="contact-item-label">Location</span>
                    Hyderabad, Telangana, India — Address revealed upon appointment confirmation
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-item-icon">🕐</span>
                  <div className="contact-item-text">
                    <span className="contact-item-label">Hours</span>
                    By appointment only<br />Monday – Saturday: 10am – 7pm
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontWeight:400,fontSize:"1.1rem",marginBottom:"1.5rem"}}>Send an Enquiry</h3>
                <form className="contact-form" onSubmit={e => { e.preventDefault(); window.location.href = "mailto:info@chronovian.com?subject=Website Enquiry"; }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" type="text" placeholder="Your name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" placeholder="your@email.com" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Enquiry Type</label>
                    <select className="form-select">
                      <option>Book an Appointment</option>
                      <option>Watch Enquiry</option>
                      <option>Jewellery Enquiry</option>
                      <option>General Enquiry</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-textarea" placeholder="Tell us how we can help..." />
                  </div>
                  <button type="submit" className="btn-gold">Send Enquiry</button>
                </form>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main>
          <section className="hero">
            {heroSlides.map((s, i) => (
              <div key={i} className={`hero-slide${slide === i ? " active" : ""}`}>
                <img src={s.img} alt={s.headline} />
              </div>
            ))}
            <div className="hero-gradient" />
            <div className="hero-content">
              <p className="hero-eyebrow">Est. 2026 — By Appointment Only</p>
              <h1 className="hero-title">{heroSlides[slide].headline}<br /><em>{heroSlides[slide].subheadline}</em></h1>
              <p className="hero-sub">{heroSlides[slide].sub}</p>
            </div>
            <div className="hero-dots">
              {heroSlides.map((_, i) => (
                <button key={i} className={`hero-dot${slide === i ? " active" : ""}`} onClick={() => setSlide(i)} />
              ))}
            </div>
          </section>

          <div className="countdown-strip">
            <span className="countdown-label-text">Opening In</span>
            <div className="countdown-units">
              <div className="countdown-unit"><span className="countdown-num">{String(days).padStart(2,"0")}</span><span className="countdown-lbl">Days</span></div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit"><span className="countdown-num">{String(hours).padStart(2,"0")}</span><span className="countdown-lbl">Hours</span></div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit"><span className="countdown-num">{String(minutes).padStart(2,"0")}</span><span className="countdown-lbl">Min</span></div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit"><span className="countdown-num">{String(seconds).padStart(2,"0")}</span><span className="countdown-lbl">Sec</span></div>
            </div>
            <span className="countdown-label-text">June 25, 2026 — Hyderabad</span>
          </div>

          <section className="featured" id="featured">
            <div className="section-header">
              <span className="section-eyebrow">New Arrivals</span>
              <h2 className="section-title">Featured <em>Timepieces</em></h2>
              <div className="gold-rule" />
            </div>
            <div className="featured-grid">
              {featuredWatches.map((w, i) => (
                <div className="watch-card" key={i}>
                  <div className="watch-img-wrap">
                    <img src={w.img} alt={`${w.brand} ${w.model}`} />
                    <span className={`watch-status${w.status === "Sold" ? " sold" : ""}`}>{w.status}</span>
                  </div>
                  <span className="watch-brand">{w.brand}</span>
                  <span className="watch-model">{w.model}</span>
                  <span className="watch-ref">{w.ref}</span>
                </div>
              ))}
            </div>
            <div className="featured-footer">
              <a href="mailto:info@chronovian.com?subject=Collection Enquiry" className="btn-outline">Enquire About Collection</a>
            </div>
          </section>

          <section className="categories" id="collections">
            {[
              { img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80", tag: "Haute Horlogerie", name: "Watches", link: "mailto:info@chronovian.com?subject=Watch Enquiry" },
              { img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80", tag: "Fine Jewellery", name: "Jewellery", link: "mailto:info@chronovian.com?subject=Jewellery Enquiry" },
            ].map(cat => (
              <div className="cat-card" key={cat.name}>
                <img src={cat.img} alt={cat.name} />
                <div className="cat-overlay" />
                <div className="cat-content">
                  <span className="cat-tag">{cat.tag}</span>
                  <span className="cat-name">{cat.name}</span>
                  <a href={cat.link} className="cat-link">Enquire Now</a>
                </div>
              </div>
            ))}
          </section>

          <section className="about-strip">
            <span className="section-eyebrow">Our Philosophy</span>
            <h2 className="section-title">A Sanctuary for the <em>Extraordinary</em></h2>
            <div className="gold-rule" />
            <p className="about-body">Chronovian is not merely a store — it is a curated sanctuary for those who understand that true luxury is measured in provenance, craftsmanship, and the singular joy of owning something exceptional. Every piece is hand-selected for its heritage, artistry, and investment potential.</p>
            <button className="btn-outline" onClick={() => setPage("contact")}>Schedule a Private Viewing</button>
          </section>

          <section className="pillars">
            <div className="pillars-inner">
              <div className="section-header">
                <span className="section-eyebrow">The Chronovian Difference</span>
                <h2 className="section-title">Why Our Clients <em>Choose</em> Us</h2>
              </div>
              <div className="pillars-grid">
                {[
                  { num: "01", title: "Absolute Privacy", body: "Every visit is conducted with the utmost discretion. Your collection, your story — kept entirely confidential." },
                  { num: "02", title: "Curated Excellence", body: "Each piece is individually authenticated and selected to meet our uncompromising standards of provenance and artistry." },
                  { num: "03", title: "Personal Service", body: "Your dedicated advisor guides you through every acquisition — from discovery to delivery — ensuring a seamless journey." },
                ].map(p => (
                  <div className="pillar" key={p.num}>
                    <span className="pillar-num">{p.num}</span>
                    <h3 className="pillar-title">{p.title}</h3>
                    <p className="pillar-body">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* PAYMENT METHODS */}
      <div style={{background:"var(--white)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"1.5rem 2.5rem"}}>
        <div style={{maxWidth:"1200px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", gap:"1.5rem", flexWrap:"wrap"}}>
          <span style={{fontSize:"0.55rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"var(--gray-light)", marginRight:"1rem"}}>Secure Payments</span>
          {[
            { label: "UPI", bg: "#5F259F", color: "white", desc: "Pay via UPI" },
            { label: "GPay", bg: "#4285F4", color: "white", desc: "Google Pay" },
            { label: "PhonePe", bg: "#5F259F", color: "white", desc: "PhonePe" },
            { label: "Paytm", bg: "#00BAF2", color: "white", desc: "Paytm" },
            { label: "VISA", bg: "#1A1F71", color: "white", desc: "Visa Card" },
            { label: "MC", bg: "#EB001B", color: "white", desc: "Mastercard" },
            { label: "RuPay", bg: "#007A3D", color: "white", desc: "RuPay Card" },
            { label: "NEFT", bg: "#F5F3F0", color: "#333", desc: "Bank Transfer" },
            { label: "EMI", bg: "#F5F3F0", color: "#333", desc: "Easy EMI" },
          ].map(pm => (
            <div key={pm.label} title={pm.desc} style={{
              background: pm.bg,
              color: pm.color,
              padding: "0.35rem 0.75rem",
              borderRadius: "4px",
              fontSize: "0.6rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              border: pm.bg === "#F5F3F0" ? "1px solid #ddd" : "none",
              minWidth: "44px",
              textAlign: "center",
            }}>{pm.label}</div>
          ))}
          <span style={{fontSize:"0.6rem", color:"var(--gray-light)", marginLeft:"0.5rem"}}>🔒 SSL Secured</span>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <span className="footer-brand">Chronovian</span>
              <p className="footer-tagline">A sanctuary for extraordinary timepieces and fine jewellery. By appointment only — Hyderabad, Telangana, India.</p>
            </div>
            <div>
              <span className="footer-col-title">Collections</span>
              <ul className="footer-links">
                <li><a href="mailto:info@chronovian.com?subject=Watch Enquiry">Timepieces</a></li>
                <li><a href="mailto:info@chronovian.com?subject=Jewellery Enquiry">Jewellery</a></li>
                <li><a href="mailto:info@chronovian.com?subject=New Arrivals">New Arrivals</a></li>
              </ul>
            </div>
            <div>
              <span className="footer-col-title">Visit Us</span>
              <ul className="footer-links">
                <li><a href="mailto:info@chronovian.com?subject=Book Appointment">Book Appointment</a></li>
                <li><button onClick={() => setPage("contact")}>Contact Us</button></li>
                <li><a href="https://wa.me/910000000000" target="_blank">WhatsApp</a></li>
              </ul>
            </div>
            <div>
              <span className="footer-col-title">Company</span>
              <ul className="footer-links">
                <li><a href="#">About Chronovian</a></li>
                <li><a href="#">Authentication</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2025 Chronovian. All rights reserved.</p>
            <div className="footer-social">
              <a href="https://instagram.com/chronovian" target="_blank">Instagram</a>
              <a href="https://wa.me/910000000000" target="_blank">WhatsApp</a>
              <a href="#">Facebook</a>
            </div>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/910000000000" target="_blank" className="whatsapp-fab">💬</a>
    </>
  );
}
