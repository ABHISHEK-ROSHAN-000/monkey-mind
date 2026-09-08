import { useEffect, useMemo, useRef, useState } from 'react';
import { useSite } from '../lib/store.jsx';

const rnd = (n) => Math.floor(Math.random() * n);
const MAX_AGE = 700; // force-hide anything visible this long (ticks are ≤0.7s apart, so life stays < 1.5s)

// Info hero: full-bleed photo grid (4×3 desktop, 4×4 mobile) over a giant
// centered title. All cells start invisible for 2s, then 4–7 random images
// are visible at any time. Every 0.4–0.7s the set drifts — and no image may
// stay visible longer than ~1.4s (capped strictly under 1.5s).
export default function InfoHero() {
  const { publishedProjects, settings } = useSite();
  const COUNT = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 768px)').matches
        ? 20
        : 12,
    []
  );

  const cells = useMemo(() => {
    const urls = [];
    for (const p of publishedProjects) {
      for (const m of p.media || []) {
        if (m.type !== 'video' && m.url && !urls.includes(m.url)) urls.push(m.url);
      }
      if (p.cover && !urls.includes(p.cover)) urls.push(p.cover);
    }
    while (urls.length < COUNT) urls.push(`https://picsum.photos/seed/mm-info-${urls.length}/800/800`);
    return urls.slice(0, COUNT);
  }, [publishedProjects, COUNT]);

  // Visible-count band scales with grid density: 4–7 of 12 on desktop,
  // 7–12 of 20 on mobile (same ~33–58% feel).
  const lo = COUNT === 20 ? 7 : 4;
  const hi = COUNT === 20 ? 12 : 7;
  const band = () => lo + rnd(hi - lo + 1);
  const vis = useRef(new Set()); // visible indexes (source of truth)
  const at = useRef(new Map()); // index -> timestamp revealed
  const live = useRef(false);
  const [, bump] = useState(0);
  const paint = () => bump((x) => x + 1);

  useEffect(() => {
    live.current = false;
    vis.current = new Set();
    at.current = new Map();
    paint();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cells.forEach((_, i) => {
        vis.current.add(i);
      });
      paint();
      return;
    }
    const start = setTimeout(() => {
      const now = Date.now();
      const pool = cells.map((_, i) => i);
      const count = band(); // initial visible set
      for (let k = 0; k < count && pool.length; k++) {
        const i = pool.splice(rnd(pool.length), 1)[0];
        vis.current.add(i);
        at.current.set(i, now);
      }
      live.current = true;
      paint();
    }, 2000);
    let timer;
    const tick = () => {
      if (live.current) {
        const now = Date.now();
        // 1. age cap: hide everything visible >= 700ms
        for (const i of [...vis.current]) {
          if (now - (at.current.get(i) || 0) >= MAX_AGE) {
            vis.current.delete(i);
            at.current.delete(i);
          }
        }
        // 2. count drift to a fresh random band value
        const target = band();
        const visible = [...vis.current];
        while (visible.length > target) {
          const i = visible.splice(rnd(visible.length), 1)[0];
          vis.current.delete(i);
          at.current.delete(i);
        }
        while (visible.length < target) {
          const hid = cells.map((_, i) => i).filter((i) => !vis.current.has(i));
          if (!hid.length) break;
          const i = hid[rnd(hid.length)];
          vis.current.add(i);
          at.current.set(i, now);
          visible.push(i);
        }
        paint();
      }
      timer = setTimeout(tick, 400 + Math.random() * 300); // next drift in 0.4–0.7s
    };
    timer = setTimeout(tick, 200);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [cells]);

  const hidden = new Set(cells.map((_, i) => i).filter((i) => !vis.current.has(i)));

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
