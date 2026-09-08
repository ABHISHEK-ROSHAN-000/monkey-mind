import { useSite } from '../lib/store.jsx';

export default function Testimonials() {
  const { settings } = useSite();
  if (!settings.testimonials?.length) return null;
  return (
    <section className="testis">
      <p style={{ color: 'var(--muted)' }}>Testimonials</p>
      <h2 style={{ fontWeight: 500 }}>Meet the people who experienced our work firsthand.</h2>
      <div className="testi-track">
        {settings.testimonials.map((t, i) => (
          <div className="testi" key={i}>
            <q>{t.quote}</q>
            <div className="who">{t.name} — {t.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
