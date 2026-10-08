import { Check, X, AlertTriangle, User, IndianRupee } from 'lucide-react';

const VARIANTS = {
  accept: {
    icon: Check,
    iconBg: 'bg-mint/15',
    iconColor: 'text-mint',
    title: 'Accept this proposal?',
    message: 'Are you sure you want to accept this proposal? The helper will be notified and the conversation will become available.',
    confirmLabel: 'Accept Proposal',
    confirmClass: 'bg-mint text-bg-0 hover:bg-mint-soft',
  },
  reject: {
    icon: X,
    iconBg: 'bg-coral/15',
    iconColor: 'text-coral',
    title: 'Reject this proposal?',
    message: 'Are you sure you want to reject this proposal? This action will notify the helper.',
    confirmLabel: 'Reject Proposal',
    confirmClass: 'bg-coral text-bg-0 hover:bg-coral-soft',
  },
  withdraw: {
    icon: AlertTriangle,
    iconBg: 'bg-amber/15',
    iconColor: 'text-amber',
    title: 'Withdraw this proposal?',
    message: 'Are you sure you want to withdraw your proposal? You can submit another proposal later if the Jugaad is still available.',
    confirmLabel: 'Withdraw Proposal',
    confirmClass: 'bg-amber text-bg-0 hover:bg-amber-soft',
  },
};

export function ConfirmActionModal({ variant, proposal, onConfirm, onClose }) {
  const cfg = VARIANTS[variant] || VARIANTS.accept;
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="surface-metal-brushed rounded-2xl p-5 sm:p-6 w-full max-w-md mx-3 sm:mx-4 relative"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid var(--metal-1)' }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-ink-1 hover:text-ink-0" aria-label="Close">
          <X size={17} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <span className={`grid place-items-center w-11 h-11 rounded-xl shrink-0 ${cfg.iconBg} ${cfg.iconColor}`}>
            <Icon size={20} />
          </span>
          <h3 className="font-display text-lg sm:text-xl">{cfg.title}</h3>
        </div>

        {/* Proposal summary */}
        {proposal && (
          <div className="surface-panel rounded-xl p-3.5 sm:p-4 mb-5 space-y-2">
            <div className="flex items-center gap-2">
              <User size={12} className="text-ink-2" />
              <span className="font-mono text-[10px] text-ink-2">HELPER</span>
              <span className="font-mono text-[11px] text-ink-0 ml-auto">{proposal.helper?.name || 'Student'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-ink-2">JUGAAD</span>
              <span className="font-mono text-[11px] text-ink-0 ml-auto truncate max-w-[140px] sm:max-w-[200px]">{proposal.jugaadTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee size={12} className="text-ink-2" />
              <span className="font-mono text-[10px] text-ink-2">PRICE</span>
              <span className="font-display text-base sm:text-lg text-amber ml-auto">₹{proposal.proposedPrice}</span>
            </div>
          </div>
        )}

        <p className="font-mono text-[11px] text-ink-1 leading-relaxed mb-6">{cfg.message}</p>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <button
            onClick={onClose}
            className="machine-control machine-control--ghost w-full sm:flex-1 justify-center"
            style={{ padding: '13px 18px' }}
          >
            <span className="ctrl-led" />
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className={`w-full sm:flex-[1.5] flex items-center justify-center gap-2 rounded-lg font-technical text-[9px] transition-colors ${cfg.confirmClass}`}
            style={{ padding: '13px 18px' }}
          >
            <Icon size={14} />
            {cfg.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
