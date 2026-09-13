import { useEffect, useState } from 'react';
import { useSite } from '../lib/store.jsx';

export default function FeaturedAdmin() {
  const s = useSite();
  const [ids, setIds] = useState(s.settings.home?.featuredIds || []);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Follow live data until the admin starts editing locally.
  useEffect(() => {
    if (!dirty) setIds(s.settings.home?.featuredIds || []);
  }, [s.settings, dirty]);

  const toggle = (id) => {
    setDirty(true);
    setIds((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  };
  const move = (i, dir) => {
    setDirty(true);
    setIds((a) => {
      const b = [...a]; const j = i + dir;
      if (j < 0 || j >= b.length) return a;
      [b[i], b[j]] = [b[j], b[i]];
      return b;
    });
  };
  const save = async () => {
    setSaving(true);
    try {
      await s.setFeatured(ids);
      setDirty(false);
      alert('Saved — home featured order is live.');
    } catch (e) {
      alert(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (s.loading) return <p>Loading…</p>;
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
              <span>#{i + 1} — {p.title || 'Untitled'}</span>
              <span className="row">
                <button className="btn ghost" onClick={() => move(i, -1)}>↑</button>
                <button className="btn ghost" onClick={() => move(i, 1)}>↓</button>
                <button className="btn danger" onClick={() => toggle(id)}>Remove</button>
              </span>
            </div>
          );
        })}
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save featured'}</button>
        </div>
      </div>
      <div className="card">
        <b>All published projects</b>
        {items.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Nothing published yet.</p>}
        {items.map((p) => (
          <label key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid var(--line)', padding: '8px 0', margin: 0 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={ids.includes(p.id)} onChange={() => toggle(p.id)} /> {p.title || 'Untitled'}
          </label>
        ))}
      </div>
    </>
  );
}
