// Shared image selection for the List and Full work views.

export function listThumbSources(p) {
  const imgs = (p.media || []).filter((m) => m.type !== 'video');
  const first = p.thumbnail?.url ? p.thumbnail : imgs[0];
  // Hover 1 is the primary List image; Hover 2 covers the case where only
  // the second slot was filled in the CMS.
  const hover = [p.hover1, p.hover2].find((m) => m?.url && m.url !== first?.url);
  return { first, second: hover || imgs[1] };
}

// Full foreground cycle: first gallery photo, then the CMS hover images,
// then the remaining stills and cover (deduped), capped at 3.
export function fullCycleImages(p) {
  const seen = new Set();
  const out = [];
  const push = (m) => {
    if (!m?.url || seen.has(m.url)) return;
    seen.add(m.url);
    out.push(m);
  };
  const stills = (p.media || []).filter((m) => m.type !== 'video');
  push(stills[0]);
  push(p.hover1);
  push(p.hover2);
  stills.slice(1).forEach(push);
  if (p.cover) push({ url: p.cover });
  return out.slice(0, 3);
}
