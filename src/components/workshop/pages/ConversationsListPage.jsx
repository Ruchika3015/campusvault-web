import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '@/services/api';

function getInitials(name) {
  const value = String(name || '').trim();

  if (!value) {
    return 'U';
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function extractConversations(response) {
  let list = [];

  if (Array.isArray(response)) {
    list = response;
  } else if (Array.isArray(response?.conversations)) {
    list = response.conversations;
  } else if (Array.isArray(response?.data)) {
    list = response.data;
  } else if (Array.isArray(response?.data?.conversations)) {
    list = response.data.conversations;
  }

  return list.map((conv) => ({
    ...conv,

    _id:
      conv._id ??
      conv.conversationId ??
      conv.id ??
      conv.conversation_id,

    other_user_name:
      conv.other_user_name ??
      conv.user?.name ??
      'User',

    other_user_email:
      conv.other_user_email ??
      conv.user?.email ??
      '',

    other_user_id:
      conv.other_user_id ??
      conv.user?._id ??
      conv.user?.id ??
      '',

    gig_title:
      conv.gig_title ??
      conv.gigTitle ??
      'Gig',
  }));
}

function extractMessages(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.messages)) {
    return response.messages;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.messages)) {
    return response.data.messages;
  }

  return [];
}

function getMessageText(message) {
  if (!message) {
    return '';
  }

  return String(
    message.text ??
      message.message ??
      message.content ??
      message.body ??
      ''
  ).trim();
}

function getMessageSenderId(message) {
  if (!message) {
    return null;
  }

  const sender =
    message.sender ??
    message.senderUser ??
    message.from ??
    message.user;

  const value =
    message.senderId ??
    message.sender_id ??
    sender?._id ??
    sender?.id ??
    sender?.userId ??
    sender?.user_id ??
    sender;

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  return String(value);
}

