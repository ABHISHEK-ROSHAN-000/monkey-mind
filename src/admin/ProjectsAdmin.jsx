import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';

const pill = (visible) => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 200,
  fontSize: '.8rem',
  fontWeight: 600,
  background: visible ? '#e7f4e7' : '#f0f0f0',
  color: visible ? '#1e7e34' : '#5e5e5e',
});

export default function ProjectsAdmin() {
  const s = useSite();
  const [q, setQ] = useState('');

  const act = async (fn) => {
    try {
      await fn();
    } catch (e) {
      alert(e?.message || 'Action failed.');
    }
  };

  if (s.loading) {
    return (
      <>
        <h1 style={{ margin: 0 }}>Products</h1>
        <div className="card"><p>Loading…</p></div>
      </>
    );
  }

  const items = [...s.projects].sort((a, b) => a.order - b.order)
    .filter((p) => (p.title || '').toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Products</h1>
        <Link className="btn" to="/admin/projects/new">+ New product</Link>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>↑ ↓ changes the order everywhere on the website, immediately.</p>
      <div className="card">
        <input placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="card">
        {items.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>No products yet — add your first one with + New product.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Name</th><th>Visibility</th><th>Home page</th><th>Position</th><th></th></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/admin/projects/${p.id}`}>{p.title || 'Untitled'}</Link>{' '}
                    <Link to={`/p/${p.slug}`} style={{ color: 'var(--muted)', fontSize: '.85rem' }}>View →</Link>
                  </td>
                  <td><span style={pill(p.status === 'published')}>{p.status === 'published' ? 'Visible' : 'Hidden'}</span></td>
                  <td>{p.featured ? 'Yes' : '—'}</td>
                  <td>
                    <button className="btn ghost" onClick={() => act(() => s.moveProject(p.id, -1))} aria-label="Move up">↑</button>{' '}
                    <button className="btn ghost" onClick={() => act(() => s.moveProject(p.id, 1))} aria-label="Move down">↓</button>
                  </td>
                  <td>
                    <Link className="btn ghost" to={`/admin/projects/${p.id}`}>Edit</Link>{' '}
                    <button className="btn danger" onClick={() => { if (confirm(`Delete ${p.title || 'this product'}? This removes it from the website for everyone. This can't be undone.`)) act(() => s.deleteProject(p.id)); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
