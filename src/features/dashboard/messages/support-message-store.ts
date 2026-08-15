import { create } from "zustand"

export interface RealtimeSupportMessage {
  id: string
  ticketId: string
  authorId: string | null
  author: string
  body: string
  createdAt: string
  internalNote: boolean
}

interface SupportMessageState {
  messagesByTicket: Record<string, RealtimeSupportMessage[]>
  setInitialMessages: (
    ticketId: string,
    messages: RealtimeSupportMessage[],
  ) => void
  appendMessage: (message: RealtimeSupportMessage) => void
}

export const usePortalSupportMessageStore = create<SupportMessageState>(
  (set) => ({
    messagesByTicket: {},
    setInitialMessages: (ticketId, messages) =>
      set((state) => ({
        messagesByTicket: {
          ...state.messagesByTicket,
          [ticketId]: messages,
        },
      })),
    appendMessage: (message) =>
      set((state) => {
        if (message.internalNote) return state
        const current = state.messagesByTicket[message.ticketId] ?? []
        if (current.some((entry) => entry.id === message.id)) return state
        return {
          messagesByTicket: {
            ...state.messagesByTicket,
            [message.ticketId]: [...current, message],
          },
        }
      }),
  }),
)
