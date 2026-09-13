// Cloudinary unsigned upload (CMS media). Cloudinary-only: uploads are
// blocked until VITE_CLOUDINARY_* is configured — nothing is stored as
// local blob URLs, so every saved image survives reloads and is visible
// to all visitors.
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(CLOUD && PRESET);

export function cloudinaryUrl(publicId, { w = 1200 } = {}) {
  if (!publicId || !CLOUD) return null;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_${w}/${publicId}`;
}

// Optimized delivery URL for a stored media item { url, publicId, type }.
// Cloudinary-hosted photos get auto-format + sized variants; GIFs keep their
// original file (format conversion can kill animation); manual/legacy URLs
// without a publicId pass through untouched.
export function deliveryUrl(m, { w = 1200 } = {}) {
  if (!m?.url) return null;
  if (m.type === 'gif' || !m.publicId || !CLOUD) return m.url;
  if (m.type === 'video') return `https://res.cloudinary.com/${CLOUD}/video/upload/q_auto,w_${w},f_auto/${m.publicId}`;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_${w}/${m.publicId}`;
}

export async function uploadToCloudinary(file, folder = 'monkey-mind') {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Add VITE_CLOUDINARY_* to .env (see .env.example).');
  }
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', PRESET);
  fd.append('folder', folder);
  let res;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, { method: 'POST', body: fd });
  } catch {
    throw new Error('Upload failed: no connection to Cloudinary. Check internet and retry.');
  }
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.json())?.error?.message || '';
    } catch { /* ignore */ }
    throw new Error(`Cloudinary upload failed (status ${res.status})${detail ? `: ${detail}` : '. Check the upload preset.'}`);
  }
  const j = await res.json();
  if (!j?.secure_url) throw new Error('Cloudinary upload failed: empty response. Retry.');
  const kind = j.resource_type === 'video' ? 'video' : (file.type === 'image/gif' ? 'gif' : 'image');
  // Cloudinary echoes the source name back (extension excluded), e.g.
  // original_filename "sample" + format "jpg" → display "sample.jpg".
  const originalFilename = j.original_filename ? (j.format ? `${j.original_filename}.${j.format}` : j.original_filename) : null;
  return { url: j.secure_url, publicId: j.public_id, type: kind, originalFilename };
}

// Note: unsigned presets cannot delete client-side, so CMS deletes are
// logical-only (the Firestore reference is removed; the hosted asset stays
// on Cloudinary until purged manually in the Cloudinary dashboard).
