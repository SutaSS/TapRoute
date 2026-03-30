'use client';

// ============================================================
// TapRoute — Login Page (/login)
// ============================================================
// TODO: Integrasikan dengan auth provider (NextAuth / Supabase / custom JWT)
// Saat ini hanya UI placeholder + redirect ke dashboard

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');

  // ------------------------------------------------------------
  // handleLogin — proses login
  // ------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Ganti dengan actual auth API call
      // Contoh: await signIn('credentials', { email, password })
      // atau: await fetch('/api/auth/login', { method: 'POST', body: ... })

      // MOCK: Untuk demo langsung redirect ke dashboard
      console.log('[Login] Demo login:', email);
      await new Promise((r) => setTimeout(r, 800)); // simulasi loading
      router.push('/dashboard');
    } catch {
      setError('Email atau password salah. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <main className="login-page">
      <div className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <h1 className="login-logo">🗺️ TapRoute</h1>
          <p className="login-tagline">AI-Powered Travel Planner · Dukung UMKM Lokal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form">
          <h2 className="login-title">Masuk ke Akun</h2>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              required
              disabled={isLoading}
              className="form-input"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="form-input"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary btn-full"
            id="login-submit-btn"
          >
            {isLoading ? '⏳ Masuk...' : '🚀 Masuk'}
          </button>

          {/* TODO: Tambahkan link register / forgot password */}
          <p className="login-demo-note">
            Demo: masukkan email & password apa saja untuk melanjutkan.
          </p>
        </form>
      </div>
    </main>
  );
}
