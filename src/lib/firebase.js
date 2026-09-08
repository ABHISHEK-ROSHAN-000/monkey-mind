// Firebase integration. Works in two modes:
// 1. Configured (all VITE_FIREBASE_* set): exports db/auth for Firestore + Auth.
// 2. Placeholder (default first draft): exports nulls; app falls back to local store.
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(cfg.apiKey && cfg.projectId);

let db = null;
let auth = null;
if (isFirebaseConfigured) {
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };
