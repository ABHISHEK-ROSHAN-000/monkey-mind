import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';
import { uploadToCloudinary } from '../lib/cloudinary.js';

const uid = () => `m-${Math.random().toString(36).slice(2, 8)}`;

export default function ProjectEditor() {
  const { id } = useParams();
  const s = useSite();
  const nav = useNavigate();
  const isNew = id === 'new';
  const existing = useMemo(() => (isNew ? null : s.projects.find((p) => p.id === id)), [id, isNew, s.projects]);

  const [form, setForm] = useState(() => existing || {
    title: '', slug: '', categoryIds: [], excerpt: '', body: '', year: String(new Date().getFullYear()),
    tags: [], cover: '', featured: false, status: 'published', media: [],
  });
  const [tagsStr, setTagsStr] = useState((existing?.tags || []).join(', '));
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCat = (cid) => setForm((f) => ({
    ...f, categoryIds: f.categoryIds.includes(cid) ? f.categoryIds.filter((c) => c !== cid) : [...f.categoryIds, cid],
  }));

  const onFiles = async (files) => {
    setBusy(true);
    try {
      const arr = [...files];
      const uploaded = [];
      for (const f of arr) {
        const u = await uploadToCloudinary(f);
        uploaded.push({ key: uid(), type: u.type, url: u.url, publicId: u.publicId, caption: f.name, order: form.media.length + uploaded.length });
      }
      setForm((f) => ({ ...f, media: [...f.media, ...uploaded], cover: f.cover || uploaded[0]?.url || f.cover }));
    } finally { setBusy(false); }
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

  const save = () => {
    if (!form.title.trim()) { alert('Title required'); return; }
    s.upsertProject({ ...form, tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean) });
    nav('/admin/projects');
  };

  return (
    <>
      <h1 style={{ marginTop: 0 }}>{isNew ? 'New project' : `Edit — ${existing?.title || ''}`}</h1>
      {!isNew && !existing && <p>Not found.</p>}
      {(isNew || existing) && (
        <>
          <div className="card">
            <label>Title</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} />
            <label>Slug (auto if empty)</label>
            <input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="genesis" />
            <div className="row">
              <div style={{ flex: 1 }}><label>Year</label><input value={form.year} onChange={(e) => set('year', e.target.value)} /></div>
              <div style={{ flex: 1 }}><label>Status</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="published">published</option>
                  <option value="draft">draft</option>
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
              {s.categories.map((c) => (
                <label key={c.id} style={{ display: 'flex', gap: 6, alignItems: 'center', border: '1px solid var(--line-dark)', borderRadius: 200, padding: '6px 12px', margin: 0 }}>
                  <input type="checkbox" style={{ width: 'auto' }} checked={form.categoryIds.includes(c.id)} onChange={() => toggleCat(c.id)} /> {c.name}
                </label>
              ))}
            </div>
            <label style={{ marginTop: 16 }}><input type="checkbox" style={{ width: 'auto' }} checked={!!form.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured on home</label>
          </div>

          <div className="card">
            <b>Media (images, videos, GIFs) — drag order with ↑ ↓</b>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Uploads go to Cloudinary when configured, else local preview placeholder.</p>
            <input type="file" multiple accept="image/*,video/*,.gif" onChange={(e) => onFiles(e.target.files)} disabled={busy} />
            {busy && <p>Uploading…</p>}
            <div className="media-strip" style={{ marginTop: 12 }}>
              {[...form.media].sort((a, b) => a.order - b.order).map((m) => (
                <div className="m" key={m.key}>
                  {m.type === 'video' ? <video src={m.url} muted preload="metadata" /> : <img src={m.url} alt="" />}
                  <div style={{ padding: 6, fontSize: '.75rem' }}>{m.type}
                    <div className="row" style={{ marginTop: 4 }}>
                      <button className="btn ghost" onClick={() => moveMedia(m.key, -1)}>↑</button>
                      <button className="btn ghost" onClick={() => moveMedia(m.key, 1)}>↓</button>
                      <button className="btn danger" onClick={() => set('media', form.media.filter((x) => x.key !== m.key))}>✕</button>
                    </div>
                    <button className="btn ghost" style={{ marginTop: 4 }} onClick={() => set('cover', m.url)}>Set cover</button>
                  </div>
                </div>
              ))}
            </div>
            <label>Cover URL</label>
            <input value={form.cover} onChange={(e) => set('cover', e.target.value)} />
          </div>

          <div className="row">
            <button className="btn" onClick={save}>Save project</button>
            <button className="btn ghost" onClick={() => nav('/admin/projects')}>Cancel</button>
          </div>
        </>
      )}
    </>
  );
}
