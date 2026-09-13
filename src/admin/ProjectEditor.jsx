import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSite } from '../lib/store.jsx';
import { isCloudinaryConfigured, uploadToCloudinary } from '../lib/cloudinary.js';

const uid = () => `m-${Math.random().toString(36).slice(2, 8)}`;
const IMG_MAX_MB = 10;
const VIDEO_MAX_MB = 80;
const MAX_ITEMS = 24;
const OK_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const OK_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blank = () => ({
  title: '', slug: '', categoryIds: [], excerpt: '', body: '', year: String(new Date().getFullYear()),
  tags: [], cover: '', thumbnail: null, featured: false, status: 'published', media: [],
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
  const [thumbBusy, setThumbBusy] = useState(false);
  const [thumbError, setThumbError] = useState('');
  const [draggingKey, setDraggingKey] = useState(null);
  const dragKey = useRef(null);
  const rowRefs = useRef({});
  const prevTops = useRef({});
  const flipToken = useRef(0);
  const loadedId = useRef(id);
  const dirtyRef = useRef(false);
  const markDirty = () => {
    dirtyRef.current = true;
  };

  // Reload the form when navigating between product ids (same component instance).
  useEffect(() => {
    if (loadedId.current === id) return;
    loadedId.current = id;
    const next = isNew ? blank() : s.projects.find((p) => p.id === id) || blank();
    setForm(next);
    setTagsStr((next.tags || []).join(', '));
    setUploadErrors([]);
    dirtyRef.current = false;
  }, [id, isNew, s.projects]);

  const set = (k, v) => {
    markDirty();
    setForm((f) => ({ ...f, [k]: v }));
  };
  const toggleCat = (cid) => {
    markDirty();
    setForm((f) => ({
      ...f, categoryIds: f.categoryIds.includes(cid) ? f.categoryIds.filter((c) => c !== cid) : [...f.categoryIds, cid],
    }));
  };

  const onFiles = async (files) => {
    setUploadErrors([]);
    if (!isCloudinaryConfigured) {
      setUploadErrors(['Photo uploads aren\u2019t working right now. Contact your developer.']);
      return;
    }
    const arr = [...(files || [])];
    if (!arr.length) return;
    if (form.media.length + arr.length > MAX_ITEMS) {
      setUploadErrors([`Too many photos: max ${MAX_ITEMS} per product.`]);
      return;
    }
    setBusy(true);
    const errs = [];
    const uploaded = [];
    try {
      for (const f of arr) {
        const isVideo = OK_VIDEO_TYPES.includes(f.type);
        if (!isVideo && !OK_IMAGE_TYPES.includes(f.type)) {
          errs.push(`${f.name || 'File'}: only JPG, PNG, WebP, GIF or MP4/WebM/MOV, please.`);
          continue;
        }
        const capMb = isVideo ? VIDEO_MAX_MB : IMG_MAX_MB;
        if (f.size > capMb * 1024 * 1024) {
          errs.push(`${f.name}: bigger than ${capMb}MB — please use a smaller ${isVideo ? 'video' : 'photo'}.`);
          continue;
        }
        try {
          const u = await uploadToCloudinary(f);
          uploaded.push({ key: uid(), type: u.type, url: u.url, publicId: u.publicId, name: u.originalFilename || f.name || '', caption: '', order: form.media.length + uploaded.length });
        } catch (e) {
          errs.push(`${f.name}: ${e?.message || 'upload failed.'}`);
        }
      }
      if (uploaded.length) {
        markDirty();
        const firstImage = uploaded.find((u) => u.type !== 'video');
        setForm((f) => ({ ...f, media: [...f.media, ...uploaded], cover: f.cover || firstImage?.url || '' }));
      }
    } finally {
      setBusy(false);
      setUploadErrors(errs);
    }
  };

  const delMedia = (key) => {
    const gone = form.media.find((m) => m.key === key);
    if (!gone) return;
    if (!confirm('Remove this photo from the product?')) return;
    markDirty();
    setForm((f) => {
      const media = f.media.filter((m) => m.key !== key);
      return { ...f, media, cover: f.cover === gone.url ? '' : f.cover };
    });
  };

  const setCaption = (key, caption) => {
    markDirty();
    setForm((f) => ({ ...f, media: f.media.map((m) => (m.key === key ? { ...m, caption } : m)) }));
  };

  const moveMedia = (key, dir) => {
    markDirty();
    setForm((f) => {
      const a = [...f.media].sort((x, y) => x.order - y.order);
      const i = a.findIndex((m) => m.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= a.length) return f;
      [a[i], a[j]] = [a[j], a[i]];
      return { ...f, media: a.map((m, k) => ({ ...m, order: k })) };
    });
  };

  const moveMediaTo = (key, targetKey, before) => {
    if (!key || !targetKey || key === targetKey) return;
    markDirty();
    setForm((f) => {
      const dragged = f.media.find((m) => m.key === key);
      if (!dragged) return f;
      const a = [...f.media].sort((x, y) => x.order - y.order).filter((m) => m.key !== key);
      let idx = a.findIndex((m) => m.key === targetKey);
      if (idx < 0) idx = a.length;
      else if (!before) idx += 1;
      a.splice(idx, 0, dragged);
      const next = a.map((m, k) => ({ ...m, order: k }));
      // No-op guard: same reference bails out of the render (calms hover cadence).
      const prev = [...f.media].sort((x, y) => x.order - y.order);
      if (next.every((m, k) => m.key === prev[k]?.key)) return f;
      return { ...f, media: next };
    });
  };

  const onCardDragStart = (e, key) => {
    // Never start a drag from editable controls or the video preview.
    if (e.target.closest('input, textarea, button, video')) {
      e.preventDefault();
      return;
    }
    dragKey.current = key;
    setDraggingKey(key);
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', key); } catch { /* ignore */ }
  };

  const onCardDragOver = (e, key) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Live reorder: commit on hover so siblings shift while dragging.
    const from = dragKey.current;
    if (!from || from === key) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const before = (e.clientY - rect.top) < rect.height / 2;
    moveMediaTo(from, key, before);
  };

  const onCardDrop = (e) => {
    // Order is already committed live on hover — just clear the drag state.
    e.preventDefault();
    endDrag();
  };

  const endDrag = () => {
    dragKey.current = null;
    setDraggingKey(null);
  };

  const orderSig = form.media.map((m) => m.key).join('|');

  // FLIP-animated list: after every order change, slide rows from their
  // previous Y to their new Y. The dragged row is excluded (it follows the
  // cursor via the native ghost); a token guards stale animation frames.
  useLayoutEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const next = {};
    Object.entries(rowRefs.current).forEach(([k, el]) => {
      if (el) next[k] = el.getBoundingClientRect().top;
    });
    if (!reduce) {
      const my = (flipToken.current += 1);
      Object.entries(next).forEach(([k, top]) => {
        const el = rowRefs.current[k];
        const old = prevTops.current[k];
        if (el && k !== dragKey.current && old !== undefined && old !== top) {
          const dy = old - top;
          el.style.transition = 'none';
          el.style.transform = `translateY(${dy}px)`;
          requestAnimationFrame(() => {
            if (my !== flipToken.current || rowRefs.current[k] !== el) return;
            el.style.transition = 'transform .22s ease';
            el.style.transform = '';
          });
        }
      });
    }
    prevTops.current = next;
  }, [orderSig]);

  const onThumbFile = async (files) => {
    const f = files?.[0];
    if (!f) return;
    setThumbError('');
    if (!isCloudinaryConfigured) {
      setThumbError('Photo uploads aren\u2019t working right now. Contact your developer.');
      return;
    }
    if (!OK_IMAGE_TYPES.includes(f.type)) {
      setThumbError('Only JPG, PNG, WebP or GIF photos, please.');
      return;
    }
    if (f.size > IMG_MAX_MB * 1024 * 1024) {
      setThumbError(`Bigger than ${IMG_MAX_MB}MB — please use a smaller photo.`);
      return;
    }
    setThumbBusy(true);
    try {
      const u = await uploadToCloudinary(f);
      markDirty();
      setForm((prev) => ({ ...prev, thumbnail: { url: u.url, publicId: u.publicId } }));
    } catch (e) {
      setThumbError(e?.message || 'Upload failed.');
    } finally {
      setThumbBusy(false);
    }
  };

  const setPhotoAsThumb = (m) => {
    markDirty();
    setThumbError('');
    setForm((f) => ({ ...f, thumbnail: { url: m.url, publicId: m.publicId || null } }));
  };

  const copyCoverAsThumb = () => {
    if (!form.cover) return;
    markDirty();
    setThumbError('');
    setForm((f) => ({ ...f, thumbnail: { url: f.cover, publicId: null } }));
  };

  const removeThumb = () => {
    if (!confirm('Remove the thumbnail? The main photo will be used instead.')) return;
    markDirty();
    setForm((f) => ({ ...f, thumbnail: null }));
  };

  const cancel = () => {
    if (dirtyRef.current && !confirm('Leave without saving? Your changes will be lost.')) return;
    nav('/admin/projects');
  };

  const save = async () => {
    const slug = (form.slug.trim() || form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    if (!form.title.trim()) { alert('Please give the product a name first.'); return; }
    if (slug && !SLUG_RE.test(slug)) { alert('The page link can only use small letters, numbers and dashes (e.g. genesis-press).'); return; }
    const cover = form.cover || form.media[0]?.url || '';
    if (!cover) { alert('Please upload at least one photo.'); return; }
    const bad = form.media.find((m) => !m.url || m.url.startsWith('blob:'));
    if (bad) { alert('One photo didn\u2019t upload properly. Please upload it again, then save.'); return; }
    if (form.thumbnail?.url?.startsWith('blob:')) { alert('The thumbnail didn\u2019t upload properly. Please upload it again, then save.'); return; }
    setSaving(true);
    try {
      await s.upsertProject({ ...form, excerpt: '', cover, tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean) });
      dirtyRef.current = false;
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
      <h1 style={{ marginTop: 0 }}>{isNew ? 'New product' : `Edit — ${existing?.title || ''}`}</h1>
      {!isNew && !existing && <p>Not found. It may have been deleted.</p>}
      {(isNew || existing) && (
        <>
          <div className="card">
            <b>1. Product details</b>
            <label>Product name</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={200} />
            <label>Page link</label>
            <input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="created from the name if left empty" maxLength={200} />
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginTop: 4 }}>Usually leave this alone — it's the last part of the product's web address. Small letters, numbers and dashes only.</p>
            <div className="row">
              <div style={{ flex: 1 }}><label>Year</label><input value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="e.g. 2025" maxLength={12} /></div>
              <div style={{ flex: 2 }}><label>Labels (comma separated)</label><input value={tagsStr} onChange={(e) => { markDirty(); setTagsStr(e.target.value); }} placeholder="Branding, Digital" /></div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginTop: 4 }}>Labels are shown under the product name on the website.</p>
            <label>Full description</label>
            <textarea rows={5} value={form.body} onChange={(e) => set('body', e.target.value)} placeholder="Shown on the product page. Plain text." />
          </div>

          <div className="card">
            <b>2. Photos + videos</b>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
              {isCloudinaryConfigured
                ? `Photos (JPG/PNG/WebP/GIF, max ${IMG_MAX_MB}MB) and short videos (MP4/WebM/MOV, max ${VIDEO_MAX_MB}MB), max ${MAX_ITEMS} files per product. Drag photos to reorder (or use ↑ ↓ on touch screens) — the first photo becomes the main photo unless you pick another. Videos play silently in a loop on the product page.`
                : 'Photo uploads aren\u2019t working right now. Contact your developer.'}
            </p>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={(e) => onFiles(e.target.files)} disabled={busy || !isCloudinaryConfigured} />
            {busy && <p>Uploading…</p>}
            {uploadErrors.length > 0 && (
              <div style={{ color: '#b3261e', fontSize: '.85rem', marginTop: 8 }}>
                {uploadErrors.map((m, i) => <p key={i} style={{ margin: '4px 0' }}>{m}</p>)}
              </div>
            )}
            <div className="media-list" style={{ marginTop: 12 }}>
              {[...form.media].sort((a, b) => a.order - b.order).map((m, i) => (
                <div
                  className={`mrow${draggingKey === m.key ? ' dragging' : ''}${form.cover === m.url ? ' is-cover' : ''}`}
                  key={m.key}
                  ref={(el) => { if (el) rowRefs.current[m.key] = el; else delete rowRefs.current[m.key]; }}
                  draggable
                  onDragStart={(e) => onCardDragStart(e, m.key)}
                  onDragOver={(e) => onCardDragOver(e, m.key)}
                  onDrop={onCardDrop}
                  onDragEnd={endDrag}
                >
                  <span className="grip" title="Drag to reorder">⋮⋮</span>
                  <span className="mthumb">
                    {m.type === 'video' ? (
                      <video src={m.url} muted playsInline preload="metadata" />
                    ) : (
                      <img src={m.url} alt="" />
                    )}
                  </span>
                  <span className="mmain">
                    <span className="mtitle">{i + 1}. {form.cover === m.url ? 'Main photo' : (m.type === 'video' ? 'Video' : 'Photo')}</span>
                    <span className="mname" title={m.name || m.caption || 'Untitled file'}>{m.name || m.caption || 'Untitled file'}</span>
                    <input value={m.caption || ''} onChange={(e) => setCaption(m.key, e.target.value)} placeholder="Short text under this photo (optional)" maxLength={140} />
                    {m.type === 'video' && <span className="mnote">Videos can\u2019t be the main photo or thumbnail — tiles always show stills.</span>}
                  </span>
                  <span className="mactions">
                    <span className="row">
                      <button className="btn ghost" onClick={() => moveMedia(m.key, -1)} aria-label="Move up">↑</button>
                      <button className="btn ghost" onClick={() => moveMedia(m.key, 1)} aria-label="Move down">↓</button>
                      <button className="btn danger" onClick={() => delMedia(m.key)} aria-label="Remove">✕</button>
                    </span>
                    <span className="row" style={{ marginTop: 4 }}>
                      <button className="btn ghost" onClick={() => set('cover', m.url)} disabled={m.type === 'video'} title={m.type === 'video' ? 'The main photo must be a still image' : undefined}>Main photo</button>
                      <button className="btn ghost" onClick={() => setPhotoAsThumb(m)} disabled={m.type === 'video'} title={m.type === 'video' ? 'The thumbnail must be a still image' : undefined}>Thumbnail</button>
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <b>3. Thumbnail</b>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>The small image shown for this product on the home page, Products page and bottom strip. If empty, the main photo is used.</p>
            {form.thumbnail?.url ? (
              <div className="row" style={{ alignItems: 'center' }}>
                <img src={form.thumbnail.url} alt="" style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 10 }} />
                <button className="btn danger" onClick={removeThumb}>Remove thumbnail</button>
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>No separate thumbnail — the main photo is used.</p>
            )}
            <label>Upload a thumbnail photo</label>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { onThumbFile(e.target.files); e.target.value = ''; }} disabled={thumbBusy || busy || saving || !isCloudinaryConfigured} />
            {thumbBusy && <p>Uploading…</p>}
            {thumbError && <p style={{ color: '#b3261e', fontSize: '.85rem' }}>{thumbError}</p>}
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn ghost" onClick={copyCoverAsThumb} disabled={!form.cover}>Use main photo</button>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginTop: 4 }}>Tip: every photo above also has its own “Use as thumbnail” button.</p>
          </div>

          <div className="card">
            <b>4. Who can see this</b>
            <label>Visibility</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="published">Visible to everyone</option>
              <option value="draft">Hidden (only you can see it here)</option>
            </select>
            <label>Groups</label>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginTop: 0 }}>Tick every group this product belongs to — it will appear under each of them on the Products page.</p>
            <div className="row">
              {s.categories.length === 0 && <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>No groups yet — add one first in Groups.</span>}
              {s.categories.map((c) => (
                <label key={c.id} style={{ display: 'flex', gap: 6, alignItems: 'center', border: '1px solid var(--line-dark)', borderRadius: 200, padding: '6px 12px', margin: 0 }}>
                  <input type="checkbox" style={{ width: 'auto' }} checked={form.categoryIds.includes(c.id)} onChange={() => toggleCat(c.id)} /> {c.name}
                </label>
              ))}
            </div>
            <label style={{ marginTop: 16 }}><input type="checkbox" style={{ width: 'auto' }} checked={!!form.featured} onChange={(e) => set('featured', e.target.checked)} /> Show on the home page</label>
            <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginTop: 4 }}>The order on the home page follows the Products list order.</p>
          </div>

          <div className="row">
            <button className="btn" onClick={save} disabled={busy || saving}>{saving ? 'Saving…' : 'Save product'}</button>
            <button className="btn ghost" onClick={cancel} disabled={saving}>Cancel</button>
          </div>
          {form.status === 'published' && <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Saving puts it on the website immediately.</p>}
        </>
      )}
    </>
  );
}
