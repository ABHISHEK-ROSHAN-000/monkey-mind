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
        <div className="card"><p>Loading live data from Firebase…</p></div>
      </>
    );
  }
  return (
    <>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      {s.syncError && (
        <div className="card"><p style={{ color: '#b3261e' }}>{s.syncError}</p></div>
      )}
      <div className="row">
        <div className="card" style={{ flex: 1, minWidth: 160 }}><b>{s.projects.length}</b><div>Projects</div></div>
        <div className="card" style={{ flex: 1, minWidth: 160 }}><b>{s.publishedProjects.length}</b><div>Published</div></div>
        <div className="card" style={{ flex: 1, minWidth: 160 }}><b>{s.categories.length}</b><div>Categories</div></div>
        <div className="card" style={{ flex: 1, minWidth: 160 }}><b>{s.featuredProjects.length}</b><div>Featured</div></div>
      </div>
      <div className="card">
        <b>Integrations</b>
        <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
          Firebase: {isFirebaseConfigured ? 'configured ✓ — CMS data is live for everyone' : 'not configured — set VITE_FIREBASE_* (see .env.example)'}<br />
          Cloudinary: {isCloudinaryConfigured ? 'configured ✓ — uploads are permanent' : 'not configured — uploads are blocked until VITE_CLOUDINARY_* is set'}
        </p>
        <div className="row">
          <Link className="btn" to="/admin/projects">Manage projects</Link>
        </div>
      </div>
      <div className="card">
        <b>Recent projects</b>
        {s.projects.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>No projects yet — create the first one in <Link to="/admin/projects">Projects</Link>.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Title</th><th>Status</th><th>Featured</th></tr></thead>
            <tbody>
              {[...s.projects].sort((a, b) => b.order - a.order).slice(0, 5).map((p) => (
                <tr key={p.id}><td><Link to={`/p/${p.slug}`}>{p.title || 'Untitled'}</Link></td><td>{p.status}</td><td>{p.featured ? `#${p.featuredOrder}` : '—'}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
