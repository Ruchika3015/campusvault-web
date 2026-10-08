import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DepthLayer } from '@/components/primitives/DepthLayer';
import { LED } from '@/components/primitives/Details';
import {
  Search,
  CalendarDays,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Lock,
} from 'lucide-react';
import { api } from '@/services/api';

const FALLBACK_GIGS = [
  {
    _id: 'fb-1',
    title: 'Fullstack React + Node Feature Development',
    description: 'Need assistance building an authentication flow with JWT tokens and user profile endpoints.',
    category: 'Coding',
    budget: 1500,
    skillsRequired: ['React', 'Node.js', 'JWT', 'MongoDB'],
    deadline: '2026-09-25',
    college: 'DTU Delhi',
  },
  {
    _id: 'fb-2',
    title: 'Minimalist Club Fest Poster & Brand Assets',
    description: 'Design 3 high-resolution Instagram reels covers and a print poster for our annual robotics symposium.',
    category: 'Design',
    budget: 800,
    skillsRequired: ['Figma', 'Photoshop', 'Typography'],
    deadline: '2026-09-22',
    college: 'GL Bajaj ITM',
  },
  {
    _id: 'fb-3',
    title: 'Automated Plant Watering IoT Project',
    description: 'Assistance required setting up soil moisture sensor code on ESP32 with relay triggering.',
    category: 'Hardware & Electronics',
    budget: 1200,
    skillsRequired: ['ESP32', 'Arduino', 'C++', 'Sensors'],
    deadline: '2026-09-28',
    college: 'DTU Delhi',
  },
  {
    _id: 'fb-4',
    title: 'Campus Fest Teaser Reel & Sound Design',
    description: 'Edit a 60-second vertical trailer using raw 4K drone & phone footage. Sound effects and beat matching needed.',
    category: 'Photography',
    budget: 950,
    skillsRequired: ['Premiere Pro', 'DaVinci Resolve', 'Audio Sync'],
    deadline: '2026-09-20',
    college: 'Allahabad University',
  },
  {
    _id: 'fb-5',
    title: 'Sponsorship Pitch Deck Strategy & Outreach',
    description: 'Draft outreach emails and refine corporate presentation slides for inter-college hackathon sponsors.',
    category: 'Marketing',
    budget: 1000,
    skillsRequired: ['Pitch Decks', 'Communication', 'Sponsorship'],
    deadline: '2026-09-30',
    college: 'GL Bajaj ITM',
  },
  {
    _id: 'fb-6',
    title: 'Discrete Mathematics & Graph Proofs Tutoring',
    description: 'Need 2 hours of whiteboard explanation on Euler paths, graph isomorphism, and tree traversals for midterms.',
    category: 'Other',
    budget: 600,
    skillsRequired: ['Discrete Math', 'Graph Theory', 'Tutoring'],
    deadline: '2026-09-18',
    college: 'Allahabad University',
  },
];

const normalizeCollege = (val) => {
  if (!val) return 'Campus Member';
  const str = String(val).trim();
  const low = str.toLowerCase();
  if (low.includes('bajaj')) return 'GL Bajaj ITM';
  if (low.includes('dtu')) return 'DTU Delhi';
  if (low.includes('allahabad')) return 'Allahabad University';
  return str;
};

