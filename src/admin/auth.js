// Firebase-only admin session. There is no demo fallback: without a
// configured Firebase Auth user, the CMS refuses to sign in.
import { auth } from '../lib/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Calls cb(user | null) on every auth change. Returns an unsubscribe fn.
export function watchAuth(cb) {
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}

export async function adminLogout() {
  if (auth) {
    try {
      await signOut(auth);
    } catch {
      /* ignore — session already dead */
    }
  }
}
