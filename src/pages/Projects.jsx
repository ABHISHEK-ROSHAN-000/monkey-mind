import { useSite } from '../lib/store.jsx';
import { WorkGrid } from '../components/WorkViews.jsx';

export default function Projects() {
  const { categories, publishedProjects, settings } = useSite();
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1>Worked on</h1>
        <p className="blurb">Every project grouped by discipline. Pick a category to jump in.</p>
        <div className="hero-social">
          {settings.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
          ))}
        </div>
      </section>
      {sorted.map((c) => {
        const items = publishedProjects.filter((p) => p.categoryIds.includes(c.id));
        return (
          <section className="cat-group" key={c.id} id={c.slug}>
            <h3>{c.name} <sup>({items.length})</sup></h3>
            {items.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No published projects yet.</p>
            ) : (
              <WorkGrid items={items} />
            )}
          </section>
        );
      })}
    </>
  );
}
