import { Link } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';
import { isFirebaseConfigured } from '../lib/firebase.js';
import { isCloudinaryConfigured } from '../lib/cloudinary.js';

export default function Dashboard() {
  const s = useSite();
  if (s.loading) {
    return (
      <>
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        <div className="card"><p>Loading your website data…</p></div>
      </>
    );
  }
  const broken = !isFirebaseConfigured || !isCloudinaryConfigured || !!s.syncError;
  return (
    <>
      <h1 style={{ marginTop: 0 }}>What would you like to do?</h1>
      {broken && (
        <div className="card">
          <b>Something needs attention</b>
          {s.syncError && <p style={{ color: '#b3261e' }}>{s.syncError}</p>}
          {(!isFirebaseConfigured || !isCloudinaryConfigured) && (
            <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Saving or photo uploads aren't working. Contact your developer.</p>
          )}
        </div>
      )}
      <div className="row">
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <b>1. Organize</b>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Add groups like Branding or Packaging. A product appears under every group you tick.</p>
          <Link className="btn" to="/admin/categories">Groups</Link>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <b>2. Add products</b>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Upload photos, write descriptions, choose who can see them.</p>
          <Link className="btn" to="/admin/projects">Products</Link>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <b>3. Edit texts</b>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Homepage intro, services, reviews and contact details.</p>
          <Link className="btn" to="/admin/about">Website texts</Link>
        </div>
      </div>
      <div className="card">
        <b>At a glance</b>
        <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
          {s.projects.length} products · {s.publishedProjects.length} visible to everyone · {s.categories.length} groups · {s.featuredProjects.length} on the home page
        </p>
        <div className="row">
          <Link className="btn ghost" to="/">View website</Link>
        </div>
      </div>
      <div className="card">
        <b>Recent products</b>
        {s.projects.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>No products yet — create the first one in <Link to="/admin/projects">Products</Link>.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Name</th><th>Visibility</th><th>Home page</th></tr></thead>
            <tbody>
              {[...s.projects].sort((a, b) => b.order - a.order).slice(0, 5).map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/admin/projects/${p.id}`}>{p.title || 'Untitled'}</Link></td>
                  <td>{p.status === 'published' ? 'Visible' : 'Hidden'}</td>
                  <td>{p.featured ? 'Yes' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
