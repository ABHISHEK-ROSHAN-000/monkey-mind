import { useSite } from '../lib/store.jsx';

export default function Testimonials() {
  const { settings } = useSite();
  const items = settings.testimonials || [];
  if (!items.length) return null;
  const slides = [...items, ...items]; // two identical halves = seamless -50% loop
  return (
    <section className="testis">
      <div className="testi-head">
        <p className="testi-label">Testimonials</p>
        <h2>Meet the people who experienced our work firsthand and share what made the collaboration truly meaningful.</h2>
      </div>
      <div className="testi-marquee">
        <div className="testi-track flow">
          {slides.map((t, i) => {
            const parts = String(t.role || '').split('—');
            const company = parts.length > 1 ? parts.pop().trim() : '';
            return (
              <div className="testi" key={i} aria-hidden={i >= items.length}>
                {company && <p className="testi-brand">{company}</p>}
                <q>{t.quote}</q>
                <p className="who">{t.name}</p>
                <p className="role">{t.role}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
