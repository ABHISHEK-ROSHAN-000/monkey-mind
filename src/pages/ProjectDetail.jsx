import { Link, useParams } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';
import MediaGallery from '../components/MediaGallery.jsx';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { getProject, publishedProjects } = useSite();
  const p = getProject(slug);
  if (!p || p.status !== 'published') {
    return (
      <section className="hero">
        <h1>NOT<br />FOUND</h1>
        <p className="blurb">This project is missing or unpublished. <Link to="/projects" style={{ textDecoration: 'underline' }}>Back to projects</Link></p>
      </section>
    );
  }
  const idx = publishedProjects.findIndex((x) => x.id === p.id);
  const prev = publishedProjects[idx - 1];
  const next = publishedProjects[idx + 1];
  return (
    <>
      <section className="detail-hero">
        <h1>{p.title}</h1>
        <p>{p.body}</p>
        <div className="detail-meta">
          <span>{p.year}</span>
          <span>{p.tags?.join(', ')}</span>
        </div>
      </section>
      <MediaGallery media={p.media?.length ? p.media : [{ key: 'cover', type: 'image', url: p.cover, order: 0 }]} />
      <div className="pager">
        <span>{prev ? <Link to={`/p/${prev.slug}`}>← {prev.title}</Link> : <span />}</span>
        <span>{next ? <Link to={`/p/${next.slug}`}>{next.title} →</Link> : <span />}</span>
      </div>
    </>
  );
}
