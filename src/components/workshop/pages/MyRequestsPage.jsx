import GigCompletionActions from './GigCompletionActions';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LED } from '@/components/primitives/Details';
import { api } from '@/services/api';

import { useProposals } from '@/context/ProposalContext';

import {
  MessageSquare,
  HandCoins,
  Check,
  X,
  Clock,
  Tag,
  Undo2,
} from 'lucide-react';

import { ConfirmActionModal } from '@/components/workshop/pages/ConfirmActionModal';


// ================================================================
// STATUS CONFIG
// ================================================================

const STATUS_CFG = {

  accepted: {
    color: 'mint',
    label: 'ACCEPTED',
  },

  'price-agreed': {
    color: 'mint',
    label: 'ACCEPTED',
  },

  'in-progress': {
    color: 'amber',
    label: 'IN PROGRESS',
  },

  completed: {
    color: 'mint',
    label: 'COMPLETED',
  },

  negotiating: {
    color: 'amber',
    label: 'NEGOTIATING',
  },

  pending: {
    color: 'amber',
    label: 'PENDING',
  },

  waiting: {
    color: 'amber',
    label: 'PENDING',
  },

  rejected: {
    color: 'coral',
    label: 'REJECTED',
  },

  withdrawn: {
    color: 'ink',
    label: 'WITHDRAWN',
  },

};


// ================================================================
// GET POSTER
//
// IMPORTANT:
// Backend returns:
//     poster_name
//
// This is the person who posted the Jugaad.
//
// Do NOT use the logged-in helper here.
// ================================================================

function getPoster(request = {}) {

  const name =
    request?.gig?.postedBy?.name ??
    request?.poster_name ??
    request?.posterName ??
    request?.poster?.name ??
    request?.owner?.name ??
    request?.jugaad?.poster?.name ??
    request?.jugaad?.owner?.name ??
    request?.creator?.name ??
    request?.creator_name ??
    request?.creatorName ??
    'Unknown User';


  const cleanName =
    String(name).trim() ||
    'Unknown User';


  const initialsSource =
    request?.poster_initials ??
    request?.posterInitials ??
    request?.poster?.initials ??
    request?.poster?.avatarInitials ??
    null;


  let initials = initialsSource;


  if (!initials) {

    initials = cleanName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join('')
      .toUpperCase();

  }


  if (!initials) {
    initials = 'U';
  }


  return {
    name: cleanName,
    initials,
  };

}


// ================================================================
// SAFE RELATIVE TIME
//
// Uses the ACTUAL backend timestamp.
//
// Example:
//     2026-08-27T14:04:40.385Z
//
// Browser converts it to the user's local time automatically.
// ================================================================

function safeTimeAgo(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'date unavailable';
  }


  const date =
    value instanceof Date
      ? value
      : new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'date unavailable';
  }


  const now =
    Date.now();


  const difference =
    now -
    date.getTime();


  // Small clock differences should still be "just now".
  if (difference < 60000) {
    return 'just now';
  }


  const seconds =
    Math.floor(
      difference / 1000
    );


  const minutes =
    Math.floor(
      seconds / 60
    );


  if (minutes < 60) {
    return `${minutes}m ago`;
  }


  const hours =
    Math.floor(
      minutes / 60
    );


  if (hours < 24) {
    return `${hours}h ago`;
  }


  const days =
    Math.floor(
      hours / 24
    );


  if (days < 30) {
    return `${days}d ago`;
  }


  const months =
    Math.floor(
      days / 30
    );


  if (months < 12) {
    return `${months}mo ago`;
  }


  const years =
    Math.floor(
      months / 12
    );


  return `${years}y ago`;

}


// ================================================================
// GET VALID CONVERSATION ID
//
// PostgreSQL conversation IDs are bigint.
// Never use fake values like "conv1".
// ================================================================

function getValidConversationId(
  request = {}
) {

  const rawId =
    request?.conversation_id ??
    request?.conversationId ??
    request?.conversation?._id ??
    request?.conversation?.id ??
    request?.conversation?.conversation_id ??
    request?.conversation?.conversationId ??
    null;


  if (
    rawId === null ||
    rawId === undefined ||
    rawId === ''
  ) {
    return null;
  }


  const value =
    String(rawId).trim();

  if (!value || value === 'null' || value === 'undefined') {
    return null;
  }

  return value;

}


