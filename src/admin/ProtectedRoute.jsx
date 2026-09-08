import { Navigate, Outlet } from 'react-router-dom';
import { isAuthed } from './auth.js';
import { auth } from '../lib/firebase.js';

export default function ProtectedRoute() {
  // Firebase session counts too; fallback to demo session flag.
  const ok = (auth?.currentUser ? true : false) || isAuthed();
  if (!ok) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
