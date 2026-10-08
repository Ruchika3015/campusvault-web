import { DepthLayer } from '@/components/primitives/DepthLayer';
import { LED, Rivet } from '@/components/primitives/Details';
import { Github, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Explore Gigs', to: '/dashboard/gigs' },
      { label: 'Post a Gig', to: '/dashboard/post-gig' },
      { label: 'Exchange Engine', action: 'engine' },
      { label: 'How it works', action: 'explore' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Campus program', to: '/campus-program' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
      { label: 'Refund & Cancellation', to: '/refund-policy' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: 'GitHub', Icon: Github, href: null },
  { label: 'Twitter/X', Icon: Twitter, href: null },
  { label: 'Instagram', Icon: Instagram, href: null },
  { label: 'LinkedIn', Icon: Linkedin, href: null },
];

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAction = (action) => {
    if (action === 'explore') {
      if (location.pathname === '/') {
        document
          .getElementById('explore')
          ?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#explore');
      }
      return;
    }

    if (action === 'engine') {
      if (location.pathname === '/') {
        document
          .getElementById('engine')
          ?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/#engine');
      }
      return;
    }
  };

  const handleFind = () =>
    navigate(isAuthenticated ? '/dashboard/gigs' : '/login');

  const handlePost = () =>
    navigate(isAuthenticated ? '/dashboard/post-gig' : '/login');

  return (
    <footer className="relative overflow-hidden grain border-t border-metal-2/30 preserve-3d">
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,138,61,0.12), transparent 60%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <DepthLayer depth={40}>
          <div className="surface-metal-brushed metal-scratches rounded-3xl p-6 sm:p-12 relative mb-12">
            <Rivet size={10} className="absolute top-3 left-3" />
            <Rivet size={10} className="absolute top-3 right-3" />
            <Rivet size={10} className="absolute bottom-3 left-3" />
            <Rivet size={10} className="absolute bottom-3 right-3" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <LED color="amber" pulse size={7} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-2">
                    Ready when you are
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl text-ink-0 leading-tight">
                  Got a requirement?{' '}
                  <span className="text-amber">
                    Find the skill on Campusvault.
                  </span>
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleFind}
                  className="font-display text-sm uppercase tracking-tight px-5 py-3 rounded-xl text-bg-0 cursor-pointer transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber w-full sm:w-auto text-center"
                  style={{
                    background:
                      'linear-gradient(180deg, var(--amber-soft), var(--amber) 55%, var(--amber-deep))',
                    boxShadow:
                      'var(--glow-amber), inset 0 1px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  Explore Gigs
                </button>

                <button
                  type="button"
                  onClick={handlePost}
                  className="font-display text-sm uppercase tracking-tight px-5 py-3 rounded-xl text-bg-0 cursor-pointer transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint w-full sm:w-auto text-center"
                  style={{
                    background:
                      'linear-gradient(180deg, var(--mint-soft), var(--mint) 55%, var(--mint-deep))',
                    boxShadow:
                      'var(--glow-mint), inset 0 1px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  Post a Gig
                </button>
              </div>
            </div>
          </div>
        </DepthLayer>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr] gap-8 sm:gap-10 mb-12">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 mb-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-lg"
              aria-label="Campusvault home"
            >
              <img
                src="/logo.svg"
                alt="Campusvault logo"
                className="h-10 sm:h-12 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
              />

              <img
                src="/CampusVault.svg"
                alt="Campusvault"
                className="h-6 sm:h-7 w-auto object-contain shrink-0 translate-y-[7px] sm:translate-y-[9px]"
              />
            </Link>

            <p className="text-sm text-ink-2 leading-relaxed max-w-xs">
              A student-to-student micro-gig platform. Your problem.
              Someone&apos;s skill. That&apos;s Campusvault.
            </p>

            <div className="flex items-center gap-3 mt-5">
              {SOCIAL_LINKS.map(({ Icon, label, href }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid place-items-center w-9 h-9 rounded-lg text-ink-2 hover:text-ink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(107,118,137,0.3)',
                    }}
                    aria-label={label}
                  >
                    <Icon size={15} />
                  </a>
                ) : (
                  <span
                    key={label}
                    title={`${label} link coming soon`}
                    aria-label={`${label} link coming soon`}
                    className="grid place-items-center w-9 h-9 rounded-lg text-ink-2/80"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(107,118,137,0.3)',
                    }}
                  >
                    <Icon size={15} />
                  </span>
                )
              )}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2 mb-4">
                {column.title}
              </h4>

              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-ink-1 hover:text-amber transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-sm"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(link.action)}
                        className="text-sm text-ink-1 hover:text-amber transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-sm"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-metal-2/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-ink-3">
            © 2026 Campusvault · Built by students, for students
          </p>

          <p className="font-mono text-[11px] text-ink-3">
            The Campus Gig Exchange · v2.6
          </p>
        </div>
      </div>
    </footer>
  );
}