import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';
import { deliveryUrl } from '../lib/cloudinary.js';

export function Inquiry() {
  const { settings, publishedProjects } = useSite();
  const covers = publishedProjects
    .map((p) => {
      const m = p.thumbnail?.url ? p.thumbnail : (p.media || []).find((x) => x.type !== 'video') || p.media?.[0];
      if (m && m.type !== 'video') return deliveryUrl(m, { w: 800 });
      return p.cover || null;
    })
    .filter(Boolean);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (covers.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % covers.length), 1500);
    return () => clearInterval(t);
  }, [covers.length]);

  return (
    <footer className="inquiry">
      <div className="inq-bg" aria-hidden="true">
        {covers.map((src, i) => (
          <img key={i} src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} className={i === idx ? 'on' : ''} />
        ))}
      </div>
      <div className="wrap inq-inner">
        <div className="inq-top">
          <p>Inquiries<br /><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p>
          <p>Based in<br /><span className="u">{settings.location}.</span></p>
        </div>
        <div className="inq-bottom">
          <p className="big">Let&apos;s build something great together.</p>
          <p className="big"><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p>
          <Link className="admin-link" to="/admin/login">Admin</Link>
        </div>
      </div>
    </footer>
  );
}

export function Colophon() {
  const { settings } = useSite();
  const year = new Date().getFullYear();
  return (
    <footer className="colophon">
      <div className="wrap colophon-inner">
        <p className="colophon-mark">MONKEY<br />MIND</p>
        <div className="colophon-side">
          <nav className="colophon-links">
            <Link to="/">Index</Link>
            <Link to="/projects">Projects</Link>
            {settings.socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
            ))}
          </nav>
          <p className="colophon-note">© {year} MMStudio. Built for creatives.</p>
        </div>
      </div>
    </footer>
  );
}
