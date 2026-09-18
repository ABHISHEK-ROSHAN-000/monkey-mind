import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deliveryUrl } from '../lib/cloudinary.js';

// Tile source: dedicated thumbnail first, then first gallery photo (images
// only — legacy video entries are skipped), then the main photo.
function tileSource(p) {
  if (p.thumbnail?.url) return p.thumbnail;
  const m = (p.media || []).find((x) => x.type !== 'video') || p.media?.[0];
  if (!m || m.type === 'video') return p.cover ? { url: p.cover } : null;
  return m;
}

function Thumb({ p }) {
  // No inline sizing: CSS owns layout (absolute fill + clip-path hover).
  const src = deliveryUrl(tileSource(p), { w: 800 });
  return <img src={src} alt={p.title} loading="lazy" />;
}

export function WorkGrid({ items }) {
  return (
    <div className="works-grid">
      {items.map((p) => (
        <Link className="work-tile" key={p.id} to={`/p/${p.slug}`} title={p.title}>
          <span className="tile-frame"><Thumb p={p} /></span>
          <span className="tile-cap">{p.title}</span>
        </Link>
      ))}
    </div>
  );
}

function ListThumb({ p }) {
  const imgs = (p.media || []).filter((m) => m.type !== 'video');
  const first = p.thumbnail?.url ? p.thumbnail : imgs[0];
  const second = imgs[1];
  return (
    <span className="list-thumb">
      <img className="t0" src={deliveryUrl(first, { w: 800 }) || p.cover} alt="" loading="lazy" />
      {second?.url ? <img className="t1" src={deliveryUrl(second, { w: 400 })} alt="" loading="lazy" /> : null}
    </span>
  );
}

export function WorkList({ items }) {
  return (
    <div className="works-list">
      {items.map((p) => (
        <Link key={p.id} className="list-row" to={`/p/${p.slug}`}>
          <ListThumb p={p} />
          <span className="list-title">{p.title}</span>
          <span className="list-tags">{(p.tags || []).join(', ')}</span>
          <span className="list-spacer" aria-hidden="true" />
          <span className="list-year">{p.year}</span>
        </Link>
      ))}
    </div>
  );
}

// Feed main: same source as tiles, served larger (780px box × 1.12 zoom × retina).
function FeedMain({ p }) {
  const src = deliveryUrl(tileSource(p), { w: 1600 });
  return <img src={src} alt={p.title} loading="lazy" decoding="async" />;
}

export function WorkFeed({ items }) {
  return (
    <div className="works-feed">
      {items.map((p) => {
        const [sup1, sup2] = feedSupport(p);
        return (
          <Link className="feed-item" key={p.id} to={`/p/${p.slug}`}>
            <div className="feed-frame">
              <div className="feed-photo"><FeedMain p={p} /></div>
              <div className="feed-hover" aria-hidden="true">
                {sup1 && <img className="sup left" src={deliveryUrl(sup1, { w: 1600 })} alt="" loading="lazy" decoding="async" />}
                {sup2 && <img className="sup right" src={deliveryUrl(sup2, { w: 1600 })} alt="" loading="lazy" decoding="async" />}
                <span className="feed-mask" />
              </div>
            </div>
            <div className="feed-cap">
              <span className="feed-title">{p.title}</span>
              <span className="feed-year"> · {p.year}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// Feed hover layer: first two supporting gallery photos, skipping videos
// and whatever the main tile already shows. Either may be absent.
function feedSupport(p) {
  const mainUrl = tileSource(p)?.url;
  return (p.media || [])
    .filter((m) => m.type !== 'video' && m.url && m.url !== mainUrl)
    .slice(0, 2);
}

export function WorkFull({ items }) {
  return (
    <div className="works-full">
      {items.map((p) => (
        <FullItem key={p.id} p={p} />
      ))}
    </div>
  );
}

// Per-card hover state: entering anywhere on the 95vh card (tint,
// foreground, or meta row) drives both the bg zoom (CSS) and the cycler.
function FullItem({ p }) {
  const [hovered, setHovered] = useState(false);
  const bg = tileSource(p);
  return (
    <Link
      className="full-item"
      to={`/p/${p.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="full-bg" aria-hidden="true">
              {bg && <img src={deliveryUrl(bg, { w: 2400 })} alt="" loading="lazy" decoding="async" />}
      </div>
      <div className="full-fg"><FullFg p={p} active={hovered} /></div>
      <div className="full-meta">
        <span>{p.title}</span>
        <span>{(p.tags || []).join(', ')}</span>
        <span>{p.year}</span>
      </div>
    </Link>
  );
}

// Foreground cycler: first 3 gallery photos (stills only), shortfalls padded
// with the cover (deduped). Cycles while hovered/focused only; a single
// image renders today's static tile with no timer at all.
function FullFg({ p, active }) {
  const imgs = useMemo(() => {
    const seen = new Set();
    const out = [];
    const push = (m) => {
      if (!m?.url || seen.has(m.url)) return;
      seen.add(m.url);
      out.push(m);
    };
    (p.media || []).forEach((m) => {
      if (m.type !== 'video') push(m);
    });
    if (p.cover) push({ url: p.cover });
    return out.slice(0, 3);
  }, [p]);
  const [i, setI] = useState(0);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    if (!active || reduced || imgs.length < 2) {
      setI(0);
      return;
    }
    const t = setInterval(() => setI((v) => (v + 1) % imgs.length), 1000);
    return () => clearInterval(t);
  }, [active, reduced, imgs]);
  if (reduced || imgs.length < 2) {
    return <Thumb p={p} />;
  }
  return (
    <div className="cycle">
      {imgs.map((m, k) => (
        <img
          key={m.url + k}
          src={deliveryUrl(m, { w: 1200 })}
          alt={k === 0 ? p.title : ''}
          loading="lazy"
          decoding="async"
          className={k === i ? 'on' : ''}
        />
      ))}
    </div>
  );
}

export function ViewSwitcher({ view, setView }) {
  return (
    <nav className="view-switch" aria-label="Layout">
      {['grid', 'list', 'feed', 'full'].map((v) => (
        <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>
          {v[0].toUpperCase() + v.slice(1)}
        </button>
      ))}
    </nav>
  );
}
