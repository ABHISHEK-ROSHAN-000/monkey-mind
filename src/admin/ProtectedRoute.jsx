import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProtectedRoute() {
  const [user, setUser] = useState(auth?.currentUser ?? null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!auth) {
      setChecking(false);
      return;
    }
    // Firebase restores the session asynchronously — wait for it instead of
    // reading currentUser synchronously (which is null on first reload).
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
  }, []);

  if (checking) return <main className="wrap"><p>Checking session…</p></main>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
