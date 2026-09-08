// First-draft placeholders mirroring the Framer template IA.
// Covers/media hotlinked from the live Framer template CDN (generic template
// stock — replace with the client's real assets before launch via CMS or here).
// One video + one gif included to prove media handling.

const img = (seed, w = 1200, h = 900) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Framer template CDN images (exact hotlink URLs incl. proven crop params).
const CDN = {
  fern1: 'https://framerusercontent.com/images/WPCYSLONbmNEmNfYTKPqcDscPc.png?width=2688&height=1792',
  purple: 'https://framerusercontent.com/images/TEMeK9K4jBHJgOIGv2oW5CljfOc.png?width=1232&height=928',
  yellow: 'https://framerusercontent.com/images/2XL9F3sBwJrY2PX88LrAi5p3Z8U.png?width=1344&height=896',
  orange: 'https://framerusercontent.com/images/XJI8TUae5fIa05QOhW9leExvYg.png?width=1344&height=896',
  fern2: 'https://framerusercontent.com/images/Bg8Qvwgi8waueoTgtGS5LqLSo.png?width=1344&height=896',
  lilac: 'https://framerusercontent.com/images/yM4z9wpwgByibpJvqBms6MXJyEo.png?width=1232&height=928',
  fern3: 'https://framerusercontent.com/images/YIGJT6dpNIP56QcQCAnayl5G4A.png?width=1456&height=816',
};

export const CATEGORIES = [
  { id: 'branding', name: 'Branding', slug: 'branding', order: 1 },
  { id: 'packaging', name: 'Packaging', slug: 'packaging', order: 2 },
  { id: 'publication', name: 'Publication', slug: 'publication', order: 3 },
  { id: 'ui-design', name: 'UI Design', slug: 'ui-design', order: 4 },
  { id: 'ad-marketing', name: 'Ad & Marketing', slug: 'ad-marketing', order: 5 },
];

const mkMedia = (key, url, i, extra = {}) => ({
  key: `${key}-${i}`,
  type: 'image',
  url,
  publicId: null,
  caption: '',
  order: i,
  ...extra,
});

const framerProject = (id, title, slug, cover, gallery, rest) => ({
  id, title, slug,
  cover,
  media: gallery.map((url, i) => mkMedia(slug, url, i)),
  categoryIds: [], excerpt: '', body: '', year: '2025', tags: [],
  featured: false, featuredOrder: 0, order: 0, status: 'published',
  ...rest,
});

