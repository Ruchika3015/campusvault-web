
import { useState } from 'react';
import { api } from '@/services/api';

export default function GigCompletionActions({
  gigId,
  role,
  status,
}) {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const normalizedStatus = String(status || '')
    .toLowerCase()
    .replaceAll('-', '_')
    .replaceAll(' ', '_');

  const isWorker = role === 'worker';
  const isOwner = role === 'owner';

  const canSubmitWork =
    isWorker && normalizedStatus === 'in_progress';

  const canComplete =
    isOwner && normalizedStatus === 'work_submitted';

  if (!gigId || (!canSubmitWork && !canComplete)) {
    return null;
  }

  async function handleSubmitWork(event) {
    event.preventDefault();

    if (!url.trim()) {
      setMessage('Please enter the work submission URL.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await api.submitWork(gigId, {
        submittedUrl: url.trim(),
        submittedNote: note.trim(),
      });

      setMessage('Work submitted successfully!');
      window.location.reload();
    } catch (error) {
      setMessage(error?.message || 'Failed to submit work.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGetOtp() {
    setLoading(true);
    setMessage('');

    try {
      const response = await api.getCompletionOtp(gigId);
      const data = response?.data ?? response;
      const code = data?.otp ?? data?.data?.otp ?? '';

      if (code) {
        setReceivedOtp(String(code));
        setOtp(String(code));
        setMessage('Completion OTP received.');
      } else {
        setMessage(
          'OTP request succeeded, but no OTP was returned. Check the API response.'
        );
      }
    } catch (error) {
      setMessage(error?.message || 'Failed to get completion OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(event) {
    event.preventDefault();

    if (!otp.trim()) {
      setMessage('Please enter the completion OTP.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await api.completeGig(gigId, otp.trim());
      setMessage('Gig completed successfully!');
      window.location.reload();
    } catch (error) {
      setMessage(error?.message || 'Could not complete the gig.');
    } finally {
      setLoading(false);
    }
  }

  const darkInputClass =
    'mt-1 w-full rounded-lg border border-[#5b5146] bg-[#241f1c] p-3 text-[#f0e9df] placeholder:text-[#9b9da5] outline-none transition focus:border-[#20c96b] focus:ring-1 focus:ring-[#20c96b]';

  return (
    <section className="mt-5 rounded-xl border border-[#5b5146] bg-[#292522] p-4 sm:p-5">
      {canSubmitWork && (
        <div className="space-y-4">
          {!showSubmitForm ? (
            <button
              type="button"
              onClick={() => {
                setShowSubmitForm(true);
                setMessage('');
              }}
              className="machine-control machine-control--primary"
            >
              SUBMIT WORK
            </button>
          ) : (
            <form
              onSubmit={handleSubmitWork}
              className="space-y-4 rounded-xl border border-[#5b5146] bg-[#292522] p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-[#f0e9df]">
                  SUBMIT YOUR WORK
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitForm(false);
                    setMessage('');
                  }}
                  className="text-xs font-mono tracking-wider text-[#b8aa9a] transition hover:text-[#f0e9df]"
                >
                  CANCEL
                </button>
              </div>

              <label className="block text-sm font-medium text-[#e8e0d6]">
                Work / deliverable URL *
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://drive.google.com/..."
                  required
                  className={darkInputClass}
                />
              </label>

              <label className="block text-sm font-medium text-[#e8e0d6]">
                Notes (optional)
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add handover notes..."
                  rows={3}
                  className={`${darkInputClass} resize-y`}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="machine-control machine-control--primary"
              >
                {loading ? 'SUBMITTING...' : 'SUBMIT WORK'}
              </button>
            </form>
          )}
        </div>
      )}

      {canComplete && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#f0e9df]">
            COMPLETE GIG
          </h3>

          <button
            type="button"
            disabled={loading}
            onClick={handleGetOtp}
            className="machine-control machine-control--primary"
          >
            {loading ? 'PLEASE WAIT...' : 'GET COMPLETION OTP'}
          </button>

          {receivedOtp && (
            <p className="text-sm text-[#e8e0d6]">
              OTP returned by the backend:{' '}
              <strong>{receivedOtp}</strong>
            </p>
          )}

          <form onSubmit={handleComplete} className="space-y-3">
            <label className="block text-sm font-medium text-[#e8e0d6]">
              Completion OTP
              <input
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter OTP"
                required
                className={darkInputClass}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="machine-control machine-control--primary"
            >
              {loading ? 'PROCESSING...' : 'CONFIRM COMPLETION'}
            </button>
          </form>
        </div>
      )}

      {message && (
        <p role="status" className="mt-3 text-sm text-[#e8e0d6]">
          {message}
        </p>
      )}
    </section>
  );
}
