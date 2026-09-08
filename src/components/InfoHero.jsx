import { useEffect, useMemo, useState } from 'react';
import { useSite } from '../lib/store.jsx';

// Info hero: full-bleed 4×3 photo grid over a giant centered title.
// Every 1s one random visible cell fades to 0 and one hidden cell restores,
// so the grid breathes without ever draining. Quick-smooth .5s transitions.
export default function InfoHero() {
  const { publishedProjects, settings } = useSite();

  const cells = useMemo(() => {
    const urls = [];
    for (const p of publishedProjects) {
      for (const m of p.media || []) {
        if (m.type !== 'video' && m.url && !urls.includes(m.url)) urls.push(m.url);
      }
      if (p.cover && !urls.includes(p.cover)) urls.push(p.cover);
    }
    while (urls.length < 12) urls.push(`https://picsum.photos/seed/mm-info-${urls.length}/800/800`);
    return urls.slice(0, 12);
  }, [publishedProjects]);

  const [hidden, setHidden] = useState(() => new Set());

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => {
      setHidden((prev) => {
        const next = new Set(prev);
        const visible = cells.map((_, i) => i).filter((i) => !next.has(i));
        if (visible.length) next.add(visible[Math.floor(Math.random() * visible.length)]);
        if (next.size > 0 && Math.random() < 0.85) {
          const hid = [...next];
          next.delete(hid[Math.floor(Math.random() * hid.length)]);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cells]);

  return (
    <section className="info-hero" aria-label={settings.about.title}>
      <h1 className="info-title">{settings.about.title}</h1>
      <div className="info-grid">
        {cells.map((src, i) => (
          <div className="info-cell" key={i}>
            <img
              src={src}
              alt=""
              loading={i < 4 ? 'eager' : 'lazy'}
              className={hidden.has(i) ? 'dim' : ''}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
