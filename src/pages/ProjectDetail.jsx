import { Link, useParams } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';
import MediaGallery from '../components/MediaGallery.jsx';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { getProject } = useSite();
  const p = getProject(slug);
  if (!p || p.status !== 'published') {
    return (
      <section className="hero">
        <h1>NOT<br />FOUND</h1>
        <p className="blurb">This project is missing or unpublished. <Link to="/projects" style={{ textDecoration: 'underline' }}>Back to projects</Link></p>
      </section>
    );
  }
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
      <MediaGallery
        variant="detail"
        media={p.media?.length ? p.media : [{ key: 'cover', type: 'image', url: p.cover, order: 0 }]}
      />
    </>
  );
}
