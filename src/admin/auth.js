// Demo-local auth. If Firebase Auth is configured, Login.jsx will use it;
// otherwise this session-flag fallback keeps the first draft usable.
const KEY = 'mm_admin_session';

export function isAuthed() {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}
export function demoLogin(email, password) {
  const okEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@mmstudio.in').toLowerCase();
  const okPass = import.meta.env.VITE_ADMIN_PASSWORD || 'monkeymind123';
  if (email.trim().toLowerCase() === okEmail && password === okPass) {
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    return true;
  }
  return false;
}
export function demoLogout() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}
