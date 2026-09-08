// Cloudinary unsigned upload (CMS media). Falls back to local object URLs
// when VITE_CLOUDINARY_* is not configured (first-draft mode).
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(CLOUD && PRESET);

export function cloudinaryUrl(publicId, { w = 1200 } = {}) {
  if (!publicId || !CLOUD) return null;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_${w}/${publicId}`;
}

export async function uploadToCloudinary(file, folder = 'monkey-mind') {
  if (!isCloudinaryConfigured) {
    return { url: URL.createObjectURL(file), publicId: null, type: file.type.startsWith('video') ? 'video' : 'image' };
  }
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', PRESET);
  fd.append('folder', folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const j = await res.json();
  const kind = j.resource_type === 'video' ? 'video' : (file.type === 'image/gif' ? 'gif' : 'image');
  return { url: j.secure_url, publicId: j.public_id, type: kind };
}

export async function deleteFromCloudinary() {
  // Unsigned presets cannot delete client-side; deletion is handled by
  // removing the reference in Firestore + a server-side cleanup note.
  return true;
}
