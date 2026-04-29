// LoginPage.tsx — full replacement

import React, { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';

const logo = '/assets/tahir-logo.png';
const bg   = '/assets/tahir-food-background.jpg';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [code,    setCode]    = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error,   setError]   = useState('');
  const [shaking, setShaking] = useState(false);

  // ✅ Single unique access code — change this anytime
  const SECRET_CODE = 'Tahirc';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // trim() removes any accidental spaces; case-sensitive match
    if (code.trim() === SECRET_CODE) {
      sessionStorage.setItem('tahir_logged_in', 'true');
      onLogin();
      return;
    }

    // Wrong code — shake the input and show inline error (no alert())
    setError('Invalid access code. Please try again.');
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
    setCode('');
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
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
        .shake { animation: shake 0.45s ease; }
      `}</style>

      <div className="flex min-h-screen items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-[2rem] border border-white/10 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[1.8rem] bg-white/10 ring-1 ring-white/10">
              <img src={logo} alt="Tahir" className="h-20 w-20 object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Tahir Fast Food</h1>
            <p className="mt-2 text-sm font-semibold text-white/60">
              Restaurant Management Dashboard
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">

            {/* Access Code field */}
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-[#f4c76a]">
                Access Code
              </label>
              <div
                className={`flex h-14 items-center gap-3 rounded-2xl border bg-white/90 px-4 text-[#24110c] shadow-[0_12px_28px_rgba(0,0,0,0.08)] ${shaking ? 'shake' : ''} ${error ? 'border-red-400' : 'border-white/10'}`}
              >
                <Key size={17} className="shrink-0 text-[#0284c7]" />
                <input
                  type={showCode ? 'text' : 'password'}
                  value={code}
                  onChange={e => { setCode(e.target.value); setError(''); }}
                  placeholder="Enter your access code"
                  autoComplete="off"
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-black/35"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(p => !p)}
                  className="shrink-0 text-black/45 transition hover:text-black"
                >
                  {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Inline error — no browser alert() */}
              {error && (
                <p className="mt-2 text-xs font-bold text-red-400">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="mt-3 flex h-14 w-full items-center justify-center rounded-2xl border-0 bg-[linear-gradient(135deg,#0891b2,#39d5ff)] text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_38px_rgba(57,213,255,0.26)] transition hover:-translate-y-0.5"
            >
              Login
            </button>
          </form>

          {/* ✅ Demo login text removed */}
        </div>
      </div>
    </div>
  );
}