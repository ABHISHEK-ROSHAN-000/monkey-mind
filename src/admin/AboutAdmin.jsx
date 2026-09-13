import { useEffect, useState } from 'react';
import { useSite } from '../lib/store.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AboutAdmin() {
  const s = useSite();
  const [home, setHome] = useState(s.settings.home);
  const [about, setAbout] = useState(s.settings.about);
  const [expertise, setExpertise] = useState(s.settings.expertise || []);
  const [testis, setTestis] = useState(s.settings.testimonials || []);
  const [socials, setSocials] = useState(s.settings.socials || []);
  const [contactEmail, setEmail] = useState(s.settings.contactEmail || '');
  const [location, setLocation] = useState(s.settings.location || '');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Follow live data until the admin starts editing locally.
  useEffect(() => {
    if (dirty) return;
    setHome(s.settings.home);
    setAbout(s.settings.about);
    setExpertise(s.settings.expertise || []);
    setTestis(s.settings.testimonials || []);
    setSocials(s.settings.socials || []);
    setEmail(s.settings.contactEmail || '');
    setLocation(s.settings.location || '');
  }, [s.settings, dirty]);

  const touch = (setter) => (v) => {
    setDirty(true);
    setter(v);
  };
  const setHomeD = touch(setHome);
  const setAboutD = touch(setAbout);
  const setExpertiseD = touch(setExpertise);
  const setTestisD = touch(setTestis);
  const setSocialsD = touch(setSocials);
  const setEmailD = touch(setEmail);
  const setLocationD = touch(setLocation);

  const save = async () => {
    if (contactEmail.trim() && !EMAIL_RE.test(contactEmail.trim())) {
      alert('Contact email looks invalid.');
      return;
    }
    const expertiseClean = expertise
      .filter((e) => (e.title || '').trim() || (e.text || '').trim())
      .map((e, i) => ({ n: String(e.n || `${i + 1}`), title: (e.title || '').trim(), text: (e.text || '').trim() }));
    const testisClean = testis
      .filter((t) => (t.quote || '').trim() || (t.name || '').trim())
      .map((t) => ({ quote: (t.quote || '').trim(), name: (t.name || '').trim(), role: (t.role || '').trim() }));
    const socialsClean = socials
      .filter((x) => (x.label || '').trim() || (x.url || '').trim())
      .map((x) => ({ label: (x.label || '').trim(), url: (x.url || '').trim() }));
    setSaving(true);
    try {
      await s.saveSettings({
        home,
        about,
        expertise: expertiseClean,
        testimonials: testisClean,
        socials: socialsClean,
        contactEmail: contactEmail.trim(),
        location: location.trim(),
      });
      setExpertise(expertiseClean);
      setTestis(testisClean);
      setSocials(socialsClean);
      setDirty(false);
      alert('Saved — live for everyone.');
    } catch (e) {
      alert(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (s.loading) return <p>Loading…</p>;

  return (
    <>
      <h1 style={{ marginTop: 0 }}>About / Info content</h1>
      <div className="card">
        <b>Home hero</b>
        <label>Hero title</label><input value={home.heroTitle} onChange={(e) => setHomeD({ ...home, heroTitle: e.target.value })} maxLength={120} />
        <label>Blurb</label><textarea rows={3} value={home.blurb} onChange={(e) => setHomeD({ ...home, blurb: e.target.value })} />
      </div>
      <div className="card">
        <b>About</b>
        <label>Title</label><input value={about.title} onChange={(e) => setAboutD({ ...about, title: e.target.value })} maxLength={120} />
        <label>Lede</label><textarea rows={3} value={about.lede} onChange={(e) => setAboutD({ ...about, lede: e.target.value })} />
        <label>Body</label><textarea rows={4} value={about.body} onChange={(e) => setAboutD({ ...about, body: e.target.value })} />
      </div>
      <div className="card">
        <b>Expertise ({expertise.length})</b>
        {expertise.map((e, i) => (
          <div key={i} className="row" style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
            <input style={{ maxWidth: 60 }} value={e.n} onChange={(ev) => setExpertiseD(expertise.map((x, k) => (k === i ? { ...x, n: ev.target.value } : x)))} maxLength={8} />
            <input style={{ flex: 1 }} value={e.title} onChange={(ev) => setExpertiseD(expertise.map((x, k) => (k === i ? { ...x, title: ev.target.value } : x)))} maxLength={80} />
            <input style={{ flex: 3 }} value={e.text} onChange={(ev) => setExpertiseD(expertise.map((x, k) => (k === i ? { ...x, text: ev.target.value } : x)))} maxLength={300} />
            <button className="btn danger" onClick={() => setExpertiseD(expertise.filter((_, k) => k !== i))}>✕</button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setExpertiseD([...expertise, { n: `${expertise.length + 1}`, title: 'New service', text: 'Describe it…' }])}>+ Add service</button>
        </div>
      </div>
      <div className="card">
        <b>Testimonials ({testis.length}) — CMS-managed ✓</b>
        {testis.map((t, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
            <textarea rows={2} value={t.quote} onChange={(e) => setTestisD(testis.map((x, k) => (k === i ? { ...x, quote: e.target.value } : x)))} />
            <div className="row">
              <input value={t.name} onChange={(e) => setTestisD(testis.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} placeholder="Name" />
              <input value={t.role} onChange={(e) => setTestisD(testis.map((x, k) => (k === i ? { ...x, role: e.target.value } : x)))} placeholder="Role" />
              <button className="btn danger" onClick={() => setTestisD(testis.filter((_, k) => k !== i))}>✕</button>
            </div>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setTestisD([...testis, { quote: 'New quote…', name: 'Name', role: 'Role' }])}>+ Add testimonial</button>
        </div>
      </div>
      <div className="card">
        <b>Social links ({socials.length})</b>
        {socials.map((x, i) => (
          <div key={i} className="row" style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
            <input style={{ flex: 1 }} value={x.label} onChange={(e) => setSocialsD(socials.map((y, k) => (k === i ? { ...y, label: e.target.value } : y)))} placeholder="Instagram" maxLength={40} />
            <input style={{ flex: 3 }} value={x.url} onChange={(e) => setSocialsD(socials.map((y, k) => (k === i ? { ...y, url: e.target.value } : y)))} placeholder="https://…" maxLength={300} />
            <button className="btn danger" onClick={() => setSocialsD(socials.filter((_, k) => k !== i))}>✕</button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setSocialsD([...socials, { label: 'Instagram', url: 'https://' }])}>+ Add link</button>
        </div>
      </div>
      <div className="card">
        <b>Contact / footer</b>
        <label>Email</label><input value={contactEmail} onChange={(e) => setEmailD(e.target.value)} maxLength={120} />
        <label>Location</label><input value={location} onChange={(e) => setLocationD(e.target.value)} maxLength={120} />
      </div>
      <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save all'}</button>
    </>
  );
}
