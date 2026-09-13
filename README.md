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

Admin: sign in at `/admin/login` with your Firebase Auth user. CMS data lives
in Firestore (`projects`, `categories`, `siteSettings/site`) — entries are
live for everyone. Deletes are permanent; media deletes remove the reference
only (purge hosted files in the Cloudinary dashboard).

## Production wiring

1. Copy `.env.example` → `.env`, fill Firebase + Cloudinary values.
2. Firebase console: enable Email/Password Auth, create admin user, create Firestore,
   deploy `firestore.rules`.
3. Cloudinary: unsigned upload preset restricted to folder `monkey-mind`, allow
   image + video. CMS uploads then go straight to Cloudinary (reorder/persist included).
4. GitHub Pages: push to `main` → Actions workflow builds `dist/` and deploys.
   Add custom domain via `CNAME` + DNS; HTTPS auto.

## Content

- All projects, categories, copy and testimonials are managed in `/admin` —
  no code changes needed. Uploads go to Cloudinary; data goes to Firestore.
- Media deletes in the CMS remove the reference only; purge hosted files in
  the Cloudinary dashboard when needed.
