# Monkey Mind — Design Studio Site + Custom CMS

Recreation of the `mmdesignstudio.framer.website` (Framer "Other") template as a
Vite + React SPA with a built-in CMS, per proposal §§2–6.

## Routes

| Route | What |
|---|---|
| `/` | Home — MONKEY MIND hero, Selected Works with **Grid / List / Feed / Full** switcher, Expertise |
| `/projects` | All Projects grouped by category (Branding, Packaging, Publication, UI Design, Ad & Marketing) |
| `/p/:slug` | Project detail — description, year, tags, image/video/GIF gallery, prev/next |
| `/info` | About — studio lede, expertise, CMS-managed testimonials |
| `/admin/login` | Admin login |
| `/admin` | Dashboard, projects CRUD, categories, home featured order, about/testimonials editor |

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve dist/
```

Demo admin (Firebase NOT configured): `admin@mmstudio.in` / `monkeymind123`
(override via `VITE_ADMIN_*`). CMS data persists in `localStorage` (`mm_cms_v1`).

## Production wiring

1. Copy `.env.example` → `.env`, fill Firebase + Cloudinary values.
2. Firebase console: enable Email/Password Auth, create admin user, create Firestore,
   deploy `firestore.rules`.
3. Cloudinary: unsigned upload preset restricted to folder `monkey-mind`, allow
   image + video. CMS uploads then go straight to Cloudinary (reorder/persist included).
4. GitHub Pages: push to `main` → Actions workflow builds `dist/` and deploys.
   Add custom domain via `CNAME` + DNS; HTTPS auto.

## What's placeholder in this draft

- Project images use `picsum.photos` seeds + one sample mp4 (see `src/data/placeholders.js`).
- One sample GIF entry on "Lotion" proves GIF rendering.
- Replace copy/media in `/admin` — no code changes needed.