// ================================================================
// GET GIG ID
// ================================================================

function getGigId(request = {}) {
  return (
    request?.gig?._id ??
    request?.gig?.id ??
    (typeof request?.gig === 'string' ? request.gig : null) ??
    request?.jugaadId ??
    request?.jugaad_id ??
    request?.jugaad?._id ??
    request?.jugaad?.id ??
    null
  );
}


// ================================================================
// GET POSTER / RECEIVER ID
// ================================================================

function getPosterId(request = {}) {
  const poster =
    request?.gig?.postedBy ??
    request?.poster ??
    request?.owner ??
    request?.creator ??
    request?.jugaad?.poster ??
    request?.jugaad?.owner ??
    null;

  return (
    poster?._id ??
    poster?.id ??
    request?.poster_id ??
    request?.posterId ??
    request?.owner_id ??
    request?.ownerId ??
    request?.creator_id ??
    request?.creatorId ??
    request?.posted_by ??
    request?.postedBy ??
    null
  );
}


function getConversationIdFromCandidate(candidate) {
  const rawId =
    candidate?._id ??
    candidate?.id ??
    candidate?.conversation_id ??
    candidate?.conversationId ??
    candidate?.conversation?._id ??
    candidate?.conversation?.id ??
    null;

  if (rawId === null || rawId === undefined) {
    return null;
  }

  const value = String(rawId).trim();

  return value &&
    value !== 'null' &&
    value !== 'undefined'
    ? value
    : null;
}


function getCandidateGigId(candidate) {
  return (
    candidate?.gig?._id ??
    candidate?.gig?.id ??
    (typeof candidate?.gig === 'string' ? candidate.gig : null) ??
    candidate?.jugaad?._id ??
    candidate?.jugaad?.id ??
    candidate?.jugaadId ??
    candidate?.jugaad_id ??
    candidate?.gig_id ??
    candidate?.gigId ??
    null
  );
}


function getCandidateParticipantIds(candidate) {
  const participants =
    Array.isArray(candidate?.participants)
      ? candidate.participants
      : Array.isArray(candidate?.users)
        ? candidate.users
        : [];

  return participants
    .map((participant) =>
      participant?._id ??
      participant?.id ??
      participant?.user_id ??
      participant?.userId ??
      participant
    )
    .filter(
      (id) =>
        id !== null &&
        id !== undefined &&
        String(id).trim() !== ''
    )
    .map((id) => String(id));
}


// ================================================================
// MAIN PAGE
// ================================================================

