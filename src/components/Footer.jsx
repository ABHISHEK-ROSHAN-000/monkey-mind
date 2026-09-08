import { Link } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';

export default function Footer() {
  const { settings } = useSite();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <p style={{ fontSize: '.82rem', fontWeight: 500, margin: '0 0 6px' }}>Inquiries</p>
            <a className="mail" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
            <p style={{ fontSize: '.82rem', fontWeight: 500, margin: '18px 0 6px' }}>Based in</p>
            <p style={{ margin: 0, fontSize: '.8rem', fontWeight: 500 }}>{settings.location}</p>
            <nav className="foot-nav">
              <Link to="/">Index</Link>
              <Link to="/projects">Projects</Link>
              <Link to="/info">Info</Link>
            </nav>
          </div>
          <div>
            <p className="big">Let&apos;s build something great together.</p>
            <p><a className="mail" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
