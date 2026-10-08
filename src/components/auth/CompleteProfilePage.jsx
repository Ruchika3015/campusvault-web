import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { LED, Rivet } from '@/components/primitives/Details';
import {
  ArrowRight, User, Building2, GraduationCap, BookOpen,
  AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';

const YEAR_OPTIONS = ['1st', '2nd', '3rd', '4th', '5th+'];

export function CompleteProfilePage() {
  const { refreshAppUser, user } = useAuth();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({
    name:        user?.name || '',
    college:     '',
    branch:      '',
    yearOfStudy: '',
    role:        'student',
  });
  const [errors,      setErrors]      = useState({});
  const [submitError, setSubmitError] = useState('');
  const [phase,       setPhase]       = useState('idle'); // idle | submitting | success
  const [focused,     setFocused]     = useState(null);

  // Prefill name from Clerk user if available
  useEffect(() => {
    if (user?.name && !form.name) {
      setForm((f) => ({ ...f, name: user.name }));
    }
  }, [user]);

  useEffect(() => {
    api
      .getColleges()
      .then((data) => {
        const list = data?.colleges || data?.data || data || [];
        setColleges(Array.isArray(list) ? list : []);
      })
      .catch(() => setColleges([]));
  }, []);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
    setSubmitError('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters.';
    if (!form.college.trim())
      e.college = 'Enter your college name.';
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (phase !== 'idle') return;
    setSubmitError('');

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      setPhase('submitting');
      await api.completeProfile({
        name:        form.name.trim(),
        college:     form.college.trim(),
        branch:      form.branch.trim() || undefined,
        yearOfStudy: form.yearOfStudy   || undefined,
        role:        form.role,
      });
      setPhase('success');
      // Refresh AuthContext so profileComplete flips to true
      await refreshAppUser();
      await new Promise((r) => setTimeout(r, 700));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setPhase('idle');
      if (err.status === 400) {
        setSubmitError(err.message || 'Please check the form fields.');
      } else if (err.status === 0) {
        setSubmitError('CampusVault is unavailable. Check your connection and try again.');
      } else {
        setSubmitError(err.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const busy    = phase === 'submitting';
  const success = phase === 'success';

  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden grain preserve-3d flex items-center justify-center bg-bg-0">

      {/* ── Background ────────────────────────────────────────── */}
      <div className="absolute inset-0 tech-diagram pointer-events-none" />
      <div className="absolute inset-0 haze pointer-events-none" />
      <div className="absolute inset-0 depth-fog pointer-events-none" />

      {/* Accent glow */}
      <div
        className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10), transparent 60%)', filter: 'blur(80px)' }}
      />

      {/* ── Card ──────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md px-3.5 sm:px-8 py-8 sm:py-12">
        <div className="w-full anim-reveal">

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <LED color="amber" pulse size={6} />
              <span className="font-technical text-[9px] text-ink-2 tracking-widest">
                03 — PROFILE INITIALISATION
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl tracking-tight text-ink-0 mb-2">
              SET UP YOUR <span className="text-amber">VAULT</span>
            </h1>
            <p className="text-xs text-ink-2">
              One-time setup. Your profile powers discovery, applications, and your reputation on CampusVault.
            </p>
          </div>

          {/* Terminal card */}
          <div className="relative surface-metal-brushed metal-scratches rounded-2xl p-5 sm:p-8">
            <Rivet size={9} className="absolute top-3 left-3" />
            <Rivet size={9} className="absolute top-3 right-3" />
            <Rivet size={9} className="absolute bottom-3 left-3" />
            <Rivet size={9} className="absolute bottom-3 right-3" />

            <form onSubmit={handleSubmit} noValidate>

              {/* ── Name ── */}
              <div className="mb-5">
                <label className="block font-technical text-[9px] text-ink-3 mb-2 tracking-widest">
                  FULL NAME *
                </label>
                <div className={`flex items-center gap-3 border rounded-lg px-4 py-3 transition-colors ${focused === 'name' ? 'border-amber' : 'border-surface-3'} bg-bg-1`}>
                  <User className="w-3.5 h-3.5 text-ink-3 flex-shrink-0" />
                  <input
                    id="cp-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    placeholder="Your full name"
                    className="flex-1 bg-transparent text-sm text-ink-0 placeholder:text-ink-4 outline-none"
                    disabled={busy || success}
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 font-technical text-[9px] text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />{errors.name}
                  </p>
                )}
              </div>

              {/* ── College ── */}
              <div className="mb-5">
                <label className="block font-technical text-[9px] text-ink-3 mb-2 tracking-widest">
                  COLLEGE / INSTITUTION *
                </label>
                <div className={`flex items-center gap-3 border rounded-lg px-4 py-3 transition-colors ${focused === 'college' ? 'border-amber' : 'border-surface-3'} bg-bg-1`}>
                  <Building2 className="w-3.5 h-3.5 text-ink-3 flex-shrink-0" />
                  <input
                    id="cp-college"
                    type="text"
                    value={form.college}
                    onChange={(e) => update('college', e.target.value)}
                    onFocus={() => setFocused('college')}
                    onBlur={() => setFocused(null)}
                    placeholder="Your college or university"
                    list="college-list"
                    className="flex-1 bg-transparent text-sm text-ink-0 placeholder:text-ink-4 outline-none"
                    disabled={busy || success}
                    autoComplete="organization"
                  />
                  <datalist id="college-list">
                    {colleges.map((c) => (
                      <option key={typeof c === 'string' ? c : c._id} value={typeof c === 'string' ? c : c.name} />
                    ))}
                  </datalist>
                </div>
                {errors.college && (
                  <p className="mt-1.5 font-technical text-[9px] text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />{errors.college}
                  </p>
                )}
              </div>

              {/* ── Branch (optional) ── */}
              <div className="mb-5">
                <label className="block font-technical text-[9px] text-ink-3 mb-2 tracking-widest">
                  BRANCH / DEPARTMENT <span className="text-ink-4">(optional)</span>
                </label>
                <div className={`flex items-center gap-3 border rounded-lg px-4 py-3 transition-colors ${focused === 'branch' ? 'border-amber' : 'border-surface-3'} bg-bg-1`}>
                  <BookOpen className="w-3.5 h-3.5 text-ink-3 flex-shrink-0" />
                  <input
                    id="cp-branch"
                    type="text"
                    value={form.branch}
                    onChange={(e) => update('branch', e.target.value)}
                    onFocus={() => setFocused('branch')}
                    onBlur={() => setFocused(null)}
                    placeholder="e.g. Computer Science"
                    className="flex-1 bg-transparent text-sm text-ink-0 placeholder:text-ink-4 outline-none"
                    disabled={busy || success}
                  />
                </div>
              </div>

              {/* ── Year of Study (optional) ── */}
              <div className="mb-5">
                <label className="block font-technical text-[9px] text-ink-3 mb-2 tracking-widest">
                  YEAR OF STUDY <span className="text-ink-4">(optional)</span>
                </label>
                <div className={`flex items-center gap-3 border rounded-lg px-4 py-3 transition-colors ${focused === 'year' ? 'border-amber' : 'border-surface-3'} bg-bg-1`}>
                  <GraduationCap className="w-3.5 h-3.5 text-ink-3 flex-shrink-0" />
                  <select
                    id="cp-year"
                    value={form.yearOfStudy}
                    onChange={(e) => update('yearOfStudy', e.target.value)}
                    onFocus={() => setFocused('year')}
                    onBlur={() => setFocused(null)}
                    className="flex-1 bg-transparent text-sm text-ink-0 outline-none cursor-pointer appearance-none"
                    disabled={busy || success}
                  >
                    <option value="" className="bg-bg-1 text-ink-2">Select year</option>
                    {YEAR_OPTIONS.map((y) => (
                      <option key={y} value={y} className="bg-bg-1">{y} Year</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Submit error ── */}
              {submitError && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="font-technical text-[10px] text-red-400">{submitError}</p>
                </div>
              )}

              {/* ── Submit button ── */}
              <button
                id="cp-submit"
                type="submit"
                disabled={busy || success}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-technical text-[10px] tracking-widest transition-all duration-200
                  bg-amber text-bg-0 hover:brightness-110 active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    ENTERING CAMPUSVAULT...
                  </>
                ) : busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    INITIALISING...
                  </>
                ) : (
                  <>
                    ENTER CAMPUSVAULT
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center font-technical text-[8px] text-ink-4">
            YOUR PROFILE IS ONLY VISIBLE TO CAMPUSVAULT MEMBERS
          </p>
        </div>
      </div>
    </div>
  );
}
