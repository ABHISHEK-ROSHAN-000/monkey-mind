import { useSite } from '../lib/store.jsx';
import InfoHero from '../components/InfoHero.jsx';
import Expertise from '../components/Expertise.jsx';
import Testimonials from '../components/Testimonials.jsx';

export default function About() {
  const { settings } = useSite();
  return (
    <>
      <InfoHero />
      <section className="hero">
        <p className="blurb">{settings.about.body}</p>
        <div className="hero-social">
          {settings.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
          ))}
        </div>
      </section>
      {settings.about.images?.length > 0 && (
        <div className="works-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {settings.about.images.map((src, i) => (
            <div className="work-tile" key={i}>
              <img src={src} alt={`Studio ${i + 1}`} loading="lazy" />
            </div>
          ))}
        </div>
      )}
      <Expertise />
      <Testimonials />
    </>
  );
}
