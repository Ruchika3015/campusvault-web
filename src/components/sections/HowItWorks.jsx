import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DepthLayer } from '@/components/primitives/DepthLayer';
import { LED } from '@/components/primitives/Details';
import {
  FileText,
  Users,
  MessageSquare,
  CheckCircle2,
  Search,
  Sparkles,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const POSTER_STEPS = [
  {
    step: '01',
    icon: FileText,
    title: 'Drop Your Requirement',
    description:
      'Specify the title, description, skills needed, your budget (₹), and deadline. Takes less than a minute.',
    tip: 'Clear deadlines & skill tags get 3x faster proposals.',
  },
  {
    step: '02',
    icon: Users,
    title: 'Compare Student Proposals',
    description:
      'Receive pitches from qualified peers. Inspect their verified profiles, star ratings, and counter-budget offers.',
    tip: 'Check peer reviews and past completed gigs before selecting.',
  },
  {
    step: '03',
    icon: MessageSquare,
    title: 'Chat & Align Directly',
    description:
      'Use built-in messaging to share project files, clarify expectations, and negotiate any details in real-time.',
    tip: 'Zero middleman interference — direct student communication.',
  },
  {
    step: '04',
    icon: CheckCircle2,
    title: 'Review & Pay Upon Delivery',
    description:
      'Inspect the submitted work, approve completion, pay directly via UPI, and leave an authentic campus review.',
    tip: 'Builds verified reputation for both you and your peer.',
  },
];

const SOLVER_STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Explore Live Campus Gigs',
    description:
      'Filter open opportunities by your skills — software dev, graphic design, electronics, tutoring, or content creation.',
    tip: 'New gigs are posted daily by students across branches.',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'Pitch Your Custom Proposal',
    description:
      'Submit your application with an estimated timeline and your proposed rate (accept the poster’s budget or pitch a counter-offer).',
    tip: 'Add a concise note highlighting similar projects you have built.',
  },
  {
    step: '03',
    icon: Zap,
    title: 'Collaborate & Execute',
    description:
      'Once the poster accepts your proposal, collaborate seamlessly, share draft milestones, and finish before the deadline.',
    tip: 'Reliable on-time delivery earns 5-star ratings and more gigs.',
  },
  {
    step: '04',
    icon: DollarSign,
    title: 'Get Paid 100% & Build Portfolio',
    description:
      'Receive full payment with zero commission deducted. Every completed gig is recorded on your verified campus profile.',
    tip: 'Use your Campusvault track record to land off-campus internships.',
  },
];

export function HowItWorks() {
  const [role, setRole] = useState('poster'); // 'poster' | 'solver'
  const activeSteps = role === 'poster' ? POSTER_STEPS : SOLVER_STEPS;

  return (
    <section
      id="how-it-works"
      className="relative py-28 px-4 sm:px-8 lg:px-16 overflow-hidden grain preserve-3d border-t border-metal-2/40"
    >
      <DepthLayer depth={-140} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/4 w-[700px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(93,184,154,0.08), transparent 60%)',
            filter: 'blur(60px)',
          }}
        />
      </DepthLayer>
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <LED color="mint" pulse size={7} />
              <span className="font-technical text-[10px] font-bold tracking-wider text-ink-0">
                03 — THE WORKFLOW
              </span>
              <span className="h-px w-12 bg-metal-2" />
              <span className="font-technical text-[10px] text-ink-2">STEP-BY-STEP</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink-0 tracking-tight">
              HOW CAMPUSVAULT WORKS.
            </h2>
            <p className="mt-4 text-base text-ink-1 max-w-xl">
              Simple, transparent, and direct. Choose how you want to use the platform:
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="surface-panel rounded-xl p-1.5 border-2 border-metal-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 w-full md:w-auto shadow-sm">
            <button
              type="button"
              onClick={() => setRole('poster')}
              className={`px-3 sm:px-4 py-2.5 rounded-lg font-technical text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all text-center ${
                role === 'poster'
                  ? 'bg-amber text-bg-0 shadow'
                  : 'text-ink-1 hover:text-ink-0 hover:bg-bg-2'
              }`}
            >
              I NEED WORK DONE (POSTER)
            </button>
            <button
              type="button"
              onClick={() => setRole('solver')}
              className={`px-3 sm:px-4 py-2.5 rounded-lg font-technical text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all text-center ${
                role === 'solver'
                  ? 'bg-amber text-bg-0 shadow'
                  : 'text-ink-1 hover:text-ink-0 hover:bg-bg-2'
              }`}
            >
              I WANT TO EARN (FREELANCER)
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeSteps.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="surface-metal-brushed rounded-2xl p-6 border-2 border-metal-2 shadow-sm flex flex-col justify-between group hover:border-mint/60 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-bold text-ink-2 group-hover:text-mint transition-colors">
                      {item.step}
                    </span>
                    <span className="grid place-items-center w-10 h-10 rounded-xl bg-bg-1 border-2 border-metal-2 text-ink-0 group-hover:border-mint/50 group-hover:text-mint transition-all">
                      <IconComponent size={18} />
                    </span>
                  </div>

                  <h3 className="font-display text-lg text-ink-0 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-ink-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-metal-2/40">
                  <p className="font-mono text-[10px] text-ink-2 leading-tight">
                    <span className="text-amber font-bold">PRO TIP: </span>
                    {item.tip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout */}
        <div className="mt-12 text-center">
          <Link
            to={role === 'poster' ? '/signup' : '/signup'}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-technical text-xs font-bold uppercase tracking-wider bg-amber text-bg-0 hover:brightness-110 shadow-md transition-all group"
          >
            <span>{role === 'poster' ? 'POST YOUR FIRST GIG NOW' : 'CREATE FREELANCER PROFILE'}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
