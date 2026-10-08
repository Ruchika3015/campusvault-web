import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import { LED } from '@/components/primitives/Details';

const CATEGORY_COLORS = {
  ALL: 'amber',
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

import { api } from '@/services/api';

import {
  Search,
  X,
  HandCoins,
  Clock,
  Star,
  Undo2,
  CheckCircle2,
} from 'lucide-react';

import { BargainModal } from '@/components/workshop/pages/BargainModal';

import { useAuth } from '@/context/AuthContext';
import { useProposals } from '@/context/ProposalContext';


// ================================================================
// SAFETY / NORMALIZATION
// ================================================================

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const poster =
    raw.poster &&
    typeof raw.poster === 'object'
      ? raw.poster
      : raw.postedBy &&
        typeof raw.postedBy === 'object'
        ? raw.postedBy
        : raw.employer &&
          typeof raw.employer === 'object'
          ? raw.employer
          : null;

  const creator =
    raw.creator &&
    typeof raw.creator === 'object'
      ? raw.creator
      : null;


  /*
   * IMPORTANT:
   * poster_name is the person who actually posted
   * the Jugaad.
   */
  const posterName =
    raw.poster_name ??
    raw.posterName ??
    poster?.name ??
    creator?.name ??
    raw.creator_name ??
    raw.creatorName ??
    null;


  const posterId =
    raw.poster_id ??
    raw.posterId ??
    poster?._id ??
    poster?.id ??
    creator?._id ??
    creator?.id ??
    raw.creator_id ??
    raw.creatorId ??
    null;


  const posterEmail =
    raw.poster_email ??
    raw.posterEmail ??
    poster?.email ??
    creator?.email ??
    raw.creator_email ??
    raw.creatorEmail ??
    null;


  const posterRating =
    raw.poster_rating ??
    raw.posterRating ??
    poster?.rating ??
    creator?.rating ??
    raw.rating ??
    null;


  return {
    ...raw,


    id:
      raw._id ??
      raw.id ??
      raw.jugaadId ??
      raw.jugaad_id ??
      `jugaad-${Math.random()
        .toString(36)
        .slice(2)}`,


    title:
      typeof raw.title === 'string'
        ? raw.title
        : 'Untitled opportunity',


    description:
      typeof raw.description === 'string'
        ? raw.description
        : 'No description available.',


    category:
      typeof raw.category === 'string'
        ? raw.category
        : 'OTHER',


    skillRequired:
      Array.isArray(raw.skillsRequired) && raw.skillsRequired.length
        ? raw.skillsRequired.join(', ')
        : typeof raw.skillRequired === 'string'
          ? raw.skillRequired
          : typeof raw.skill_required === 'string'
            ? raw.skill_required
            : Array.isArray(
                  raw.required_skills
              )
              ? raw.required_skills.join(', ')
              : 'General',


    amount:
      raw.budget ??
      raw.amount ??
      raw.price ??
      0,


    deadline:
      raw.deadline ??
      raw.dueDate ??
      raw.due_date ??
      null,


    /*
     * Keep the backend-created timestamp.
     */
    postedAt:
      raw.postedAt ??
      raw.posted_at ??
      raw.created_at ??
      raw.createdAt ??
      null,


    matchPercentage:
      raw.matchPercentage ??
      raw.match_percentage ??
      null,


    posterName,
    posterId,
    posterEmail,
    posterRating,


    poster:
      poster || posterName
        ? {
            ...(poster || {}),

            id:
              poster?.id ??
              posterId,

            name:
              poster?.name ??
              posterName,

            email:
              poster?.email ??
              posterEmail,

            rating:
              poster?.rating ??
              posterRating,
          }
        : null,


    creator,
  };
}


// ================================================================
// NORMALIZE FEED
// ================================================================

function normalizeFeed(data) {
  let list = [];


  if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data?.gigs)) {
    list = data.gigs;
  } else if (Array.isArray(data?.jugaads)) {
    list = data.jugaads;
  } else if (Array.isArray(data?.data?.gigs)) {
    list = data.data.gigs;
  } else if (Array.isArray(data?.data?.jugaads)) {
    list = data.data.jugaads;
  } else if (Array.isArray(data?.data)) {
    list = data.data;
  } else if (Array.isArray(data?.items)) {
    list = data.items;
  } else if (Array.isArray(data?.results)) {
    list = data.results;
  }


  return list
    .map(normalizeItem)
    .filter(Boolean);
}


