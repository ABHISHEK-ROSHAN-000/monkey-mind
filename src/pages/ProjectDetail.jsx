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
  const brief = (p.body || '').trim();
  const approach = (p.approach || '').trim();
  const company = (p.company || '').trim();
  const timeline = (p.timeline || p.year || '').trim();
  const duration = (p.duration || '').trim();
  const tags = (p.tags || []).filter(Boolean);
  const hasFacts = tags.length > 0 || company || timeline || duration;

  return (
    <>
      <section className="detail-hero">
        <h1>{p.title}</h1>
        <div className="detail-grid">
          <div className="detail-brief">
            {brief && (
              <div className="detail-block">
                <p className="detail-label">Project Brief</p>
                <p className="detail-copy">{brief}</p>
              </div>
            )}
            {hasFacts && (
              <dl className="detail-meta">
                {tags.length > 0 && (
                  <div className="detail-meta-item">
                    <dt>Service</dt>
                    <dd>{tags.join(', ')}</dd>
                  </div>
                )}
                {company && (
                  <div className="detail-meta-item">
                    <dt>Company</dt>
                    <dd>{company}</dd>
                  </div>
                )}
                {timeline && (
                  <div className="detail-meta-item">
                    <dt>Timeline</dt>
                    <dd>{timeline}</dd>
                  </div>
                )}
                {duration && (
                  <div className="detail-meta-item">
                    <dt>Duration</dt>
                    <dd>{duration}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
          {approach && (
            <div className="detail-approach">
              <p className="detail-label">Our Approach</p>
              <p className="detail-copy">{approach}</p>
            </div>
          )}
        </div>
      </section>
      <MediaGallery
        variant="detail"
        media={p.media?.length ? p.media : (p.cover ? [{ key: 'cover', type: 'image', url: p.cover, order: 0 }] : [])}
      />
    </>
  );
}
