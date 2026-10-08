import { Link } from 'react-router-dom';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  LED,
  Rivet,
} from '@/components/primitives/Details';

import { api } from '@/services/api';

import {
  Search,
  Plus,
  ArrowRight,
  Bell,
  ClipboardList,
  Send,
  MessageSquare,
  BriefcaseBusiness,
  RefreshCw,
} from 'lucide-react';


/* ================================================================
   UI HELPERS
================================================================ */

const CATEGORY_COLORS = {
  Design: 'amber',
  Development: 'mint',
  Writing: 'coral',
  Marketing: 'amber',
  Video: 'mint',
  Photography: 'coral',
  Academic: 'mint',
  Events: 'amber',
  Business: 'coral',
  Other: 'amber',
};


const GIG_STATUS_COLORS = {
  open: 'mint',
  assigned: 'amber',
  in_progress: 'amber',
  completed: 'mint',
  cancelled: 'coral',
  closed: 'coral',
};


function getList(
  response,
  possibleKeys = []
) {
  if (Array.isArray(response)) {
    return response;
  }

  for (const key of possibleKeys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}


function getId(item) {
  return (
    item?.id ??
    item?._id
  );
}


function getAmount(item) {
  return (
    item?.amount ??
    item?.budget ??
    item?.proposed_price ??
    item?.proposedPrice ??
    0
  );
}


function getName(user) {
  if (!user) {
    return 'Student';
  }

  if (typeof user === 'string') {
    return user;
  }

  return (
    user.name ??
    user.full_name ??
    user.fullName ??
    user.username ??
    'Student'
  );
}


function formatRelativeTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diff =
    Date.now() -
    date.getTime();

  const seconds =
    Math.floor(
      diff / 1000
    );

  if (seconds < 60) {
    return 'just now';
  }

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

  return `${Math.floor(months / 12)}y ago`;
}


function formatDeadline(value) {
  if (!value) {
    return '';
  }

  const deadline =
    new Date(value);

  if (
    Number.isNaN(
      deadline.getTime()
    )
  ) {
    return '';
  }

  const diff =
    deadline.getTime() -
    Date.now();

  if (diff <= 0) {
    return 'DEADLINE PASSED';
  }

  const days =
    Math.ceil(
      diff /
        (1000 * 60 * 60 * 24)
    );

  if (days === 1) {
    return '1 DAY LEFT';
  }

  return `${days} DAYS LEFT`;
}


function getCategoryColor(
  category
) {
  return (
    CATEGORY_COLORS[category] ||
    'amber'
  );
}


function getStatusColor(
  status
) {
  return (
    GIG_STATUS_COLORS[status] ||
    'mint'
  );
}


/* ================================================================
   ROLE LABEL
================================================================ */

function getRoleLabel(user) {
  const role =
    String(
      user?.role ||
      'student'
    )
      .trim()
      .toLowerCase();

  switch (role) {
    case 'operator':
      return 'OPERATOR // ACTIVE';

    case 'admin':
      return 'ADMIN // ACTIVE';

    case 'moderator':
      return 'MODERATOR // ACTIVE';

    case 'helper':
      return 'HELPER // ACTIVE';

    case 'student':
    default:
      return 'STUDENT // ACTIVE';
  }
}


/* ================================================================
   DASHBOARD
================================================================ */

