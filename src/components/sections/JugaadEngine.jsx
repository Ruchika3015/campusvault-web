import { useState, useEffect, useRef } from 'react';
import { DepthLayer, ForegroundLayer } from '@/components/primitives/DepthLayer';
import { Screen, LED, LEDMeter, Rivet, Sticker, Particle, Cable } from '@/components/primitives/Details';
import { TactileButton } from '@/components/primitives/TactileButton';
import { PaperNote } from '@/components/primitives/PaperNote';
import { Star, Cpu, Activity, ArrowRight, CheckCircle2, Power } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

const ENGINE_STAGES = ['IDLE', 'RECEIVE', 'ANALYZE', 'MATCH', 'FOUND'];

const FALLBACK_GIGS = [
  { id: '1', title: 'Fullstack React feature implementation', budget: 1500, category: 'Development', skill: 'React, Node.js' },
  { id: '2', title: 'Minimalist logo & brand assets', budget: 800, category: 'Design', skill: 'Figma, Vector Art' },
  { id: '3', title: 'Discrete mathematics assignment help', budget: 600, category: 'Academics', skill: 'Discrete Math, Proofs' },
];

const CANDIDATE_PROFILES = [
  { id: 'c1', name: 'Aman S.', skill: 'Fullstack Systems', rating: '4.9', completed: '18', tag: 'Top Contributor', initials: 'AS', accent: 'amber' },
  { id: 'c2', name: 'Ruchika C.', skill: 'UI/UX & Design', rating: '5.0', completed: '24', tag: 'Design Lead', initials: 'RC', accent: 'mint' },
  { id: 'c3', name: 'Dev P.', skill: 'Algorithmic CS', rating: '4.8', completed: '12', tag: 'Fast Delivery', initials: 'DP', accent: 'coral' },
];