export function MyRequestsPage() {

  const {

    myRequests = [],

    acceptCounter,

    rejectCounter,

    withdrawProposal,

  } = useProposals();


  const [
    confirmAction,
    setConfirmAction,
  ] = useState(null);


  const requests =
    Array.isArray(myRequests)
      ? myRequests
      : [];


  // ================================================================
  // WITHDRAW
  // ================================================================

  const handleWithdraw =
    (request) => {

      setConfirmAction({

        variant: 'withdraw',

        proposal: {

          id:
            request?._id ??
            request?.proposalId ??
            request?.proposal_id ??
            request?.id,

          helper: {
            name: 'You',
          },

          jugaadTitle:
            request?.gig?.title ??
            request?.jugaadTitle ??
            request?.jugaad_title ??
            request?.jugaad?.title ??
            request?.title ??
            'Gig',

          proposedPrice:
            request?.expectedBudget ??
            request?.agreedAmount ??
            request?.agreed_amount ??
            request?.proposedAmount ??
            request?.proposed_amount ??
            request?.proposed_price ??
            request?.amount ??
            0,

        },

      });

    };


  // ================================================================
  // CONFIRM ACTION
  // ================================================================

  const handleConfirmAction =
    async () => {

      if (!confirmAction) {
        return;
      }


      try {

        if (
          confirmAction.variant ===
            'withdraw' &&
          confirmAction.proposal?.id
        ) {

          await withdrawProposal(
            confirmAction.proposal.id
          );

        }

      } catch (error) {

        console.error(
          'Failed to perform proposal action:',
          error
        );

      } finally {

        setConfirmAction(null);

      }

    };


  // ================================================================
  // RENDER
  // ================================================================

  return (

    <div>

      {/* ==========================================================
          PAGE HEADER
      ========================================================== */}

      <section className="pt-12 pb-7">

        <div className="flex items-center gap-3 mb-4">

          <LED
            color="mint"
            pulse
            size={7}
          />

          <span className="font-technical text-[9px] text-ink-2">
            05 — YOUR OUTGOING SIGNALS
          </span>

        </div>


        <h1 className="font-display text-4xl sm:text-5xl">

          MY

          <br />

          <span className="text-mint">
            APPLICATIONS.
          </span>

        </h1>


        <p className="mt-4 max-w-xl text-sm text-ink-2">
          Track every gig where you submitted an application,
          made an offer, or started working.
        </p>

      </section>


      {/* ==========================================================
          EMPTY STATE
      ========================================================== */}

      {requests.length === 0 ? (

        <div
          className="surface-panel rounded-2xl p-8 text-center"
          style={{
            border:
              '1px solid var(--metal-1)',
          }}
        >

          <p className="font-display text-lg text-ink-2">
            NO APPLICATIONS YET.
          </p>


          <p className="font-mono text-[10px] text-ink-3 mt-2">
            Your submitted applications and status updates will appear here.
          </p>

        </div>

      ) : (

        /* ========================================================
           REQUEST LIST
        ======================================================== */

        <div className="space-y-3">

          {requests.map(
            (
              request,
              index
            ) => (

              <RequestRow

                key={

                  request?._id ??

                  request?.proposalId ??

                  request?.proposal_id ??

                  request?.id ??

                  request?.jugaadId ??

                  request?.jugaad_id ??

                  `request-${index}`

                }

                request={request}

                acceptCounter={
                  acceptCounter
                }

                rejectCounter={
                  rejectCounter
                }

                onWithdraw={() =>
                  handleWithdraw(
                    request
                  )
                }

              />

            )
          )}

        </div>

      )}


      {/* ==========================================================
          CONFIRM MODAL
      ========================================================== */}

      {confirmAction && (

        <ConfirmActionModal

          variant={
            confirmAction.variant
          }

          proposal={
            confirmAction.proposal
          }

          onClose={() =>
            setConfirmAction(null)
          }

          onConfirm={
            handleConfirmAction
          }

        />

      )}

    </div>

  );

}


// ================================================================
// REQUEST ROW
// ================================================================