export function LiveGigsPreview() {
  const [gigs, setGigs] = useState(FALLBACK_GIGS);
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [selectedCollege, setSelectedCollege] = useState('ALL CAMPUSES');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.getGigs()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : res?.gigs || res?.data?.gigs || [];
        if (list.length > 0) {
          const mapped = list.map((g) => ({
            _id: g._id,
            title: g.title,
            description: g.description,
            category: g.category || 'Other',
            budget: g.budget || g.amount || 500,
            skillsRequired: Array.isArray(g.skillsRequired) && g.skillsRequired.length
              ? g.skillsRequired
              : Array.isArray(g.skills) && g.skills.length
              ? g.skills
              : ['General'],
            deadline: g.deadline ? String(g.deadline).slice(0, 10) : 'Flexible',
            college: normalizeCollege(g.postedBy?.college || g.employer?.college),
          }));
          setGigs(mapped);
        }
      })
      .catch(() => {
        // Keeps curated fallbacks
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Compute available categories with active gigs
  const availableCategories = useMemo(() => {
    const cats = new Set(['ALL']);
    gigs.forEach((g) => {
      if (g.category) cats.add(g.category);
    });
    return Array.from(cats);
  }, [gigs]);

  // Compute available colleges with active gigs
  const availableColleges = useMemo(() => {
    const list = new Set(['ALL CAMPUSES']);
    gigs.forEach((g) => {
      if (g.college && g.college !== 'Campus Member') {
        list.add(g.college);
      }
    });
    return Array.from(list);
  }, [gigs]);

  // Filter visible gigs
  const filteredGigs = useMemo(() => {
    return gigs.filter((g) => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.skillsRequired?.some((s) => s.toLowerCase().includes(q)) ||
        g.college?.toLowerCase().includes(q);

      const matchesCat =
        selectedCat === 'ALL' ||
        g.category?.toLowerCase() === selectedCat.toLowerCase();

      const matchesCollege =
        selectedCollege === 'ALL CAMPUSES' ||
        g.college?.toLowerCase() === selectedCollege.toLowerCase();

      return matchesQuery && matchesCat && matchesCollege;
    });
  }, [gigs, query, selectedCat, selectedCollege]);

  return (
    <section
      id="live-gigs"
      className="relative py-28 px-4 sm:px-8 lg:px-16 overflow-hidden grain preserve-3d border-t border-metal-2/40"
    >
      <DepthLayer depth={-100} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 right-1/4 w-[800px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34,197,94,0.08), transparent 60%)',
            filter: 'blur(70px)',
          }}
        />
      </DepthLayer>
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <LED color="amber" pulse size={7} />
              <span className="font-technical text-[10px] font-bold tracking-wider text-ink-0">
                04 — LIVE MARKETPLACE PREVIEW
              </span>
              <span className="h-px w-12 bg-metal-2" />
              <span className="font-technical text-[10px] text-ink-2">CAMPUS OPPORTUNITIES</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink-0 tracking-tight">
              DISCOVER WORK POSTED TODAY.
            </h2>
            <p className="mt-3 text-base text-ink-1 max-w-xl">
              Preview live requirements from partner colleges. Sign up with your college email to access your campus's private gig vault.
            </p>
          </div>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-2.5 rounded-xl font-technical text-xs font-bold uppercase tracking-wider bg-amber text-bg-0 hover:brightness-110 shadow transition-all group"
          >
            <span>SIGN UP TO APPLY</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Campus Context Info Banner for Non-Signed In Users */}
        <div className="surface-panel rounded-2xl p-4 sm:p-5 border-2 border-metal-2 mb-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-amber/15 text-amber shrink-0 border-2 border-amber/30">
              <GraduationCap size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-ink-0 uppercase tracking-wide">
                  PUBLIC MULTI-CAMPUS PREVIEW
                </span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-mint/15 text-mint font-bold">
                  ALL UNIVERSITIES
                </span>
              </div>
              <p className="text-xs text-ink-1 mt-1 font-sans max-w-2xl leading-relaxed">
                As a guest, you are seeing active gigs posted across partner campuses.
                <strong className="text-ink-0 font-semibold"> Sign in with your college email</strong> to automatically filter and unlock your own college's private gig network.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
            <Link
              to="/signup"
              className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl font-technical text-xs font-bold uppercase tracking-wider bg-amber text-bg-0 hover:brightness-110 shadow-sm"
            >
              UNLOCK MY CAMPUS →
            </Link>
          </div>
        </div>

        {/* Filter Bar with Category & Campus Selectors */}
        <div className="surface-panel rounded-2xl p-4 border-2 border-metal-2 mb-8 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center flex-1 rounded-xl bg-bg-1 border-2 border-metal-2 px-3 py-2 shadow-sm">
              <Search size={16} className="text-ink-2 shrink-0 mr-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by keyword, skill, or campus (e.g. DTU, GL Bajaj)..."
                className="w-full bg-transparent font-mono text-xs text-ink-0 placeholder:text-ink-2 outline-none font-medium"
              />
            </div>

            {/* Campus dropdown */}
            <div className="flex items-center gap-2 rounded-xl bg-bg-1 border-2 border-metal-2 px-3 py-2 shadow-sm shrink-0 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <GraduationCap size={15} className="text-amber shrink-0" />
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  aria-label="Filter by Campus"
                  className="bg-transparent font-technical text-xs font-bold text-ink-0 uppercase tracking-wider outline-none cursor-pointer w-full"
                >
                  {availableColleges.map((col) => (
                    <option key={col} value={col} className="bg-bg-1 text-ink-0">
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-metal-2/40">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg font-technical text-xs uppercase font-bold tracking-wider transition-all ${
                  selectedCat === cat
                    ? 'bg-amber text-bg-0 font-extrabold shadow'
                    : 'bg-bg-1 text-ink-0 hover:bg-bg-2 border-2 border-metal-2'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gigs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGigs.slice(0, 6).map((gig) => (
            <div
              key={gig._id}
              className="surface-metal-brushed rounded-2xl p-6 border-2 border-metal-2 shadow-sm hover:border-amber/70 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-technical text-[9px] font-bold px-2.5 py-1 rounded-md bg-bg-1 border border-metal-2 text-ink-0 uppercase tracking-wider">
                    {gig.category}
                  </span>

                  <span className="font-mono text-base font-extrabold text-amber">
                    ₹{gig.budget}
                  </span>
                </div>

                {/* College Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-2 border border-metal-2 mb-3 text-ink-0 font-mono text-xs font-semibold">
                  <GraduationCap size={13} className="text-amber shrink-0" />
                  <span>{gig.college}</span>
                </div>

                <h3 className="font-display text-lg text-ink-0 mb-2 group-hover:text-amber transition-colors line-clamp-2">
                  {gig.title}
                </h3>

                <p className="text-xs sm:text-sm text-ink-1 line-clamp-3 mb-5 leading-relaxed">
                  {gig.description}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {gig.skillsRequired.slice(0, 4).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="font-mono text-[9px] px-2 py-0.5 rounded bg-bg-2 text-ink-0 border border-metal-2 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t-2 border-metal-2/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-ink-2 font-mono">
                  <CalendarDays size={13} />
                  <span>{gig.deadline}</span>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 font-technical text-xs font-bold text-amber hover:underline group-hover:translate-x-0.5 transition-all"
                >
                  <Lock size={12} className="text-amber" />
                  <span>SIGN IN TO APPLY</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 text-center surface-panel rounded-2xl p-8 border-2 border-metal-2 shadow-sm">
          <p className="font-mono text-sm text-ink-1">
            Want to post your own requirement and hire talented campus peers?
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-technical text-xs font-bold uppercase tracking-wider bg-amber text-bg-0 hover:brightness-110 shadow transition-all"
            >
              CREATE STUDENT ACCOUNT
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-technical text-xs font-bold uppercase tracking-wider bg-bg-1 text-ink-0 border-2 border-metal-2 hover:bg-bg-2 transition-all"
            >
              LOG IN
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
