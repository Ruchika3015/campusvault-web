
import { useState } from 'react';
import { api } from '@/services/api';

export default function GigCompletionActions({ gigId, role, status }) {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const normalizedStatus = String(status ?? '')
    .toLowerCase()
    .replace(/[-\s]/g, '_');

  const canSubmitWork =
    role === 'worker' && normalizedStatus === 'in_progress';

  const canComplete =
    role === 'owner' && normalizedStatus === 'work_submitted';

  async function handleSubmitWork(event) {
    event.preventDefault();

    if (!gigId) {
      setMessage('Unable to submit: gig ID is missing.');
      return;
    }

    if (!url.trim()) {
      setMessage('Please enter the work or deliverable URL.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      await api.submitWork(gigId, {
        submittedUrl: url.trim(),
        submittedNote: note.trim(),
      });

      setMessage('Work submitted successfully.');
      setUrl('');
      setNote('');
      setShowSubmitForm(false);

      window.location.reload();
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to submit work. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGetOtp() {
    if (!gigId) {
      setMessage('Unable to get OTP: gig ID is missing.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setReceivedOtp('');

      const response = await api.getCompletionOtp(gigId);
      const data = response?.data ?? response;
      const generatedOtp = data?.otp ?? data?.data?.otp;

      if (generatedOtp) {
        setReceivedOtp(String(generatedOtp));
        setOtp(String(generatedOtp));
        setMessage('Completion OTP received.');
      } else {
        setMessage(
          data?.message ||
            'OTP requested. Check the backend response or registered delivery channel.'
        );
      }
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to get completion OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(event) {
    event.preventDefault();

    if (!gigId) {
      setMessage('Unable to complete: gig ID is missing.');
      return;
    }

    if (!otp.trim()) {
      setMessage('Please enter the completion OTP.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      await api.completeGig(gigId, otp.trim());

      setMessage('Gig completed successfully.');
      window.location.reload();
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to complete the gig. Check the OTP and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-3">
      {canSubmitWork && (
        <>
          <button
            type="button"
            onClick={() => setShowSubmitForm((previous) => !previous)}
            className="flex items-center gap-1.5 rounded-lg bg-mint/10 px-3 py-2 font-technical text-xs text-mint transition-colors hover:bg-mint/20"
          >
            {showSubmitForm ? 'CANCEL SUBMISSION' : 'SUBMIT WORK'}
          </button>

          {showSubmitForm && (
            <form
              onSubmit={handleSubmitWork}
              className="mt-3 space-y-3 rounded-lg border border-metal-1/40 bg-metal-1/10 p-4"
            >
              <label className="block text-sm text-metal-2">
                Work / deliverable URL *
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://drive.google.com/..."
                  required
                  className="mt-1 w-full rounded-lg border border-metal-1/50 bg-[#292522] px-3 py-2.5 text-sm text-[#f0ebe4] placeholder:text-[#938a80] outline-none focus:border-mint/60"
                />
              </label>

              <label className="block text-sm text-metal-2">
                Notes (optional)
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add handover notes..."
                  rows={3}
                  className="mt-1 w-full resize-y rounded-lg border border-metal-1/50 bg-[#292522] px-3 py-2.5 text-sm text-[#f0ebe4] placeholder:text-[#938a80] outline-none focus:border-mint/60"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg border border-mint/40 bg-mint/10 px-4 py-2 text-xs font-semibold text-mint transition-colors hover:bg-mint/20 disabled:opacity-50"
              >
                {loading ? 'SUBMITTING...' : 'CONFIRM SUBMISSION'}
              </button>
            </form>
          )}
        </>
      )}

      {canComplete && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleGetOtp}
            className="rounded-lg bg-mint/10 px-3 py-2 font-technical text-xs text-mint transition-colors hover:bg-mint/20 disabled:opacity-50"
          >
            {loading ? 'PLEASE WAIT...' : 'GET COMPLETION OTP'}
          </button>

          {receivedOtp && (
            <p className="text-sm text-metal-2">
              OTP returned by backend:{' '}
              <strong>{receivedOtp}</strong>
            </p>
          )}

          <form onSubmit={handleComplete} className="space-y-3">
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter completion OTP"
              required
              className="w-full rounded-lg border border-metal-1/50 bg-[#292522] px-3 py-2.5 text-sm text-[#f0ebe4] placeholder:text-[#938a80] outline-none focus:border-mint/60"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg border border-mint/40 bg-mint/10 px-4 py-2 text-xs font-semibold text-mint transition-colors hover:bg-mint/20 disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : 'CONFIRM COMPLETION'}
            </button>
          </form>
        </div>
      )}

      {message && (
        <p role="status" className="mt-3 text-sm text-metal-2">
          {message}
        </p>
      )}
    </section>
  );
}
