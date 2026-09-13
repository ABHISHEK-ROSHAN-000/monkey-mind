import { useState } from 'react';
import { useSite } from '../lib/store.jsx';

export default function CategoriesAdmin() {
  const s = useSite();
  const [name, setName] = useState('');

  const add = async () => {
    if (!name.trim()) {
      alert('Please type a group name first.');
      return;
    }
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
        <h1 style={{ marginTop: 0 }}>Groups</h1>
        <div className="card"><p>Loading…</p></div>
      </>
    );
  }

  const sorted = [...s.categories].sort((a, b) => a.order - b.order);
  return (
    <>
      <h1 style={{ marginTop: 0 }}>Groups</h1>
      <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Groups organize your Products page. A product can appear under more than one group.</p>
      <div className="card">
        <div className="row">
          <input style={{ flex: 1 }} placeholder="New group name, e.g. Packaging…" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          <button className="btn" onClick={add}>Add</button>
        </div>
      </div>
      <div className="card">
        {sorted.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>No groups yet — add your first one above.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Name</th><th>Products</th><th></th></tr></thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{s.projects.filter((p) => (p.categoryIds || []).includes(c.id)).length}</td>
                  <td><button className="btn danger" onClick={() => { if (confirm(`Delete ${c.name}? Products in this group will lose the label, but their photos and text stay.`)) s.deleteCategory(c.id).catch((e) => alert(e?.message || 'Delete failed')); }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
