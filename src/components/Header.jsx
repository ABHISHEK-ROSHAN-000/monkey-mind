import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { settings } = useSite();
  const textLink = ({ isActive }) => (isActive ? 'active' : '');
  return (
    <>
      <header className="site-header">
        <div className="wrap topbar">
          <Link to="/" className="brand">MM Studio</Link>
          <nav className="topnav main-nav">
            <NavLink to="/" end className={textLink}>Index</NavLink>
            <NavLink to="/projects" className={textLink}>Projects</NavLink>
            <NavLink to="/info" className={textLink}>About</NavLink>
          </nav>
          <a className="topmail main-nav" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          <button className={`menu-btn${open ? ' open' : ''}`} onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>
            <span /><span />
          </button>
        </div>
      </header>
      {open && (
        <nav className="mobile-menu">
          <Link to="/" onClick={() => setOpen(false)}>Index</Link>
          <Link to="/projects" onClick={() => setOpen(false)}>Projects</Link>
          <Link to="/info" onClick={() => setOpen(false)}>About</Link>
        </nav>
      )}
    </>
  );
}
