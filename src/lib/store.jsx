// Firebase-backed CMS store (Firestore). No local persistence: every client
// subscribes to the same collections, so entries made in /admin are visible
// to all visitors. Documents: projects/{slug}, categories/{slug},
// siteSettings/site (single doc).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

// Retired local-first keys (v1–v4). Removed once so stale demo drafts from
// older builds never resurface in admin browsers.
const LEGACY_KEYS = ['mm_cms_v1', 'mm_cms_v2', 'mm_cms_v3', 'mm_cms_v4'];

// Shape guarantee for a fresh backend (full wipe): never null, so public
// pages and admin screens can render before the client adds content.
const EMPTY_SETTINGS = {
  home: { heroTitle: 'MONKEY MIND', blurb: '', featuredIds: [] },
  about: { title: '', lede: '', body: '' },
  expertise: [],
  testimonials: [],
  contactEmail: '',
  location: '',
  socials: [],
  infoGrid: [],
  footerImages: [],
};

const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const byOrder = (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0);
const mkey = () => `m-${Math.random().toString(36).slice(2, 8)}`;

const Ctx = createContext(null);
export const useSite = () => useContext(Ctx);

function nextOrder(items) {
  return items.reduce((m, x) => Math.max(m, Number(x.order) || 0), 0) + 1;
}

function cleanThumbnail(t) {
  const url = String(t?.url || '');
  if (!url || url.startsWith('blob:')) return { url: '', publicId: null };
  return { url, publicId: t.publicId || null };
}

function cleanMedia(media) {
  if (!Array.isArray(media)) return [];
  return media.map((m, i) => ({
    key: String(m.key || mkey()),
    type: m.type === 'video' ? 'video' : (m.type === 'gif' ? 'gif' : 'image'),
    url: String(m.url || ''),
    publicId: m.publicId || null,
    name: String(m.name || ''),
    caption: String(m.caption || ''),
    order: Number.isFinite(Number(m.order)) ? Number(m.order) : i,
  })).filter((m) => m.url && !m.url.startsWith('blob:'));
}

