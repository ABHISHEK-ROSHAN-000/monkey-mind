import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';
import { useTheme } from '../lib/theme.js';
import mmMarkLight from '../assets/mm-logo/mm-logo-05.svg';
import mmMarkDark from '../assets/mm-logo/mm-logo-11.svg';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { settings } = useSite();
  const { theme, toggle } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const textLink = ({ isActive }) => (isActive ? 'active' : '');
  return (
    <>
      <header className="site-header">
        <div className="wrap topbar">
          <Link to="/" className="brand" aria-label="Monkey Mind">
            <img
              className="brand-logo"
              src={theme === 'dark' ? mmMarkDark : mmMarkLight}
              alt=""
              aria-hidden="true"
              draggable="false"
            />
          </Link>
          <div className="topbar-right">
            <nav className="topnav main-nav">
              <NavLink to="/" end className={textLink}>Index</NavLink>
              <NavLink to="/projects" className={textLink}>Projects</NavLink>
              <NavLink to="/info" className={textLink}>About</NavLink>
            </nav>
            <a className="topmail main-nav" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={`Switch to ${nextTheme} mode`}
            title={`Switch to ${nextTheme} mode`}
          >
            {nextTheme === 'dark' ? 'Dark' : 'Light'}
          </button>
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
