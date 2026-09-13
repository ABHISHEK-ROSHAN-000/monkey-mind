import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';
import { isCloudinaryConfigured, uploadToCloudinary } from '../lib/cloudinary.js';

const uid = () => `m-${Math.random().toString(36).slice(2, 8)}`;
const MAX_FILE_MB = 10;
const MAX_ITEMS = 24;
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blank = () => ({
  title: '', slug: '', categoryIds: [], excerpt: '', body: '', year: String(new Date().getFullYear()),
  tags: [], cover: '', featured: false, status: 'published', media: [],
});

export default function ProjectEditor() {
  const { id } = useParams();
  const s = useSite();
  const nav = useNavigate();
  const isNew = id === 'new';
  const existing = isNew ? null : s.projects.find((p) => p.id === id);

  const [form, setForm] = useState(() => (isNew ? blank() : existing || blank()));
  const [tagsStr, setTagsStr] = useState(() => (existing?.tags || []).join(', '));
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const loadedId = useRef(id);

  // Reload the form when navigating between project ids (same component instance).
  useEffect(() => {
    if (loadedId.current === id) return;
    loadedId.current = id;
    const next = isNew ? blank() : s.projects.find((p) => p.id === id) || blank();
    setForm(next);
    setTagsStr((next.tags || []).join(', '));
    setUploadErrors([]);
  }, [id, isNew, s.projects]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCat = (cid) => setForm((f) => ({
    ...f, categoryIds: f.categoryIds.includes(cid) ? f.categoryIds.filter((c) => c !== cid) : [...f.categoryIds, cid],
  }));

  const onFiles = async (files) => {
    setUploadErrors([]);
    if (!isCloudinaryConfigured) {
      setUploadErrors(['Cloudinary is not configured. Add VITE_CLOUDINARY_* to .env — uploads are blocked until then.']);
      return;
    }
    const arr = [...(files || [])];
    if (!arr.length) return;
    if (form.media.length + arr.length > MAX_ITEMS) {
      setUploadErrors([`Too many images: max ${MAX_ITEMS} per project.`]);
      return;
    }
    setBusy(true);
    const errs = [];
    const uploaded = [];
    try {
      for (const f of arr) {
        if (!OK_TYPES.includes(f.type)) {
          errs.push(`${f.name || 'File'}: only JPG, PNG, WebP or GIF.`);
          continue;
        }
        if (f.size > MAX_FILE_MB * 1024 * 1024) {
          errs.push(`${f.name}: over ${MAX_FILE_MB}MB.`);
          continue;
        }
        try {
          const u = await uploadToCloudinary(f);
          uploaded.push({ key: uid(), type: u.type, url: u.url, publicId: u.publicId, caption: '', order: form.media.length + uploaded.length });
        } catch (e) {
          errs.push(`${f.name}: ${e?.message || 'upload failed.'}`);
        }
      }
      if (uploaded.length) {
        setForm((f) => ({ ...f, media: [...f.media, ...uploaded], cover: f.cover || uploaded[0].url }));
      }
    } finally {
      setBusy(false);
      setUploadErrors(errs);
    }
  };

  const delMedia = (key) => {
    setForm((f) => {
      const gone = f.media.find((m) => m.key === key);
      const media = f.media.filter((m) => m.key !== key);
      return { ...f, media, cover: gone && f.cover === gone.url ? '' : f.cover };
    });
  };

  const setCaption = (key, caption) => {
    setForm((f) => ({ ...f, media: f.media.map((m) => (m.key === key ? { ...m, caption } : m)) }));
  };

  const moveMedia = (key, dir) => {
    setForm((f) => {
      const a = [...f.media].sort((x, y) => x.order - y.order);
      const i = a.findIndex((m) => m.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= a.length) return f;
      [a[i], a[j]] = [a[j], a[i]];
      return { ...f, media: a.map((m, k) => ({ ...m, order: k })) };
    });
  };

  const save = async () => {
    const slug = (form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    if (!form.title.trim()) { alert('Title is required.'); return; }
    if (slug && !SLUG_RE.test(slug)) { alert('Slug must be lowercase letters, numbers and dashes (e.g. genesis-press).'); return; }
    const cover = form.cover || form.media[0]?.url || '';
    if (!cover) { alert('Add a cover image or upload at least one media item.'); return; }
    const bad = form.media.find((m) => !m.url || m.url.startsWith('blob:'));
    if (bad) { alert('One media item is an unsaved local preview. Re-upload it, then save.'); return; }
    setSaving(true);
    try {
      await s.upsertProject({ ...form, cover, tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean) });
      nav('/admin/projects');
    } catch (e) {
      alert(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (s.loading) return <p>Loading…</p>;
  if (s.syncError && !s.projects.length && !isNew) return <p style={{ color: '#b3261e' }}>{s.syncError}</p>;

  return (
    <>
      <h1 style={{ marginTop: 0 }}>{isNew ? 'New project' : `Edit — ${existing?.title || ''}`}</h1>
      {!isNew && !existing && <p>Not found. It may have been deleted.</p>}
      {(isNew || existing) && (
        <>
          <div className="card">
            <label>Title</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={200} />
            <label>Slug (auto from title if empty — becomes the page URL)</label>
            <input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="genesis" maxLength={200} />
            <div className="row">
              <div style={{ flex: 1 }}><label>Year</label><input value={form.year} onChange={(e) => set('year', e.target.value)} maxLength={12} /></div>
              <div style={{ flex: 1 }}><label>Status</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="published">published — visible to everyone</option>
                  <option value="draft">draft — hidden from the site</option>
                </select>
              </div>
              <div style={{ flex: 1 }}><label>Tags (comma separated)</label><input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="Branding, Digital" /></div>
            </div>
            <label>Excerpt</label>
            <input value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            <label>Body</label>
            <textarea rows={5} value={form.body} onChange={(e) => set('body', e.target.value)} />
            <label>Categories</label>
            <div className="row">
              {s.categories.length === 0 && <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>No categories yet — add them in Categories first.</span>}
              {s.categories.map((c) => (
                <label key={c.id} style={{ display: 'flex', gap: 6, alignItems: 'center', border: '1px solid var(--line-dark)', borderRadius: 200, padding: '6px 12px', margin: 0 }}>
                  <input type="checkbox" style={{ width: 'auto' }} checked={form.categoryIds.includes(c.id)} onChange={() => toggleCat(c.id)} /> {c.name}
                </label>
              ))}
            </div>
            <label style={{ marginTop: 16 }}><input type="checkbox" style={{ width: 'auto' }} checked={!!form.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured on home (final order is set in Home Featured)</label>
          </div>

          <div className="card">
            <b>Media (images + GIFs) — reorder with ↑ ↓</b>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
              {isCloudinaryConfigured
                ? `Uploads go to Cloudinary (JPG/PNG/WebP/GIF, max ${MAX_FILE_MB}MB each, max ${MAX_ITEMS} per project).`
                : 'Cloudinary is not configured — uploads are blocked. Add VITE_CLOUDINARY_* to .env.'}
            </p>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => onFiles(e.target.files)} disabled={busy || !isCloudinaryConfigured} />
            {busy && <p>Uploading…</p>}
            {uploadErrors.length > 0 && (
              <div style={{ color: '#b3261e', fontSize: '.85rem', marginTop: 8 }}>
                {uploadErrors.map((m, i) => <p key={i} style={{ margin: '4px 0' }}>{m}</p>)}
              </div>
            )}
            <div className="media-strip" style={{ marginTop: 12 }}>
              {[...form.media].sort((a, b) => a.order - b.order).map((m) => (
                <div className="m" key={m.key} style={form.cover === m.url ? { outline: '2px solid #212121' } : undefined}>
                  <img src={m.url} alt="" />
                  <div style={{ padding: 6, fontSize: '.75rem' }}>{m.type}{form.cover === m.url ? ' · cover' : ''}
                    <input value={m.caption || ''} onChange={(e) => setCaption(m.key, e.target.value)} placeholder="Caption (optional)" style={{ marginTop: 4 }} maxLength={140} />
                    <div className="row" style={{ marginTop: 4 }}>
                      <button className="btn ghost" onClick={() => moveMedia(m.key, -1)}>↑</button>
                      <button className="btn ghost" onClick={() => moveMedia(m.key, 1)}>↓</button>
                      <button className="btn danger" onClick={() => delMedia(m.key)}>✕</button>
                    </div>
                    <button className="btn ghost" style={{ marginTop: 4 }} onClick={() => set('cover', m.url)}>Set cover</button>
                  </div>
                </div>
              ))}
            </div>
            <label>Cover URL</label>
            <input value={form.cover} onChange={(e) => set('cover', e.target.value)} placeholder="Set from an upload, or paste a URL" />
          </div>

          <div className="row">
            <button className="btn" onClick={save} disabled={busy || saving}>{saving ? 'Saving…' : 'Save project'}</button>
            <button className="btn ghost" onClick={() => nav('/admin/projects')} disabled={saving}>Cancel</button>
          </div>
        </>
      )}
    </>
  );
}
