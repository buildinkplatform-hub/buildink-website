import { create } from "zustand"

export interface RealtimeMessage {
  id: string
  conversationId: string
  senderId: string | null
  body: string | null
  sentAt: string
  mine?: boolean
}

interface ConversationSummary {
  id: string
  lastMessageAt: string | null
  unreadCount: number
}

interface MessageState {
  messagesByConversation: Record<string, RealtimeMessage[]>
  conversations: Record<string, ConversationSummary>
  totalUnread: number
  setInitialMessages: (
    conversationId: string,
    messages: RealtimeMessage[],
  ) => void
  appendMessage: (message: RealtimeMessage, viewerId?: string) => void
  updateConversation: (summary: ConversationSummary) => void
  setConversations: (items: ConversationSummary[]) => void
  clearConversationUnread: (conversationId: string) => void
  reset: () => void
}

const emptyMessageState = {
  messagesByConversation: {},
  conversations: {},
  totalUnread: 0,
}

function recomputeTotal(conversations: Record<string, ConversationSummary>) {
  return Object.values(conversations).reduce(
    (total, item) => total + item.unreadCount,
    0,
  )
}

function mergeMessages(
  existing: RealtimeMessage[],
  incoming: RealtimeMessage[],
) {
  const byId = new Map(existing.map((message) => [message.id, message]))
  for (const message of incoming) byId.set(message.id, message)
  return [...byId.values()].sort(
    (left, right) =>
      new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime(),
  )
}

export const usePortalMessageStore = create<MessageState>((set) => ({
  ...emptyMessageState,
  setInitialMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: mergeMessages(
          state.messagesByConversation[conversationId] ?? [],
          messages,
        ),
      },
    })),
  appendMessage: (message, viewerId) =>
    set((state) => {
      const current = state.messagesByConversation[message.conversationId] ?? []
      if (current.some((entry) => entry.id === message.id)) return state
      const nextMessage = {
        ...message,
        mine: viewerId ? message.senderId === viewerId : message.mine,
      }
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: [...current, nextMessage],
        },
      }
    }),
  updateConversation: (summary) =>
    set((state) => {
      const conversations = {
        ...state.conversations,
        [summary.id]: summary,
      }
      return {
        conversations,
        totalUnread: recomputeTotal(conversations),
      }
    }),
  setConversations: (items) =>
    set(() => {
      const conversations = Object.fromEntries(
        items.map((item) => [item.id, item]),
      )
      return {
        conversations,
        totalUnread: recomputeTotal(conversations),
      }
    }),
  clearConversationUnread: (conversationId) =>
    set((state) => {
      const existing = state.conversations[conversationId]
      if (!existing || existing.unreadCount === 0) return state
      const conversations = {
        ...state.conversations,
        [conversationId]: { ...existing, unreadCount: 0 },
      }
      return {
        conversations,
        totalUnread: recomputeTotal(conversations),
      }
    }),
  reset: () => set(emptyMessageState),
}))
