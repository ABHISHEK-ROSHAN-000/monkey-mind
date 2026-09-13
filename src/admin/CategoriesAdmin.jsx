import { useState } from 'react';
import { useSite } from '../lib/store.jsx';

export default function CategoriesAdmin() {
  const s = useSite();
  const [name, setName] = useState('');

  const add = async () => {
    if (!name.trim()) return;
    try {
      await s.upsertCategory({ name: name.trim() });
      setName('');
    } catch (e) {
      alert(e?.message || 'Add failed.');
    }
  };

  if (s.loading) {
    return (
      <>
        <h1 style={{ marginTop: 0 }}>Categories</h1>
        <div className="card"><p>Loading…</p></div>
      </>
    );
  }

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Categories</h1>
      <div className="card">
        <div className="row">
          <input style={{ flex: 1 }} placeholder="New category name…" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          <button className="btn" onClick={add}>Add</button>
        </div>
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Name</th><th>Slug</th><th>Projects</th><th></th></tr></thead>
          <tbody>
            {[...s.categories].sort((a, b) => a.order - b.order).map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td><td>/{c.slug}</td>
                <td>{s.projects.filter((p) => (p.categoryIds || []).includes(c.id)).length}</td>
                <td><button className="btn danger" onClick={() => { if (confirm(`Delete ${c.name}? Projects keep everything else.`)) s.deleteCategory(c.id).catch((e) => alert(e?.message || 'Delete failed')); }}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
