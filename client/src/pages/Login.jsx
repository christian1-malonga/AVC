import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLES } from '../hooks/usePermissions';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

const DEMO = [
  ['Admin', 'admin@choircloud.com', 'admin'],
  ['President', 'president@choircloud.com', 'president'],
  ['Secretary', 'secretary@choircloud.com', 'secretary'],
  ['Provost', 'provost@choircloud.com', 'provost'],
  ['Custodian', 'custodian@choircloud.com', 'custodian'],
  ['Electoral', 'electoral@choircloud.com', 'electoral'],
  ['Member', 'miriam@choircloud.com', 'member'],
];

const GoogleMark = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="g-mark">
    <path fill="#4285F4" d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.42Z" />
    <path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.7Z" />
    <path fill="#FBBC05" d="M6.54 13.78A5.85 5.85 0 0 1 6.23 12c0-.62.11-1.22.31-1.78V7.69H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.31l3.24-2.53Z" />
    <path fill="#EA4335" d="M12 6.19c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.28 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z" />
  </svg>
);

export default function Login({ onSwitch }) {
  const { login, demoLogin, googleLogin } = useAuth();
  const { toast } = useToast();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);

  const googleLoginRef = useRef(googleLogin);
  useEffect(() => { googleLoginRef.current = googleLogin; });

  /* Load Google Identity Services when a Client ID is configured */
  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    const init = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => {
          try {
            const p = JSON.parse(atob(resp.credential.split('.')[1]));
            googleLoginRef.current({ email: p.email, name: p.name, avatarUrl: p.picture, googleId: p.sub });
          } catch { /* ignore bad token */ }
        },
        auto_select: false,
        ux_mode: 'popup',
      });
      window.google.accounts.id.disableAutoSelect();
      setGoogleReady(true);
    };
    if (window.google?.accounts?.id) init();
    else {
      const s = document.createElement('script');
      s.src = GIS_SRC;
      s.async = true;
      s.onload = init;
      s.onerror = () => { if (!cancelled) setGoogleFailed(true); };
      document.head.appendChild(s);
    }
    return () => { cancelled = true; };
  }, [clientId]);

  /* FIX: render the official button via callback-ref, so it draws the moment the container exists */
  const googleBtnRef = useCallback((node) => {
    if (node && window.google?.accounts?.id) {
      node.innerHTML = '';
      window.google.accounts.id.renderButton(node, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: 300,
      });
    }
  }, []);

  const sandboxGoogle = () => {
    toast('Sandbox Google sign-in (add VITE_GOOGLE_CLIENT_ID for the real account chooser)');
    googleLogin({ email: 'google.chorister@gmail.com', name: 'Google Chorister', avatarUrl: null, googleId: 'sandbox-' + Date.now() });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!email || !pass) return toast('Email and password are required.', 'err');
    setLoading('form');
    (async () => {
      try { await login(email, pass); }
      catch (err) { toast(err.message, 'err'); }
      finally { setLoading(null); }
    })();
  };

  const demo = async (em) => {
    setLoading(em);
    try { await demoLogin(em); }
    catch (err) { toast(err.message, 'err'); }
    finally { setLoading(null); }
  };

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <img src="/choir_logo.jpeg" alt="AVC Logo" className="auth-logo" />
        <p className="auth-title">St. Barnabas<br />Amazing Voices Choir</p>
        <p className="auth-sub2">Sing Praises to the Lord</p>

        <form onSubmit={submit} className="auth-form">
          <label className="label" htmlFor="login-email">Email address</label>
          <input id="login-email" name="email" className="input" type="email" autoComplete="email"
            placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="lab-row">
            <label className="label" htmlFor="login-password">Password</label>
            <button type="button" className="link-gold" onClick={() => toast('Password reset is coming soon.')}>Forgot Password?</button>
          </div>
          <div className="relative">
            <input id="login-password" name="password" className="input" type={show ? 'text' : 'password'} autoComplete="current-password"
              placeholder="Enter your password" value={pass} onChange={(e) => setPass(e.target.value)} style={{ paddingRight: 38 }} />
            <button type="button" onClick={() => setShow((v) => !v)} className="eye-btn" aria-label="Toggle password visibility">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button className="btn-gold" type="submit" disabled={loading !== null}>
            {loading === 'form' && <Loader2 size={16} className="spin" />} Sign In
          </button>
        </form>

        <div className="or-row"><span className="or-line" />OR<span className="or-line" /></div>

        {/* ===== GOOGLE BUTTON — always visible now ===== */}
        <div className="google-wrap">
          {clientId && !googleFailed ? (
            googleReady ? (
              <div ref={googleBtnRef} />
            ) : (
              <button className="btn-google2" disabled><Loader2 size={16} className="spin" /> Loading Google…</button>
            )
          ) : (
            <button className="btn-google2" type="button" onClick={sandboxGoogle}>
              <GoogleMark /><span>Continue with Google</span>
            </button>
          )}
        </div>

        <div className="or-row"><span className="or-line" />demo roles<span className="or-line" /></div>
        <div className="demo-grid2">
          {DEMO.map(([label, em, role]) => (
            <button type="button" key={em} className="demo-btn2" onClick={() => demo(em)} disabled={loading !== null}>
              <span className="demo-dot" style={{ background: ROLES[role].color }} />{label}
            </button>
          ))}
        </div>

        <p className="auth-foot-link">Don&apos;t have an account? <button className="link-gold" onClick={onSwitch}>Create Account</button></p>
      </section>
      <footer className="foot-bar fixed">© 2026 St. Barnabas Amazing Voices Choir. All rights Reserved</footer>
    </main>
  );
}