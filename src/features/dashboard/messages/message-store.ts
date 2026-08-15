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
}

function recomputeTotal(conversations: Record<string, ConversationSummary>) {
  return Object.values(conversations).reduce(
    (total, item) => total + item.unreadCount,
    0,
  )
}

export const usePortalMessageStore = create<MessageState>((set) => ({
  messagesByConversation: {},
  conversations: {},
  totalUnread: 0,
  setInitialMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
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
}))
