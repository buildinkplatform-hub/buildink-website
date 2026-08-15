"use client"

import { cn } from "@/lib/utils/cn"
import { usePortalMessageStore } from "@/features/dashboard/messages/message-store"

export function PortalNavBadge({
  segment,
  collapsed,
}: {
  segment: string
  collapsed?: boolean
}) {
  const totalUnread = usePortalMessageStore((state) => state.totalUnread)
  if (segment !== "messages" || totalUnread <= 0) return null

  return (
    <span
      className={cn(
        "relative z-10 shrink-0 rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold text-white",
        collapsed && "absolute -end-0.5 -top-0.5 min-w-4 border border-white/20 bg-danger px-1",
      )}
    >
      {totalUnread > 99 ? "99+" : totalUnread}
    </span>
  )
}
