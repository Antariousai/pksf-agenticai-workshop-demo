import React, { lazy, Suspense, useCallback, useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { COLORS } from './pksf_demo_scenarios.js';

const SESSION_KEY = 'pksf_demo_logged_in';

const DEMO_EMAIL = 'workshop-demo@antarious.com';
const DEMO_PASSWORD = 'Workshop@pksf_2026';

const labelRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  fontSize: '0.8rem',
  fontWeight: 600,
  color: COLORS.textDim,
  marginBottom: 6,
};

const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: 0,
  padding: '12px 13px',
  borderRadius: 9,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surfaceHi,
  color: COLORS.text,
  fontFamily: 'inherit',
  fontSize: '1rem',
  outlineColor: COLORS.mint,
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function readStoredAuth() {
  try {
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

/** Loaded only after workshop sign-in succeeds (or valid tab session) — main demo never mounts without the gate. */
const PKSFAgentDemo = lazy(() => import('./pksf_agent_demo.jsx'));

export default function DemoLoginGate() {
  const [authed, setAuthed] = useState(() => readStoredAuth());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = email.trim().toLowerCase();
      const p = password;
      if (trimmed === DEMO_EMAIL.toLowerCase() && p === DEMO_PASSWORD) {
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
          /* ignore quota / privacy mode */
        }
        setError('');
        setAuthed(true);
      } else {
        setError('Incorrect email or password.');
      }
    },
    [email, password],
  );

  if (authed) {
    return (
      <Suspense
        fallback={
          <div
            className="demo-login-shell"
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              background: COLORS.bg,
              color: COLORS.textDim,
              fontSize: '0.95rem',
            }}
          >
            Loading AI Agent Experience Center…
          </div>
        }
      >
        <PKSFAgentDemo />
      </Suspense>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        body, html, #root { margin: 0; padding: 0; color-scheme: light; min-height: 100%; }
        .demo-login-shell {
          font-family: 'DM Sans', 'Noto Sans Bengali', system-ui, sans-serif;
          color: ${COLORS.text};
        }
        .font-display { font-family: 'Syne', 'Noto Sans Bengali', sans-serif; letter-spacing: -0.01em; }
        .demo-login-shell .demo-login-input:focus {
          border-color: ${COLORS.mint};
          box-shadow: 0 0 0 3px rgba(26, 111, 168, 0.2);
          outline: none;
        }
      `}</style>
      <div
        className="demo-login-shell"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
          background: COLORS.bg,
          backgroundImage: `
            radial-gradient(ellipse at 18% -10%, rgba(26, 111, 168, 0.14), transparent 45%),
            radial-gradient(ellipse at 92% 110%, rgba(14, 140, 114, 0.1), transparent 48%)`,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 16,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 20px 50px rgba(13, 44, 74, 0.12)',
            padding: '36px 32px 32px',
          }}
          role="main"
          aria-labelledby="demo-login-heading"
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <img
              src="/braindot-ai-logo.png"
              alt="Braindot AI"
              width={58}
              height={58}
              decoding="async"
              style={{
                width: 58,
                height: 58,
                borderRadius: 13,
                objectFit: 'contain',
                display: 'block',
                boxShadow: '0 8px 24px rgba(13, 44, 74, 0.08)',
              }}
            />
          </div>
          <h1
            id="demo-login-heading"
            className="font-display"
            style={{
              margin: '0 0 6px',
              fontSize: '1.55rem',
              fontWeight: 800,
              textAlign: 'center',
              letterSpacing: -0.02,
            }}
          >
            Workshop demo sign-in
          </h1>
          <p style={{ margin: '0 0 26px', fontSize: '0.93rem', color: COLORS.textDim, textAlign: 'center', lineHeight: 1.55 }}>
            Use your <strong style={{ color: COLORS.text, fontWeight: 600 }}>workshop email</strong> and password to enter the AI Agent Experience Center.
          </p>

          <form onSubmit={onSubmit}>
            <div>
              <div style={labelRow}>
                <Mail size={15} strokeWidth={2.2} aria-hidden style={{ opacity: 0.85 }} />
                <span>Email</span>
              </div>
              <input
                className="demo-login-input"
                type="email"
                autoComplete="email"
                placeholder="you@organisation.org"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                style={inputStyle}
              />
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={labelRow}>
                <Lock size={15} strokeWidth={2.2} aria-hidden style={{ opacity: 0.85 }} />
                <span>Password</span>
              </div>
              <input
                className="demo-login-input"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                style={inputStyle}
              />
            </div>

            {error ? (
              <p
                role="alert"
                style={{
                  margin: '14px 0 0',
                  fontSize: '0.88rem',
                  color: COLORS.red,
                  fontWeight: 500,
                }}
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              style={{
                width: '100%',
                marginTop: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 18px',
                borderRadius: 10,
                border: 'none',
                background: `linear-gradient(135deg, ${COLORS.mint}, ${COLORS.teal})`,
                color: COLORS.onAccent,
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 18px rgba(26, 111, 168, 0.32)',
              }}
            >
              <Lock size={17} strokeWidth={2.2} aria-hidden />
              Continue to demo
            </button>
          </form>

          <div
            style={{
              marginTop: 24,
              padding: '16px 16px 14px',
              borderRadius: 11,
              background: COLORS.blueWash,
              border: `1px solid ${COLORS.borderHi}`,
              fontSize: '0.8rem',
              color: COLORS.textDim,
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: COLORS.text,
                fontSize: '0.72rem',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              Facilitator demo credentials
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, color: COLORS.textMute, fontSize: '0.75rem', marginBottom: 4 }}>
                Email
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.8rem',
                  color: COLORS.text,
                  wordBreak: 'break-all',
                  background: COLORS.surface,
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {DEMO_EMAIL}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: COLORS.textMute, fontSize: '0.75rem', marginBottom: 4 }}>
                Password
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.8rem',
                  color: COLORS.text,
                  wordBreak: 'break-all',
                  background: COLORS.surface,
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                {DEMO_PASSWORD}
              </div>
            </div>
          </div>

          <p style={{ margin: '18px 0 0', fontSize: '0.76rem', color: COLORS.textMute, textAlign: 'center', lineHeight: 1.5 }}>
            This screen is part of the workshop preview only — credentials are simulated in the browser, not validated by a server. Closing this tab clears your session.
          </p>
        </div>
      </div>
    </>
  );
}