function RequestRow({

  request = {},

  acceptCounter,

  rejectCounter,

  onWithdraw,

}) {

  const navigate = useNavigate();

  const [
    openingMessage,
    setOpeningMessage,
  ] = useState(false);

  const [
    messageError,
    setMessageError,
  ] = useState('');


  // ==============================================================
  // POSTER
  // ==============================================================

  const poster =
    getPoster(request);


  // ==============================================================
  // STATUS
  // ==============================================================

  const status =
    String(
      request?.status ??
      'pending'
    ).toLowerCase();


  const cfg =
    STATUS_CFG[status] ?? {

      color: 'amber',

      label:
        status
          .replace(
            /[-_]/g,
            ' '
          )
          .toUpperCase(),

    };


  // ==============================================================
  // STATUS FLAGS
  // ==============================================================

  const isAccepted = [

    'accepted',

    'price-agreed',

    'in-progress',

    'in_progress',

    'completed',

  ].includes(status);


  const isNegotiating =
    status === 'negotiating';


  const isWithdrawn =
    status === 'withdrawn';


  const isPending = [

    'waiting',

    'pending',

  ].includes(status);


  // ==============================================================
  // PROPOSAL ID
  // ==============================================================

  const proposalId =
    request?._id ??
    request?.proposalId ??
    request?.proposal_id ??
    request?.id;


  const canWithdraw =
    Boolean(proposalId) &&
    !isWithdrawn &&
    (
      isPending ||
      isNegotiating
    );

  const hasBottomActions =
    isAccepted ||
    isNegotiating;


  // ==============================================================
  // JUGAAD DETAILS
  // ==============================================================

  const jugaadTitle =
    request?.gig?.title ??
    request?.jugaadTitle ??
    request?.jugaad_title ??
    request?.jugaad?.title ??
    request?.title ??
    'Untitled Gig';


  const category =
    request?.gig?.category ??
    request?.category ??
    request?.jugaad?.category ??
    'General';


  // ==============================================================
  // AMOUNT
  // ==============================================================

  const proposedAmount =
    request?.expectedBudget ??
    request?.agreedAmount ??
    request?.agreed_amount ??
    request?.proposedAmount ??
    request?.proposed_amount ??
    request?.amount ??
    request?.proposed_price ??
    0;


  // ==============================================================
  // REQUEST TYPE
  // ==============================================================

  const requestType =
    request?.requestType ??
    request?.request_type ??
    (
      request?.proposedAmount != null ||
      request?.proposed_amount != null ||
      request?.proposed_price != null
        ? 'proposal'
        : 'interest'
    );


  // ==============================================================
  // MESSAGE / EXPLANATION
  // ==============================================================

  const explanation =
    request?.explanation ??
    request?.proposal_message ??
    request?.message ??
    '';


  // ==============================================================
  // SKILLS
  // ==============================================================

  const skills =
    Array.isArray(
      request?.skills
    )
      ? request.skills
      : Array.isArray(
          request?.required_skills
        )
        ? request.required_skills
        : [];


  // ==============================================================
  // COMPLETION TIME
  // ==============================================================

  const completionTime =
    request?.completionTime ??
    request?.completion_time ??
    request?.estimated_completion ??
    '';


  // ==============================================================
  // IMPORTANT:
  //
  // The backend proposal query returns:
  //
  //     p.created_at
  //
  // That is the real time the request was submitted.
  //
  // Prefer created_at above everything else.
  // ==============================================================

  const requestedAt =
    request?.created_at ??
    request?.createdAt ??
    request?.requested_at ??
    request?.requestedAt ??
    null;


  // ==============================================================
  // NEGOTIATION HISTORY
  // ==============================================================

  const negotiationHistory =
    Array.isArray(
      request?.negotiationHistory
    )

      ? request.negotiationHistory

      : Array.isArray(
          request?.negotiation_history
        )

        ? request.negotiation_history

        : [];


  // ==============================================================
  // CONVERSATION ID
  //
  // Use the conversation already linked to this application when
  // available. If the application response does not include it,
  // look up the existing inbox conversation before creating one.
  // The MESSAGE button is still shown for every accepted request.
  // ==============================================================

  const conversationId =
    getValidConversationId(
      request
    );


  const handleOpenMessage =
    async () => {

      if (openingMessage) {
        return;
      }

      try {
        setOpeningMessage(true);
        setMessageError('');

        // 1. Use the conversation ID returned with the application.
        if (conversationId) {
          navigate(
            `/dashboard/messages/${conversationId}`
          );
          return;
        }

        const gigId =
          getGigId(request);

        const receiverId =
          getPosterId(request);

        if (!gigId || !receiverId) {
          throw new Error(
            'The gig or poster information is missing, so the conversation cannot be opened.'
          );
        }

        // 2. Reuse an existing conversation if the backend already
        //    created one when the application was accepted.
        const conversationsResponse =
          await api.getConversations();

        const conversations =
          Array.isArray(
            conversationsResponse
          )
            ? conversationsResponse
            : conversationsResponse?.conversations ??
              conversationsResponse?.data ??
              [];

        const existingConversation =
          conversations.find(
            (candidate) => {
              const candidateGigId =
                getCandidateGigId(
                  candidate
                );

              const participantIds =
                getCandidateParticipantIds(
                  candidate
                );

              return (
                String(candidateGigId) ===
                  String(gigId) &&
                participantIds.includes(
                  String(receiverId)
                ) &&
                Boolean(
                  getConversationIdFromCandidate(
                    candidate
                  )
                )
              );
            }
          );

        let resolvedConversationId =
          getConversationIdFromCandidate(
            existingConversation
          );

        // 3. Only if no existing conversation is found, create one.
        if (!resolvedConversationId) {
          const createdResponse =
            await api.createConversation({
              receiverId,
              gigId,
            });

          const createdConversation =
            createdResponse?.conversation ??
            createdResponse?.data ??
            createdResponse;

          resolvedConversationId =
            getConversationIdFromCandidate(
              createdConversation
            );
        }

        if (!resolvedConversationId) {
          throw new Error(
            'Conversation ID was not returned by the server.'
          );
        }

        navigate(
          `/dashboard/messages/${resolvedConversationId}`
        );
      } catch (error) {
        console.error(
          'Failed to open conversation:',
          error
        );

        setMessageError(
          error?.message ||
            'Unable to open this conversation.'
        );
      } finally {
        setOpeningMessage(false);
      }
    };


  return (

    <article
      className="surface-panel rounded-2xl p-5"
      style={{
        border:
          '1px solid var(--metal-1)',
      }}
    >

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-start gap-3">

        {/* ======================================================
            POSTER AVATAR
        ====================================================== */}

        <span className="grid place-items-center w-10 h-10 rounded-full bg-amber text-bg-0 font-display text-[9px] shrink-0">

          {poster.initials}

        </span>


        {/* ======================================================
            INFORMATION
        ====================================================== */}

        <div className="flex-1 min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h2 className="font-display text-lg">

              {jugaadTitle}

            </h2>


            <span

              className="font-technical text-[10px] font-semibold px-2.5 py-1 rounded"

              style={{
                color:
                  `var(--${cfg.color})`,

                background:
                  `color-mix(in srgb, var(--${cfg.color}) 14%, transparent)`,
              }}

            >

              {cfg.label}

            </span>

          </div>


          {/* ====================================================
              POSTER + REAL TIMESTAMP
          ==================================================== */}

          <p className="font-mono text-[9px] text-ink-3 mt-1">

            Poster:{' '}

            <span className="text-ink-1">

              {poster.name}

            </span>

            {' '}·{' '}

            {category}

            {' '}·{' '}

            {safeTimeAgo(
              requestedAt
            )}

          </p>


          {/* ====================================================
              PROPOSAL MESSAGE
          ==================================================== */}

          {explanation && (

            <p className="font-mono text-[10px] text-ink-2 mt-2 leading-relaxed surface-panel rounded-lg p-3">

              "{explanation}"

            </p>

          )}


          {/* ====================================================
              SKILLS
          ==================================================== */}

          {skills.length > 0 && (

            <p className="font-mono text-[9px] text-ink-3 mt-2 flex items-center gap-1 flex-wrap">

              <Tag size={10} />


              {skills.map(
                (
                  skill,
                  index
                ) => (

                  <span
                    key={`${skill}-${index}`}
                  >

                    {skill}

                    {index <
                      skills.length - 1
                      ? ' · '
                      : ''}

                  </span>

                )
              )}

            </p>

          )}


          {/* ====================================================
              COMPLETION TIME
          ==================================================== */}

          {completionTime && (

            <p className="font-mono text-[9px] text-ink-3 mt-1 flex items-center gap-1">

              <Clock size={11} />

              {completionTime}

            </p>

          )}

        </div>


        {/* ======================================================
            AMOUNT & ACTIONS
        ====================================================== */}

        <div className="flex items-center gap-3 shrink-0 self-start">

          {/* WITHDRAW */}
          {canWithdraw && (
            <button
              type="button"
              onClick={onWithdraw}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-coral/15 text-coral font-technical text-xs font-semibold hover:bg-coral/25 transition-all border border-coral/30 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Undo2 size={13} />
              WITHDRAW<span className="hidden sm:inline">&nbsp;APPLICATION</span>
            </button>
          )}

          {/* WITHDRAWN */}
          {isWithdrawn && (
            <span className="font-mono text-xs text-ink-3 px-2.5 py-1 rounded bg-bg-2/70 border border-border-default/40 whitespace-nowrap">
              Withdrawn
            </span>
          )}

          <div className="text-right">
            <p className="font-display text-xl text-amber">
              ₹
              {Number(
                proposedAmount || 0
              ).toFixed(2)}
            </p>

            <p className="font-mono text-[8px] text-ink-3">
              {requestType === 'bargain'
                ? 'BARGAIN'
                : requestType === 'proposal'
                  ? 'PROPOSAL'
                  : 'INTEREST'}
            </p>
          </div>

        </div>

      </div>


      {/* =========================================================
          NEGOTIATION HISTORY
      ========================================================= */}

      {isNegotiating &&
        negotiationHistory.length > 0 && (

          <div className="mt-4 surface-wood rounded-xl p-3">

            <p className="font-technical text-[8px] text-paper/80 mb-2">

              NEGOTIATION HISTORY

            </p>


            {negotiationHistory.map(
              (
                offer,
                index
              ) => (

                <div

                  key={
                    offer?.id ??
                    index
                  }

                  className="flex items-center gap-2 py-1"

                >

                  <span className="font-mono text-[9px] text-paper flex-1">

                    {offer?.from ===
                    'me'

                      ? 'You'

                      : 'Poster'}

                    {offer?.message
                      ? ` — ${offer.message}`
                      : ''}

                  </span>


                  <span className="font-display text-sm text-amber">

                    ₹
                    {Number(
                      offer?.amount ??
                      0
                    ).toFixed(2)}

                  </span>

                </div>

              )
            )}

          </div>

        )}


      {/* =========================================================
          BOTTOM ACTIONS (MESSAGES / NEGOTIATION)
      ========================================================= */}

      {hasBottomActions && (

        <div className="mt-4 pt-3 border-t border-metal-1/40 flex flex-wrap items-center gap-2">

          {/* ======================================================
              MESSAGE
              ONLY AFTER ACCEPTANCE
          ====================================================== */}

          {isAccepted && (

            <button

              type="button"

              onClick={handleOpenMessage}

              disabled={openingMessage}

              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-xs hover:bg-mint/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"

            >

              <MessageSquare
                size={13}
              />

              {openingMessage
                ? 'OPENING...'
                : 'MESSAGE'}

            </button>

          )}


          {isAccepted &&
            messageError && (

              <span className="basis-full font-mono text-[9px] text-coral">

                {messageError}

              </span>

            )}


          {/* ======================================================
              NEGOTIATION ACTIONS
          ====================================================== */}

          {isNegotiating && (

            <>

              {/* ACCEPT */}

              <button

                type="button"

                onClick={async () => {

                  try {

                    if (proposalId) {

                      await acceptCounter(
                        proposalId
                      ).catch(
                        (error) =>
                          console.error(
                            'Failed to accept counter offer:',
                            error
                          )
                      );

                    }

                  } catch (error) {

                    console.error(
                      'Failed to accept counter offer:',
                      error
                    );

                  }

                }}

                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-xs hover:bg-mint/25 transition-colors"

              >

                <Check size={13} />

                ACCEPT

              </button>


              {/* REJECT */}

              <button

                type="button"

                onClick={async () => {

                  try {

                    if (proposalId) {

                      await rejectCounter(
                        proposalId
                      ).catch(
                        (error) =>
                          console.error(
                            'Failed to reject counter offer:',
                            error
                          )
                      );

                    }

                  } catch (error) {

                    console.error(
                      'Failed to reject counter offer:',
                      error
                    );

                  }

                }}

                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-xs hover:bg-coral/20 transition-colors"

              >

                <X size={13} />

                REJECT

              </button>


              {/* COUNTER */}

              <button

                type="button"

                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-xs hover:bg-amber/10 transition-colors"

              >

                <HandCoins
                  size={13}
                />

                COUNTER

              </button>

            </>

          )}


          {/* ======================================================
              NEGOTIATING WITHOUT PROPOSAL ID
          ====================================================== */}

          {isNegotiating &&
            !proposalId && (

              <span className="font-mono text-xs text-ink-3">

                Waiting for your response to the counter offer.

              </span>

            )}

                </div>

      )}

      <GigCompletionActions
        gigId={getGigId(request)}
        role="worker"
        status={
          request?.gig?.status ??
          request?.gigStatus ??
          request?.gig_status
        }
      />

    </article>

  );

}


export const ApplicationsPage = MyRequestsPage;
export default MyRequestsPage;