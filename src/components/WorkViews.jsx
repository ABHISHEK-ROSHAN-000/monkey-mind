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

export function WorkFeed({ items }) {
  return (
    <div className="works-feed">
      {items.map((p) => (
        <Link className="feed-item" key={p.id} to={`/p/${p.slug}`}>
          <div className="thumb"><Thumb p={p} ratio="16/9" /></div>
          <h3>{p.title} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {p.year}</span></h3>
        </Link>
      ))}
    </div>
  );
}

export function WorkFull({ items }) {
  return (
    <div className="works-full">
      {items.map((p) => (
        <Link key={p.id} to={`/p/${p.slug}`}>
          <div className="full-item"><Thumb p={p} /></div>
          <div className="full-cap">{p.title} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({p.year})</span></div>
        </Link>
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
