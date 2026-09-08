import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';

export default function Footer() {
  const { settings, publishedProjects } = useSite();
  const covers = publishedProjects.map((p) => p.media?.[0]?.url || p.cover).filter(Boolean);
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