export function DashboardHome() {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  const name =
    user?.name
      ?.split(' ')[0] ||
    'there';


  const [
    discoveryFeed,
    setDiscoveryFeed,
  ] = useState([]);

  const [
    myPostedJugaads,
    setMyPostedJugaads,
  ] = useState([]);

  const [
    myRequests,
    setMyRequests,
  ] = useState([]);

  const [
    receivedProposals,
    setReceivedProposals,
  ] = useState([]);

  const [
    dashboardNotifications,
    setDashboardNotifications,
  ] = useState([]);

  const [
    conversations,
    setConversations,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');


  /* ================================================================
     LOAD EVERYTHING FROM BACKEND
  ================================================================= */

  const loadDashboard =
    useCallback(async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setError('');

      try {
        const results =
          await Promise.allSettled([
            api.getDiscoveryFeed(),
            api.getMyJugaads(),
            api.getMyProposals(),
            api.getReceivedProposals(),
            api.getNotifications(),
            api.getConversations(),
          ]);

        const [
          discoveryResult,
          myJugaadsResult,
          myRequestsResult,
          receivedProposalsResult,
          notificationsResult,
          conversationsResult,
        ] = results;


        /* ------------------------------------------------------------
           DISCOVERY
        ------------------------------------------------------------ */

        if (
          discoveryResult.status ===
          'fulfilled'
        ) {
          const list =
            getList(
              discoveryResult.value,
              [
                'gigs',
                'jugaads',
                'results',
                'items',
              ]
            );

          setDiscoveryFeed(
            list
          );
        } else {
          setDiscoveryFeed([]);

          console.error(
            'Failed to load discovery feed:',
            discoveryResult.reason
          );
        }


        /* ------------------------------------------------------------
           MY GIGS
        ------------------------------------------------------------ */

        if (
          myJugaadsResult.status ===
          'fulfilled'
        ) {
          const list =
            getList(
              myJugaadsResult.value,
              [
                'gigs',
                'results',
                'items',
              ]
            );

          setMyPostedJugaads(
            list
          );
        } else {
          setMyPostedJugaads([]);

          console.error(
            'Failed to load my Gigs:',
            myJugaadsResult.reason
          );
        }


        /* ------------------------------------------------------------
           MY PROPOSALS / REQUESTS
        ------------------------------------------------------------ */

        if (
          myRequestsResult.status ===
          'fulfilled'
        ) {
          const list =
            getList(
              myRequestsResult.value,
              [
                'applications',
                'proposals',
                'requests',
                'results',
                'items',
              ]
            );

          setMyRequests(
            list
          );
        } else {
          setMyRequests([]);

          console.error(
            'Failed to load my proposals:',
            myRequestsResult.reason
          );
        }


        /* ------------------------------------------------------------
           RECEIVED PROPOSALS
        ------------------------------------------------------------ */

        if (
          receivedProposalsResult.status ===
          'fulfilled'
        ) {
          const list =
            getList(
              receivedProposalsResult.value,
              [
                'applications',
                'proposals',
                'requests',
                'results',
                'items',
              ]
            );

          setReceivedProposals(
            list
          );
        } else {
          setReceivedProposals([]);

          console.error(
            'Failed to load received proposals:',
            receivedProposalsResult.reason
          );
        }


        /* ------------------------------------------------------------
           NOTIFICATIONS
        ------------------------------------------------------------ */

        if (
          notificationsResult.status ===
          'fulfilled'
        ) {
          const list =
            getList(
              notificationsResult.value,
              [
                'notifications',
                'results',
                'items',
              ]
            );

          setDashboardNotifications(
            list
          );
        } else {
          setDashboardNotifications([]);

          console.error(
            'Failed to load notifications:',
            notificationsResult.reason
          );
        }


        /* ------------------------------------------------------------
           CONVERSATIONS
        ------------------------------------------------------------ */

        if (
          conversationsResult.status ===
          'fulfilled'
        ) {
          const list =
            getList(
              conversationsResult.value,
              [
                'conversations',
                'results',
                'items',
              ]
            );

          setConversations(
            list
          );
        } else {
          setConversations([]);

          console.error(
            'Failed to load conversations:',
            conversationsResult.reason
          );
        }


        /*
         * Show workspace error only when
         * every request has failed.
         */
        const allFailed =
          results.every(
            (result) =>
              result.status ===
              'rejected'
          );

        if (allFailed) {
          setError(
            'Unable to load your workspace. Please check that the backend is running.'
          );
        }

      } catch (err) {
        console.error(
          'Dashboard loading error:',
          err
        );

        setError(
          err?.message ||
            'Unable to load your workspace. Please try again.'
        );

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [
      isAuthenticated,
    ]);


  /* ================================================================
     INITIAL LOAD
  ================================================================= */

  useEffect(() => {
    loadDashboard();
  }, [
    loadDashboard,
  ]);


  /* ================================================================
     REFRESH WHEN USER RETURNS TO TAB
  ================================================================= */

  useEffect(() => {
    const handleFocus =
      () => {
        if (
          document.visibilityState ===
          'visible'
        ) {
          loadDashboard();
        }
      };

    document.addEventListener(
      'visibilitychange',
      handleFocus
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleFocus
      );
    };
  }, [
    loadDashboard,
  ]);


  /* ================================================================
     REFRESH BUTTON
  ================================================================= */

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadDashboard();
    };


  /* ================================================================
     DERIVED DATA
  ================================================================= */

  const activeJugaads =
    useMemo(
      () =>
        myPostedJugaads.filter(
          (item) =>
            ![
              'completed',
              'cancelled',
              'closed',
            ].includes(
              item.status
            )
        ),
      [
        myPostedJugaads,
      ]
    );


  const activeCollaborations =
    useMemo(
      () =>
        myRequests.filter(
          (proposal) =>
            [
              'accepted',
              'assigned',
              'in_progress',
            ].includes(
              proposal.status
            )
        ),
      [
        myRequests,
      ]
    );


  const unreadMessages =
    useMemo(
      () =>
        conversations.filter(
          (conversation) =>
            conversation.unread ||
            conversation.has_unread ||
            Number(
              conversation.unread_count
            ) > 0
        ).length,
      [
        conversations,
      ]
    );


  const unreadNotifications =
    useMemo(
      () =>
        dashboardNotifications.filter(
          (notification) =>
            !notification.read &&
            notification.is_read !==
              true
        ),
      [
        dashboardNotifications,
      ]
    );


  const stats = [
    [
      'RECOMMENDED',
      discoveryFeed.length,
      Search,
      'amber',
    ],

    [
      'MY ACTIVE GIGS',
      activeJugaads.length,
      ClipboardList,
      'coral',
    ],

    [
      'REQUESTS RECEIVED',
      receivedProposals.length,
      Bell,
      'amber',
    ],

    [
      'MY REQUESTS',
      myRequests.length,
      Send,
      'mint',
    ],

    [
      'COLLABORATIONS',
      activeCollaborations.length,
      BriefcaseBusiness,
      'mint',
    ],

    [
      'UNREAD MESSAGES',
      unreadMessages,
      MessageSquare,
      'coral',
    ],
  ];


  const recentActiveJugaads =
    activeJugaads.slice(0, 3);

  const recommendedJugaads =
    discoveryFeed.slice(0, 3);

  const recentNotifications =
    dashboardNotifications.slice(
      0,
      3
    );


  /* ================================================================
     UI
  ================================================================= */

  return (
    <div>

      {/* ============================================================
          HEADER
      ============================================================ */}

      <section className="pt-12 sm:pt-16 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">

        <div>

          <div className="flex items-center gap-3 mb-4 flex-wrap">

            <LED
              color="mint"
              pulse
              size={7}
            />

            <span className="font-technical text-xs sm:text-sm text-ink-2">
              01 — YOUR WORKSPACE
            </span>

            <span className="h-px w-10 bg-metal-2" />

            <span className="font-technical text-xs sm:text-sm text-mint">
              STATUS // ONLINE
            </span>

          </div>


          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl tracking-tight break-words">

            <span className="block">
              WELCOME,
            </span>

            <span className="block text-amber">
              {name.toUpperCase()}.
            </span>

          </h1>


          <p className="mt-4 max-w-xl text-sm sm:text-base text-ink-2 leading-relaxed">
            Find the next opportunity, post something
            you need solved, and make something useful
            with people on campus.
          </p>

        </div>


        {/* User badge */}
        <div
          className="surface-metal-heavy rounded-2xl p-4 sm:p-5 relative w-full sm:w-auto sm:min-w-[240px] border border-metal-1"
        >

          <Rivet
            size={6}
            className="absolute top-1.5 right-1.5"
          />


          <div className="flex items-center gap-2.5 mb-2">

            <span className="grid place-items-center w-9 h-9 rounded-full bg-amber text-bg-0 font-display text-xs font-bold shrink-0">
              {user?.name
                ?.slice(0, 2)
                .toUpperCase() ||
                'U'}
            </span>


            <div>

              <p className="font-mono text-xs sm:text-sm font-semibold text-paper">
                {user?.name ||
                  'Your workspace'}
              </p>


              <p className="font-technical text-xs text-paper/70">
                {getRoleLabel(user)}
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <LED
              color="mint"
              pulse
              size={5}
            />

            <span className="font-mono text-xs text-paper/80">
              The room is yours.
            </span>

          </div>

        </div>

      </section>


      {/* ============================================================
          ERROR
      ============================================================ */}

      {error && (
        <div className="surface-panel rounded-xl p-4 mb-6 border border-coral/30">

          <div className="flex items-center justify-between gap-4">

            <p className="font-mono text-[9px] text-coral">
              {error}
            </p>


            <button
              type="button"
              onClick={handleRefresh}
              className="machine-control machine-control--ghost"
              disabled={refreshing}
            >

              <RefreshCw
                size={12}
                className={
                  refreshing
                    ? 'animate-spin'
                    : ''
                }
              />

              RETRY

            </button>

          </div>

        </div>
      )}


      {/* ============================================================
          MAIN ACTIONS
      ============================================================ */}

      <section className="grid md:grid-cols-2 gap-4 mb-8">

        <Link
          to="/dashboard/gigs"
          className="surface-metal-brushed rounded-2xl p-6 group hover:border-amber/50 transition-all"
          style={{
            border:
              '1px solid rgba(34,197,94,.35)',
          }}
        >

          <div className="flex items-start justify-between">

            <span className="grid place-items-center w-12 h-12 rounded-xl bg-amber/10 text-amber">
              <Search size={23} />
            </span>

            <ArrowRight
              className="text-ink-3 group-hover:text-amber group-hover:translate-x-1 transition-all"
              size={18}
            />

          </div>


          <p className="font-display text-2xl sm:text-3xl font-bold mt-6">
            EXPLORE GIGS
          </p>


          <p className="font-sans text-sm text-ink-2 mt-2">
            Opportunities selected for your skills.
          </p>


          <p className="font-technical text-xs sm:text-sm font-bold text-amber mt-5">
            {loading
              ? 'LOADING...'
              : `${discoveryFeed.length} OPEN OPPORTUNITIES →`}
          </p>

        </Link>


        <Link
          to="/dashboard/post-gig"
          className="surface-metal-brushed rounded-2xl p-6 group hover:border-mint/50 transition-all"
          style={{
            border:
              '1px solid rgba(93,184,154,.25)',
          }}
        >

          <div className="flex items-start justify-between">

            <span className="grid place-items-center w-12 h-12 rounded-xl bg-mint/10 text-mint">
              <Plus size={23} />
            </span>

            <ArrowRight
              className="text-ink-3 group-hover:text-mint group-hover:translate-x-1 transition-all"
              size={18}
            />

          </div>


          <p className="font-display text-2xl sm:text-3xl font-bold mt-6">
            POST A GIG
          </p>


          <p className="font-sans text-sm text-ink-2 mt-2">
            Ask the campus to help you get it done.
          </p>


          <p className="font-technical text-xs sm:text-sm font-bold text-mint mt-5">
            CREATE A NEW GIG →
          </p>

        </Link>

      </section>


      {/* ============================================================
          STATS
      ============================================================ */}

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">

        {stats.map(
          ([
            label,
            value,
            Icon,
            color,
          ]) => (

            <div
              key={label}
              className="surface-panel rounded-xl p-3"
            >

              <div className="flex justify-between items-start">

                <Icon
                  size={14}
                  className={`text-${color}`}
                />


                <span
                  className="font-display text-2xl"
                  style={{
                    color:
                      `var(--${color})`,
                  }}
                >
                  {loading
                    ? '—'
                    : value}
                </span>

              </div>


              <p className="font-technical text-[7px] text-ink-3 mt-3">
                {label}
              </p>

            </div>

          )
        )}

      </section>


      {/* ============================================================
          CONTENT
      ============================================================ */}

      <section className="grid lg:grid-cols-[1.35fr_.65fr] gap-6">

        {/* ==========================================================
            RECOMMENDED
        ========================================================== */}

        <div className="surface-panel rounded-2xl p-5">

          <div className="flex items-center justify-between mb-4">

            <div>

              <p className="font-technical text-xs sm:text-sm font-bold text-ink-0">
                RECOMMENDED FOR YOU
              </p>

              <p className="font-mono text-xs sm:text-sm text-ink-2 mt-1">
                Fresh opportunities from the campus.
              </p>

            </div>


            <Link
              to="/dashboard/gigs"
              className="font-technical text-xs sm:text-sm font-bold text-amber hover:underline"
            >
              VIEW ALL →
            </Link>

          </div>


          <div className="space-y-2.5">

            {loading ? (

              <EmptyState
                text="Loading opportunities..."
              />

            ) : recommendedJugaads.length > 0 ? (

              recommendedJugaads.map(
                (item) => (
                  <OpportunityRow
                    key={getId(item)}
                    item={item}
                  />
                )
              )

            ) : (

              <EmptyState
                text="No gigs available right now."
              />

            )}

          </div>

        </div>


        {/* ==========================================================
            RIGHT COLUMN
        ========================================================== */}

        <div className="space-y-4">

          {/* ========================================================
              MY ACTIVE GIGS
          ======================================================== */}

          <div className="surface-wood rounded-2xl p-5">

            <div className="flex items-center justify-between mb-4">

              <p className="font-technical text-xs sm:text-sm font-bold text-paper/90">
                MY ACTIVE GIGS
              </p>


              <Link
                to="/dashboard/my-gigs"
                className="font-technical text-xs sm:text-sm font-bold text-paper/70 hover:text-paper"
              >
                VIEW →
              </Link>

            </div>


            {loading ? (

              <p className="font-mono text-xs text-paper/60">
                Loading your gigs...
              </p>

            ) : recentActiveJugaads.length > 0 ? (

              recentActiveJugaads.map(
                (item) => (
                  <Link
                    to="/dashboard/my-gigs"
                    key={getId(item)}
                    className="flex items-center gap-2.5 py-2 border-b border-paper/10 last:border-0"
                  >

                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        background:
                          `var(--${getStatusColor(
                            item.status
                          )})`,
                      }}
                    />


                    <span className="font-editorial text-sm sm:text-base text-paper flex-1 truncate font-medium">
                      {item.title ||
                        'Untitled Gig'}
                    </span>


                    <span className="font-mono text-xs sm:text-sm font-bold text-paper/80">
                      ₹
                      {getAmount(item)}
                    </span>

                  </Link>
                )
              )

            ) : (

              <p className="font-mono text-xs text-paper/60">
                You haven't posted any active gigs yet.
              </p>

            )}

          </div>


          {/* ========================================================
              RECENT ACTIVITY
          ======================================================== */}

          <div className="surface-panel rounded-2xl p-5">

            <div className="flex justify-between mb-3">

              <div>

                <p className="font-technical text-xs sm:text-sm font-bold text-ink-1">
                  RECENT ACTIVITY
                </p>


                {unreadNotifications.length >
                  0 && (
                  <p className="font-mono text-xs font-bold text-amber mt-1">
                    {
                      unreadNotifications.length
                    }{' '}
                    UNREAD
                  </p>
                )}

              </div>


              <Bell
                size={13}
                className="text-amber"
              />

            </div>


            {loading ? (

              <EmptyState
                text="Loading activity..."
              />

            ) : recentNotifications.length >
              0 ? (

              recentNotifications.map(
                (notification) => {

                  const id =
                    notification.id ??
                    notification._id;

                  const message =
                    notification.text ??
                    notification.message ??
                    notification.title ??
                    'New activity';

                  const timestamp =
                    notification.timestamp ??
                    notification.created_at ??
                    notification.createdAt;

                  const conversationId =
                    notification.conversationId ??
                    notification.conversation_id;


                  return (
                    <Link
                      key={id}
                      to={
                        conversationId
                          ? `/dashboard/messages/${conversationId}`
                          : '/dashboard'
                      }
                      className="flex gap-2 py-2 border-b border-metal-1/40 last:border-0"
                    >

                      <span>
                        {notification.emoji ||
                          '•'}
                      </span>


                      <div className="min-w-0">

                        <p className="font-sans text-xs sm:text-sm text-ink-1 leading-snug">
                          {message}
                        </p>


                        {timestamp && (
                          <p className="font-mono text-xs text-ink-3 mt-1">
                            {formatRelativeTime(
                              timestamp
                            )}
                          </p>
                        )}

                      </div>

                    </Link>
                  );
                }
              )

            ) : (

              <EmptyState
                text="No recent activity yet."
              />

            )}

          </div>

        </div>

      </section>


      {/* ============================================================
          REQUEST / MESSAGE LINKS
      ============================================================ */}

      <section className="mt-6 flex justify-center gap-3 flex-wrap">

        <Link
          to="/dashboard/my-requests"
          className="machine-control machine-control--ghost"
        >
          <span className="ctrl-led" />

          MY REQUESTS (
          {myRequests.length}
          )
        </Link>


        <Link
          to="/dashboard/requests"
          className="machine-control machine-control--ghost"
        >
          <span className="ctrl-led" />

          REQUESTS RECEIVED (
          {receivedProposals.length}
          )
        </Link>


        <Link
          to="/dashboard/messages"
          className="machine-control machine-control--ghost"
        >
          <span className="ctrl-led" />

          MESSAGES (
          {conversations.length}
          )
        </Link>


        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="machine-control machine-control--ghost"
        >

          <RefreshCw
            size={12}
            className={
              refreshing
                ? 'animate-spin'
                : ''
            }
          />

          REFRESH

        </button>

      </section>

    </div>
  );
}


