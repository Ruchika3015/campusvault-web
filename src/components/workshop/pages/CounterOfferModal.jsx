import { useState } from 'react';
import { X, HandCoins, Send, IndianRupee, ArrowLeft, Check } from 'lucide-react';

export function CounterOfferModal({ proposal, onClose, onSubmit }) {
  const [counterPrice, setCounterPrice] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!counterPrice || Number(counterPrice) <= 0) return;
    onSubmit(Number(counterPrice), message.trim());
    setSent(true);
  };

  return (
    <div className="workshop-overlay" onClick={onClose}>
      <div
        className="workshop-panel surface-metal-brushed rounded-2xl p-5 sm:p-6 w-full max-w-md mx-3 sm:mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-ink-3 hover:text-ink-0">
          <X size={17} />
        </button>

        {sent ? (
          <div className="text-center py-8">
            <div className="mx-auto grid place-items-center w-14 h-14 rounded-full bg-amber/15 text-amber mb-4">
              <Send size={23} />
            </div>
            <p className="font-display text-2xl">COUNTER OFFER SENT</p>
            <p className="font-mono text-[10px] text-ink-2 mt-2">
              {proposal.helper.name} will see your counter offer in their requests.
            </p>
            <button onClick={onClose} className="machine-control machine-control--ghost mt-6 w-full sm:w-auto">
              <span className="ctrl-led" />
              CLOSE
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-metal-1/40 pb-4 mb-5">
              <span className="grid place-items-center w-10 h-10 rounded-lg bg-amber/10 text-amber shrink-0">
                <HandCoins size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-technical text-[10px] text-ink-0">COUNTER OFFER</p>
                <p className="font-mono text-[9px] text-ink-3 mt-0.5 truncate">{proposal.gigTitle || proposal.gig?.title || proposal.title || proposal.jugaadTitle || 'Gig Offer'}</p>
              </div>
            </div>

            {/* Offer history */}
            {proposal.offerHistory && proposal.offerHistory.length > 0 && (
              <div className="surface-panel rounded-xl p-3 mb-4">
                <p className="font-technical text-[8px] text-ink-3 mb-2">OFFER HISTORY</p>
                {proposal.offerHistory.map((offer, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span className="font-mono text-[9px] text-ink-2 flex-1 truncate">
                      {offer.from === 'helper' ? proposal.helper.name : 'You'} {offer.message && `— ${offer.message}`}
                    </span>
                    <span className="font-display text-sm text-amber shrink-0">₹{offer.amount}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="surface-panel rounded-xl p-4 mb-4">
              <p className="font-technical text-[8px] text-ink-3">HELPER'S PROPOSED PRICE</p>
              <p className="font-display text-3xl text-amber mt-1">₹{proposal.proposedPrice}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="font-technical text-[8px] text-ink-2 block mb-2">YOUR COUNTER PRICE</label>
              <div className="flex items-center rounded-lg bg-bg-1 border border-metal-1 mb-4">
                <IndianRupee size={14} className="ml-3 text-ink-3" />
                <input
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  placeholder={String(proposal.proposedPrice)}
                  className="w-full bg-transparent px-2 py-3 font-mono text-sm outline-none"
                />
              </div>

              <label className="font-technical text-[8px] text-ink-2 block mb-2">MESSAGE / REASON</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Explain your counter offer..."
                className="w-full rounded-lg bg-bg-1 border border-metal-1 p-3 font-mono text-xs outline-none resize-none mb-5"
              />

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button type="button" onClick={onClose} className="machine-control machine-control--ghost w-full sm:flex-1 justify-center" style={{ padding: '13px 18px' }}>
                  <span className="ctrl-led" />
                  CANCEL
                </button>
                <button type="submit" disabled={!counterPrice} className="machine-control machine-control--primary w-full sm:flex-[1.5] justify-center disabled:opacity-40" style={{ padding: '13px 18px' }}>
                  <span className="ctrl-led" />
                  <span className="flex items-center gap-2">
                    <Send size={14} />
                    SEND COUNTER
                  </span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