// ================================================================
// SAFE DAYS UNTIL
// ================================================================

function safeDaysUntil(value, now = Date.now()) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'No deadline';
  }

  const rawValue = String(value).trim();
  let deadline;

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    const [year, month, day] = rawValue
      .split('-')
      .map(Number);

    deadline = new Date(
      year,
      month - 1,
      day,
      23,
      59,
      59,
      999
    );
  } else {
    deadline = new Date(value);
  }

  if (Number.isNaN(deadline.getTime())) {
    return 'No deadline';
  }

  const difference = deadline.getTime() - now;

  if (difference <= 0) {
    return 'Deadline passed';
  }

  const nowDate = new Date(now);
  const deadlineDate = new Date(deadline.getTime());

  const sameDay =
    nowDate.getFullYear() === deadlineDate.getFullYear() &&
    nowDate.getMonth() === deadlineDate.getMonth() &&
    nowDate.getDate() === deadlineDate.getDate();

  if (sameDay) {
    return 'today';
  }

  const days = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  if (days === 1) {
    return '1 day left';
  }

  return `${days} days left`;
}


// ================================================================
// SAFE RELATIVE TIME
// ================================================================
//
// IMPORTANT:
//
// Do NOT use the mock-data timeAgo() here.
//
// This function works directly with the actual backend
// created_at / createdAt timestamp.
//
// ================================================================

