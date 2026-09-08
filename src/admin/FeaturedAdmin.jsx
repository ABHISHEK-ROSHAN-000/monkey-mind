import { useState } from 'react';
import { useSite } from '../lib/store.jsx';

export default function FeaturedAdmin() {
  const s = useSite();
  const [ids, setIds] = useState(s.settings.home.featuredIds || []);
  const toggle = (id) => setIds((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const move = (i, dir) => setIds((a) => {
    const b = [...a]; const j = i + dir;
    if (j < 0 || j >= b.length) return a;
    [b[i], b[j]] = [b[j], b[i]];
    return b;
  });
  const items = s.publishedProjects;
  return (
    <>
      <h1 style={{ marginTop: 0 }}>Home — Featured projects</h1>
      <div className="card">
        <b>Order ({ids.length} selected)</b>
        {ids.map((id, i) => {
          const p = s.projects.find((x) => x.id === id);
          if (!p) return null;
          return (
            <div className="row" key={id} style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
              <span>#{i + 1} — {p.title}</span>
              <span className="row">
                <button className="btn ghost" onClick={() => move(i, -1)}>↑</button>
                <button className="btn ghost" onClick={() => move(i, 1)}>↓</button>
                <button className="btn danger" onClick={() => toggle(id)}>Remove</button>
              </span>
            </div>
          );
        })}
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => s.setFeatured(ids)}>Save featured</button>
        </div>
      </div>
      <div className="card">
        <b>All published projects</b>
        {items.map((p) => (
          <label key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid var(--line)', padding: '8px 0', margin: 0 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={ids.includes(p.id)} onChange={() => toggle(p.id)} /> {p.title}
          </label>
        ))}
      </div>
    </>
  );
}