export function ExchangeEngine() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const handleExplore = () => navigate(isAuthenticated ? '/dashboard/gigs' : '/login');
  const handlePost = () => navigate(isAuthenticated ? '/dashboard/post-gig' : '/login');

  const [stage, setStage] = useState('IDLE');
  const [liveGigs, setLiveGigs] = useState(FALLBACK_GIGS);
  const [activeGigIndex, setActiveGigIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [active, setActive] = useState(true);
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.getGigs()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : res?.gigs || res?.data?.gigs || [];
        if (list.length > 0) {
          setLiveGigs(list);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || !active) return;
    let i = 0;
    const tick = () => {
      const idx = Math.floor(i / ENGINE_STAGES.length) % liveGigs.length;
      setActiveGigIndex(idx);
      setStage(ENGINE_STAGES[i % ENGINE_STAGES.length]);
      i++;
    };
    tick();
    const interval = setInterval(tick, 2400);
    return () => clearInterval(interval);
  }, [inView, active, liveGigs]);

  const stageIndex = ENGINE_STAGES.indexOf(stage);
  const engineOn = active;
  const isFound = stage === 'FOUND';

  const currentGig = liveGigs[activeGigIndex] || FALLBACK_GIGS[0];
  const currentCandidate = CANDIDATE_PROFILES[activeGigIndex % CANDIDATE_PROFILES.length];

  const currentNote = {
    emoji: '💼',
    text: currentGig.title,
    budget: currentGig.budget ? `₹${currentGig.budget}` : 'Open',
    time: currentGig.category || 'Gig',
  };

  return (
    <section
      id="engine"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-24 px-4 overflow-hidden grain preserve-3d"
    >
      {/* ambient engine glow */}
      <DepthLayer depth={-120} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full anim-breathe"
          style={{
            background: `radial-gradient(circle, rgba(34,197,94,${engineOn ? 0.16 : 0.07}), transparent 60%)`,
            filter: 'blur(60px)',
          }}
        />
      </DepthLayer>

      {/* technical diagram backdrop */}
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      {/* Section label */}
      <ForegroundLayer depth={60} className="relative z-10 text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-3">
          <LED color="amber" pulse size={7} />
          <span className="font-technical text-[10px] text-ink-2">Matching Apparatus</span>
          <span className="h-px w-12 bg-metal-2" />
          <span className="font-technical text-[10px] text-ink-3">UNIT 02</span>
        </div>
        <h2 className="font-display text-2xl sm:text-5xl md:text-6xl tracking-tight text-ink-0">
          THE CAMPUSVAULT <span className="text-amber">EXCHANGE ENGINE</span>
        </h2>
        <p className="mt-4 max-w-md mx-auto text-xs sm:text-sm text-ink-2">
          A project requirement enters the engine. It parses skills, matches student talent, and guarantees secure delivery.
        </p>
      </ForegroundLayer>

      {/* ===== THE MACHINE ===== */}
      <div
        className="relative w-full max-w-5xl preserve-3d"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <DepthLayer depth={40}>
          <div className="relative surface-metal-brushed metal-scratches rounded-3xl p-4 sm:p-10">
            {/* Rivets */}
            <Rivet size={11} className="absolute top-3 left-3" />
            <Rivet size={11} className="absolute top-3 right-3" />
            <Rivet size={11} className="absolute bottom-3 left-3" />
            <Rivet size={11} className="absolute bottom-3 right-3" />
            <Rivet size={8} className="absolute top-3 left-1/2 -translate-x-1/2" />
            <Rivet size={8} className="absolute bottom-3 left-1/2 -translate-x-1/2" />

            {/* serial number plate */}
            <div className="absolute top-3 right-16 font-mono text-[7px] text-ink-3 tracking-wider hidden sm:block">
              MODEL CV-X26 · S/N 0042-VAULT
            </div>

            {/* Top status bar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-metal-2/40">
              <div className="flex items-center gap-3">
                <Cpu size={16} className={engineOn ? 'text-amber' : 'text-ink-3'} />
                <span className="font-mono text-xs uppercase tracking-wider text-ink-1">CAMPUSVAULT-OS v2.6</span>
                {hovering && engineOn && (
                  <span className="font-technical text-[8px] text-mint flex items-center gap-1 anim-reveal">
                    <CheckCircle2 size={10} /> ENGINE READY
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <LEDMeter level={stageIndex + 1} count={5} color={isFound ? 'mint' : 'amber'} size={5} />
                <span className="font-mono text-[9px] uppercase tracking-wider text-ink-2 hidden sm:inline">
                  {stage}
                </span>
              </div>
            </div>

            {/* ===== Three-stage pipeline ===== */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch preserve-3d">
              {/* INPUT */}
              <div className="flex flex-col gap-3">
                <StageLabel step="01" label="GIG INTAKE" color="coral" active={stageIndex >= 1} />
                <div className="relative surface-panel rounded-2xl p-5 flex-1 min-h-[260px] flex flex-col">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 rounded-b-lg" style={{ background: 'linear-gradient(180deg, var(--bg-0), var(--bg-2))', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)' }} />
                  <div className="flex items-center gap-2 mb-3 mt-1">
                    <LED color={stageIndex >= 1 ? 'coral' : 'off'} pulse={stageIndex >= 1} size={6} />
                    <span className="font-technical text-[9px] text-ink-2">incoming_requirement</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className={`transition-all duration-500 ${stageIndex >= 1 ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2'}`}>
                      <PaperNote note={currentNote} rotate={-3} small className="w-full max-w-[200px] mx-auto" />
                    </div>
                  </div>
                  <p className="font-mono text-[9px] text-ink-3 mt-3 truncate">
                    &gt; {currentGig.title}
                  </p>
                </div>
              </div>

              {/* CORE */}
              <div className="flex flex-col gap-3 md:w-64">
                <StageLabel step="02" label="MATCHING CORE" color="amber" active={stageIndex >= 2} centered />
                <div className="relative surface-panel rounded-2xl p-5 flex-1 min-h-[260px] flex flex-col items-center justify-center gap-4 overflow-hidden">
                  <div className="relative w-36 h-36 grid place-items-center preserve-3d">
                    <div
                      className="absolute inset-0 rounded-full anim-rotor"
                      style={{
                        background: 'conic-gradient(from 0deg, var(--amber), transparent 25%, var(--mint) 50%, transparent 75%, var(--amber))',
                        opacity: engineOn ? 0.35 : 0.1,
                        filter: 'blur(4px)',
                      }}
                    />
                    <div
                      className="w-24 h-24 rounded-full surface-metal grid place-items-center relative"
                      style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)' }}
                    >
                      <div
                        className="w-16 h-16 rounded-full border border-amber/40 grid place-items-center text-center"
                        style={{ background: 'var(--bg-0)' }}
                      >
                        <span className="font-mono text-[9px] text-amber font-bold leading-tight">
                          {stage}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* signal trace */}
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                    {engineOn && (
                      <div className="h-full w-1/3 anim-signal" style={{ background: 'linear-gradient(90deg, transparent, var(--amber), transparent)' }} />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Activity size={11} className={engineOn ? 'text-mint' : 'text-ink-3'} />
                    <span className="font-technical text-[9px] text-ink-2">
                      {stage === 'ANALYZE' ? 'matching skills...' : stage === 'MATCH' ? 'scoring candidates...' : stage === 'FOUND' ? 'talent matched' : 'standby'}
                    </span>
                  </div>
                </div>
              </div>

              {/* OUTPUT */}
              <div className="flex flex-col gap-3">
                <StageLabel step="03" label="TALENT MATCH" color="mint" active={isFound} />
                <div className="relative surface-panel rounded-2xl p-5 flex-1 min-h-[260px] flex flex-col">
                  <div
                    className="absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(93,184,154,0.10), transparent 70%)',
                      opacity: isFound ? 1 : 0,
                    }}
                  />
                  <div className="relative flex items-center gap-2 mb-3">
                    <LED color={isFound ? 'mint' : 'off'} pulse={isFound} size={6} />
                    <span className="font-technical text-[9px] text-ink-2">recommended_worker</span>
                  </div>
                  <div className="relative flex-1 flex items-center justify-center">
                    <div className={`transition-all duration-500 ${isFound ? 'opacity-100 scale-100' : 'opacity-20 scale-95'}`}>
                      <MatchCard match={currentCandidate} active={isFound} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* signal cables */}
            <div className="hidden md:block">
              <Cable className="top-1/2 left-[33%] w-[3%]" color="var(--coral)" />
              <Cable className="top-1/2 left-[64%] w-[3%]" color="var(--mint)" />
            </div>

            {/* Bottom rail */}
            <div className="mt-6 pt-4 border-t border-metal-2/40 flex items-center justify-between">
              <button
                onClick={() => setActive((v) => !v)}
                className="flex items-center gap-2 group"
                aria-label="Toggle engine power"
              >
                <span className="grid place-items-center w-7 h-7 rounded-md surface-metal-brushed group-hover:scale-105 transition-transform">
                  <Power size={12} className={engineOn ? 'text-amber' : 'text-ink-3'} />
                </span>
                <span className="font-technical text-[9px] text-ink-3">
                  {engineOn ? 'engine.active' : 'engine.standby'}
                </span>
              </button>
              <div className="hidden sm:flex items-center gap-2 font-mono text-[9px] text-ink-3">
                <span>latency 0.28s</span>
                <span className="text-metal-edge">·</span>
                <span>campus-wide matching</span>
              </div>
            </div>
          </div>
        </DepthLayer>

        {/* ambient particles */}
        {[
          { top: '-2%', left: '8%', s: 3, c: 'rgba(34,197,94,0.45)' },
          { top: '5%', left: '90%', s: 2, c: 'rgba(93,184,154,0.3)' },
          { bottom: '-2%', left: '40%', s: 3, c: 'rgba(34,197,94,0.3)' },
        ].map((p, i) => (
          <Particle key={i} size={p.s} color={p.c} className="anim-drift" style={{ top: p.top, left: p.left, bottom: p.bottom }} />
        ))}
      </div>

      {/* CTAs below engine */}
      <ForegroundLayer depth={60} className="mt-12 flex flex-col sm:flex-row items-center gap-4">
        <TactileButton variant="amber" onClick={handleExplore}>
          <ArrowRight size={14} />
          Explore Gigs
        </TactileButton>
        <TactileButton variant="mint" id="post" onClick={handlePost}>
          Post a Gig
        </TactileButton>
      </ForegroundLayer>
    </section>
  );
}

