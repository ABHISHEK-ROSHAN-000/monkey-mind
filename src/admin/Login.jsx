import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, isFirebaseConfigured } from '../lib/firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!isFirebaseConfigured || !auth) {
      setErr('Sign-in isn\u2019t working right now. Contact your developer.');
      return;
    }
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      nav('/admin', { replace: true });
    } catch {
      setErr('Login failed. Check the email and password and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrap" style={{ maxWidth: 440, padding: '80px 24px' }}>
      <Link to="/">← Back to site</Link>
      <h1 style={{ fontFamily: 'var(--font-head)' }}>Manage your website</h1>
      <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
        {isFirebaseConfigured ? 'Sign in to update your website.' : 'Sign-in isn\u2019t working right now. Contact your developer.'}
      </p>
      <form onSubmit={submit} className="card">
        <label>Email</label>
        <input type="email" required autoComplete="username" maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.in" />
        <label>Password</label>
        <input type="password" required autoComplete="current-password" maxLength={128} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
        {err && <p style={{ color: '#b3261e' }}>{err}</p>}
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </form>
    </div>
  );
}
