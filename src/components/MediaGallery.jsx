export default function MediaGallery({ media }) {
  if (!media?.length) return null;
  const sorted = [...media].sort((a, b) => (a.order || 0) - (b.order || 0));
  return (
    <div className="gallery">
      {sorted.map((m) => (
        <figure key={m.key}>
          {m.type === 'video' ? (
            <video src={m.url} controls playsInline preload="metadata" />
          ) : (
            <img src={m.url} alt={m.caption || ''} loading="lazy" />
          )}
          {m.caption && <figcaption>{m.caption}{m.type === 'gif' ? ' · GIF' : ''}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
