import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const IconScan = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
    <line x1="7" y1="12" x2="17" y2="12"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconGoogle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function LandingPage() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.email || 'User';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#FAFAFA] selection:bg-[#FF3D00] selection:text-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#262626] bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[#1A1A1A] border border-[#404040] text-[#FF3D00]">
              <IconScan />
            </div>
            <span className="font-bold text-base tracking-tight uppercase text-white font-display">CodeLens</span>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-6 h-6 border border-[#404040]" />
                  ) : (
                    <div className="w-6 h-6 bg-[#FF3D00] text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center uppercase font-mono-code">
                      {userName.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-mono-code text-neutral-300 hidden sm:inline">{userName}</span>
                  <button
                    type="button"
                    onClick={signOut}
                    className="text-xs uppercase font-mono-code text-neutral-500 hover:text-neutral-200 transition-colors tracking-wider"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-mono-code uppercase tracking-wider bg-[#1A1A1A] text-neutral-200 border border-[#262626] hover:border-[#FF3D00] transition-colors"
                >
                  <IconGoogle />
                  Sign in
                </button>
              )
            )}

            <Link
              to="/app"
              className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-[#FF3D00] text-[#0A0A0A] hover:bg-[#FF541F] transition-colors"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-6 py-20 gap-24">
        {/* Poster Hero Section */}
        <section className="flex flex-col items-start gap-8">
          {/* Accent Line Visual Anchor */}
          <div className="h-1 w-20 bg-[#FF3D00]" />

          <p className="text-xs font-mono-code uppercase tracking-[0.2em] text-[#FF3D00]">
            Automated Code Analysis &amp; Blind Spot Detection
          </p>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black font-display tracking-tighter text-white leading-[0.95]">
            FIND YOUR <br />
            <span className="text-[#FF3D00]">BLIND SPOTS.</span> <br />
            FIX THEM FAST.
          </h1>

          <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed font-normal">
            Paste your code. Get an instant algorithm &amp; security diagnosis. Know exactly what to study before shipping.
          </p>

          <div className="pt-4">
            <Link
              to="/app"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF3D00] text-[#0A0A0A] font-bold text-sm uppercase tracking-widest hover:bg-[#FF541F] transition-transform active:translate-y-px"
            >
              Start Analyzing Now
              <IconArrowRight />
            </Link>
          </div>
        </section>

        {/* Feature Grid with Sharp Borders */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-b border-[#262626] divide-y md:divide-y-0 md:divide-x divide-[#262626]">
          <div className="p-8 flex flex-col gap-3 bg-[#0F0F0F]">
            <span className="text-xs font-mono-code uppercase tracking-[0.15em] text-[#FF3D00]">01 / ALGO</span>
            <h2 className="text-xl font-bold font-display tracking-tight text-white">Algo Diagnosis</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Identify hidden complexity bottlenecks, nested loop inefficiencies, and sub-optimal data structures.
            </p>
          </div>

          <div className="p-8 flex flex-col gap-3 bg-[#0F0F0F]">
            <span className="text-xs font-mono-code uppercase tracking-[0.15em] text-[#FF3D00]">02 / SECURITY</span>
            <h2 className="text-xl font-bold font-display tracking-tight text-white">Security Scan</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Detect input sanitization gaps, SQL injection risks, and exposed secrets before code goes live.
            </p>
          </div>

          <div className="p-8 flex flex-col gap-3 bg-[#0F0F0F]">
            <span className="text-xs font-mono-code uppercase tracking-[0.15em] text-[#FF3D00]">03 / PATTERN</span>
            <h2 className="text-xl font-bold font-display tracking-tight text-white">Pattern Tracking</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Track recurring weaknesses over time and get targeted guidance on what to study next.
            </p>
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#262626] py-8 text-xs font-mono-code uppercase tracking-wider text-neutral-500">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span>CodeLens · Structural &amp; Algorithmic Intelligence</span>
          <Link to="/app" className="text-neutral-300 hover:text-[#FF3D00] transition-colors">
            Open Workspace →
          </Link>
        </div>
      </footer>
    </div>
  );
}
