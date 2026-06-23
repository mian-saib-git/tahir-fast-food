import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

const logo = '/assets/tahir-logo.png';
const bg = '/assets/tahir-food-background.jpg';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        setError('Email or password is incorrect.');
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
        return;
      }

      sessionStorage.setItem('tahir_logged_in', 'true');
      onLogin();
    } catch {
      setError('Unable to connect to Supabase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `
          radial-gradient(circle at center, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.50) 68%, rgba(0,0,0,0.78) 100%),
          linear-gradient(rgba(18,8,5,0.72), rgba(18,8,5,0.88)),
          url(${bg})
        `,
      }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }

        .shake {
          animation: shake 0.45s ease;
        }
      `}</style>

      <div className="flex min-h-screen items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-[2rem] border border-white/10 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
          style={{
            background:
              'linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[1.8rem] bg-white/10 ring-1 ring-white/10">
              <img
                src={logo}
                alt="Tahir"
                className="h-20 w-20 object-contain"
              />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white">
              Tahir Fast Food
            </h1>

            <p className="mt-2 text-sm font-semibold text-white/60">
              Restaurant Management Dashboard
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#f4c76a]">
                Email address
              </label>

              <div
                className={`flex h-14 items-center gap-3 rounded-2xl border bg-white/90 px-4 text-[#24110c] ${
                  error ? 'border-red-400' : 'border-white/10'
                }`}
              >
                <Mail size={17} className="shrink-0 text-[#0284c7]" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError('');
                  }}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-black/35"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#f4c76a]">
                Password
              </label>

              <div
                className={`flex h-14 items-center gap-3 rounded-2xl border bg-white/90 px-4 text-[#24110c] ${
                  shaking ? 'shake' : ''
                } ${
                  error ? 'border-red-400' : 'border-white/10'
                }`}
              >
                <Lock size={17} className="shrink-0 text-[#0284c7]" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-black/35"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="shrink-0 text-black/45 transition hover:text-black"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-3 flex h-14 w-full items-center justify-center rounded-2xl border-0 bg-[linear-gradient(135deg,#0891b2,#39d5ff)] text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_38px_rgba(57,213,255,0.26)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
