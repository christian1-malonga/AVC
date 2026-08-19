import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './pages/Login';
import Register from './pages/Register';
import SelectSection from './pages/SelectSection';
import SectionConfirm from './pages/SectionConfirm';
import AppShell from './components/AppShell';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function Root() {
  const { user, pendingGoogle } = useAuth();
  const [screen, setScreen] = useState('login');

  // Flow 1: pending Google login → show section confirm screen
  if (pendingGoogle) return <SectionConfirm />;
  // Flow 2: not logged in → show login / register
  if (!user) return screen === 'register' ? <Register onSwitch={() => setScreen('login')} /> : <Login onSwitch={() => setScreen('register')} />;
  // Flow 3: logged in but no section → show section picker (for non-Google users)
  if (!user.section) return <SelectSection />;
  // Flow 4: fully logged in → dashboard shell
  return <AppShell />;
}

export default function App() {
  const inner = (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <Root />
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );

  // Only wrap in GoogleOAuthProvider if we have a client ID
  if (GOOGLE_CLIENT_ID) {
    return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{inner}</GoogleOAuthProvider>;
  }
  // Without a client ID we still render the app — the Google button will show a sandbox notice
  return <SandboxGoogleWrapper>{inner}</SandboxGoogleWrapper>;
}

// Sandbox wrapper: lets the Google button render a friendly notice when no client ID is set
function SandboxGoogleWrapper({ children }) {
  return (
    <>
      {children}
      <div style={{
        position: 'fixed', bottom: 12, right: 12, background: '#fff3cd', color: '#856404',
        padding: '8px 14px', borderRadius: 8, fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,.15)', zIndex: 9999
      }}>
        ⚠️ Google sign-in in sandbox mode. Add <code>VITE_GOOGLE_CLIENT_ID</code> to client/.env
      </div>
    </>
  );
}