import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';

export default function ProjectsAdmin() {
  const s = useSite();
  const [q, setQ] = useState('');
  const items = [...s.projects].sort((a, b) => a.order - b.order)
    .filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Projects</h1>
        <Link className="btn" to="/admin/projects/new">+ New project</Link>
      </div>
      <div className="card">
        <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Title</th><th>Status</th><th>Order</th><th></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td><Link to={`/admin/projects/${p.id}`}>{p.title}</Link> <span style={{ color: 'var(--muted)' }}>/{p.slug}</span></td>
                <td>{p.status}{p.featured ? ' ★' : ''}</td>
                <td>
                  <button className="btn ghost" onClick={() => s.moveProject(p.id, -1)}>↑</button>{' '}
                  <button className="btn ghost" onClick={() => s.moveProject(p.id, 1)}>↓</button>
                </td>
                <td>
                  <Link className="btn ghost" to={`/admin/projects/${p.id}`}>Edit</Link>{' '}
                  <button className="btn danger" onClick={() => { if (confirm(`Delete ${p.title}?`)) s.deleteProject(p.id); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
