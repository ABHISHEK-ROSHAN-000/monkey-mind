import { useSite } from '../lib/store.jsx';

export default function Expertise() {
  const { settings } = useSite();
  return (
    <section className="expertise">
      <div className="exp-head">
        <div className="exp-label-wrap">
          <p className="exp-label">Our Expertise</p>
        </div>
        <div className="exp-lede-wrap">
          <p className="lede">{settings.about.lede}</p>
        </div>
      </div>
      <div className="exp-rows">
        {settings.expertise.map((e) => (
          <div className="exp-row" key={e.title}>
            <div className="exp-num-wrap">
              <div className="n">{e.n}</div>
            </div>
            <div className="exp-content-wrap">
              <h3>{e.title}</h3>
              <p>{e.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
