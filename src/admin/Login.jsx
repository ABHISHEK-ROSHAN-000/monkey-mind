import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { demoLogin } from './auth.js';
import { auth, isFirebaseConfigured } from '../lib/firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      if (isFirebaseConfigured && auth) {
        await signInWithEmailAndPassword(auth, email, pass);
        try { sessionStorage.setItem('mm_admin_session', '1'); } catch { /* ignore */ }
        nav('/admin');
        return;
      }
      if (demoLogin(email, pass)) nav('/admin');
      else setErr('Invalid credentials. First-draft demo: admin@mmstudio.in / monkeymind123 (or set VITE_ADMIN_*).');
    } catch {
      setErr('Login failed. Check Firebase user or demo credentials.');
    }
  };

  return (
    <div className="wrap" style={{ maxWidth: 440, padding: '80px 24px' }}>
      <Link to="/">← Back to site</Link>
      <h1 style={{ fontFamily: 'var(--font-head)' }}>Admin login</h1>
      <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>
        {isFirebaseConfigured ? 'Firebase Auth enabled.' : 'Demo mode — Firebase not configured yet. See .env.example.'}
      </p>
      <form onSubmit={submit} className="card">
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@mmstudio.in" />
        <label>Password</label>
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
        {err && <p style={{ color: '#b3261e' }}>{err}</p>}
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}