function getMessageDate(message) {
  if (!message) {
    return null;
  }

  const value =
    message.createdAt ??
    message.created_at ??
    message.sentAt ??
    message.sent_at ??
    message.timestamp ??
    message.date;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getMessageId(message, index) {
  return (
    message?._id ??
    message?.id ??
    message?.message_id ??
    `message-${index}`
  );
}

function isMessageRead(message) {
  return Boolean(
    message?.read_at ||
      message?.readAt ||
      message?.read === true ||
      message?.isRead === true ||
      message?.is_read === true
  );
}

function formatMessageTime(message) {
  const date = getMessageDate(message);

  if (!date) {
    return '';
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatLastMessage(conversation) {
  if (conversation?.last_message) {
    return String(conversation.last_message);
  }

  if (conversation?.lastMessage) {
    return String(conversation.lastMessage);
  }

  return 'No messages yet — say hello!';
}

function formatMoney(value) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '₹0';
  }

  return `₹${value}`;
}

function enrichConversation(
  conversation,
  messages
) {
  const sortedMessages = [...messages].sort(
    (a, b) => {
      const dateA = getMessageDate(a)?.getTime() ?? 0;
      const dateB = getMessageDate(b)?.getTime() ?? 0;

      return dateA - dateB;
    }
  );

  const latestMessage =
    sortedMessages.length > 0
      ? sortedMessages[
          sortedMessages.length - 1
        ]
      : null;

  const personId = String(
    conversation?.other_user_id ??
      conversation?.user?._id ??
      conversation?.user?.id ??
      ''
  );

  const incomingUnreadMessages =
    sortedMessages.filter((message) => {
      const senderId =
        getMessageSenderId(message);

      if (!senderId || !personId) {
        return false;
      }

      const isFromOtherPerson =
        String(senderId) ===
        String(personId);

      return (
        isFromOtherPerson &&
        !isMessageRead(message)
      );
    });

  const latestText =
    getMessageText(latestMessage);

  const latestSenderId =
    getMessageSenderId(latestMessage);

  const latestIsMine =
    latestSenderId !== null &&
    personId !== '' &&
    String(latestSenderId) !==
      String(personId);

  const backendUnreadCount =
    Number.isFinite(
      Number(conversation?.unread_count)
    )
      ? Number(conversation.unread_count)
      : Number.isFinite(
            Number(conversation?.unreadCount)
          )
        ? Number(conversation.unreadCount)
        : null;

  const unreadCount =
    incomingUnreadMessages.length > 0
      ? incomingUnreadMessages.length
      : backendUnreadCount ?? 0;

  return {
    ...conversation,

    _messages: sortedMessages,

    _latestMessage: latestMessage,

    _lastMessageText:
      latestText ||
      formatLastMessage(conversation),

    _lastMessageTime:
      formatMessageTime(latestMessage),

    _latestMessageTimestamp:
      getMessageDate(
        latestMessage
      )?.getTime() ??
      0,

    _latestIsMine: latestIsMine,

    _unreadCount: unreadCount,
  };
}

export function ConversationsListPage() {
  const navigate = useNavigate();

  const [conversations, setConversations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const loadConversations = async (
    showLoading = false
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError('');

      const response =
        await api.getConversations();

      const list =
        extractConversations(response);

      /*
       * Fetch the actual messages for every
       * conversation so the list can show:
       *
       * - latest message
       * - latest message time
       * - unread count
       */
      const enrichedList =
        await Promise.all(
          list.map(
            async (conversation) => {
              const conversationId =
                conversation?._id ??
                conversation?.id ??
                conversation?.conversation_id;

              if (!conversationId) {
                return enrichConversation(
                  conversation,
                  []
                );
              }

              try {
                const messageResponse =
                  await api.getConversationMessages(
                    conversationId
                  );

                const messages =
                  extractMessages(
                    messageResponse
                  );

                return enrichConversation(
                  conversation,
                  messages
                );
              } catch (messageError) {
                console.error(
                  `Failed to load messages for conversation ${conversationId}:`,
                  messageError
                );

                /*
                 * Keep the conversation visible
                 * even if its messages fail.
                 */
                return enrichConversation(
                  conversation,
                  []
                );
              }
            }
          )
        );

      console.log(
        'CONVERSATIONS FROM BACKEND:',
        response
      );

      console.log(
        'ENRICHED CONVERSATIONS:',
        enrichedList
      );

      setConversations(
        enrichedList
      );
    } catch (err) {
      console.error(
        'Failed to load conversations:',
        err
      );

      setError(
        err?.message ||
          'Unable to load conversations. Please try again.'
      );

      /*
       * Don't destroy the currently visible
       * conversations during a background refresh.
       */
      if (showLoading) {
        setConversations([]);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadConversations(true);

    const intervalId =
      window.setInterval(() => {
        loadConversations(false);
      }, 10000);

    return () =>
      window.clearInterval(
        intervalId
      );
  }, []);

  const visibleConversations =
    useMemo(() => {
      return conversations
        .filter((conversation) => {
          return Boolean(
            conversation?._id ||
              conversation?.id ||
              conversation?.conversation_id
          );
        })
        .sort(
          (a, b) =>
            (b?._latestMessageTimestamp ??
              0) -
            (a?._latestMessageTimestamp ??
              0)
        );
    }, [conversations]);

  const openConversation = async (
    conversation
  ) => {
    const conversationId =
      conversation?._id ??
      conversation?.id ??
      conversation?.conversation_id;

    if (!conversationId) {
      console.error(
        'Conversation has no conversation ID:',
        conversation
      );

      return;
    }

    /*
     * Mark incoming messages as read before
     * opening the conversation.
     *
     * The existing API uses the other user's
     * ID as receiverId.
     */
    const personId =
      conversation?.other_user_id ??
      conversation?.user?._id ??
      conversation?.user?.id ??
      '';

    if (personId) {
      try {
        await api.markConversationAsRead(
          personId
        );
      } catch (err) {
        console.error(
          'Failed to mark conversation as read:',
          err
        );
      }
    }

    /*
     * Immediately remove the unread badge
     * locally so the UI feels instant.
     */
    setConversations(
      (current) =>
        current.map((item) => {
          const itemId =
            item?._id ??
            item?.id ??
            item?.conversation_id;

          if (
            String(itemId) !==
            String(conversationId)
          ) {
            return item;
          }

          return {
            ...item,
            _unreadCount: 0,
          };
        })
    );

    navigate(
      `/dashboard/messages/${conversationId}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-0 px-6 py-16 text-ink-0">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-3 font-technical text-[10px] uppercase tracking-[0.28em] text-mint-soft">
            06 — ACCEPTED COLLABORATIONS
          </div>

          <h1 className="text-5xl font-black uppercase tracking-[-0.04em] md:text-6xl">
            Messages.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-ink-2">
            Loading your accepted collaborations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-0 px-0 sm:px-2 py-6 sm:py-12 text-ink-0">
      <div className="mx-auto max-w-[1180px]">

        {/* HEADER */}
        <div className="mb-3 font-technical text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-mint-soft">
          06 — ACCEPTED COLLABORATIONS
        </div>

        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-[-0.04em] md:text-6xl">
          Messages.
        </h1>

        <p className="mt-3 sm:mt-5 max-w-2xl text-xs sm:text-base leading-relaxed text-ink-2">
          Conversations unlock only when a poster accepts your
          request. Every thread belongs to one gig.
        </p>

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-2xl border border-coral/20 bg-coral/10 px-5 py-4 text-sm text-coral-soft">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!error &&
          visibleConversations.length ===
            0 && (
            <div className="mt-10 rounded-3xl border border-metal-1/30 bg-bg-1 p-8">
              <p className="text-lg font-semibold text-ink-0">
                No accepted collaborations yet.
              </p>

              <p className="mt-2 text-sm text-ink-2">
                Once a proposal is accepted, the
                other person will appear here.
              </p>
            </div>
          )}

        {/* CONVERSATIONS */}
        <div className="mt-9 space-y-4">
          {visibleConversations.map(
            (conversation) => {
              const conversationId =
                conversation?._id ??
                conversation?.id ??
                conversation?.conversation_id;

              const personName =
                conversation?.other_user_name ||
                'User';

              const personEmail =
                conversation?.other_user_email ||
                '';

              const personId =
                conversation?.other_user_id ??
                '';

              const jugaadTitle =
                conversation?.jugaad_title ||
                conversation?.gig_title ||
                'Gig';

              const jugaadId =
                conversation?.jugaad_id ??
                '';

              const proposalId =
                conversation?.proposal_id ??
                '';

              const lastMessage =
                conversation?._lastMessageText ||
                'No messages yet — say hello!';

              const lastMessageTime =
                conversation?._lastMessageTime ||
                '';

              const latestIsMine =
                Boolean(
                  conversation?._latestIsMine
                );

              const unreadCount =
                Number(
                  conversation?._unreadCount ??
                    0
                );

              const hasUnread =
                unreadCount > 0;

              const initials =
                getInitials(personName);

              return (
                <button
                  key={conversationId}
                  type="button"
                  onClick={() =>
                    openConversation(
                      conversation
                    )
                  }
                  className={`
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    sm:gap-5
                    rounded-2xl
                    border
                    px-3.5
                    py-3.5
                    sm:px-6
                    sm:py-5
                    text-left
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
                    transition
                    ${
                      hasUnread
                        ? `
                          border-mint/60
                          bg-bg-2
                          shadow-[0_0_0_1px_rgba(120,255,210,0.08)]
                        `
                        : `
                          border-metal-1/40
                          bg-bg-1
                        `
                    }
                    hover:border-metal-2/60
                    hover:bg-bg-2
                  `}
                >
                  {/* AVATAR */}
                  <div
                    className={`
                      relative
                      flex
                      h-11
                      w-11
                      sm:h-14
                      sm:w-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      text-sm
                      sm:text-lg
                      font-black
                    `}
                    style={{
                      background:
                        'linear-gradient(135deg, var(--mint), var(--mint-deep))',
                      color:
                        'var(--bg-0)',
                    }}
                  >
                    {initials}

                    {/* UNREAD DOT */}
                    {hasUnread && (
                      <span
                        className="
                          absolute
                          -right-0.5
                          -top-0.5
                          h-3.5
                          w-3.5
                          rounded-full
                          border-2
                          border-bg-1
                          bg-mint
                        "
                      />
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">

                    {/* TOP ROW */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          min-w-0
                          flex-1
                          truncate
                          text-xl
                          ${
                            hasUnread
                              ? 'font-black text-ink-0'
                              : 'font-bold text-ink-0'
                          }
                        `}
                      >
                        {personName}
                      </div>

                      {/* LAST MESSAGE TIME */}
                      {lastMessageTime && (
                        <span
                          className={`
                            shrink-0
                            text-xs
                            ${
                              hasUnread
                                ? 'font-semibold text-mint'
                                : 'text-ink-3'
                            }
                          `}
                        >
                          {lastMessageTime}
                        </span>
                      )}
                    </div>

                    {/* JUGAAD */}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-2">
                      <span>
                        {jugaadTitle}
                      </span>

                      <span>•</span>

                      <span>
                        {formatMoney(
                          conversation?.amount ??
                            conversation?.budget ??
                            conversation?.price
                        )}
                      </span>
                    </div>

                    {/* MESSAGE + UNREAD COUNT */}
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className={`
                          min-w-0
                          flex-1
                          truncate
                          text-sm
                          ${
                            hasUnread
                              ? 'font-semibold text-ink-0'
                              : 'text-ink-2'
                          }
                        `}
                      >
                        {latestIsMine &&
                          lastMessage !==
                            'No messages yet — say hello!' && (
                            <span className="mr-1 text-ink-3">
                              You:
                            </span>
                          )}

                        {lastMessage}
                      </div>

                      {/* UNREAD COUNT */}
                      {hasUnread && (
                        <span
                          className="
                            flex
                            h-6
                            min-w-6
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-mint
                            px-1.5
                            text-[11px]
                            font-black
                            text-bg-0
                          "
                        >
                          {unreadCount > 99
                            ? '99+'
                            : unreadCount}
                        </span>
                      )}
                    </div>

                    {/* DEBUG-FRIENDLY META */}
                    {(personId ||
                      jugaadId ||
                      proposalId ||
                      personEmail) && (
                      <div className="mt-2 hidden text-[10px] text-ink-3">
                        user: {personId} · gig:{' '}
                        {jugaadId} · proposal:{' '}
                        {proposalId} ·{' '}
                        {personEmail}
                      </div>
                    )}
                  </div>

                  {/* ARROW */}
                  <div
                    className="
                      shrink-0
                      text-2xl
                      text-ink-2
                      transition
                      group-hover:translate-x-1
                      group-hover:text-ink-0
                    "
                  >
                    →
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export default ConversationsListPage;