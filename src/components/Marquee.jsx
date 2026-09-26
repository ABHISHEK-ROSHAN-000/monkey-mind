export default function Marquee({ text, units = 6 }) {
  return (
    <div className="marquee" aria-label={text}>
      <div className="marquee-track" aria-hidden="true">
        {Array.from({ length: units }).map((_, i) => (
          <span key={i} className="marquee-unit">{text}</span>
        ))}
      </div>
    </div>
  );
}
