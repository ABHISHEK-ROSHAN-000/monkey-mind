import { useEffect, useMemo, useRef, useState } from 'react';
import { useSite } from '../lib/store.jsx';

const rnd = (n) => Math.floor(Math.random() * n);
// Random subset of `count` indexes out of 12
const pick = (count) => {
  const pool = Array.from({ length: 12 }, (_, i) => i);
  const out = new Set();
  while (out.size < count && pool.length) out.add(pool.splice(rnd(pool.length), 1)[0]);
  return out;
};

// Info hero: full-bleed 4×3 photo grid over a giant centered title.
// All 12 start invisible for 2s, then 4–7 random images are visible at any
// time — every 1s the visible set drifts to a new random 4–7.
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

  // hidden = indexes currently faded out. Start: everything hidden.
  const [hidden, setHidden] = useState(() => new Set(cells.map((_, i) => i)));
  const live = useRef(false);

  useEffect(() => {
    live.current = false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHidden(new Set());
      return;
    }
    setHidden(new Set(cells.map((_, i) => i)));
    const start = setTimeout(() => {
      const keep = pick(4 + rnd(4)); // 4–7 stay visible
      setHidden(new Set(cells.map((_, i) => i).filter((i) => !keep.has(i))));
      live.current = true;
    }, 2000);
    let timer;
    const tick = () => {
      if (live.current) {
        const target = 4 + rnd(4); // new random 4–7
        setHidden((prev) => {
          const visible = cells.map((_, i) => i).filter((i) => !prev.has(i));
          const next = new Set(prev);
          while (visible.length > target) {
            const i = visible.splice(rnd(visible.length), 1)[0];
            next.add(i);
          }
          while (visible.length < target) {
            const hid = [...next];
            if (!hid.length) break;
            const i = hid.splice(rnd(hid.length), 1)[0];
            next.delete(i);
            visible.push(i);
          }
          return next;
        });
      }
      timer = setTimeout(tick, 400 + Math.random() * 300); // next drift in 0.4–0.7s
    };
    timer = setTimeout(tick, 200);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
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
