// Shared image selection for the List and Full work views.

export function listThumbSources(p) {
  const imgs = (p.media || []).filter((m) => m.type !== 'video');
  const first = p.thumbnail?.url ? p.thumbnail : imgs[0];
  // Hover 1 is the primary List image; Hover 2 covers the case where only
  // the second slot was filled in the CMS.
  const hover = [p.hover1, p.hover2].find((m) => m?.url && m.url !== first?.url);
  return { first, second: hover || imgs[1] };
}

// Full foreground: the CMS hover images take priority. If none are set,
// fall back to the first three gallery stills and cover (deduped).
export function fullCycleImages(p) {
  const seen = new Set();
  const out = [];
  const push = (m) => {
    if (!m?.url || seen.has(m.url)) return;
    seen.add(m.url);
    out.push(m);
  };
  [p.hover1, p.hover2].forEach(push);
  if (out.length) return out.slice(0, 2);

  const stills = (p.media || []).filter((m) => m.type !== 'video');
  stills.forEach(push);
  if (p.cover) push({ url: p.cover });
  return out.slice(0, 3);
}
