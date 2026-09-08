import { useState } from 'react';
import { useSite } from '../lib/store.jsx';

export default function AboutAdmin() {
  const s = useSite();
  const [home, setHome] = useState(s.settings.home);
  const [about, setAbout] = useState(s.settings.about);
  const [expertise, setExpertise] = useState(s.settings.expertise);
  const [testis, setTestis] = useState(s.settings.testimonials);
  const [contactEmail, setEmail] = useState(s.settings.contactEmail);
  const [location, setLocation] = useState(s.settings.location);

  const save = () => {
    s.saveSettings({ home, about, expertise, testimonials: testis, contactEmail, location });
    alert('Saved');
  };

  return (
    <>
      <h1 style={{ marginTop: 0 }}>About / Info content</h1>
      <div className="card">
        <b>Home hero</b>
        <label>Hero title</label><input value={home.heroTitle} onChange={(e) => setHome({ ...home, heroTitle: e.target.value })} />
        <label>Blurb</label><textarea rows={3} value={home.blurb} onChange={(e) => setHome({ ...home, blurb: e.target.value })} />
      </div>
      <div className="card">
        <b>About</b>
        <label>Title</label><input value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} />
        <label>Lede</label><textarea rows={3} value={about.lede} onChange={(e) => setAbout({ ...about, lede: e.target.value })} />
        <label>Body</label><textarea rows={4} value={about.body} onChange={(e) => setAbout({ ...about, body: e.target.value })} />
      </div>
      <div className="card">
        <b>Expertise ({expertise.length})</b>
        {expertise.map((e, i) => (
          <div key={i} className="row" style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
            <input style={{ maxWidth: 60 }} value={e.n} onChange={(ev) => setExpertise(expertise.map((x, k) => (k === i ? { ...x, n: ev.target.value } : x)))} />
            <input style={{ flex: 1 }} value={e.title} onChange={(ev) => setExpertise(expertise.map((x, k) => (k === i ? { ...x, title: ev.target.value } : x)))} />
            <input style={{ flex: 3 }} value={e.text} onChange={(ev) => setExpertise(expertise.map((x, k) => (k === i ? { ...x, text: ev.target.value } : x)))} />
            <button className="btn danger" onClick={() => setExpertise(expertise.filter((_, k) => k !== i))}>✕</button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setExpertise([...expertise, { n: `0${expertise.length + 1}`, title: 'New service', text: 'Describe it…' }])}>+ Add service</button>
        </div>
      </div>
      <div className="card">
        <b>Testimonials ({testis.length}) — CMS-managed ✓</b>
        {testis.map((t, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
            <textarea rows={2} value={t.quote} onChange={(e) => setTestis(testis.map((x, k) => (k === i ? { ...x, quote: e.target.value } : x)))} />
            <div className="row">
              <input value={t.name} onChange={(e) => setTestis(testis.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} />
              <input value={t.role} onChange={(e) => setTestis(testis.map((x, k) => (k === i ? { ...x, role: e.target.value } : x)))} />
              <button className="btn danger" onClick={() => setTestis(testis.filter((_, k) => k !== i))}>✕</button>
            </div>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setTestis([...testis, { quote: 'New quote…', name: 'Name', role: 'Role' }])}>+ Add testimonial</button>
        </div>
      </div>
      <div className="card">
        <b>Contact / footer</b>
        <label>Email</label><input value={contactEmail} onChange={(e) => setEmail(e.target.value)} />
        <label>Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <button className="btn" onClick={save}>Save all</button>
    </>
  );
}
