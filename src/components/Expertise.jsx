import { useSite } from '../lib/store.jsx';

export default function Expertise() {
  const { settings } = useSite();
  return (
    <section className="expertise">
      <div className="exp-head">
        <p className="exp-label">Our Expertise</p>
        <p className="lede">{settings.about.lede}</p>
      </div>
      <div className="exp-rows">
        {settings.expertise.map((e) => (
          <div className="exp-row" key={e.title}>
            <div className="n">{e.n}</div>
            <h3>{e.title}</h3>
            <p>{e.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
