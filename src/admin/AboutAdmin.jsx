import { useEffect, useMemo, useState } from 'react';
import { useSite } from '../lib/store.jsx';
import { isCloudinaryConfigured, uploadToCloudinary } from '../lib/cloudinary.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const muted = { color: 'var(--muted)', fontSize: '.85rem', marginTop: 4 };
const IMG_MAX_MB = 10;
const OK_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const INFO_CAP = 12; // mosaic map has exactly 12 position slots
const ikey = () => `g-${Math.random().toString(36).slice(2, 8)}`;

export default function AboutAdmin() {
  const s = useSite();
  const [home, setHome] = useState(s.settings.home);
  const [about, setAbout] = useState(s.settings.about);
  const [expertise, setExpertise] = useState(s.settings.expertise || []);
  const [testis, setTestis] = useState(s.settings.testimonials || []);
  const [socials, setSocials] = useState(s.settings.socials || []);
  const [contactEmail, setEmail] = useState(s.settings.contactEmail || '');
  const [location, setLocation] = useState(s.settings.location || '');
  const [infoGrid, setInfoGrid] = useState(s.settings.infoGrid || []);
  const [footerImages, setFooterImages] = useState(s.settings.footerImages || []);
  const [infoBusy, setInfoBusy] = useState(false);
  const [infoErr, setInfoErr] = useState('');
  const [footBusy, setFootBusy] = useState(false);
  const [footErr, setFootErr] = useState('');
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
    setInfoGrid(s.settings.infoGrid || []);
    setFooterImages(s.settings.footerImages || []);
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

  // Every project photo/cover/thumbnail, deduped — the pick source for both cards.
  const library = useMemo(() => {
    const seen = new Set();
    const out = [];
    const push = (url, publicId, name) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      out.push({ url, publicId: publicId || null, name: name || '' });
    };
    (s.publishedProjects || []).forEach((p) => {
      (p.media || []).forEach((m) => {
        if (m.type !== 'video') push(m.url, m.publicId, m.name || m.caption);
      });
      if (p.cover) push(p.cover, null, '');
      if (p.thumbnail?.url) push(p.thumbnail.url, p.thumbnail.publicId, '');
    });
    return out;
  }, [s.publishedProjects]);

  const uploadInto = async (files, list, setList, setBusyF, setErrF, cap) => {
    setErrF('');
    const arr = [...(files || [])];
    if (!arr.length) return;
    if (!isCloudinaryConfigured) {
      setErrF('Photo uploads aren\u2019t working right now. Contact your developer.');
      return;
    }
    if (cap && list.length + arr.length > cap) {
      setErrF(`The grid holds max ${cap} photos. Remove one to add another.`);
      return;
    }
    setBusyF(true);
    const errs = [];
    const done = [];
    try {
      for (const f of arr) {
        if (!OK_IMAGE_TYPES.includes(f.type)) {
          errs.push(`${f.name || 'File'}: only JPG, PNG, WebP or GIF, please.`);
          continue;
        }
        if (f.size > IMG_MAX_MB * 1024 * 1024) {
          errs.push(`${f.name}: bigger than ${IMG_MAX_MB}MB — please use a smaller photo.`);
          continue;
        }
        try {
          const u = await uploadToCloudinary(f);
          done.push({ key: ikey(), url: u.url, publicId: u.publicId, name: u.originalFilename || f.name || '' });
        } catch (e) {
          errs.push(`${f.name}: ${e?.message || 'upload failed.'}`);
        }
      }
      if (done.length) {
        setDirty(true);
        setSavedTick(false);
        setList((prev) => [...prev, ...done]);
      }
    } finally {
      setBusyF(false);
      setErrF(errs.join(' '));
    }
  };

  const pickInto = (item, list, setList, cap) => {
    if (cap && list.length >= cap) return;
    if (list.some((x) => x.url === item.url)) return;
    setDirty(true);
    setSavedTick(false);
    setList((prev) => [...prev, { key: ikey(), url: item.url, publicId: item.publicId || null, name: item.name || '' }]);
  };

  const moveImg = (list, setList, i, dir) => {
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    setDirty(true);
    setSavedTick(false);
    const a = [...list];
    [a[i], a[j]] = [a[j], a[i]];
    setList(a);
  };

  const delImg = (list, setList, i, what) => {
    if (!askDelete(what)) return;
    setDirty(true);
    setSavedTick(false);
    setList(list.filter((_, k) => k !== i));
  };

  const photoRows = (list, setList, numbered) => list.map((x, i) => (
    <div key={x.key || i} className="row" style={{ borderBottom: '1px solid var(--line)', padding: '8px 0', alignItems: 'center' }}>
      <img src={x.url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} loading="lazy" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{numbered ? `Position ${i + 1}` : `Photo ${i + 1}`}</div>
        <div style={{ color: 'var(--muted)', fontSize: '.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={x.name || x.url}>{x.name || 'Untitled file'}</div>
      </div>
      <button className="btn ghost" onClick={() => moveImg(list, setList, i, -1)} aria-label="Move up">↑</button>
      <button className="btn ghost" onClick={() => moveImg(list, setList, i, 1)} aria-label="Move down">↓</button>
      <button className="btn danger" onClick={() => delImg(list, setList, i, 'photo')}>✕</button>
    </div>
  ));

  const libraryBrowser = (list, setList, cap) => {
    const full = cap && list.length >= cap;
    if (!library.length) return <p style={muted}>No project photos yet — add products first, or upload below.</p>;
    return (
      <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {library.map((item) => {
          const added = list.some((x) => x.url === item.url);
          return (
            <button
              key={item.url}
              type="button"
              className="btn ghost"
              disabled={added || full}
              onClick={() => pickInto(item, list, setList, cap)}
              title={added ? 'Already added' : `Use ${item.name || 'this photo'}`}
              style={{ padding: 4, lineHeight: 0 }}
            >
              <img src={item.url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, opacity: added || full ? 0.4 : 1 }} loading="lazy" />
            </button>
          );
        })}
      </div>
    );
  };

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
    const cleanImgs = (arr) => arr
      .filter((x) => (x.url || '').trim())
      .map((x, i) => ({ key: String(x.key || ikey()), url: x.url.trim(), publicId: x.publicId || null, name: String(x.name || ''), order: i }));
    const infoGridClean = cleanImgs(infoGrid).slice(0, INFO_CAP);
    const footerClean = cleanImgs(footerImages);
    setSaving(true);
    try {
      await s.saveSettings({
        home,
        about,
        expertise: expertiseClean,
        testimonials: testisClean,
        socials: socialsClean,
        infoGrid: infoGridClean,
        footerImages: footerClean,
        contactEmail: contactEmail.trim(),
        location: location.trim(),
      });
      setExpertise(expertiseClean);
      setTestis(testisClean);
      setSocials(socialsClean);
      setInfoGrid(infoGridClean);
      setFooterImages(footerClean);
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
        <b>Info page photos ({infoGrid.length}/{INFO_CAP})</b>
        <p style={muted}>Shows on: Info page photo mosaic, positions 1–12 in the order below.</p>
        {photoRows(infoGrid, setInfoGrid, true)}
        {infoGrid.length >= INFO_CAP
          ? <p style={muted}>The grid is full (12 photos). Remove one to add another.</p>
          : <>
              <label>Upload photos</label>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { uploadInto(e.target.files, infoGrid, setInfoGrid, setInfoBusy, setInfoErr, INFO_CAP); e.target.value = ''; }} disabled={infoBusy} />
            </>}
        {infoBusy && <p>Uploading…</p>}
        {infoErr && <p style={{ color: '#b3261e', fontSize: '.85rem' }}>{infoErr}</p>}
        <label style={{ marginTop: 8 }}>Or pick from your products</label>
        {libraryBrowser(infoGrid, setInfoGrid, INFO_CAP)}
      </div>
      <div className="card">
        <b>Footer photos ({footerImages.length})</b>
        <p style={muted}>Shows on: footer background, rotating in the order below.</p>
        {photoRows(footerImages, setFooterImages, false)}
        <label>Upload photos</label>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { uploadInto(e.target.files, footerImages, setFooterImages, setFootBusy, setFootErr, 0); e.target.value = ''; }} disabled={footBusy} />
        {footBusy && <p>Uploading…</p>}
        {footErr && <p style={{ color: '#b3261e', fontSize: '.85rem' }}>{footErr}</p>}
        <label style={{ marginTop: 8 }}>Or pick from your products</label>
        {libraryBrowser(footerImages, setFooterImages, 0)}
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
