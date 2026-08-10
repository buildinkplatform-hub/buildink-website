import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils/cn"

export function Separator({
  className,
  ...props
}: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("border-line border-t", className)} {...props} />
}
