import { useRef } from 'react';
import { useSite } from '../lib/store.jsx';

// Marquee with touch scrub: on touch devices the rotation never stops —
// a horizontal drag scrubs the live animation clock 1:1 and releases it
// exactly where the finger left off. Desktop hover-pause lives in CSS
// (scoped to hover-capable devices only).
export default function Testimonials() {
  const { settings } = useSite();
  const trackRef = useRef(null);
  const drag = useRef(null);
  const items = settings.testimonials || [];
  if (!items.length) return null;
  const slides = [...items, ...items]; // two identical halves = seamless -50% loop

  const onTouchStart = (e) => {
    const t = e.changedTouches[0];
    const track = trackRef.current;
    const anim = track?.getAnimations?.()?.[0];
    if (!anim || drag.current) return;
    anim.pause();
    drag.current = {
      anim,
      id: t.identifier,
      startX: t.clientX,
      startTime: anim.currentTime ?? 0,
      msPerPx: 30000 / (track.scrollWidth / 2), // 30s loop over one half-width
    };
  };
  const onTouchMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const t = [...e.changedTouches].find((x) => x.identifier === d.id);
    if (!t) return;
    d.anim.currentTime = d.startTime - (t.clientX - d.startX) * d.msPerPx;
  };
  const endTouch = (e) => {
    const d = drag.current;
    if (!d || ![...e.changedTouches].some((x) => x.identifier === d.id)) return;
    drag.current = null;
    d.anim.play();
  };

  return (
    <section className="testis">
      <div className="testi-head">
        <p className="testi-label">Testimonials</p>
        <h2>Meet the people who experienced our work firsthand and share what made the collaboration truly meaningful.</h2>
      </div>
      <div
        className="testi-marquee"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={endTouch}
        onTouchCancel={endTouch}
      >
        <div className="testi-track flow" ref={trackRef}>
          {slides.map((t, i) => {
            const parts = String(t.role || '').split('—');
            const company = parts.length > 1 ? parts.pop().trim() : '';
            return (
              <div className="testi" key={i} aria-hidden={i >= items.length}>
                {company && <p className="testi-brand">{company}</p>}
                <q>{t.quote}</q>
                <p className="who">{t.name}</p>
                <p className="role">{t.role}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