/* ================================================================
   OPPORTUNITY ROW
================================================================ */

function OpportunityRow({
  item,
}) {
  const categoryColor =
    getCategoryColor(
      item.category
    );


  const skill =
    item.skillRequired ??
    item.required_skill ??
    (
      Array.isArray(
        item.required_skills
      )
        ? item.required_skills.join(
            ', '
          )
        : item.required_skills
    ) ??
    'General';


  const poster =
    item.poster ??
    item.owner ??
    item.user;


  const posterName =
    item.poster_name ??
    item.posterName ??
    getName(poster);


  const postedAt =
    item.postedAt ??
    item.posted_at ??
    item.created_at ??
    item.createdAt;


  const amount =
    getAmount(item);


  return (
    <Link
      to="/dashboard/gigs"
      className="flex items-center gap-3 rounded-xl p-3 surface-metal hover:border-amber/30 transition-colors"
      style={{
        border:
          '1px solid var(--metal-1)',
      }}
    >

      <span
        className="grid place-items-center w-10 h-10 rounded-lg shrink-0"
        style={{
          background:
            `color-mix(in srgb, var(--${categoryColor}) 15%, transparent)`,
          color:
            `var(--${categoryColor})`,
        }}
      >

        <span className="font-display text-sm">
          {item.category
            ?.slice(0, 1)
            .toUpperCase() ||
            'G'}
        </span>

      </span>


      <div className="min-w-0 flex-1">

        <p className="font-editorial text-base sm:text-lg font-bold text-ink-0 truncate">
          {item.title ||
            'Untitled Gig'}
        </p>


        <p className="font-mono text-xs sm:text-sm text-ink-2 mt-1 truncate">
          {skill} · {posterName}

          {postedAt
            ? ` · ${formatRelativeTime(
                postedAt
              )}`
            : ''}
        </p>

      </div>


      <div className="text-right shrink-0">

        <p className="font-display text-base sm:text-lg font-bold text-amber">
          ₹{amount}
        </p>


        {item.deadline && (
          <p className="font-mono text-xs text-coral font-medium">
            {formatDeadline(
              item.deadline
            )}
          </p>
        )}

      </div>

    </Link>
  );
}


/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({
  text,
}) {
  return (
    <div className="rounded-xl surface-metal p-4">

      <p className="font-mono text-[9px] text-ink-3">
        {text}
      </p>

    </div>
  );
}