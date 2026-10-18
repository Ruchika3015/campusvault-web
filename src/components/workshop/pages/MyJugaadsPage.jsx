import GigCompletionActions from './GigCompletionActions';
import { useState, useEffect, useCallback } from 'react';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { LED } from '@/components/primitives/Details';

const GIG_STATUS = {
  'open': { color: 'coral', label: 'OPEN' },
  'receiving-requests': { color: 'amber', label: 'RECEIVING PROPOSALS' },
  'assigned': { color: 'mint', label: 'ASSIGNED' },
  'in-progress': { color: 'amber', label: 'IN PROGRESS' },
  'in_progress': { color: 'amber', label: 'IN PROGRESS' },
  'work_submitted': { color: 'mint', label: 'WORK SUBMITTED' },
  'completed': { color: 'mint', label: 'COMPLETED' },
  'cancelled': { color: 'coral', label: 'CANCELLED' },
};

const JUGAAD_STATUS = GIG_STATUS;

function timeAgo(date) {
  if (!date) return '';
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

import { api, apiRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useProposals } from '@/context/ProposalContext';

import {
  ClipboardList,
  ArrowLeft,
  ChevronRight,
  HandCoins,
  Check,
  X,
  MessageSquare,
  Clock,
  Tag,
} from 'lucide-react';

import { CounterOfferModal } from '@/components/workshop/pages/CounterOfferModal';
import { ConfirmActionModal } from '@/components/workshop/pages/ConfirmActionModal';


/* ============================================================
   PROPOSAL STATUS
============================================================ */

const PROPOSAL_STATUS = {
  pending: {
    color: 'amber',
    label: 'PENDING',
  },

  accepted: {
    color: 'mint',
    label: 'ACCEPTED',
  },

  rejected: {
    color: 'coral',
    label: 'REJECTED',
  },

  'counter-offer': {
    color: 'amber',
    label: 'COUNTER OFFER',
  },

  withdrawn: {
    color: 'ink',
    label: 'WITHDRAWN',
  },
};


/* ============================================================
   HELPERS
============================================================ */

function getValidConversationId(source) {
  if (!source) {
    return null;
  }

  const rawId =
    source?.conversationId ??
    source?.conversation_id ??
    source?.conversation?.id ??
    source?.conversation?._id ??
    source?.conversation?.conversationId ??
    source?.conversation?.conversation_id ??
    source?._id ??
    source?.id ??
    null;

  if (
    rawId === null ||
    rawId === undefined
  ) {
    return null;
  }

  const value = String(rawId).trim();
  if (!value || value === 'null' || value === 'undefined') {
    return null;
  }

  return value;
}


function getProposalJugaadId(proposal) {
  return (
    proposal?.gig?._id ??
    (typeof proposal?.gig === 'string' ? proposal?.gig : null) ??
    proposal?.gig?.id ??
    proposal?.jugaadId ??
    proposal?.jugaad_id ??
    proposal?.jugaad?.id ??
    proposal?.jugaad?._id ??
    proposal?.jugaad?.jugaadId ??
    null
  );
}


function getInitials(name) {
  if (!name) {
    return 'U';
  }

  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}


/* ============================================================
   NORMALIZE PROPOSAL
============================================================ */

function normalizeProposal(proposal) {
  if (!proposal) {
    return null;
  }

  const helper =
    proposal?.applicant ||
    proposal?.helper ||
    proposal?.student ||
    proposal?.user ||
    {};

  const name =
    helper?.name ||
    helper?.fullName ||
    helper?.username ||
    proposal?.helperName ||
    proposal?.helper_name ||
    proposal?.studentName ||
    proposal?.student_name ||
    'Student';

  const status =
    proposal?.status ||
    'pending';

  const amount =
    proposal?.expectedBudget ??
    proposal?.proposedPrice ??
    proposal?.proposed_price ??
    proposal?.amount ??
    0;

  return {
    ...proposal,
    id: proposal?._id ?? proposal?.id,
    proposal_message: proposal?.proposal || proposal?.proposal_message || proposal?.explanation || '',

    helper: {
      ...helper,
      id:
        helper?._id ??
        helper?.id ??
        proposal?.helperId ??
        proposal?.helper_id ??
        null,
      name,
    },

    helperId:
      helper?._id ??
      helper?.id ??
      proposal?.helperId ??
      proposal?.helper_id ??
      null,

    helperName: name,

    proposedPrice: amount,

    status,

    conversationId:
      proposal?.conversationId ??
      proposal?.conversation_id ??
      null,

    conversation_id:
      proposal?.conversation_id ??
      proposal?.conversationId ??
      null,
  };
}


/* ============================================================
   PAGE
============================================================ */

export function MyJugaadsPage() {
  const {
    isDemoMode,
    isAuthenticated,
  } = useAuth();

  const {
    receivedProposals = [],
    acceptProposal,
    rejectProposal,
    counterProposal,
    refreshData,
    conversations = [],
  } = useProposals();

  const [
    jugaadsList,
    setJugaadsList,
  ] = useState(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    selected,
    setSelected,
  ] = useState(null);

  const [
    status,
    setStatus,
  ] = useState({});

  const [
    counterTarget,
    setCounterTarget,
  ] = useState(null);

  const [
    confirmAction,
    setConfirmAction,
  ] = useState(null);


  /* ==========================================================
     LOAD MY JUGAADS
  ========================================================== */

  const fetchMyJugaads =
    useCallback(
      async () => {

        if (!isAuthenticated) {
          setJugaadsList([]);
          setLoading(false);

          return;
        }


        setLoading(true);


        try {

          const [
            jugaadsResult
          ] = await Promise.all([
            api.getMyJugaads(),
            refreshData(),
          ]);


          const list =
            jugaadsResult?.jugaads ??
            jugaadsResult?.data?.jugaads ??
            jugaadsResult?.data ??
            (
              Array.isArray(
                jugaadsResult
              )
                ? jugaadsResult
                : []
            );


          setJugaadsList(
            Array.isArray(list)
              ? list
              : []
          );

        } catch (error) {

          console.error(
            'Failed to load my jugaads:',
            error
          );

          setJugaadsList([]);

        } finally {

          setLoading(false);
        }

      },
      [
        isDemoMode,
        isAuthenticated,
        refreshData,
      ]
    );


  useEffect(() => {
    fetchMyJugaads();
  }, [
    fetchMyJugaads,
  ]);


  /* ==========================================================
     UPDATE STATUS
  ========================================================== */

  const handleUpdateStatus =
    async (
      itemId,
      newStatus
    ) => {

      setStatus(
        current => ({
          ...current,
          [itemId]:
            newStatus,
        })
      );


      if (isDemoMode) {
        return;
      }


      try {

        if (
          typeof api.updateJugaadStatus ===
          'function'
        ) {

          await api.updateJugaadStatus(
            itemId,
            newStatus
          );
        }


        await fetchMyJugaads();

      } catch (error) {

        console.error(
          'Failed to update Jugaad status:',
          error
        );
      }
    };


  /* ==========================================================
     NORMALIZE JUGAAD LIST
  ========================================================== */

  const items =
    (
      Array.isArray(jugaadsList)
        ? jugaadsList
        : []
    ).map(
      x => {
        const itemId = x?._id ?? x?.id ?? x?.jugaadId;
        return {
          ...x,
          id: itemId,
          amount:
            x?.budget ??
            x?.amount ??
            x?.price ??
            0,
          budget:
            x?.budget ??
            x?.amount ??
            x?.price ??
            0,
          postedAt:
            x?.created_at ??
            x?.createdAt ??
            x?.posted_at ??
            x?.postedAt ??
            null,
          status:
            status[itemId] ??
            status[x?.id] ??
            x?.status ??
            'open',
          interestedStudents:
            x?.interestedStudents ??
            x?.interested_students ??
            x?.requests ??
            [],
        };
      }
    );


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {

    return (
      <div>

        <Header
          title="MY GIGS"
          sub="The requirements you posted on CampusVault."
          icon={
            <ClipboardList />
          }
        />

        <div className="surface-metal-brushed rounded-2xl p-12 text-center">

          <p className="font-mono text-xs text-ink-3">
            LOADING YOUR GIGS...
          </p>

        </div>

      </div>
    );
  }


  /* ==========================================================
     DETAIL PAGE
  ========================================================== */

  if (selected) {

    const item =
      items.find(
        x =>
          String(x.id) ===
          String(selected)
      ) ||
      items[0];


    if (!item) {
      return null;
    }


    const itemProposals =
      Array.isArray(
        receivedProposals
      )
        ? receivedProposals

            .filter(
              proposal => {

                const proposalJugaadId =
                  getProposalJugaadId(
                    proposal
                  );

                return (
                  proposalJugaadId !==
                    null &&
                  String(
                    proposalJugaadId
                  ) ===
                    String(item.id)
                );
              }
            )

            .map(
              proposal =>
                normalizeProposal(
                  proposal
                )
            )

        : [];


    return (
      <Detail
        item={item}
        proposals={
          itemProposals
        }
        conversations={
          conversations
        }

        onBack={() =>
          setSelected(null)
        }

        onStatus={newStatus =>
          handleUpdateStatus(
            item.id,
            newStatus
          )
        }

        onAcceptProposal={
          proposal =>
            setConfirmAction({
              variant:
                'accept',
              proposal,
            })
        }

        onRejectProposal={
          proposal =>
            setConfirmAction({
              variant:
                'reject',
              proposal,
            })
        }

        onCounterProposal={
          proposal =>
            setCounterTarget(
              proposal
            )
        }

        confirmAction={
          confirmAction
        }

        setConfirmAction={
          setConfirmAction
        }

        onConfirmAction={
          async () => {

            if (!confirmAction) {
              return;
            }

            try {

              if (
                confirmAction.variant ===
                  'accept' &&
                confirmAction.proposal?.id
              ) {

                await acceptProposal(
                  confirmAction
                    .proposal
                    .id
                );

              } else if (
                confirmAction.variant ===
                  'reject' &&
                confirmAction.proposal?.id
              ) {

                await rejectProposal(
                  confirmAction
                    .proposal
                    .id
                );
              }


              await fetchMyJugaads();

            } catch (error) {

              console.error(
                'Failed to process proposal:',
                error
              );

            } finally {

              setConfirmAction(
                null
              );
            }
          }
        }
      />
    );
  }


  /* ==========================================================
     LIST PAGE
  ========================================================== */

  return (
    <div>

      <Header
        title="MY GIGS"
        sub="The requirements you posted on the exchange."
        icon={
          <ClipboardList />
        }
      />


      <div className="flex items-center justify-between mb-4">

        <p className="font-mono text-[9px] text-ink-3">
          {items.length} posted gigs
        </p>


        <Link
          to="/dashboard/post-gig"
          className="machine-control machine-control--primary"
          style={{
            padding:
              '8px 12px',
          }}
        >

          <span className="ctrl-led" />

          POST NEW GIG

        </Link>

      </div>


      {items.length === 0 ? (

        <div
          className="surface-metal-brushed rounded-2xl p-12 text-center"
          style={{
            border:
              '1px solid var(--metal-1)',
          }}
        >

          <ClipboardList
            size={36}
            className="mx-auto text-ink-3 mb-3"
          />

          <p className="font-display text-xl text-ink-0">
            NO POSTED GIGS
          </p>

          <p className="font-mono text-xs text-ink-2 mt-2 max-w-sm mx-auto">
            You haven't posted any requirements yet.
            Publish a gig on CampusVault to get help from campus peers.
          </p>

          <Link
            to="/dashboard/post-gig"
            className="machine-control machine-control--primary inline-flex mt-6"
            style={{
              padding:
                '10px 16px',
            }}
          >

            <span className="ctrl-led" />

            POST YOUR FIRST GIG

          </Link>

        </div>

      ) : (

        <div className="grid lg:grid-cols-2 gap-3">

          {items.map(
            item => {

              const itemProposals =
                Array.isArray(
                  receivedProposals
                )
                  ? receivedProposals.filter(
                      proposal =>
                        String(
                          getProposalJugaadId(
                            proposal
                          )
                        ) ===
                        String(item.id)
                    )
                  : [];


              const statusConfig =
                GIG_STATUS[
                  item.status
                ] ||
                GIG_STATUS.open;


              /*
               * IMPORTANT:
               *
               * Only direct interested students
               * are counted here.
               *
               * Proposal students are not merged
               * into the interested list.
               */

              const directRequests =
                Array.isArray(
                  item.interestedStudents
                )
                  ? item.interestedStudents
                  : [];


              const requestCount =
                directRequests.length +
                itemProposals.length;


              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setSelected(
                      item.id
                    )
                  }
                  className="surface-metal-brushed rounded-2xl p-5 text-left hover:border-amber/40 transition-colors"
                  style={{
                    border:
                      '1px solid var(--metal-1)',
                  }}
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="font-display text-lg sm:text-xl font-bold">
                        {item.title}
                      </p>

                      <p className="font-mono text-xs sm:text-sm text-ink-2 mt-1">
                        {item.id} ·{' '}
                        {
                          item.skillRequired ||
                          item.category
                        }
                      </p>

                    </div>


                    <span
                      className="font-technical text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded"
                      style={{
                        color:
                          `var(--${statusConfig.color})`,

                        background:
                          `color-mix(in srgb, var(--${statusConfig.color}) 12%, transparent)`,
                      }}
                    >
                      {
                        statusConfig.label
                      }
                    </span>

                  </div>


                  <p className="font-sans text-xs sm:text-sm text-ink-1 mt-3 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>


                  <div className="flex items-center gap-3 mt-4">

                    <span className="font-display text-xl sm:text-2xl font-bold text-amber">
                      ₹
                      {Number(
                        item.amount
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </span>


                    <span className="font-mono text-xs sm:text-sm text-ink-2">
                      {requestCount}{' '}
                      requests
                    </span>


                    {itemProposals.length >
                      0 && (

                      <span className="font-technical text-xs text-amber px-2 py-0.5 rounded bg-amber/10">
                        {
                          itemProposals.length
                        }{' '}
                        PROPOSALS
                      </span>

                    )}


                    <ChevronRight
                      size={14}
                      className="ml-auto text-ink-3"
                    />

                  </div>

                </button>
              );
            }
          )}

        </div>
      )}


      {counterTarget && (

        <CounterOfferModal
          proposal={
            counterTarget
          }

          onClose={() =>
            setCounterTarget(
              null
            )
          }

          onSubmit={async (
            price,
            msg
          ) => {

            try {

              await counterProposal(
                counterTarget.id,
                price,
                msg
              );

              await fetchMyJugaads();

            } catch (error) {

              console.error(
                'Failed to send counter offer:',
                error
              );

            } finally {

              setCounterTarget(
                null
              );
            }
          }}
        />

      )}

    </div>
  );
}


/* ============================================================
   HEADER
============================================================ */

function Header({
  title,
  sub,
  icon,
}) {
  return (
    <section className="pt-12 pb-7">

      <div className="flex items-center gap-3 mb-4">

        <LED
          color="amber"
          pulse
          size={7}
        />

        <span className="font-technical text-[9px] text-ink-2">
          WORKSHOP // PERSONAL LEDGER
        </span>

      </div>


      <div className="flex items-center gap-3">

        <span className="text-amber">
          {icon}
        </span>

        <h1 className="font-display text-4xl sm:text-5xl">
          {title}
        </h1>

      </div>


      <p className="mt-3 text-sm text-ink-2">
        {sub}
      </p>

    </section>
  );
}


/* ============================================================
   DETAIL
============================================================ */

function Detail({
  item,
  proposals,
  conversations,
  onBack,
  onStatus,
  onAcceptProposal,
  onRejectProposal,
  onCounterProposal,
  confirmAction,
  setConfirmAction,
  onConfirmAction,
}) {

  /*
   * ==========================================================
   * DIRECT INTEREST ONLY
   * ==========================================================
   *
   * This is the important correction.
   *
   * DO NOT merge proposals into this array.
   *
   * A student who submits a proposal belongs under
   * PROPOSALS RECEIVED.
   *
   * A student who only clicks INTERESTED belongs here.
   */

  const directStudents =
    Array.isArray(
      item?.interestedStudents
    )
      ? item.interestedStudents
      : [];

  /*
   * Remove direct-interest entries that already have
   * a proposal from the same student.
   *
   * That prevents the same person appearing in both
   * sections.
   */

  const proposalHelperIds =
    new Set(
      (
        Array.isArray(
          proposals
        )
          ? proposals
          : []
      )
        .map(
          proposal =>
            proposal?.helperId ??
            proposal?.helper_id ??
            proposal?.helper?.id ??
            null
        )
        .filter(
          id =>
            id !== null &&
            id !== undefined
        )
        .map(
          id => String(id)
        )
    );


  const realInterestedStudents =
    directStudents.filter(
      student => {

        const studentId =
          student?.id ??
          student?.userId ??
          student?.user_id ??
          null;


        /*
         * If the student has a proposal,
         * don't display them again here.
         */

        if (
          studentId !== null &&
          studentId !== undefined &&
          proposalHelperIds.has(
            String(studentId)
          )
        ) {
          return false;
        }


        return true;
      }
    );


  /*
   * ==========================================================
   * ACCEPTED PROPOSAL CONVERSATION
   * ==========================================================
   */

  const enrichedProposals =
    (
      Array.isArray(
        proposals
      )
        ? proposals
        : []
    ).map(
      proposal => {

        const proposalId =
          proposal?.id ??
          proposal?.proposalId ??
          null;


        const helperId =
          proposal?.helperId ??
          proposal?.helper_id ??
          proposal?.helper?.id ??
          null;


        /*
         * Exact proposal conversation first.
         */

        const exactConversation =
          Array.isArray(
            conversations
          )
            ? conversations.find(
                conversation => {

                  const conversationProposalId =
                    conversation?.proposal_id ??
                    conversation?.proposalId ??
                    conversation?.proposal?.id ??
                    null;


                  return (
                    proposalId !=
                      null &&
                    conversationProposalId !=
                      null &&
                    String(
                      proposalId
                    ) ===
                      String(
                        conversationProposalId
                      )
                  );
                }
              )
            : null;


        /*
         * Fallback for older conversations.
         */

        const fallbackConversation =
          exactConversation ||
          (
            Array.isArray(
              conversations
            )
              ? conversations.find(
                  conversation => {

                    const conversationJugaadId =
                      conversation?.jugaad_id ??
                      conversation?.jugaadId ??
                      conversation?.jugaad?.id ??
                      null;


                    const userOne =
                      conversation?.user_one_id ??
                      conversation?.userOneId ??
                      null;


                    const userTwo =
                      conversation?.user_two_id ??
                      conversation?.userTwoId ??
                      null;


                    const posterId =
                      item?.poster_id ??
                      item?.posterId ??
                      null;


                    if (
                      conversationJugaadId ==
                        null ||
                      String(
                        conversationJugaadId
                      ) !==
                        String(item.id)
                    ) {
                      return false;
                    }


                    if (
                      helperId == null ||
                      posterId == null ||
                      userOne == null ||
                      userTwo == null
                    ) {
                      return false;
                    }


                    return (
                      (
                        String(
                          userOne
                        ) ===
                          String(
                            posterId
                          ) &&
                        String(
                          userTwo
                        ) ===
                          String(
                            helperId
                          )
                      ) ||
                      (
                        String(
                          userOne
                        ) ===
                          String(
                            helperId
                          ) &&
                        String(
                          userTwo
                        ) ===
                          String(
                            posterId
                          )
                      )
                    );
                  }
                )
              : null
          );


        const conversationId =
          getValidConversationId(
            proposal
          ) ||
          getValidConversationId(
            fallbackConversation
          );


        return {
          ...proposal,

          conversationId,

          conversation_id:
            conversationId,
        };
      }
    );


  return (
    <div>

      <section className="pt-12 pb-6">

        <button
          onClick={onBack}
          className="flex items-center gap-2 font-technical text-xs sm:text-sm text-ink-2 hover:text-amber mb-5 transition-colors"
        >
          <ArrowLeft size={16} />
          BACK TO MY GIGS
        </button>


        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <LED
                color={
                  GIG_STATUS[
                    item?.status
                  ]?.color || 'amber'
                }
                pulse
                size={7}
              />


              <span
                className="font-technical text-xs font-semibold px-2 py-0.5 rounded"
                style={{
                  color:
                    `var(--${
                      GIG_STATUS[
                        item?.status
                      ]?.color ||
                      'amber'
                    })`,
                }}
              >
                {
                  GIG_STATUS[
                    item?.status
                  ]?.label ||
                    item?.status
                }
              </span>

            </div>


            <h1 className="font-display text-3xl sm:text-4xl">
              {item?.title}
            </h1>


            <p className="font-mono text-xs sm:text-sm text-ink-2 mt-2">

              {item?.id} ·{' '}

              {
                item?.skillRequired ||
                item?.category
              }

              {' · posted '}

              {item?.postedAt
                ? timeAgo(
                    item.postedAt
                  )
                : 'recently'}

            </p>

          </div>


          <div className="surface-panel rounded-xl px-5 py-3">

            <p className="font-technical text-xs font-bold tracking-wider text-ink-3">
              BUDGET
            </p>

            <p className="font-display text-2xl sm:text-3xl font-bold text-amber">
              ₹
              {Number(
                item?.budget ??
                  item?.amount ??
                  0
              ).toLocaleString(
                'en-IN'
              )}
              .00
            </p>

          </div>

        </div>
            </section>

      <GigCompletionActions
        gigId={item.id}
        role="owner"
        status={item.status}
      />

      <div className="grid lg:grid-cols-[.75fr_1.25fr] gap-5">

        {/* =====================================================
            LEFT
        ===================================================== */}

        <div className="surface-panel rounded-2xl p-5">

          <p className="font-technical text-xs sm:text-sm font-bold tracking-wider mb-3">
            GIG DETAILS
          </p>


          <p className="font-sans text-sm sm:text-base text-ink-1 leading-relaxed">
            {item?.description}
          </p>


          <div className="mt-5 pt-4 border-t border-metal-1/40">

            <p className="font-technical text-xs font-bold tracking-wider text-ink-3">
              ASSIGNMENT STATUS
            </p>


            <div className="flex flex-wrap gap-2 mt-3">

              {[
                'open',
                'receiving-requests',
                'assigned',
                'in-progress',
                'completed',
                'cancelled',
              ].map(
                currentStatus => (

                  <button
                    key={
                      currentStatus
                    }

                    onClick={() =>
                      onStatus(
                        currentStatus
                      )
                    }

                    className={`px-3 py-2 rounded-md font-technical text-xs font-semibold transition-colors ${
                      item?.status ===
                      currentStatus
                        ? 'bg-amber text-bg-0'
                        : 'bg-bg-2 text-ink-3 border border-metal-1 hover:text-ink-0'
                    }`}
                  >
                    {
                      GIG_STATUS[
                        currentStatus
                      ]?.label ||
                        currentStatus
                    }
                  </button>

                )
              )}

            </div>

          </div>

        </div>


        {/* =====================================================
            RIGHT
        ===================================================== */}

        <div className="space-y-5">

          {/* ===================================================
              PROPOSALS RECEIVED
          =================================================== */}

          {enrichedProposals.length >
            0 && (

            <div className="surface-metal-brushed rounded-2xl p-5">

              <div className="flex items-center justify-between mb-4">

                <p className="font-technical text-xs sm:text-sm font-bold text-amber">
                  PROPOSALS RECEIVED
                </p>


                <span className="font-mono text-xs text-ink-2">
                  {
                    enrichedProposals.length
                  }{' '}
                  proposals
                </span>

              </div>


              <div className="space-y-3">

                {enrichedProposals.map(
                  proposal => (

                    <ProposalDetailCard
                      key={
                        proposal.id
                      }

                      item={
                        item
                      }

                      proposal={
                        proposal
                      }

                      onAccept={() =>
                        onAcceptProposal(
                          proposal
                        )
                      }

                      onReject={() =>
                        onRejectProposal(
                          proposal
                        )
                      }

                      onCounter={() =>
                        onCounterProposal(
                          proposal
                        )
                      }
                    />

                  )
                )}

              </div>

            </div>

          )}


          {/* ===================================================
              INTERESTED STUDENTS
              ONLY DIRECT INTEREST
          =================================================== */}

          <div className="surface-metal-brushed rounded-2xl p-5">

            <div className="flex items-center justify-between mb-4">

              <p className="font-technical text-xs sm:text-sm font-bold text-ink-1">
                INTERESTED STUDENTS
              </p>


              <span className="font-mono text-xs text-ink-2">
                {
                  realInterestedStudents.length
                }{' '}
                requests
              </span>

            </div>


            <div className="space-y-3">

              {realInterestedStudents.length ===
              0 ? (

                <p className="font-mono text-xs sm:text-sm text-ink-3 py-2">
                  No direct student requests yet.
                </p>

              ) : (

                realInterestedStudents.map(
                  (
                    student,
                    index
                  ) => (

                    <StudentRequest
                      key={
                        student?.id ||
                        student?.userId ||
                        index
                      }

                      student={
                        student
                      }

                      assigned={
                        false
                      }

                      locked={
                        false
                      }

                      onAccept={() => {}}
                      onReject={() => {}}
                      onCounter={() => {}}
                    />

                  )
                )

              )}

            </div>

          </div>

        </div>

      </div>


      {confirmAction && (

        <ConfirmActionModal
          variant={
            confirmAction.variant
          }

          proposal={
            confirmAction.proposal
          }

          onClose={() =>
            setConfirmAction(
              null
            )
          }

          onConfirm={
            onConfirmAction
          }
        />

      )}

    </div>
  );
}


/* ============================================================
   PROPOSAL CARD
============================================================ */

function ProposalDetailCard({
  item,
  proposal,
  onAccept,
  onReject,
  onCounter,
}) {
  const navigate =
    useNavigate();

  const [
    openingConversation,
    setOpeningConversation,
  ] = useState(false);

  const [
  paymentConsent,
  setPaymentConsent,
] = useState(false);


  const [
    conversationError,
    setConversationError,
  ] = useState('');

  const normalized =
    normalizeProposal(
      proposal
    );


  const status =
    String(
      normalized?.status ||
        'pending'
    ).toLowerCase();


  const cfg =
    PROPOSAL_STATUS[
      status
    ] ||
    PROPOSAL_STATUS.pending;


  const isAccepted =
    status ===
    'accepted';


  const isRejected =
    status ===
    'rejected';


  const isWithdrawn =
    status ===
    'withdrawn';


  const conversationId =
    getValidConversationId(
      normalized
    );

  const handleOpenConversation =
    async () => {
      const receiverId =
        normalized?.helperId ??
        normalized?.helper_id ??
        normalized?.helper?.id;

      const gigId =
        item?.id;

      if (
        !receiverId ||
        !gigId
      ) {
        setConversationError(
          'Conversation details are unavailable.'
        );

        return;
      }

      try {
        setOpeningConversation(true);
        setConversationError('');

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
                candidate?.gig?._id ??
                candidate?.gig?.id ??
                candidate?.gig ??
                null;

              const participantIds =
                Array.isArray(
                  candidate?.participants
                )
                  ? candidate.participants.map(
                      (participant) =>
                        participant?._id ??
                        participant?.id ??
                        participant
                    )
                  : [];

              return (
                String(candidateGigId) ===
                  String(gigId) &&
                participantIds.some(
                  (participantId) =>
                    String(participantId) ===
                    String(receiverId)
                ) &&
                Boolean(candidate?._id)
              );
            }
          );

        const conversation =
          existingConversation ||
          await api.createConversation({
            receiverId,
            gigId,
          });

        if (!conversation?._id) {
          throw new Error(
            'Conversation ID was not returned by the server.'
          );
        }

        navigate(
          `/dashboard/messages/${conversation._id}`
        );
      } catch (error) {
        console.error(
          'Failed to open conversation:',
          error
        );

        setConversationError(
          error?.message ||
            'Unable to open this conversation.'
        );
      } finally {
        setOpeningConversation(false);
      }
    };


  const helperName =
    normalized?.helper?.name ||
    normalized?.helperName ||
    normalized?.helper_name ||
    'Student';


  const proposedAmount =
    normalized?.proposedPrice ??
    normalized?.proposed_price ??
    normalized?.amount ??
    0;

  const formattedProposedAmount =
    Number(
      proposedAmount
    ).toLocaleString(
      'en-IN'
    );


  return (
    <div className="surface-panel rounded-xl p-4">

      <div className="flex items-start gap-3">

        <span className="grid place-items-center w-10 h-10 rounded-full bg-amber text-bg-0 font-display text-xs font-bold shrink-0">

          {
            normalized?.helper
              ?.initials ||
            getInitials(
              helperName
            )
          }

        </span>


        <div className="flex-1 min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <p className="font-display text-base font-bold">
              {helperName}
            </p>


            <span
              className="font-technical text-xs px-2 py-0.5 rounded"
              style={{
                color:
                  `var(--${cfg.color})`,

                background:
                  `color-mix(in srgb, var(--${cfg.color}) 12%, transparent)`,
              }}
            >
              {cfg.label}
            </span>

          </div>


          {Array.isArray(
            normalized?.skills
          ) &&
            normalized.skills.length >
              0 && (

              <p className="font-mono text-xs text-ink-2 mt-1 flex items-center gap-1.5">

                <Tag size={12} />

                {
                  normalized.skills.join(
                    ' · '
                  )
                }

              </p>
            )}


          {(
            normalized?.explanation ||
            normalized?.proposal_message ||
            normalized?.proposalMessage
          ) && (

            <p className="font-sans text-xs sm:text-sm text-ink-1 mt-2 leading-relaxed italic">

              "
              {
                normalized?.explanation ||
                normalized?.proposal_message ||
                normalized?.proposalMessage
              }
              "

            </p>

          )}


          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-mono text-ink-2">

            <span className="font-display text-lg font-bold text-amber">

              ₹
              {
                formattedProposedAmount
              }

            </span>


            {(
              normalized?.completionTime ||
              normalized?.estimated_completion
            ) && (

              <span className="flex items-center gap-1">

                <Clock size={13} />

                {
                  normalized?.completionTime ||
                  normalized?.estimated_completion
                }

              </span>

            )}

          </div>

        </div>

      </div>


      {/* =======================================================
          ACCEPTED → MESSAGE & PAYMENT
      ======================================================= */}

      {isAccepted && (

        <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-metal-1/40">

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={
                handleOpenConversation
              }
              disabled={
                openingConversation
              }
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-mint/15 text-mint font-technical text-xs font-semibold hover:bg-mint/25 transition-colors disabled:opacity-50"
            >
              <MessageSquare
                size={14}
              />
              {
                openingConversation
                  ? 'OPENING...'
                  : 'MESSAGE'
              }
            </button>
          </div>

          {conversationError && (
            <p className="w-full font-mono text-[9px] text-coral">
              {conversationError}
            </p>
          )}

          <div className="pt-2 border-t border-metal-1/30 flex flex-col gap-2.5">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={paymentConsent}
                onChange={(event) =>
                  setPaymentConsent(event.target.checked)
                }
                className="mt-0.5 accent-amber"
              />

              <span className="font-mono text-[10px] sm:text-xs text-ink-2 leading-relaxed">
                I agree to the{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-amber hover:underline"
                >
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link
                  to="/refund-policy"
                  target="_blank"
                  className="text-amber hover:underline"
                >
                  Refund & Cancellation Policy
                </Link>
                .
              </span>
            </label>


          <button
  type="button"
  disabled={!paymentConsent}
            onClick={async () => {
  try {
    const profileResponse = await api.getProfile();
    const profile =
      profileResponse?.data ||
      profileResponse?.user ||
      profileResponse ||
      {};

    const amount = Number(proposedAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    const customerEmail = profile?.email || profile?.emailAddress;
    const customerPhone =
      profile?.number ||
      profile?.phone ||
      profile?.phoneNumber ||
      profile?.mobile;

    if (!customerEmail) {
      throw new Error('Your profile email is required for payment');
    }

    const cleanPhone = String(customerPhone || '')
      .replace(/\s+/g, '')
      .replace(/^(\+91|91)/, '');

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new Error(
        'Please add a valid 10-digit Indian mobile number to your profile'
      );
    }

    // Create a Razorpay order using your backend.
    const response = await api.createRazorpayOrder(item?.id);

    const order = response?.data || response?.order || response;

    const orderId = order?.id || order?.orderId;
    const keyId =
      order?.keyId ||
      order?.key_id ||
      import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!orderId || !keyId) {
      throw new Error(
        'Razorpay order or public key is missing. Check the backend response.'
      );
    }

    // Load Razorpay Checkout if it isn't already loaded.
    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        script.onerror = () =>
          reject(new Error('Unable to load Razorpay Checkout'));
        document.body.appendChild(script);
      });
    }

    const options = {
      key: keyId,
      order_id: orderId,
      amount: order?.amountPaise ?? order?.amount ?? Math.round(amount * 100),
      currency: order?.currency || 'INR',
      name: 'CampusVault',
      description: 'Jugaad payment',
      prefill: {
        name:
          profile?.name ||
          profile?.fullName ||
          profile?.username ||
          '',
        email: customerEmail,
        contact: cleanPhone,
      },

      handler: async (paymentResponse) => {
        try {
          // Verify the payment on the backend.
          const verification = await api.verifyRazorpayPayment({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          });

          const result = verification?.data || verification;

          if (result?.status === 'PAID') {
  window.alert('Payment successful!');
} else {
  window.alert(
    `Payment verification completed, but the final status is ${
      result?.status || 'PENDING'
    }. Please check the payment status before trying again.`
  );
}
        } catch (error) {
          console.error('Razorpay verification error:', error);
          window.alert(
            'Payment verification could not be completed. Please contact support before retrying.'
          );
        }
      },

      modal: {
        ondismiss: () => {
          console.log('Razorpay checkout closed');
        },
      },
    };

    const checkout = new window.Razorpay(options);

    checkout.on('payment.failed', (event) => {
      console.error('Razorpay payment failed:', event.error);
      window.alert(
        event.error?.description || 'Payment failed. Please try again.'
      );
    });

    checkout.open();
  } catch (error) {
    console.error('Razorpay payment error:', error);
    window.alert(
      error?.message || 'Payment could not be started. Please try again.'
    );
  }
}}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-mint/15 text-mint font-technical text-xs font-semibold hover:bg-mint/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <HandCoins size={14} />

            PAY ₹
            {formattedProposedAmount}
          </button>

          </div>

        </div>

      )}


      {/* =======================================================
          PENDING → ACTIONS
      ======================================================= */}

      {!isAccepted &&
        !isRejected &&
        !isWithdrawn && (

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-metal-1/40">

          <button
            type="button"
            onClick={
              onAccept
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-mint/15 text-mint font-technical text-xs font-semibold hover:bg-mint/25 transition-colors"
          >
            <Check size={14} />
            ACCEPT
          </button>


          <button
            type="button"
            onClick={
              onReject
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-coral/10 text-coral font-technical text-xs font-semibold hover:bg-coral/20 transition-colors"
          >
            <X size={14} />
            REJECT
          </button>


          <button
            type="button"
            onClick={
              onCounter
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber/30 text-amber font-technical text-xs font-semibold hover:bg-amber/10 transition-colors"
          >
            <HandCoins
              size={14}
            />
            COUNTER
          </button>

        </div>

      )}

    </div>
  );
}


/* ============================================================
   DIRECT INTEREST CARD
============================================================ */

function StudentRequest({
  student,
}) {

  const skills =
    Array.isArray(
      student?.skills
    )
      ? student.skills
      : [];


  const name =
    student?.name ||
    student?.fullName ||
    student?.username ||
    'Student';


  const isBargain =
    student?.requestType ===
      'bargain' ||
    student?.request_type ===
      'bargain';


  const proposedAmount =
    student?.proposedAmount ??
    student?.proposed_amount ??
    0;


  return (
    <div className="surface-panel rounded-xl p-4">

      <div className="flex items-start gap-3">

        <span className="grid place-items-center w-10 h-10 rounded-full bg-amber text-bg-0 font-display text-xs font-bold shrink-0">

          {
            student?.initials ||
            getInitials(name)
          }

        </span>


        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2">

            <p className="font-display text-base font-bold">
              {name}
            </p>


            {isBargain && (

              <span className="font-technical text-xs text-amber px-2 py-0.5 rounded bg-amber/10">
                BARGAIN
              </span>

            )}

          </div>


          <p className="font-mono text-xs text-ink-2 mt-1">

            {
              skills.length >
              0
                ? skills.join(
                    ' · '
                  )
                : 'Student'
            }

            {' · '}

            {
              student?.rating ||
              0
            }★

          </p>


          {student?.message && (

            <p className="font-sans text-xs sm:text-sm text-ink-1 mt-2 italic leading-relaxed">
              "{student.message}"
            </p>

          )}

        </div>


        <span className="font-technical text-xs font-semibold text-amber">

          {isBargain
            ? `OFFER ₹${proposedAmount}`
            : 'INTERESTED'}

        </span>

      </div>


      {/* ========================================================
          DIRECT INTEREST CAN STILL BE ACCEPTED / REJECTED
          BECAUSE IT HAS NO PROPOSAL.
      ======================================================== */}

      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-metal-1/40">

        <button
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-mint/15 text-mint font-technical text-xs font-semibold hover:bg-mint/25 transition-colors"
        >
          <Check size={14} />
          ACCEPT
        </button>


        <button
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-coral/10 text-coral font-technical text-xs font-semibold hover:bg-coral/20 transition-colors"
        >
          <X size={14} />
          REJECT
        </button>

      </div>

    </div>
  );
}


export const MyGigsPage = MyJugaadsPage;
export default MyJugaadsPage;