export function SiteProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    try {
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!auth) {
      setIsAdminUser(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => setIsAdminUser(!!u));
  }, []);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      setSyncError('Firebase is not configured. Add VITE_FIREBASE_* to .env (see .env.example).');
      return;
    }
    setSyncError('');
    let ready = 0;
    const markReady = () => {
      ready += 1;
      if (ready >= 3) setLoading(false);
    };
    const onErr = (e) => {
      setSyncError(e?.message || 'Sync failed. Check connection and Firestore rules.');
      markReady();
    };
    // Rules are not filters: an unfiltered collection scan is denied for
    // anonymous visitors, so they subscribe with a matching status filter
    // (admins keep the unfiltered scan and also see drafts).
    const projectsQuery = isAdminUser
      ? collection(db, 'projects')
      : query(collection(db, 'projects'), where('status', '==', 'published'));
    const u1 = onSnapshot(
      projectsQuery,
      (snap) => {
        setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        markReady();
      },
      onErr,
    );
    const u2 = onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        markReady();
      },
      onErr,
    );
    const u3 = onSnapshot(
      doc(db, 'siteSettings', 'site'),
      (snap) => {
        if (snap.exists()) setSettings({ ...EMPTY_SETTINGS, ...snap.data() });
        markReady();
      },
      onErr,
    );
    return () => {
      u1();
      u2();
      u3();
    };
  }, [isAdminUser]);

  const api = useMemo(() => {
    const publishedProjects = projects
      .filter((p) => p.status === 'published')
      .sort(byOrder);
    // Home order follows the Products list order (single "Show on home page" tick).
    const featuredProjects = publishedProjects
      .filter((p) => p.featured)
      .sort(byOrder);
    const getProject = (slug) => projects.find((p) => p.slug === slug);

    const needDb = () => {
      if (!db) throw new Error('Firebase is not configured.');
    };
    const settingsRef = () => doc(db, 'siteSettings', 'site');

    function buildProjectData(input, order, createdAt) {
      const now = Date.now();
      return {
        title: (input.title || '').trim(),
        slug: ((input.slug || '').trim() || slugify(input.title || '')),
        cover: String(input.cover || ''),
        thumbnail: cleanThumbnail(input.thumbnail),
        media: cleanMedia(input.media),
        categoryIds: (Array.isArray(input.categoryIds) ? input.categoryIds : []).filter((c) => typeof c === 'string'),
        excerpt: String(input.excerpt || ''),
        body: String(input.body || ''),
        year: String(input.year || ''),
        tags: (Array.isArray(input.tags) ? input.tags : []).map((t) => String(t)),
        featured: !!input.featured,
        featuredOrder: Number(input.featuredOrder) || 0,
        order,
        status: input.status === 'draft' ? 'draft' : 'published',
        createdAt: createdAt ?? now,
        updatedAt: now,
      };
    }

    function assertProjectValid(data) {
      if (!data.title) throw new Error('Title is required.');
      if (!SLUG_RE.test(data.slug)) throw new Error('Slug must be lowercase letters, numbers and dashes (e.g. genesis-press).');
      if (!data.cover && !data.media.length) throw new Error('Add a cover image or at least one media item.');
    }

    async function upsertProject(input) {
      needDb();
      const old = input.id ? projects.find((p) => p.id === input.id) : null;
      const order = old?.order ?? nextOrder(projects);
      const createdAt = old?.createdAt;
      const data = buildProjectData(input, order, createdAt);
      assertProjectValid(data);

      if (input.id && input.id !== data.slug) {
        // Slug changed → move to a new document so the URL follows the slug.
        const clash = await getDoc(doc(db, 'projects', data.slug));
        if (clash.exists()) throw new Error(`Slug “${data.slug}” is already used by another project.`);
        const batch = writeBatch(db);
        batch.set(doc(db, 'projects', data.slug), data);
        batch.delete(doc(db, 'projects', input.id));
        const ids = (settings.home?.featuredIds || []).map((x) => (x === input.id ? data.slug : x));
        batch.set(settingsRef(), { home: { ...(settings.home || {}), featuredIds: ids } }, { merge: true });
        await batch.commit();
        return;
      }
      if (!input.id) {
        const clash = await getDoc(doc(db, 'projects', data.slug));
        if (clash.exists()) throw new Error(`Slug “${data.slug}” is already used by another project.`);
        await setDoc(doc(db, 'projects', data.slug), data);
        return;
      }
      await setDoc(doc(db, 'projects', input.id), data, { merge: true });
    }

    async function deleteProject(id) {
      needDb();
      const batch = writeBatch(db);
      batch.delete(doc(db, 'projects', id));
      const ids = (settings.home?.featuredIds || []).filter((x) => x !== id);
      batch.set(settingsRef(), { home: { ...(settings.home || {}), featuredIds: ids } }, { merge: true });
      await batch.commit();
    }

    async function moveProject(id, dir) {
      needDb();
      const arr = [...projects].sort(byOrder);
      const i = arr.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return;
      const aOrder = Number(arr[i].order) || i;
      const bOrder = Number(arr[j].order) || j;
      const batch = writeBatch(db);
      batch.update(doc(db, 'projects', arr[i].id), { order: bOrder, updatedAt: Date.now() });
      batch.update(doc(db, 'projects', arr[j].id), { order: aOrder, updatedAt: Date.now() });
      await batch.commit();
    }

    async function upsertCategory(input) {
      needDb();
      const name = (input.name || '').trim();
      if (!name) throw new Error('Category name is required.');
      const slug = ((input.slug || '').trim() || slugify(name));
      if (!SLUG_RE.test(slug)) throw new Error('Category slug must be lowercase letters, numbers and dashes.');
      if (!input.id) {
        const clash = await getDoc(doc(db, 'categories', slug));
        if (clash.exists()) throw new Error(`Category “${slug}” already exists.`);
        await setDoc(doc(db, 'categories', slug), { name, slug, order: nextOrder(categories) });
        return;
      }
      if (input.id !== slug) {
        const clash = await getDoc(doc(db, 'categories', slug));
        if (clash.exists()) throw new Error(`Category “${slug}” already exists.`);
        const batch = writeBatch(db);
        const oldCat = categories.find((c) => c.id === input.id);
        batch.set(doc(db, 'categories', slug), { name, slug, order: oldCat?.order ?? nextOrder(categories) });
        batch.delete(doc(db, 'categories', input.id));
        projects
          .filter((p) => (p.categoryIds || []).includes(input.id))
          .forEach((p) => {
            batch.update(doc(db, 'projects', p.id), {
              categoryIds: p.categoryIds.map((c) => (c === input.id ? slug : c)),
              updatedAt: Date.now(),
            });
          });
        await batch.commit();
        return;
      }
      await setDoc(doc(db, 'categories', input.id), { name, slug }, { merge: true });
    }

    async function deleteCategory(id) {
      needDb();
      const batch = writeBatch(db);
      batch.delete(doc(db, 'categories', id));
      projects
        .filter((p) => (p.categoryIds || []).includes(id))
        .forEach((p) => {
          batch.update(doc(db, 'projects', p.id), {
            categoryIds: (p.categoryIds || []).filter((c) => c !== id),
            updatedAt: Date.now(),
          });
        });
      await batch.commit();
    }

    async function setFeatured(ids) {
      needDb();
      // Keep existing projects only (drops deleted ghosts), deduped, order kept.
      const clean = [...new Set(ids)].filter((id) => projects.some((p) => p.id === id));
      const batch = writeBatch(db);
      projects.forEach((p) => {
        const idx = clean.indexOf(p.id);
        batch.update(doc(db, 'projects', p.id), {
          featured: idx >= 0,
          featuredOrder: idx >= 0 ? idx + 1 : 0,
          updatedAt: Date.now(),
        });
      });
      batch.set(settingsRef(), { home: { ...(settings.home || {}), featuredIds: clean } }, { merge: true });
      await batch.commit();
    }

    async function saveSettings(patch) {
      needDb();
      await setDoc(settingsRef(), patch, { merge: true });
    }

    return {
      projects,
      categories,
      settings,
      loading,
      syncError,
      publishedProjects,
      featuredProjects,
      getProject,
      upsertProject,
      deleteProject,
      moveProject,
      upsertCategory,
      deleteCategory,
      setFeatured,
      saveSettings,
    };
  }, [projects, categories, settings, loading, syncError]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
