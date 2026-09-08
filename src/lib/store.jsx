// Local-first CMS store (localStorage) with Firestore sync hooks.
// First draft: fully functional offline. When Firebase env is set,
// call syncFromFirestore()/persistToFirestore() from admin screens.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CATEGORIES, PROJECTS, SITE_SETTINGS } from '../data/placeholders.js';

const KEY = 'mm_cms_v2';

function seed() {
  return { projects: PROJECTS, categories: CATEGORIES, settings: SITE_SETTINGS };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const j = JSON.parse(raw);
    if (!j.projects || !j.settings) return seed();
    return j;
  } catch {
    return seed();
  }
}

const Ctx = createContext(null);
export const useSite = () => useContext(Ctx);

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function SiteProvider({ children }) {
  const [state, setState] = useState(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const api = useMemo(() => ({
    ...state,
    publishedProjects: state.projects.filter((p) => p.status === 'published').sort((a, b) => a.order - b.order),
    featuredProjects: state.projects
      .filter((p) => p.status === 'published' && p.featured)
      .sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99)),
    getProject: (slug) => state.projects.find((p) => p.slug === slug),

    upsertProject(input) {
      setState((s) => {
        const exists = s.projects.find((p) => p.id === input.id);
        const slug = input.slug?.trim() || slugify(input.title || 'untitled');
        if (exists) {
          return { ...s, projects: s.projects.map((p) => (p.id === input.id ? { ...p, ...input, slug, updatedAt: Date.now() } : p)) };
        }
        const order = Math.max(0, ...s.projects.map((p) => p.order || 0)) + 1;
        return { ...s, projects: [...s.projects, { ...input, id: input.id || uid('p'), slug, order, status: input.status || 'published', media: input.media || [], categoryIds: input.categoryIds || [], createdAt: Date.now() }] };
      });
    },
    deleteProject(id) {
      setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) }));
    },
    moveProject(id, dir) {
      setState((s) => {
        const arr = [...s.projects].sort((a, b) => a.order - b.order);
        const i = arr.findIndex((p) => p.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= arr.length) return s;
        const a = arr[i].order, b = arr[j].order;
        arr[i] = { ...arr[i], order: b }; arr[j] = { ...arr[j], order: a };
        return { ...s, projects: arr };
      });
    },
    upsertCategory(input) {
      setState((s) => {
        if (input.id && s.categories.find((c) => c.id === input.id)) {
          return { ...s, categories: s.categories.map((c) => (c.id === input.id ? { ...c, ...input } : c)) };
        }
        const order = Math.max(0, ...s.categories.map((c) => c.order || 0)) + 1;
        return { ...s, categories: [...s.categories, { ...input, id: input.id || uid('c'), slug: input.slug || slugify(input.name), order }] };
      });
    },
    deleteCategory(id) {
      setState((s) => ({
        ...s,
        categories: s.categories.filter((c) => c.id !== id),
        projects: s.projects.map((p) => ({ ...p, categoryIds: p.categoryIds.filter((c) => c !== id) })),
      }));
    },
    setFeatured(ids) {
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) => {
          const idx = ids.indexOf(p.id);
          return idx >= 0 ? { ...p, featured: true, featuredOrder: idx + 1 } : { ...p, featured: false, featuredOrder: 0 };
        }),
        settings: { ...s.settings, home: { ...s.settings.home, featuredIds: ids } },
      }));
    },
    saveSettings(patch) {
      setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    },
    resetAll() {
      setState(seed());
    },
  }), [state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