// Keep JugaadEngine as alias for backwards compatibility
export const JugaadEngine = ExchangeEngine;

function StageLabel({ step, label, color, active, centered }) {
  const text = active ? `var(--${color})` : 'var(--text-3)';
  return (
    <div className={`flex items-center gap-2 ${centered ? 'justify-center' : ''}`}>
      <span className="font-mono text-[9px] text-ink-3">{step}</span>
      <span className="font-technical text-[9px] transition-colors duration-500" style={{ color: text }}>
        {label}
      </span>
    </div>
  );
}

function MatchCard({ match, active }) {
  const accentBg =
    match.accent === 'mint'
      ? 'linear-gradient(135deg, var(--mint), var(--mint-deep))'
      : match.accent === 'coral'
        ? 'linear-gradient(135deg, var(--coral), #a04040)'
        : 'linear-gradient(135deg, var(--amber), var(--amber-deep))';

  return (
    <div className={`w-full max-w-[220px] ${active ? 'anim-match-pop' : ''}`}>
      <div className="surface-panel rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div
            className="grid place-items-center w-11 h-11 rounded-xl shrink-0 font-display text-bg-0 text-base"
            style={{ background: accentBg, boxShadow: active ? 'var(--glow-mint)' : 'none' }}
          >
            {match.initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-display text-base text-ink-0 truncate">{match.name}</p>
              {active && <CheckCircle2 size={12} className="text-mint shrink-0" />}
            </div>
            <p className="font-mono text-[10px] text-ink-2 truncate">{match.skill}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-amber fill-amber" />
            <span className="font-mono text-xs text-ink-0">{match.rating}</span>
          </div>
          <span className="font-mono text-[9px] text-ink-2">{match.completed} completed</span>
        </div>
        <div className="mt-3">
          <Sticker color={match.accent === 'coral' ? 'coral' : match.accent === 'mint' ? 'mint' : 'amber'} rotate={-2}>
            {match.tag}
          </Sticker>
        </div>
      </div>
    </div>
  );
}
