import { useState } from 'react';
import { useSite } from '../lib/store.jsx';
import { WorkGrid } from '../components/WorkViews.jsx';

export default function Projects() {
  const { categories, publishedProjects, syncError } = useSite();
  const [tab, setTab] = useState('all');
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const active = sorted.find((c) => c.id === tab);
  const items = tab === 'all'
    ? [...publishedProjects].sort((a, b) => a.order - b.order)
    : publishedProjects.filter((p) => (p.categoryIds || []).includes(tab));
  return (
    <div className="projects-page">
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1>Worked on</h1>
        {/* <p className="blurb">Every project grouped by discipline. Pick a category to jump in.</p> */}
        {/* <div className="hero-social">
          {settings.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
          ))}
        </div> */}
      </section>
      {syncError && (
        <p style={{ color: '#b3261e' }}>Couldn't load content: {syncError}</p>
      )}
      {sorted.length === 0 && !syncError && (
        <p style={{ color: 'var(--muted)' }}>No categories yet — add them in the CMS.</p>
      )}
      {sorted.length > 0 && (
        <div className="sec-head">
          <div className="sec-title">
            <h2>Categories</h2>
          </div>
          <nav className="cat-switch" aria-label="Categories">
            <button
              key="all"
              className={tab === 'all' ? 'on' : ''}
              onClick={() => setTab('all')}
            >
              All ({publishedProjects.length})
            </button>
            {sorted.map((c) => {
              const n = publishedProjects.filter((p) => (p.categoryIds || []).includes(c.id)).length;
              return (
                <button
                  key={c.id}
                  className={tab === c.id ? 'on' : ''}
                  onClick={() => setTab(c.id)}
                >
                  {c.name} ({n})
                </button>
              );
            })}
          </nav>
        </div>
      )}
      {sorted.length > 0 && (
        <div className="view-stage" key={tab} data-view="projects">
          {items.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>
              {tab === 'all' ? 'No published projects yet.' : `No published projects in ${active?.name || 'this category'} yet.`}
            </p>
          ) : (
            <WorkGrid items={items} />
          )}
        </div>
      )}
    </div>
  );
}
