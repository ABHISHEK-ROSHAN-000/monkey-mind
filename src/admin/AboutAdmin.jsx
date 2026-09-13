import { useEffect, useState } from 'react';
import { useSite } from '../lib/store.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const muted = { color: 'var(--muted)', fontSize: '.85rem', marginTop: 4 };

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
  const [savedTick, setSavedTick] = useState(false);

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
    setSavedTick(false);
    setter(v);
  };
  const setHomeD = touch(setHome);
  const setAboutD = touch(setAbout);
  const setExpertiseD = touch(setExpertise);
  const setTestisD = touch(setTestis);
  const setSocialsD = touch(setSocials);
  const setEmailD = touch(setEmail);
  const setLocationD = touch(setLocation);

  const askDelete = (what) => confirm(`Remove this ${what}? This goes live when you save.`);

  const save = async () => {
    if (contactEmail.trim() && !EMAIL_RE.test(contactEmail.trim())) {
      alert('That email address doesn\u2019t look right. Please check it.');
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
      setSavedTick(true);
    } catch (e) {
      alert(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (s.loading) return <p>Loading…</p>;

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Website texts</h1>
      <p style={muted}>Everything written on the website, in one place. Saving puts it live immediately.</p>
      <div className="card">
        <b>Home page intro</b>
        <p style={muted}>Shows on: home page, next to MONKEY MIND.</p>
        <label>Intro text</label><textarea rows={3} value={home.blurb} onChange={(e) => setHomeD({ ...home, blurb: e.target.value })} />
      </div>
      <div className="card">
        <b>About intro</b>
        <p style={muted}>Shows on: Info page, next to “Our Expertise”.</p>
        <label>Title</label><input value={about.title} onChange={(e) => setAboutD({ ...about, title: e.target.value })} maxLength={120} />
        <label>Intro text</label><textarea rows={3} value={about.lede} onChange={(e) => setAboutD({ ...about, lede: e.target.value })} />
      </div>
      <div className="card">
        <b>Services ({expertise.length})</b>
        <p style={muted}>Shows on: Info page, as a numbered list. Number, name and one-line description per row.</p>
        {expertise.map((e, i) => (
          <div key={i} className="row" style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
            <div><label>Number</label><input style={{ maxWidth: 60 }} value={e.n} onChange={(ev) => setExpertiseD(expertise.map((x, k) => (k === i ? { ...x, n: ev.target.value } : x)))} maxLength={8} /></div>
            <div style={{ flex: 1 }}><label>Service name (max 80)</label><input value={e.title} onChange={(ev) => setExpertiseD(expertise.map((x, k) => (k === i ? { ...x, title: ev.target.value } : x)))} maxLength={80} /></div>
            <div style={{ flex: 3 }}><label>Description (max 300)</label><input value={e.text} onChange={(ev) => setExpertiseD(expertise.map((x, k) => (k === i ? { ...x, text: ev.target.value } : x)))} maxLength={300} /></div>
            <button className="btn danger" onClick={() => { if (askDelete('service')) setExpertiseD(expertise.filter((_, k) => k !== i)); }}>✕</button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setExpertiseD([...expertise, { n: `${expertise.length + 1}`, title: 'New service', text: 'Describe it…' }])}>+ Add service</button>
        </div>
      </div>
      <div className="card">
        <b>Customer reviews ({testis.length})</b>
        <p style={muted}>Shows on: bottom of the Info page.</p>
        {testis.map((t, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
            <label>Review</label>
            <textarea rows={2} value={t.quote} onChange={(e) => setTestisD(testis.map((x, k) => (k === i ? { ...x, quote: e.target.value } : x)))} />
            <div className="row">
              <div style={{ flex: 1 }}><label>Name</label><input value={t.name} onChange={(e) => setTestisD(testis.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} placeholder="Name" /></div>
              <div style={{ flex: 1 }}><label>Job title</label><input value={t.role} onChange={(e) => setTestisD(testis.map((x, k) => (k === i ? { ...x, role: e.target.value } : x)))} placeholder="Role" /></div>
              <button className="btn danger" onClick={() => { if (askDelete('review')) setTestisD(testis.filter((_, k) => k !== i)); }}>✕</button>
            </div>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setTestisD([...testis, { quote: 'New quote…', name: 'Name', role: 'Role' }])}>+ Add review</button>
        </div>
      </div>
      <div className="card">
        <b>Social links ({socials.length})</b>
        <p style={muted}>Shows on: top bar and bottom of the website. Full addresses starting with https://</p>
        {socials.map((x, i) => (
          <div key={i} className="row" style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
            <div style={{ flex: 1 }}><label>Link name (max 40)</label><input value={x.label} onChange={(e) => setSocialsD(socials.map((y, k) => (k === i ? { ...y, label: e.target.value } : y)))} placeholder="Instagram" maxLength={40} /></div>
            <div style={{ flex: 3 }}><label>Address</label><input value={x.url} onChange={(e) => setSocialsD(socials.map((y, k) => (k === i ? { ...y, url: e.target.value } : y)))} placeholder="https://…" maxLength={300} /></div>
            <button className="btn danger" onClick={() => { if (askDelete('link')) setSocialsD(socials.filter((_, k) => k !== i)); }}>✕</button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setSocialsD([...socials, { label: 'Instagram', url: 'https://' }])}>+ Add link</button>
        </div>
      </div>
      <div className="card">
        <b>Contact</b>
        <p style={muted}>Shows on: top bar and bottom of the website.</p>
        <label>Email</label><input value={contactEmail} onChange={(e) => setEmailD(e.target.value)} maxLength={120} />
        <label>Location</label><input value={location} onChange={(e) => setLocationD(e.target.value)} maxLength={120} />
      </div>
      <div className="row" style={{ alignItems: 'center' }}>
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save all changes'}</button>
        {savedTick && !dirty && <span style={{ color: '#1e7e34', fontWeight: 600 }}>Saved ✓ live on the website</span>}
      </div>
    </>
  );
}
