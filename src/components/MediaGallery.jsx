export default function MediaGallery({ media, variant }) {
  if (!media?.length) return null;
  // Images only — legacy video entries are skipped.
  const sorted = [...media]
    .filter((m) => m.type !== 'video')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  if (!sorted.length) return null;
  return (
    <div className={variant === 'detail' ? 'gallery detail' : 'gallery'}>
      {sorted.map((m) => (
        <figure key={m.key}>
          <img src={m.url} alt={m.caption || ''} loading="lazy" />
          {m.caption && <figcaption>{m.caption}{m.type === 'gif' ? ' · GIF' : ''}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
