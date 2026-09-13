import { useEffect, useMemo, useState } from 'react';
import { useSite } from '../lib/store.jsx';

// Framer "Other" template — Info hero 5-state mosaic (desktop spec adapted to
// fluid grid + mobile 3×4 with the same visibility map).
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

// Info hero: full-bleed photo grid (4×3 desktop, 3×4 mobile) over a giant
// centered title. Fixed image order per mount; visibility follows the exact
// 5-state map above — layout never rearranges, tiles just fade.
export default function InfoHero() {
  const { publishedProjects, settings } = useSite();
  const COUNT = 12;

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

  const [idx, setIdx] = useState(0);
  const [staticAll, setStaticAll] = useState(false);

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

  return (
    <section className="info-hero" aria-label={settings.about.title}>
      <h1 className="info-title">{settings.about.title}</h1>
      <div className="info-grid">
        {cells.map((src, i) => {
          const visible = staticAll || STATES[idx][i] === 1;
          return (
            <div className={`info-cell tile-${KIND[i].toLowerCase()}`} key={i}>
              <img
                src={src}
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
