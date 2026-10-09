import { useEffect, useRef, useState } from 'react';
import { useSite } from '../lib/store.jsx';
import { WorkFeed, WorkGrid } from '../components/WorkViews.jsx';
import Marquee from '../components/Marquee.jsx';

export default function Projects() {
  const { categories, publishedProjects, syncError } = useSite();
  const [tab, setTab] = useState('all');
  const switchRef = useRef(null);
  // Mobile shows the stacked feed; desktop keeps the grid.
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 768px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const yy = String(new Date().getFullYear()).slice(-2);
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const active = sorted.find((c) => c.id === tab);

  // Dynamic scroll-edge fades: mark which ends of the tab row are scrollable
  // (mobile CSS fades the marked ends). Re-runs when CMS categories arrive.
  useEffect(() => {
    const el = switchRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      el.classList.toggle('can-left', el.scrollLeft > 4);
      el.classList.toggle('can-right', el.scrollLeft < max - 4);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sorted.length]);
  const items = tab === 'all'
    ? [...publishedProjects].sort((a, b) => a.order - b.order)
    : publishedProjects.filter((p) => (p.categoryIds || []).includes(tab));
  return (
    <div className="projects-page">
      <section className="hero" style={{ paddingBottom: 0 }}>
        <Marquee text={`WORKS (20-${yy})`} />
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
        <nav ref={switchRef} className="cat-switch" aria-label="Categories">
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
      )}
      {sorted.length > 0 && (
        <div className="view-stage" key={tab} data-view="projects">
          {items.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>
              {tab === 'all' ? 'No published projects yet.' : `No published projects in ${active?.name || 'this category'} yet.`}
            </p>
          ) : (
            isMobile ? <WorkFeed items={items} /> : <WorkGrid items={items} />
          )}
        </div>
      )}
    </div>
  );
}
