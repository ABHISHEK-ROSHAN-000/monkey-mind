import { deliveryUrl } from '../lib/cloudinary.js';

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function MediaGallery({ media, variant }) {
  if (!media?.length) return null;
  const sorted = [...media].sort((a, b) => (a.order || 0) - (b.order || 0));
  if (!sorted.length) return null;
  // Videos loop silently (reduced-motion: paused with controls instead).
  const autoplay = !reduceMotion();
  return (
    <div className={variant === 'detail' ? 'gallery detail' : 'gallery'}>
      {sorted.map((m) => (
        <figure key={m.key}>
          {m.type === 'video' ? (
            <video
              src={deliveryUrl(m, { w: 1600 })}
              muted
              loop
              playsInline
              preload="metadata"
              ref={(el) => { if (el) el.muted = true; }}
              {...(autoplay ? { autoPlay: true } : { controls: true })}
            />
          ) : (
            <img src={deliveryUrl(m, { w: 1600 })} alt={m.caption || ''} loading="lazy" />
          )}
          {m.caption && <figcaption>{m.caption}{m.type === 'gif' ? ' · GIF' : ''}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
