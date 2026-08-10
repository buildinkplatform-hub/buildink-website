import Image from "next/image"

import { cn } from "@/lib/utils/cn"

export function BrandLogo({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  return (
    <Image
      src={
        compact ? "/brand/buildink-logo-mark.svg" : "/brand/buildink-logo.svg"
      }
      width={compact ? 44 : 174}
      height={compact ? 44 : 45}
      alt="Buildink"
      priority
      className={cn(
        compact ? "size-11" : "h-auto w-[154px] sm:w-[174px]",
        className,
      )}
    />
  )
}
