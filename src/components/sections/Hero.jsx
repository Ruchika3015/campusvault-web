import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DepthLayer, ForegroundLayer } from '@/components/primitives/DepthLayer';
import { PaperNote } from '@/components/primitives/PaperNote';
import { LED, LEDMeter, Particle, Rivet, Screen, MachineSwitch, Cable } from '@/components/primitives/Details';
import { ArrowDown, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { api } from '@/services/api';

const NOTE_POSITIONS = [
  { top: '10%', right: '14%', rot: -6, delay: '0s' },
  { top: '16%', right: '2%', rot: 5, delay: '0.5s' },
  { top: '27%', right: '24%', rot: -4, delay: '1s' },
  { top: '34%', right: '8%', rot: 6, delay: '0.3s' },
  { top: '44%', right: '28%', rot: -5, delay: '0.8s' },
  { top: '48%', right: '3%', rot: 4, delay: '1.4s' },
];

const DEFAULT_SLIPS = [
  { id: '1', emoji: '💻', text: 'Fullstack React + Node feature build', budget: '₹1,500', time: 'Development' },
  { id: '2', emoji: '🎨', text: 'Brand identity & clean SVG logo set', budget: '₹800', time: 'Design' },
  { id: '3', emoji: '📐', text: 'Engineering mathematics assignment solve', budget: '₹600', time: 'Academics' },
  { id: '4', emoji: '🎬', text: 'Club reel video editing & audio sync', budget: '₹1,200', time: 'Media' },
  { id: '5', emoji: '⚡', text: 'Arduino IoT sensor setup and circuit test', budget: '₹950', time: 'Hardware' },
  { id: '6', emoji: '📝', text: 'Technical documentation & API spec writeup', budget: '₹750', time: 'Content' },
  { id: '7', emoji: '🔍', text: 'Python data analysis & graph plots', budget: '₹850', time: 'Data' },
];

export function Hero() {
  const [gigs, setGigs] = useState([]);
  const [gigCount, setGigCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    api.getGigs()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : res?.gigs || res?.data?.gigs || [];
        setGigCount(list.length);
        if (list.length > 0) {
          const mapped = list.slice(0, NOTE_POSITIONS.length).map((g) => ({
            id: g._id,
            emoji: '💼',
            text: g.title,
            budget: g.budget ? `₹${g.budget}` : 'Open',
            time: g.category || 'Gig',
          }));
          setGigs(mapped);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const activeSlips = gigs.length > 0 ? gigs : DEFAULT_SLIPS;
  return (
    <section
      id="top"
      className="relative min-h-screen overflow-hidden grain preserve-3d"
    >
      {/* ===== BACKGROUND LAYER — walls, diagrams, faint lettering, light ===== */}
      <DepthLayer depth={-200} className="absolute inset-0 pointer-events-none" blur={1.5}>
        {/* warm key light — muted amber */}
        <div
          className="absolute top-[8%] left-[25%] w-[900px] h-[700px] rounded-full anim-breathe"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.16), transparent 60%)',
            filter: 'blur(70px)',
          }}
        />
        {/* cool rim — very subtle green */}
        <div
          className="absolute bottom-[-15%] right-[-8%] w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(93,184,154,0.07), transparent 60%)',
            filter: 'blur(70px)',
          }}
        />
        {/* secondary warm glow lower-right where the engine sits */}
        <div
          className="absolute bottom-[5%] right-[15%] w-[500px] h-[400px] rounded-full anim-breathe"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.12), transparent 60%)',
            filter: 'blur(50px)',
            animationDelay: '1.5s',
          }}
        />
      </DepthLayer>

      {/* technical diagram grid on the wall */}
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      {/* faint giant background lettering */}
      <div className="bg-lettering">CAMPUSVAULT</div>

      {/* architectural wall outlines — structural frame */}
      <DepthLayer depth={-160} className="absolute inset-0 pointer-events-none" blur={1}>
        {/* wall frame — vertical structural lines */}
        <div className="absolute top-0 left-[8%] w-px h-full" style={{ background: 'linear-gradient(180deg, transparent, var(--metal-2) 15%, var(--metal-2) 85%, transparent)', opacity: 0.15 }} />
        <div className="absolute top-0 right-[5%] w-px h-full" style={{ background: 'linear-gradient(180deg, transparent, var(--metal-2) 15%, var(--metal-2) 85%, transparent)', opacity: 0.15 }} />
        {/* horizontal beam */}
        <div className="absolute top-[18%] left-0 right-0 h-px" style={{ background: 'var(--metal-2)', opacity: 0.1 }} />
        <div className="absolute bottom-[22%] left-0 right-0 h-px" style={{ background: 'var(--metal-2)', opacity: 0.1 }} />
        {/* thin technical annotations */}
        <div className="absolute top-[19%] left-[10%] font-mono text-[8px] text-ink-3/30 tracking-wider">SECTION A-02</div>
        <div className="absolute bottom-[23%] right-[8%] font-mono text-[8px] text-ink-3/30 tracking-wider">REF: CJ-X24</div>
      </DepthLayer>

      {/* atmospheric haze + depth fog */}
      <div className="absolute inset-0 haze pointer-events-none" />
      <div className="absolute inset-0 depth-fog pointer-events-none" />

      {/* ===== MIDGROUND — the Jugaad Engine machine (partially visible, right side) ===== */}
      <DepthLayer depth={-60} className="absolute inset-0 pointer-events-none hidden md:block" blur={0.5}>
        {/* Large machine housing — bottom right, partially off-screen */}
        <div
          className="absolute bottom-[-8%] right-[-4%] w-[480px] h-[420px] rounded-3xl surface-metal-brushed metal-scratches opacity-90"
          style={{ transform: 'perspective(800px) rotateY(-8deg) rotateX(2deg)' }}
        >
          {/* rivets on the machine housing */}
          <Rivet size={10} className="absolute top-4 left-4" />
          <Rivet size={10} className="absolute top-4 right-4" />
          <Rivet size={8} className="absolute top-4 left-1/2" />
          <Rivet size={8} className="absolute bottom-4 left-4" />
          <Rivet size={8} className="absolute bottom-4 right-4" />

          {/* serial plate */}
          <div className="absolute top-3 left-16 font-mono text-[7px] text-ink-3 tracking-wider">CJ-ENGINE-X24</div>

          {/* circular mechanical core — always rotating */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-32 h-32 grid place-items-center">
            <div
              className="absolute inset-0 rounded-full anim-rotor"
              style={{
                background: 'conic-gradient(from 0deg, var(--amber), transparent 25%, var(--mint) 50%, transparent 75%, var(--amber))',
                filter: 'blur(3px)',
                opacity: 0.6,
              }}
            />
            <div
              className="absolute inset-5 rounded-full anim-rotor-rev"
              style={{
                background: 'conic-gradient(from 180deg, var(--amber-deep), transparent 30%, var(--coral) 60%, transparent 90%)',
                filter: 'blur(2px)',
                opacity: 0.4,
              }}
            />
            <div className="absolute inset-8 rounded-full" style={{ background: 'var(--bg-1)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9)' }} />
            <div
              className="relative z-10 grid place-items-center w-10 h-10 rounded-full anim-core-pulse"
              style={{
                background: 'radial-gradient(circle, var(--amber-soft), var(--amber) 60%, var(--amber-deep))',
                boxShadow: 'var(--glow-amber)',
              }}
            >
              <Zap size={16} className="text-bg-0" />
            </div>
            {/* orbiting particles — always moving */}
            <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full anim-orbit" style={{ ['--orbit-r']: '44px', ['--orbit-d']: '5s', background: 'var(--mint)', boxShadow: 'var(--glow-mint)' }} />
            <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full anim-orbit" style={{ ['--orbit-r']: '54px', ['--orbit-d']: '7s', background: 'var(--amber)', boxShadow: 'var(--glow-amber)' }} />
          </div>

          {/* indicator lights row */}
          <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 flex items-center gap-2">
            <LED color="amber" pulse size={5} />
            <LED color="amber" pulse size={5} style={{ animationDelay: '0.3s' }} />
            <LED color="off" size={5} />
            <LED color="mint" pulse size={5} style={{ animationDelay: '0.6s' }} />
            <LED color="mint" pulse size={5} />
          </div>

          {/* signal trace line — always running */}
          <div className="absolute bottom-[20%] left-6 right-6 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
            <div className="h-full w-1/4 anim-signal" style={{ background: 'linear-gradient(90deg, transparent, var(--amber), transparent)' }} />
          </div>

          {/* small status display */}
          <div className="absolute bottom-[10%] left-6">
            <Screen tone="amber" className="rounded-md p-2 w-28 h-12" flicker>
              <p className="font-mono text-[7px] text-amber-soft leading-tight">
                QUEUE: 12<br />
                <span className="text-mint">ACTIVE: 7</span>
              </p>
            </Screen>
          </div>

          {/* small label */}
          <div className="absolute bottom-[10%] right-6 font-technical text-[7px] text-ink-3">
            MATCHING APPARATUS
          </div>
        </div>

        {/* vertical cable run right side */}
        <div className="absolute top-0 right-[14%] w-px h-full" style={{ background: 'linear-gradient(180deg, transparent, var(--metal-2) 20%, var(--metal-2) 80%, transparent)', opacity: 0.3 }} />
        {/* horizontal cable stubs */}
        <div className="absolute top-[28%] right-[10%] w-[8%] h-px" style={{ background: 'var(--metal-2)', opacity: 0.25 }} />
        <div className="absolute top-[52%] right-[16%] w-[6%] h-px" style={{ background: 'var(--metal-2)', opacity: 0.25 }} />
      </DepthLayer>

      {/* ===== MIDGROUND — cables and pipes ===== */}
      <DepthLayer depth={-30} className="absolute inset-0 pointer-events-none hidden md:block">
        <Cable className="top-[32%] left-0 w-[16%]" />
        <Cable className="bottom-[24%] right-[2%] w-[22%]" color="var(--amber-deep)" />
        <Cable className="top-[48%] left-[5%] w-[10%]" color="var(--mint-deep)" />
        {/* a pipe — thicker cable */}
        <div className="absolute top-[68%] left-0 w-[20%] h-1 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, var(--metal-1) 0 8px, var(--metal-0) 8px 10px)', opacity: 0.4 }} />
      </DepthLayer>

      {/* ===== INTAKE SLOT — lower right, near the machine ===== */}
      <DepthLayer depth={20} className="absolute bottom-[16%] right-[6%] hidden lg:flex flex-col items-center gap-2 pointer-events-auto">
        <div className="font-technical text-[8px] text-ink-3">INTAKE // REQUEST</div>
        <div
          className="relative w-40 h-3 rounded-lg"
          style={{
            background: 'linear-gradient(180deg, var(--bg-0) 0%, var(--bg-2) 100%)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* glow inside the slot */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-1 rounded-full" style={{ background: 'var(--amber)', opacity: 0.3, filter: 'blur(2px)' }} />
        </div>
        <div className="flex items-center gap-1.5">
          <LED color="amber" pulse size={5} />
          <span className="font-technical text-[7px] text-ink-3">DROP REQUEST</span>
        </div>
      </DepthLayer>


      {/* atmospheric dust — gentle floating */}
      <DepthLayer depth={30} className="absolute inset-0 pointer-events-none">
        {[
          { top: '16%', left: '22%', s: 3, c: 'rgba(34,197,94,0.45)', d: '0s' },
          { top: '38%', left: '62%', s: 2, c: 'rgba(93,184,154,0.25)', d: '1.2s' },
          { top: '68%', left: '18%', s: 3, c: 'rgba(34,197,94,0.3)', d: '0.6s' },
          { top: '48%', left: '42%', s: 2, c: 'rgba(242,237,228,0.2)', d: '1.8s' },
          { top: '28%', left: '78%', s: 2, c: 'rgba(34,197,94,0.35)', d: '2.2s' },
          { top: '76%', left: '52%', s: 2, c: 'rgba(93,184,154,0.2)', d: '1s' },
        ].map((p, i) => (
          <Particle key={i} size={p.s} color={p.c} className="anim-float" style={{ top: p.top, left: p.left, animationDelay: p.d }} />
        ))}
      </DepthLayer>

      {/* ===== FOREGROUND — physical request slips at varying depths ===== */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {NOTE_POSITIONS.slice(0, activeSlips.length).map((pos, i) => (
          <div
            key={activeSlips[i]?.id || i}
            className="absolute anim-float-slow pointer-events-auto"
            style={{
              top: pos.top, right: pos.right, bottom: pos.bottom, left: pos.left,
              ['--rot']: `${pos.rot}deg`,
              animationDelay: pos.delay,
              zIndex: pos.bottom ? 15 : 10,
            }}
          >
            <PaperNote note={activeSlips[i]} rotate={pos.rot} className="w-44" small={i % 2 === 1} />
          </div>
        ))}
      </div>


      {/* ===== MAIN COMPOSITION — asymmetrical, left-aligned (UNCHANGED) ===== */}
      <ForegroundLayer depth={60} className="relative z-20 min-h-screen flex items-center px-4 sm:px-12 lg:px-20 pt-24 sm:pt-28 pb-16 sm:pb-20 pointer-events-none">
        <div className="max-w-2xl pointer-events-auto">
          {/* technical label */}
          <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10 anim-reveal flex-wrap">
            <LED color="mint" pulse size={7} />
            <span className="font-technical text-[9px] sm:text-[10px] text-ink-2">
              01 — The Campus Gig Exchange
            </span>
            <span className="h-px w-8 sm:w-12 bg-metal-2" />
            <span className="font-technical text-[9px] sm:text-[10px] text-ink-3">STATUS: READY</span>
          </div>

          {/* editorial statement — the visual anchor */}
          <h1 className="font-display text-ink-0 anim-reveal" style={{ animationDelay: '0.1s' }}>
            <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.98] sm:leading-[0.95] tracking-tight">
              Your problem.
            </span>
            <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.98] sm:leading-[0.95] tracking-tight text-amber mt-1">
              Someone's skill.
            </span>
            <span className="block font-editorial text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink-1 mt-2 normal-case">
              That's Campusvault.
            </span>
          </h1>

          {/* description */}
          <p className="mt-6 sm:mt-8 max-w-md text-xs sm:text-base text-ink-2 leading-relaxed anim-reveal" style={{ animationDelay: '0.3s' }}>
            A student-to-student exchange where a problem walks in and a skill walks out.
            Post what you need. Find who can do it. Get it done.
          </p>

          {/* CTA Buttons for guests */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 anim-reveal" style={{ animationDelay: '0.4s' }}>
            <a
              href="#live-gigs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-technical text-xs font-bold uppercase tracking-wider bg-amber text-bg-0 hover:brightness-110 shadow-lg hover:shadow-amber/25 transition-all group cursor-pointer w-full sm:w-auto text-center"
            >
              <span>EXPLORE LIVE GIGS</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-technical text-xs font-bold uppercase tracking-wider bg-bg-1 text-ink-0 hover:text-ink-0 hover:bg-bg-2 border-2 border-metal-2 shadow-sm transition-all w-full sm:w-auto text-center"
            >
              <span>POST A REQUIREMENT</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-3 sm:gap-x-5 font-mono text-[10px] sm:text-[11px] text-ink-2 anim-reveal" style={{ animationDelay: '0.5s' }}>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber shadow-sm" />
              100% Student Verified
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-mint shadow-sm" />
              Direct Peer-to-Peer
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-coral shadow-sm" />
              Zero Platform Cut
            </span>
          </div>

          {/* counter — subtle */}
          <div className="mt-8 flex items-center gap-3 anim-reveal" style={{ animationDelay: '0.55s' }}>
            <span className="font-mono text-xs text-ink-0 font-bold">{gigCount > 0 ? gigCount : 'Live'}</span>
            <span className="font-technical text-[9px] text-ink-3">Active gigs listed on campus</span>
          </div>

          {/* scroll cue */}
          <a
            href="#what-we-offer"
            className="mt-12 inline-flex items-center gap-2 text-ink-3 hover:text-ink-1 transition-colors anim-reveal"
            style={{ animationDelay: '0.65s' }}
            aria-label="Scroll to discover what we offer"
          >
            <span className="font-technical text-[9px]">Discover what we offer</span>
            <ArrowDown size={14} className="anim-float" />
          </a>
        </div>
      </ForegroundLayer>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, var(--bg-0))' }} />
    </section>
  );
}
