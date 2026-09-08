import { useState } from 'react';
import { useSite } from '../lib/store.jsx';
import Expertise from '../components/Expertise.jsx';
import { WorkGrid, WorkList, WorkFeed, WorkFull, ViewSwitcher } from '../components/WorkViews.jsx';

export default function Home() {
  const { publishedProjects, featuredProjects, settings } = useSite();
  const [view, setView] = useState('grid');
  // Selected Works grid is a fixed 8 boxes: featured first (in featured order),
  // then filled with remaining published projects by order.
  const selected = (() => {
    const out = [...featuredProjects];
    if (out.length < 8) {
      const have = new Set(out.map((p) => p.id));
      for (const p of publishedProjects) {
        if (out.length >= 8) break;
        if (!have.has(p.id)) out.push(p);
      }
    }
    return out.slice(0, 8);
  })();

  return (
    <>
      <section className="hero hero-home">
        <h1>MONKEY<br />MIND</h1>
        <p className="blurb">{settings.home.blurb}</p>
        <div className="hero-social">
          {settings.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
          ))}
        </div>
      </section>

      <div className="sec-head">
        <div className="sec-title">
          <h2>Selected Works<sup>({publishedProjects.length})</sup></h2>
        </div>
        <ViewSwitcher view={view} setView={setView} />
      </div>
      {view === 'grid' && <WorkGrid items={selected} />}
      {view === 'list' && <WorkList items={selected} />}
      {view === 'feed' && <WorkFeed items={selected} />}
      {view === 'full' && <WorkFull items={selected} />}

      <Expertise />
    </>
  );
}
