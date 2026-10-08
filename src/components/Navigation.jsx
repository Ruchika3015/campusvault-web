import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { TactileButton } from '@/components/primitives/TactileButton';
import { Rivet } from '@/components/primitives/Details';
import { useAuth } from '@/context/AuthContext';

const LINKS = [
  { label: 'What We Offer', href: '#what-we-offer' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Live Gigs', href: '#live-gigs' },
  { label: 'Categories', href: '#categories' },
  { label: 'FAQ', href: '#faq' },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('campvault_theme', next);
    setTheme(next);
  };

  // Only show on the landing page
  if (location.pathname !== '/') return null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`surface-metal-brushed metal-scratches relative w-full max-w-6xl rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'opacity-100' : 'opacity-95'}`}
      >
        <Rivet size={7} className="absolute top-2 left-2" />
        <Rivet size={7} className="absolute top-2 right-2" />
        <Rivet size={7} className="absolute bottom-2 left-2" />
        <Rivet size={7} className="absolute bottom-2 right-2" />

        {/* Brand mark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-lg py-0.5"
          aria-label="Campusvault home"
        >
          <img
            src="/logo.svg"
            alt="Campusvault logo"
            className="h-9 sm:h-11 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
          />
          <img
            src="/CampusVault.svg"
            alt="Campusvault"
            className="h-5 sm:h-6 w-auto object-contain shrink-0 translate-y-[6px] sm:translate-y-[8px]"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="group relative font-technical text-xs text-ink-1 hover:text-ink-0 px-3.5 py-2 transition-colors whitespace-nowrap"
            >
              {l.label}
              <span className="absolute left-3.5 right-3.5 -bottom-0.5 h-px bg-amber scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid place-items-center w-8 h-8 rounded-lg text-ink-1 hover:text-amber transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(107,118,137,0.3)' }}
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === 'light' ? <Moon size={14} className="text-amber" /> : <Sun size={14} className="text-ink-1 hover:text-amber" />}
          </button>

          {isAuthenticated ? (
            <Link to="/dashboard">
              <TactileButton variant="amber" className="!py-2 !px-4" ariaLabel="Go to Dashboard">
                Dashboard <ArrowRight size={13} className="ml-1" />
              </TactileButton>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <TactileButton variant="ghost" className="!py-2 !px-3.5 !text-white font-bold" ariaLabel="Login">
                  Login
                </TactileButton>
              </Link>
              <Link to="/signup">
                <TactileButton variant="amber" className="!py-2 !px-3.5 !text-white font-bold" ariaLabel="Sign up">
                  Sign Up
                </TactileButton>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid place-items-center w-8 h-8 rounded-lg text-ink-1 hover:text-amber transition-colors cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(107,118,137,0.3)' }}
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === 'light' ? <Moon size={14} className="text-amber" /> : <Sun size={14} className="text-ink-1 hover:text-amber" />}
          </button>

          <button
            className="grid place-items-center w-8 h-8 rounded-lg text-ink-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(107,118,137,0.4)' }}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-2 surface-panel rounded-2xl p-4 flex flex-col gap-2 anim-reveal border border-metal-1 shadow-2xl max-h-[80vh] overflow-y-auto">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-technical text-xs text-ink-1 hover:text-ink-0 px-3 py-2.5 rounded-lg hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <div className="h-px bg-metal-1 my-1" />
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                <TactileButton variant="amber" className="w-full justify-center">Go to Dashboard</TactileButton>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <TactileButton variant="ghost" className="w-full justify-center">Login</TactileButton>
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)}>
                  <TactileButton variant="amber" className="w-full justify-center">Sign Up</TactileButton>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