function safeTimeAgo(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '';
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
    return '';
  }


  /*
   * Compare timestamps directly.
   *
   * This avoids the old formatter accidentally treating
   * backend-created posts as newly created.
   */

  const now =
    Date.now();


  const postedTime =
    date.getTime();


  let difference =
    now - postedTime;


  /*
   * Future timestamps can happen because the server clock
   * and browser clock are slightly different.
   *
   * Clamp them to zero rather than showing negative time.
   */

  if (difference < 0) {
    difference = 0;
  }


  const seconds =
    Math.floor(
      difference / 1000
    );


  if (seconds < 60) {
    return 'just now';
  }


  const minutes =
    Math.floor(
      seconds / 60
    );


  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1
        ? 'minute'
        : 'minutes'
    } ago`;
  }


  const hours =
    Math.floor(
      minutes / 60
    );


  if (hours < 24) {
    return `${hours} ${
      hours === 1
        ? 'hour'
        : 'hours'
    } ago`;
  }


  const days =
    Math.floor(
      hours / 24
    );


  if (days < 7) {
    return `${days} ${
      days === 1
        ? 'day'
        : 'days'
    } ago`;
  }


  const weeks =
    Math.floor(
      days / 7
    );


  if (weeks < 5) {
    return `${weeks} ${
      weeks === 1
        ? 'week'
        : 'weeks'
    } ago`;
  }


  /*
   * For older posts, show the actual posting date.
   */

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
}


// ================================================================
// MAIN PAGE
// ================================================================

export function FindJugaadPage() {

  const {
    user,
    isDemoMode,
    isAuthenticated,
  } = useAuth();


  const {
    sendProposal,
    getProposalForJugaad,
    refreshData,
  } = useProposals();


  /*
   * Re-render once every minute so deadline and
   * relative-posted-time labels stay synchronized.
   */
  const [currentTime, setCurrentTime] =
    useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);


  const [feedItems, setFeedItems] = useState([]);


  const [loading, setLoading] =
    useState(
      !isDemoMode
    );


  const [hidden, setHidden] =
    useState([]);


  const [bargain, setBargain] =
    useState(null);


  const [proposalItem, setProposalItem] =
    useState(null);


  const [selectedGig, setSelectedGig] =
    useState(null);


  const [undo, setUndo] =
    useState(null);


  const [query, setQuery] =
    useState('');


  const [category, setCategory] =
    useState('ALL');


  // ================================================================
  // LOAD DISCOVERY FEED
  // ================================================================

  const fetchFeed =
    useCallback(
      async () => {
        if (!isAuthenticated) {
          setFeedItems([]);
          setLoading(false);
          return;
        }

        setLoading(true);


        try {

          const response =
            await api.getDiscoveryFeed();


          console.log(
            'DISCOVERY FEED RESPONSE:',
            response
          );


          const normalized =
            normalizeFeed(
              response
            );


          console.log(
            'NORMALIZED DISCOVERY FEED:',
            normalized
          );


          setFeedItems(
            normalized
          );

        } catch (error) {

          console.error(
            'Failed to load Jugaad feed:',
            error
          );


          setFeedItems([]);

        } finally {

          setLoading(false);

        }

      },
      [
        isDemoMode,
        isAuthenticated,
      ]
    );


  useEffect(() => {

    fetchFeed();

  }, [fetchFeed]);


  // ================================================================
  // CURRENT LOGGED-IN USER
  // ================================================================
  //
  // ONLY used as HELPER when sending a proposal.
  //
  // It is NOT used as the poster displayed on cards.
  //
  // ================================================================

  const helper =
    user
      ? {

          id:
            user?.id ??
            'user',


          name:
            user?.name ??
            user?.email ??
            'Student',


          initials:
            String(
              user?.name ??
              user?.email ??
              'S'
            )
              .slice(0, 2)
              .toUpperCase(),

        }

      : {

          id: 'guest',

          name: 'Guest',

          initials: 'GU',

        };


  // ================================================================
  // AVAILABLE CATEGORIES (ONLY SHOW FIELDS WITH AVAILABLE GIGS)
  // ================================================================

  const availableCategories = useMemo(() => {
    const unhiddenGigs = feedItems.filter(
      (item) => item && (item.id === undefined || !hidden.includes(item.id))
    );

    const activeCategories = [];

    const PREFERRED_CATEGORIES = [
      'Coding',
      'Design',
      'Hardware & Electronics',
      'Academics',
      'Marketing',
      'Photography',
      'Content & Media',
      'Events & Organization',
      'Other',
    ];

    for (const cat of PREFERRED_CATEGORIES) {
      const targetCat = cat.toLowerCase().trim();
      const hasGigs = unhiddenGigs.some((item) => {
        const itemCat = String(item.category || '').toLowerCase().trim();
        return (
          itemCat === targetCat ||
          (targetCat === 'coding' && (itemCat === 'code' || itemCat === 'development')) ||
          (targetCat === 'development' && (itemCat === 'code' || itemCat === 'coding')) ||
          (targetCat === 'content & media' && (itemCat === 'video' || itemCat === 'photography')) ||
          (targetCat === 'marketing' && itemCat.includes('marketing'))
        );
      });

      if (hasGigs) {
        activeCategories.push(cat);
      }
    }

    // Also include any custom categories present in unhidden gigs
    unhiddenGigs.forEach((item) => {
      const raw = String(item.category || '').trim();
      if (!raw) return;
      const alreadyCovered = activeCategories.some((c) => {
        const cLow = c.toLowerCase();
        const rawLow = raw.toLowerCase();
        return (
          cLow === rawLow ||
          (cLow === 'coding' && (rawLow === 'code' || rawLow === 'development')) ||
          (cLow === 'content & media' && (rawLow === 'video' || rawLow === 'photography')) ||
          (cLow === 'marketing' && rawLow.includes('marketing'))
        );
      });
      if (!alreadyCovered) {
        const formatted = raw.charAt(0).toUpperCase() + raw.slice(1);
        if (!activeCategories.includes(formatted)) {
          activeCategories.push(formatted);
        }
      }
    });

    return ['ALL', ...activeCategories];
  }, [feedItems, hidden]);

  useEffect(() => {
    if (category !== 'ALL' && !availableCategories.includes(category)) {
      setCategory('ALL');
    }
  }, [availableCategories, category]);

  // ================================================================
  // FILTERING
  // ================================================================

  const visible =
    feedItems.filter(
      (item) => {

        if (!item) {
          return false;
        }


        if (
          item.id !== undefined &&
          hidden.includes(item.id)
        ) {
          return false;
        }


        const search =
          query
            .trim()
            .toLowerCase();


        const matchesQuery =
          !search ||

          String(
            item.title ?? ''
          )
            .toLowerCase()
            .includes(search) ||


          String(
            item.skillRequired ?? ''
          )
            .toLowerCase()
            .includes(search) ||


          String(
            item.description ?? ''
          )
            .toLowerCase()
            .includes(search);


        const itemCat = String(item.category || '').toLowerCase().trim();
        const selectedCat = category.toLowerCase().trim();

        const matchesCategory =
          selectedCat === 'all' ||
          itemCat === selectedCat ||
          (selectedCat === 'coding' && (itemCat === 'code' || itemCat === 'development')) ||
          (selectedCat === 'development' && (itemCat === 'code' || itemCat === 'coding')) ||
          (selectedCat === 'content & media' && (itemCat === 'video' || itemCat === 'photography')) ||
          (selectedCat === 'marketing' && itemCat.includes('marketing'));

        return (
          matchesQuery &&
          matchesCategory
        );

      }
    );


  // ================================================================
  // HIDE OPPORTUNITY
  // ================================================================

  const hide =
    async (id) => {

      if (
        id === undefined ||
        id === null
      ) {
        return;
      }


      setHidden(
        (current) => {

          if (
            current.includes(id)
          ) {
            return current;
          }


          return [
            ...current,
            id,
          ];

        }
      );


      setUndo(id);


      if (!isDemoMode) {

        try {

          await api.markNotInterested(
            id
          );

        } catch (error) {

          console.error(
            'Failed to mark not interested:',
            error
          );

        }

      }


      setTimeout(
        () => {

          setUndo(
            (current) =>
              current === id
                ? null
                : current
          );

        },
        5000
      );

    };


  // ================================================================
  // SEND PROPOSAL
  // ================================================================

  const handleSendProposal =
    async (payload) => {

      try {

        console.log(
          'FIND JUGAAD - sending proposal:',
          payload
        );


        await sendProposal({
          ...payload,
          helper,
        });


        console.log(
          'FIND JUGAAD - proposal sent successfully'
        );


        await fetchFeed();


        if (refreshData) {

          await refreshData();

        }


        setBargain(null);

        setProposalItem(null);

      } catch (error) {

        console.error(
          'FIND JUGAAD - failed to send proposal:',
          error
        );


        throw error;

      }

    };


  // ================================================================
  // SECTIONS
  // ================================================================

  const sortedVisible = visible.slice().sort((a, b) => {
    const da = new Date(a.postedAt || a.createdAt || 0).getTime();
    const db = new Date(b.postedAt || b.createdAt || 0).getTime();
    return db - da;
  });

  const sections = [
    [
      category === 'ALL' && !query ? 'ALL LIVE CAMPUS GIGS' : `MATCHING GIGS (${sortedVisible.length})`,
      sortedVisible,
    ],
  ];


  // ================================================================
  // RENDER
  // ================================================================

  return (

    <div>

      {/* ==========================================================
          HEADER
      ========================================================== */}

      <section className="pt-12 pb-7">

        <div className="flex items-center gap-3 mb-4">

          <LED
            color="amber"
            pulse
            size={7}
          />


          <span className="font-technical text-[9px] text-ink-2">

            02 — CAMPUS OPPORTUNITY FEED

          </span>

        </div>


        <h1 className="font-display text-4xl sm:text-5xl">

          EXPLORE

          <br />

          <span className="text-amber">

            GIGS.

          </span>

        </h1>


        <p className="mt-4 max-w-xl text-sm text-ink-2">

          Opportunities selected for you.
          Discover work posted by other
          students, then choose how you want
          to approach it.

        </p>

      </section>


      {/* ==========================================================
          SEARCH + CATEGORY
      ========================================================== */}

      <div className="surface-panel rounded-xl p-3 flex flex-col sm:flex-row gap-3 mb-8 border-2 border-metal-2 shadow-sm">

        <div className="flex items-center flex-1 rounded-lg bg-bg-1 border-2 border-metal-2 shadow-sm">

          <Search
            size={16}
            className="ml-3 text-ink-1 shrink-0"
          />


          <input

            value={
              query
            }

            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }

            placeholder="Search opportunities or skills..."

            className="w-full bg-transparent px-3 py-2.5 font-mono text-xs outline-none text-ink-0 placeholder:text-ink-3/80 font-medium"

          />

        </div>


        <div className="flex flex-wrap gap-2">

          {availableCategories.map(
            (currentCategory) => (

              <button

                key={
                  currentCategory
                }

                type="button"

                onClick={() =>
                  setCategory(
                    currentCategory
                  )
                }

                className={`px-3 py-1.5 rounded-lg font-technical text-xs sm:text-sm uppercase font-bold tracking-wider transition-all shadow-sm ${
                  category ===
                  currentCategory
                    ? 'bg-amber text-bg-0 font-extrabold shadow'
                    : 'bg-bg-1 text-ink-0 hover:text-ink-0 hover:bg-bg-2 border-2 border-metal-2'
                }`}

              >

                {currentCategory}

              </button>

            )
          )}

        </div>

      </div>


      {/* ==========================================================
          UNDO
      ========================================================== */}

      {undo !== null && (

        <div className="mb-4 flex items-center justify-between surface-wood rounded-lg px-4 py-3">

          <span className="font-mono text-[10px] text-paper">

            Opportunity hidden from your feed.

          </span>


          <button

            type="button"

            onClick={() => {

              setHidden(
                (current) =>
                  current.filter(
                    (id) =>
                      id !== undo
                  )
              );


              setUndo(null);

            }}

            className="flex items-center gap-1.5 font-technical text-[8px] text-amber"

          >

            <Undo2 size={12} />

            UNDO

          </button>

        </div>

      )}


      {/* ==========================================================
          FEED
      ========================================================== */}

      {loading ? (

        <div className="py-16 text-center">

          <p className="font-mono text-sm text-ink-2">

            Loading opportunities...

          </p>

        </div>

      ) : (

        <div className="space-y-9">

          {sections.map(
            ([title, items]) => {

              if (
                !Array.isArray(
                  items
                ) ||
                items.length === 0
              ) {
                return null;
              }


              return (

                <section
                  key={title}
                >

                  <div className="flex items-center gap-2 mb-3">

                    <span className="font-technical text-xs sm:text-sm font-bold text-ink-0 uppercase tracking-wider">

                      {title}

                    </span>


                    <span className="font-mono text-xs text-ink-3">

                      (
                      {items.length}
                      )

                    </span>


                    <span className="h-px flex-1 bg-metal-1/40" />

                  </div>


                  <div className="grid lg:grid-cols-2 gap-3">

                    {items.map(
                      (item) => {

                        if (!item) {
                          return null;
                        }


                        let existingProposal =
                          null;


                        try {

                          existingProposal =
                            getProposalForJugaad(
                              item.id
                            );

                        } catch (error) {

                          console.error(
                            'Failed to get proposal:',
                            error
                          );

                        }


                        return (

                          <OpportunityCard

                            key={
                              item.id
                            }

                            item={
                              item
                            }

                            existingProposal={
                              existingProposal
                            }

                            currentTime={
                              currentTime
                            }

                            onHide={() =>
                              hide(
                                item.id
                              )
                            }

                            onBargain={() =>
                              setBargain(
                                item
                              )
                            }

                            onInterest={() => {

                              console.log(
                                'INTERESTED clicked:',
                                item
                              );


                              setProposalItem(
                                item
                              );

                            }}

                            onSelect={() =>
                              setSelectedGig(
                                item
                              )
                            }

                          />

                        );

                      }
                    )}

                  </div>

                </section>

              );

            }
          )}

        </div>

      )}


      {/* ==========================================================
          EMPTY STATE
      ========================================================== */}

      {!loading &&
        visible.length === 0 && (

          <div className="py-16 text-center">

            <Search
              size={32}
              className="mx-auto text-ink-3 mb-3"
            />


            <p className="font-mono text-sm text-ink-2">

              No opportunities match this view.

            </p>

          </div>

        )}


      {/* ==========================================================
          BARGAIN MODAL
      ========================================================== */}

      {bargain && (

        <BargainModal

          item={
            bargain
          }

          mode="bargain"

          onClose={() =>
            setBargain(null)
          }

          onSend={
            handleSendProposal
          }

        />

      )}


      {/* ==========================================================
          FULL DETAIL MODAL (CENTERED)
      ========================================================== */}

      {selectedGig && (

        <GigDetailModal

          item={
            selectedGig
          }

          existingProposal={(() => {
            try {
              return getProposalForJugaad(
                selectedGig.id
              );
            } catch {
              return null;
            }
          })()}

          currentTime={
            currentTime
          }

          onClose={() =>
            setSelectedGig(null)
          }

          onBargain={() => {
            const gig = selectedGig;
            setSelectedGig(null);
            setBargain(gig);
          }}

          onInterest={() => {
            const gig = selectedGig;
            setSelectedGig(null);
            setProposalItem(gig);
          }}

        />

      )}


      {/* ==========================================================
          INTERESTED / PROPOSAL MODAL
      ========================================================== */}

      {proposalItem && (

        <BargainModal

          item={
            proposalItem
          }

          mode="interest"

          onClose={() =>
            setProposalItem(null)
          }

          onSend={
            handleSendProposal
          }

        />

      )}

    </div>

  );

}


// ================================================================
// OPPORTUNITY CARD (UNIFORM SIZE)
// ================================================================

function OpportunityCard({
  item,
  existingProposal,
  currentTime,
  onInterest,
  onHide,
  onBargain,
  onSelect,
}) {
  if (
    !item ||
    typeof item !== 'object'
  ) {
    return null;
  }


  const category =
    typeof item.category === 'string'
      ? item.category
      : 'OTHER';


  const color =
    CATEGORY_COLORS?.[
      category
    ] || 'amber';


  const proposalSent =
    Boolean(
      existingProposal
    );


  const proposalStatus =
    existingProposal?.status ??
    null;


  const deadlineLabel =
    safeDaysUntil(
      item?.deadline,
      currentTime
    );

  const deadlinePassed =
    deadlineLabel === 'Deadline passed';


  const posterName =
    item?.poster_name ??
    item?.posterName ??
    item?.poster?.name ??
    item?.creator_name ??
    item?.creatorName ??
    item?.creator?.name ??
    'Student';


  const posterInitials =
    item?.poster?.initials ??
    item?.poster_initials ??
    item?.posterInitials ??
    (
      String(posterName)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(
          (part) =>
            part[0]
        )
        .join('')
        .slice(0, 2)
        .toUpperCase() ||
      'ST'
    );


  const posterRating =
    item?.poster_rating ??
    item?.posterRating ??
    item?.poster?.rating ??
    item?.rating ??
    '4.8';


  const categoryChar =
    category.charAt(0) ||
    'G';


  const postedTimestamp =
    item?.postedAt ??
    item?.posted_at ??
    item?.created_at ??
    item?.createdAt ??
    null;


  const postedTimeLabel =
    safeTimeAgo(
      postedTimestamp
    );


  return (
    <article
      className="surface-metal-brushed rounded-2xl p-4 sm:p-5 relative flex flex-col justify-between min-h-[300px] h-full sm:min-h-[320px] transition-all duration-200 hover:border-amber/50 hover:shadow-lg group"
      style={{
        border:
          `1px solid color-mix(in srgb, var(--${color}) 22%, transparent)`,
      }}
    >
      {/* UPPER SECTION */}
      <div>
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span
              onClick={onSelect}
              className="grid place-items-center w-11 h-11 rounded-xl shrink-0 cursor-pointer"
              style={{
                background:
                  `color-mix(in srgb, var(--${color}) 14%, transparent)`,
                color:
                  `var(--${color})`,
              }}
            >
              <span className="font-display text-lg">
                {categoryChar}
              </span>
            </span>

            <div className="min-w-0 flex-1">
              <h2
                onClick={onSelect}
                className="font-display text-base sm:text-lg text-ink-0 leading-snug font-bold truncate cursor-pointer hover:text-amber transition-colors"
                title={item?.title}
              >
                {item?.title ||
                  'Untitled opportunity'}
              </h2>

              <div className="flex items-center gap-2 mt-1.5 min-w-0">
                <span
                  className="font-technical text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0"
                  style={{
                    background:
                      `var(--${color})`,
                    color:
                      'var(--bg-0)',
                  }}
                >
                  {category}
                </span>

                <span
                  className="font-mono text-xs text-ink-2 font-medium truncate flex-1"
                  title={item?.skillRequired || 'General'}
                >
                  {item?.skillRequired ||
                    'General'}
                </span>
              </div>
            </div>
          </div>

          {item?.matchPercentage !=
            null && (
            <span className="font-mono text-xs font-semibold text-mint shrink-0 bg-mint/10 px-2 py-0.5 rounded">
              {item.matchPercentage}% match
            </span>
          )}
        </div>

        {/* CLAMPED DESCRIPTION (2 lines max for uniform card height) */}
        <p
          onClick={onSelect}
          className="font-sans text-xs sm:text-sm leading-relaxed text-ink-1 mt-3 line-clamp-2 break-words cursor-pointer hover:text-paper transition-colors"
        >
          {item?.description ||
            'No description available.'}
        </p>

        {/* VIEW DETAILS ACTION */}
        <button
          type="button"
          onClick={onSelect}
          className="font-technical text-[10px] sm:text-xs text-amber hover:underline mt-2 inline-flex items-center gap-1 font-bold"
        >
          VIEW FULL DETAILS →
        </button>
      </div>

      {/* LOWER SECTION */}
      <div className="mt-3">
        {/* META ROW */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-ink-2">
          <span className="text-amber font-display text-xl font-bold">
            ₹{item?.amount ?? 0}
          </span>

          <span
            className={`flex items-center gap-1 ${
              deadlinePassed
                ? 'text-coral font-medium'
                : ''
            }`}
          >
            <Clock size={13} />
            {deadlineLabel}
          </span>

          <span className="flex items-center gap-1">
            <Star
              size={13}
              className="text-amber fill-amber"
            />
            {posterRating}
          </span>

          {postedTimeLabel && (
            <span>
              {postedTimeLabel}
            </span>
          )}
        </div>

        {/* PROPOSAL STATUS BADGE */}
        {proposalSent && (
          <div className="mt-2 surface-panel rounded-lg px-2.5 py-1.5 flex items-center gap-2 truncate">
            <CheckCircle2
              size={13}
              className={
                proposalStatus === 'accepted'
                  ? 'text-mint'
                  : proposalStatus === 'rejected'
                  ? 'text-coral'
                  : 'text-amber'
              }
            />
            <span className="font-mono text-[9px] text-ink-2 truncate">
              {proposalStatus === 'accepted'
                ? 'Proposal Accepted'
                : proposalStatus === 'rejected'
                ? 'Proposal Rejected'
                : proposalStatus === 'counter-offer'
                ? 'Counter offer received'
                : 'Proposal Sent'}
            </span>
          </div>
        )}

        {/* FOOTER ROW */}
        <div className="mt-3 pt-2.5 border-t border-metal-1/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Poster avatar */}
            <span className="grid place-items-center w-7 h-7 rounded-full bg-amber text-bg-0 font-display text-xs font-bold shrink-0">
              {posterInitials}
            </span>

            {/* POSTER NAME */}
            <span className="font-mono text-xs sm:text-sm text-ink-1 font-medium truncate max-w-[100px] sm:max-w-none">
              {posterName}
            </span>

            {/* NOT INTERESTED */}
            <button
              type="button"
              onClick={onHide}
              aria-label="Not interested"
              className="grid place-items-center w-7 h-7 rounded-lg text-ink-3 hover:text-coral hover:bg-coral/10 shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          {/* ACTIONS */}
          {deadlinePassed ? (
            <span
              className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-technical text-xs font-semibold text-coral border border-coral/30 shrink-0"
            >
              <Clock size={13} />
              DEADLINE PASSED
            </span>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                type="button"
                onClick={onBargain}
                disabled={proposalSent}
                className="flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1.5 font-technical text-xs sm:text-sm font-semibold text-amber border border-amber/30 hover:bg-amber/10 transition-colors disabled:opacity-40"
              >
                <HandCoins size={13} />
                BARGAIN
              </button>

              <button
                type="button"
                onClick={onInterest}
                disabled={proposalSent}
                className={`flex items-center gap-1 rounded-lg px-2.5 sm:px-3 py-1.5 font-technical text-xs sm:text-sm font-semibold transition-colors ${
                  proposalSent
                    ? 'bg-mint/15 text-mint border border-mint/30'
                    : 'bg-amber text-bg-0 hover:bg-amber-soft'
                } disabled:cursor-default`}
              >
                {proposalSent ? (
                  <CheckCircle2
                    size={13}
                  />
                ) : (
                  <span className="text-xs">
                    ♥
                  </span>
                )}
                {proposalSent
                  ? 'SENT'
                  : 'INTERESTED'}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}


// ================================================================
// GIG DETAIL MODAL (FULL VIEW IN CENTER)
// ================================================================

function GigDetailModal({
  item,
  existingProposal,
  currentTime,
  onClose,
  onBargain,
  onInterest,
}) {
  if (!item) return null;

  const category =
    typeof item.category === 'string' ? item.category : 'OTHER';

  const color = CATEGORY_COLORS?.[category] || 'amber';

  const deadlineLabel = safeDaysUntil(item?.deadline, currentTime);
  const deadlinePassed = deadlineLabel === 'Deadline passed';

  const posterName =
    item?.poster_name ??
    item?.posterName ??
    item?.poster?.name ??
    item?.creator_name ??
    item?.creatorName ??
    item?.creator?.name ??
    'Student';

  const posterRating =
    item?.poster_rating ??
    item?.posterRating ??
    item?.poster?.rating ??
    item?.rating ??
    '4.8';

  const postedTimestamp =
    item?.postedAt ??
    item?.posted_at ??
    item?.created_at ??
    item?.createdAt ??
    null;

  const postedTimeLabel = safeTimeAgo(postedTimestamp);

  const proposalSent = Boolean(existingProposal);

  return (
    <div className="workshop-overlay" onClick={onClose}>
      <div
        className="workshop-panel surface-metal-brushed rounded-2xl p-6 sm:p-8 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto border border-metal-1 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-ink-3 hover:text-ink-0 hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* CATEGORY & MATCH */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className="font-technical text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider"
            style={{
              background: `var(--${color})`,
              color: 'var(--bg-0)',
            }}
          >
            {category}
          </span>

          {item?.matchPercentage != null && (
            <span className="font-mono text-xs font-semibold text-mint bg-mint/10 px-2 py-0.5 rounded">
              {item.matchPercentage}% match
            </span>
          )}
        </div>

        {/* FULL TITLE */}
        <h2 className="font-display text-2xl sm:text-3xl text-ink-0 font-bold leading-snug mb-3">
          {item?.title || 'Untitled opportunity'}
        </h2>

        {/* SKILLS */}
        <div className="mb-4">
          <p className="font-technical text-xs text-ink-3 uppercase tracking-wider mb-1 font-bold">
            SKILLS REQUIRED
          </p>
          <p className="font-mono text-sm text-amber font-semibold">
            {item?.skillRequired || 'General'}
          </p>
        </div>

        {/* FULL UN-TRUNCATED DESCRIPTION */}
        <div className="surface-panel rounded-xl p-4 sm:p-5 mb-5 border border-metal-1/40">
          <p className="font-technical text-xs text-ink-3 uppercase tracking-wider mb-2 font-bold">
            FULL GIG DESCRIPTION
          </p>
          <p className="font-sans text-sm sm:text-base leading-relaxed text-ink-1 whitespace-pre-wrap break-words">
            {item?.description || 'No description provided.'}
          </p>
        </div>

        {/* SPECIFICATIONS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="surface-panel rounded-xl p-3.5 border border-metal-1/30">
            <p className="font-technical text-xs text-ink-3 font-semibold">BUDGET</p>
            <p className="font-display text-2xl font-bold text-amber mt-1">
              ₹{item?.amount ?? 0}
            </p>
          </div>

          <div className="surface-panel rounded-xl p-3.5 border border-metal-1/30">
            <p className="font-technical text-xs text-ink-3 font-semibold">DEADLINE</p>
            <p
              className={`font-mono text-sm mt-1 flex items-center gap-1.5 font-bold ${
                deadlinePassed ? 'text-coral' : 'text-ink-1'
              }`}
            >
              <Clock size={15} />
              {deadlineLabel}
            </p>
          </div>

          <div className="surface-panel rounded-xl p-3.5 border border-metal-1/30 col-span-2 sm:col-span-1">
            <p className="font-technical text-xs text-ink-3 font-semibold">POSTED BY</p>
            <p className="font-mono text-sm text-ink-1 mt-1 truncate font-bold flex items-center gap-1.5">
              <span>{posterName}</span>
              <span className="text-amber flex items-center text-xs">
                <Star size={12} className="fill-amber mr-0.5" />
                {posterRating}
              </span>
            </p>
            {postedTimeLabel && (
              <p className="font-mono text-xs text-ink-3 mt-0.5">{postedTimeLabel}</p>
            )}
          </div>
        </div>

        {/* MODAL ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-metal-1/40">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto text-center px-4 py-2.5 rounded-lg font-technical text-xs font-semibold text-ink-2 hover:text-ink-0 hover:bg-white/5 transition-colors"
          >
            CLOSE
          </button>

          {deadlinePassed ? (
            <span className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 font-technical text-xs font-semibold text-coral border border-coral/30">
              <Clock size={15} />
              DEADLINE PASSED
            </span>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onBargain}
                disabled={proposalSent}
                className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 font-technical text-xs sm:text-sm font-semibold text-amber border border-amber/30 hover:bg-amber/10 transition-colors disabled:opacity-40"
              >
                <HandCoins size={16} />
                BARGAIN
              </button>

              <button
                type="button"
                onClick={onInterest}
                disabled={proposalSent}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 font-technical text-xs sm:text-sm font-semibold transition-colors ${
                  proposalSent
                    ? 'bg-mint/15 text-mint border border-mint/30'
                    : 'bg-amber text-bg-0 hover:bg-amber-soft'
                } disabled:cursor-default`}
              >
                {proposalSent ? (
                  <>
                    <CheckCircle2 size={16} />
                    PROPOSAL SENT
                  </>
                ) : (
                  <>
                    <span className="text-sm">♥</span>
                    INTERESTED
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export const ExploreGigsPage = FindJugaadPage;
export default FindJugaadPage;