export const PROJECTS = [
  framerProject('p-genesis', 'Genesis', 'genesis', CDN.fern1, [CDN.fern1, CDN.purple, CDN.yellow],
    { categoryIds: ['branding'], excerpt: 'Fashion identity + digital clarity.', body: 'A contemporary fashion project where branding meets digital clarity. We created a bold yet minimal identity system and extended it into a clean, immersive online experience.', year: '2025', tags: ['Branding', 'Digital'], featured: true, featuredOrder: 1, order: 1 }),
  framerProject('p-motm', 'MOTM', 'motm', CDN.purple, [CDN.purple, CDN.orange],
    { categoryIds: ['branding', 'packaging'], excerpt: 'Bold retail-facing identity.', body: 'Placeholder body for MOTM. Replace with client copy in CMS → Projects.', year: '2025', tags: ['Branding'], featured: true, featuredOrder: 2, order: 2 }),
  { ...framerProject('p-goon', 'Goon Squad', 'goon-squad', CDN.yellow, [CDN.yellow], { categoryIds: ['ad-marketing'], excerpt: 'Campaign + motion placeholders.', body: 'Placeholder body for Goon Squad.', year: '2024', tags: ['Campaign'], featured: true, featuredOrder: 3, order: 3 }),
    media: [{ key: 'mm-goon-vid', type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', publicId: null, caption: 'Teaser (placeholder mp4)', order: 0 }, mkMedia('goon-squad', CDN.yellow, 1)] },
  framerProject('p-minerva', 'Minerva', 'minerva', CDN.orange, [CDN.orange, CDN.fern2],
    { categoryIds: ['publication'], excerpt: 'Editorial system.', body: 'Placeholder body for Minerva.', year: '2024', tags: ['Editorial'], featured: true, featuredOrder: 4, order: 4 }),
  framerProject('p-mein', 'Mein', 'mein', CDN.fern2, [CDN.fern2],
    { categoryIds: ['branding'], excerpt: 'Minimal identity.', body: 'Placeholder body for Mein.', year: '2024', tags: ['Branding'], order: 5 }),
  { ...framerProject('p-lotion', 'Lotion', 'lotion', CDN.lilac, [CDN.lilac], { categoryIds: ['packaging'], excerpt: 'Shelf-ready packaging.', body: 'Placeholder body for Lotion.', year: '2024', tags: ['Packaging'], order: 6 }),
    media: [mkMedia('lotion', CDN.lilac, 0), { key: 'mm-lotion-gif', type: 'gif', url: img('mm-lotion-gif', 800, 600), publicId: null, caption: 'GIF placeholder', order: 1 }] },
  framerProject('p-mascara', 'Mascara', 'mascara', CDN.fern3, [CDN.fern3],
    { categoryIds: ['packaging', 'ad-marketing'], excerpt: 'Beauty launch kit.', body: 'Placeholder body for Mascara.', year: '2023', tags: ['Packaging', 'Ads'], order: 7 }),
  framerProject('p-engine9', 'Engine No. 9', 'engine-no-9', img('mm-engine9', 1200, 900), [img('mm-engine9-0', 1200, 900)],
    { categoryIds: ['branding', 'ui-design'], excerpt: 'Industrial brand + web.', body: 'Placeholder body for Engine No. 9.', year: '2023', tags: ['Branding', 'Web'], order: 8 }),
  framerProject('p-prism', 'Prism', 'prism', img('mm-prism', 1200, 900), [img('mm-prism-0', 1200, 900)],
    { categoryIds: ['branding'], excerpt: 'Color-led identity.', body: 'Placeholder body for Prism.', year: '2023', tags: ['Branding'], order: 9 }),
  framerProject('p-darzi', 'Darzi Website', 'darzi-website', img('mm-darzi', 1200, 900), [img('mm-darzi-0', 1200, 900)],
    { categoryIds: ['ui-design'], excerpt: 'Tailor-made web UI.', body: 'Placeholder body for Darzi Website.', year: '2023', tags: ['UI'], order: 10 }),
  framerProject('p-weave', 'Weave Edition 1', 'weave-edition-1', img('mm-weave', 1200, 900), [img('mm-weave-0', 1200, 900)],
    { categoryIds: ['publication'], excerpt: 'Print edition.', body: 'Placeholder body for Weave Edition 1.', year: '2022', tags: ['Print'], order: 11 }),
  framerProject('p-oziva', 'Oziva Multivitamine', 'oziva-packaging', img('mm-oziva', 1200, 900), [img('mm-oziva-0', 1200, 900)],
    { categoryIds: ['packaging', 'ad-marketing'], excerpt: 'Supplement packaging.', body: 'Placeholder body for Oziva.', year: '2022', tags: ['Packaging'], order: 12 }),
];

export const SITE_SETTINGS = {
  home: {
    heroTitle: 'MONKEY MIND',
    blurb: "Monkeymind is a space for ideas that don't always follow a straight line. We play, question, experiment, and shape those thoughts into design that feels relevant, expressive, and distinctly its own.",
    featuredIds: ['p-genesis', 'p-motm', 'p-goon', 'p-minerva'],
  },
  about: {
    title: 'MM Studio',
    lede: 'We believe brands should go beyond aesthetics and create genuine connections. That’s why our process combines creativity with strategy.',
    body: 'Monkey Mind is a Mumbai-based design practice working across branding, packaging and creative communication. This placeholder copy is editable in CMS → About.',
    images: [CDN.purple, CDN.orange],
  },
  expertise: [
    { n: '01', title: 'Branding', text: 'Defining the identity, positioning, and visual language that make a brand distinctive and coherent.' },
    { n: '02', title: 'Packaging', text: 'Translating brand strategy into considered packaging that communicates clearly and earns attention on the shelf.' },
    { n: '03', title: 'Creative Communication', text: 'Turning ideas into purposeful visual stories, campaigns, creative ads, motion graphics, and posters that drive engagement.' },
  ],
  testimonials: [
    { quote: 'Working with this team was seamless. They took our vision and turned it into a digital experience far beyond expectations.', name: 'Monica Lewinsky', role: 'Brand Manager — Neue' },
    { quote: 'A bold portfolio approach that not only impressed our clients but also inspired our own creative process.', name: 'Peter Mcneeley', role: 'Founder — Human' },
  ],
  contactEmail: 'contact@mmstudio.in',
  location: 'Mumbai, Maharashtra',
  socials: [
    { label: 'Instagram', url: 'https://www.instagram.com/' },
    { label: 'Linkedin', url: 'https://www.linkedin.com/' },
  ],
};
