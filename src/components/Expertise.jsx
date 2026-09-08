import { useSite } from '../lib/store.jsx';

export default function Expertise() {
  const { settings } = useSite();
  return (
    <section className="expertise">
      <p style={{ color: 'var(--muted)' }}>Our Expertise</p>
      <p className="lede">{settings.about.lede}</p>
      <div className="exp-grid">
        {settings.expertise.map((e) => (
          <div className="exp-card" key={e.title}>
            <div className="n">{e.n}</div>
            <h3>{e.title}</h3>
            <p>{e.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
