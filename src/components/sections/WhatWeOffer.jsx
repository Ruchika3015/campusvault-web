import { Link } from 'react-router-dom';
import { DepthLayer } from '@/components/primitives/DepthLayer';
import { LED } from '@/components/primitives/Details';
import {
  Sparkles,
  Send,
  Wallet,
  HandCoins,
  ShieldCheck,
  RotateCcw,
  Users,
  CheckCircle2,
} from 'lucide-react';

const OFFERINGS = [
  {
    icon: Send,
    tag: 'POST IN 60 SECONDS',
    accent: 'amber',
    title: 'Instant Campus Gig Posting',
    description:
      'Got a stuck React bug, need a club fest poster, or an engineering lab assignment completed? Drop your requirement with a clear budget in ₹ and deadline.',
    perks: ['Custom budgets (fixed or hourly)', 'Exact skill tagging', 'Hard deadline tracking'],
  },
  {
    icon: Wallet,
    tag: '100% YOUR EARNINGS',
    accent: 'mint',
    title: 'Monetize Your Practical Skills',
    description:
      'Turn your late-night coding, Figma designs, video editing, or exam notes into verified income without leaving your hostel or library.',
    perks: ['Zero platform commission cuts', 'Direct student-to-student payments', 'Build verified portfolio proofs'],
  },
  {
    icon: HandCoins,
    tag: 'FLEXIBLE TERMS',
    accent: 'coral',
    title: 'Interactive Proposal & Bargain Engine',
    description:
      'Quotes aren’t rigid. Propose custom counter-budgets, negotiate deliverables, discuss scope in real-time, and agree on fair rates before committing.',
    perks: ['Custom counter-offers', 'Scope negotiation', 'Direct messaging with posters'],
  },
  {
    icon: ShieldCheck,
    tag: 'CAMPUS TRUST',
    accent: 'amber',
    title: 'Verified Student College Profiles',
    description:
      'Safety and trust come first. Every member is verified with college credentials, authentic peer star ratings, and real completion histories.',
    perks: ['College domain authentication', 'Peer review ratings (1-5 stars)', 'Public portfolio & social links'],
  },
  {
    icon: RotateCcw,
    tag: 'COMPLETE CONTROL',
    accent: 'mint',
    title: 'Self-Serve Application Lifecycle',
    description:
      'Full transparency at every step. Track submitted proposals in real-time, review incoming candidates, or withdraw your proposal anytime if schedules change.',
    perks: ['One-click application withdrawal', 'Live status indicators', 'Zero penalty for fair withdrawals'],
  },
  {
    icon: Users,
    tag: 'CAMPUS VENTURES',
    accent: 'coral',
    title: 'Cross-Branch Networking & Teams',
    description:
      'Bridge the gap between departments. Connect CS coders with design leads and business minds to form hackathon squads and campus startups.',
    perks: ['Find complementary co-creators', 'Hackathon squad assembly', 'Campus-wide reputation level up'],
  },
];

export function WhatWeOffer() {
  return (
    <section
      id="what-we-offer"
      className="relative py-28 px-4 sm:px-8 lg:px-16 overflow-hidden grain preserve-3d border-t border-metal-2/40"
    >
      {/* Background Ambience */}
      <DepthLayer depth={-120} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(22,163,74,0.09), transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
      </DepthLayer>
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-3 mb-4">
            <LED color="amber" pulse size={7} />
            <span className="font-technical text-[10px] font-bold tracking-wider text-ink-0">
              02 — WHAT CAMPUSVAULT OFFERS
            </span>
            <span className="h-px w-12 bg-metal-2" />
            <span className="font-technical text-[10px] text-ink-2">PLATFORM CAPABILITIES</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink-0 leading-tight tracking-tight">
            THE ALL-IN-ONE
            <br />
            <span className="text-amber">CAMPUS TALENT EXCHANGE.</span>
          </h2>

          <p className="mt-5 text-base sm:text-lg text-ink-1 leading-relaxed">
            Campusvault replaces chaotic WhatsApp group chats and bulletin boards with a structured,
            verified ecosystem where college students solve problems, trade skills, and get paid.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFERINGS.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="surface-metal-brushed rounded-2xl p-6 sm:p-7 border-2 border-metal-2 shadow-sm hover:border-amber/70 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={`grid place-items-center w-12 h-12 rounded-xl border-2 ${
                        item.accent === 'amber'
                          ? 'bg-amber/10 border-amber/30 text-amber'
                          : item.accent === 'mint'
                          ? 'bg-mint/10 border-mint/30 text-mint'
                          : 'bg-coral/10 border-coral/30 text-coral'
                      }`}
                    >
                      <IconComponent size={22} />
                    </span>

                    <span className="font-technical text-[9px] font-bold px-2.5 py-1 rounded-md bg-bg-1 border border-metal-2 text-ink-0 tracking-wider">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-ink-0 mb-3 group-hover:text-amber transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-ink-1 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-5 border-t-2 border-metal-2/50 space-y-2">
                  {item.perks.map((perk, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-xs font-mono text-ink-0">
                      <CheckCircle2 size={13} className="text-amber shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Highlight Strip */}
        <div className="mt-14 surface-panel rounded-2xl p-6 sm:p-8 border-2 border-metal-2 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-14 h-14 rounded-2xl bg-amber/15 text-amber shrink-0 border-2 border-amber/30">
              <Sparkles size={26} />
            </span>
            <div>
              <h4 className="font-display text-lg text-ink-0">
                Ready to see what campus peers are working on right now?
              </h4>
              <p className="text-sm text-ink-1 mt-1 font-sans">
                Browse open requirements across coding, design, electronics, and academics.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <a
              href="#live-gigs"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-technical text-xs font-bold uppercase tracking-wider bg-amber text-bg-0 hover:brightness-110 shadow transition-all"
            >
              BROWSE LIVE GIGS
            </a>
            <Link
              to="/signup"
              className="w-full sm:w-auto text-center px-5 py-3 rounded-xl font-technical text-xs font-bold uppercase tracking-wider bg-bg-1 text-ink-0 border-2 border-metal-2 hover:bg-bg-2 transition-all"
            >
              JOIN FREE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
