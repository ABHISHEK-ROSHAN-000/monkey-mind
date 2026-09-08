import { Link } from 'react-router-dom';

function Thumb({ p, ratio }) {
  const m = p.media?.[0];
  const src = m?.url || p.cover;
  if (m?.type === 'video') {
    return <video src={m.url} muted playsInline preload="metadata" style={{ width: '100%', height: '100%', aspectRatio: ratio || '1/1', objectFit: 'cover' }} />;
  }
  return <img src={src} alt={p.title} loading="lazy" style={{ width: '100%', height: '100%', aspectRatio: ratio || '1/1', objectFit: 'cover' }} />;
}

export function WorkGrid({ items }) {
  return (
    <div className="works-grid">
      {items.map((p) => (
        <Link className="work-tile" key={p.id} to={`/p/${p.slug}`} title={p.title}>
          <Thumb p={p} />
          <span className="tile-cap">{p.title}</span>
        </Link>
      ))}
    </div>
  );
}

export function WorkList({ items }) {
  return (
    <div className="works-list">
      {items.map((p) => (
        <Link key={p.id} to={`/p/${p.slug}`}>
          <span>{p.title}</span>
          <small>{p.tags?.join(', ')} · {p.year}</small>
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
