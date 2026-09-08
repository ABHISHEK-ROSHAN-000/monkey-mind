import { useSite } from '../lib/store.jsx';

export default function Testimonials() {
  const { settings } = useSite();
  if (!settings.testimonials?.length) return null;
  return (
    <section className="testis">
      <div className="testi-head">
        <p className="testi-label">Testimonials</p>
        <h2>Meet the people who experienced our work firsthand and share what made the collaboration truly meaningful.</h2>
      </div>
      <div className="testi-track">
        {settings.testimonials.map((t, i) => {
          const parts = String(t.role || '').split('—');
          const company = parts.length > 1 ? parts.pop().trim() : '';
          return (
            <div className="testi" key={i}>
              {company && <p className="testi-brand">{company}</p>}
              <q>{t.quote}</q>
              <p className="who">{t.name}</p>
              <p className="role">{t.role}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
