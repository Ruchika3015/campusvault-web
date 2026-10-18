
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

  return (
    <section className="mt-5 rounded-xl border border-amber/30 p-4">
      <h3 className="mb-3 font-display text-lg">
        {canSubmitWork ? 'SUBMIT YOUR WORK' : 'COMPLETE GIG'}
      </h3>

      {canSubmitWork && (
        <form onSubmit={handleSubmitWork} className="space-y-3">
          <label className="block text-sm">
            Work / deliverable URL *
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://drive.google.com/..."
              required
              className="mt-1 w-full rounded-lg border p-3"
            />
          </label>

          <label className="block text-sm">
            Notes (optional)
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add handover notes..."
              rows={3}
              className="mt-1 w-full rounded-lg border p-3"
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

      {canComplete && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleGetOtp}
            className="machine-control machine-control--primary"
          >
            {loading ? 'PLEASE WAIT...' : 'GET COMPLETION OTP'}
          </button>

          {receivedOtp && (
            <p className="text-sm">
              OTP returned by the backend: <strong>{receivedOtp}</strong>
            </p>
          )}

          <form onSubmit={handleComplete} className="space-y-3">
            <label className="block text-sm">
              Completion OTP
              <input
                type="text"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter OTP"
                required
                className="mt-1 w-full rounded-lg border p-3"
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
        <p role="status" className="mt-3 text-sm">
          {message}
        </p>
      )}
    </section>
  );
}
