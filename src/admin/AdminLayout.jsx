import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase.js';
import { signOut } from 'firebase/auth';

export default function AdminLayout() {
  const nav = useNavigate();
  const logout = async () => {
    if (auth) { try { await signOut(auth); } catch { /* ignore */ } }
    nav('/admin/login', { replace: true });
  };
  const link = ({ isActive }) => (isActive ? 'on' : '');
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/" style={{ fontWeight: 700, padding: '10px 12px' }}>← MM Studio</Link>
        <NavLink to="/admin" end className={link}>Dashboard</NavLink>
        <NavLink to="/admin/projects" className={link}>Projects</NavLink>
        <NavLink to="/admin/categories" className={link}>Categories</NavLink>
        <NavLink to="/admin/featured" className={link}>Home Featured</NavLink>
        <NavLink to="/admin/about" className={link}>About / Info</NavLink>
        <button className="btn ghost" style={{ marginTop: 'auto' }} onClick={logout}>Logout</button>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  );
}
