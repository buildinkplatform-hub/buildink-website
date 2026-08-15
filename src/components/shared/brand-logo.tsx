import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils/cn"

export function BrandLogo({
  compact = false,
  inverted = false,
  linked = false,
  className,
}: {
  compact?: boolean
  inverted?: boolean
  linked?: boolean
  className?: string
}) {
  const content = compact ? (
    <Image
      src="/brand/buildink-logo-mark.svg"
      width={44}
      height={44}
      alt="Buildink"
      priority
      className={cn("size-11", className)}
    />
  ) : inverted ? (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand/buildink-logo-mark.svg"
        alt=""
        width={38}
        height={38}
        priority
      />
      <span className="min-w-0 leading-none">
        <span className="block text-[17px] font-bold tracking-[0.08em] text-white">
          BUILDINK
        </span>
        <span className="text-brand-400 mt-1 block text-[7px] font-semibold tracking-[0.18em]">
          BUILD BEYOND LIMITS
        </span>
      </span>
    </span>
  ) : (
    <Image
      src="/brand/buildink-logo.svg"
      width={174}
      height={45}
      alt="Buildink"
      priority
      className={cn(
        "h-auto w-[154px] sm:w-[174px]",
        className,
      )}
    />
  )

  if (!linked) return content

  return (
    <Link
      href="/dashboard"
      aria-label="Buildink dashboard"
      className="focus:ring-primary/40 inline-flex rounded-md focus:ring-2 focus:outline-none"
    >
      {content}
    </Link>
  )
}
