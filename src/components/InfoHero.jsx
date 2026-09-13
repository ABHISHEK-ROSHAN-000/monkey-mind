import { useEffect, useMemo, useState } from 'react';
import { useSite } from '../lib/store.jsx';
import { deliveryUrl } from '../lib/cloudinary.js';

// Framer "Other" template — Info hero 5-state mosaic (desktop 4×3, mobile 3×3)
// over a giant centered title. Fixed image order per mount; visibility follows
// the exact 5-state map above — layout never rearranges, tiles just fade.
// Positions 1–12 map to indexes 0–11; 1 = visible, 0 = hidden.
const STATES = [
  [0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1], // Slider 01: 02,03,05,07,08,10,12
  [1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1], // Slider 02: 01,03,06,08,09,10,11,12
  [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0], // Slider 03: 02,04,05,08,10
  [0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], // Slider 04: 02,03,06,09,12
  [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0], // Slider 05: 01,04,07,09
];
// Squares F = immediate 0.8s fade; Squares S = 0.8s fade with 0.4s delay.
const KIND = ['F', 'S', 'F', 'S', 'S', 'F', 'S', 'F', 'F', 'F', 'F', 'S'];

const STATE_MS = 2500; // each preset holds 2.5s, loops 1→2→3→4→5→1

export default function InfoHero() {
  const { publishedProjects, settings } = useSite();
  const [COUNT, setCOUNT] = useState(12);
  const [idx, setIdx] = useState(0);
  const [staticAll, setStaticAll] = useState(false);

  useEffect(() => {
    const m = window.matchMedia('(max-width: 768px)');
    setCOUNT(m.matches ? 9 : 12);
    const onChange = (e) => setCOUNT(e.matches ? 9 : 12);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  const cells = useMemo(() => {
    const seen = new Set();
    const out = [];
    const push = (m) => {
      if (!m?.url || seen.has(m.url)) return;
      seen.add(m.url);
      out.push(m);
    };
    for (const p of publishedProjects) {
      for (const m of p.media || []) {
        if (m.type !== 'video') push(m);
      }
      if (p.cover) push({ url: p.cover });
    }
    return out.slice(0, COUNT);
  }, [publishedProjects, COUNT]);

  useEffect(() => {
    setIdx(0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStaticAll(true);
      return;
    }
    setStaticAll(false);
    let timer;
    const advance = () => {
      setIdx((i) => (i + 1) % STATES.length);
      timer = setTimeout(advance, STATE_MS);
    };
    timer = setTimeout(advance, STATE_MS);
    return () => clearTimeout(timer);
  }, [cells]);

  if (!cells.length) {
    return (
      <section className="info-hero" aria-label={settings.about.title}>
        <h1 className="info-title">{settings.about.title}</h1>
      </section>
    );
  }

  return (
    <section className="info-hero" aria-label={settings.about.title}>
      <h1 className="info-title">{settings.about.title}</h1>
      <div className="info-grid">
        {cells.map((cell, i) => {
          const visible = staticAll || STATES[idx][i] === 1;
          return (
            <div className={`info-cell tile-${KIND[i].toLowerCase()}`} key={i}>
              <img
                src={deliveryUrl(cell, { w: 800 })}
                alt=""
                loading={i < 4 ? 'eager' : 'lazy'}
                className={visible ? '' : 'dim'}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
