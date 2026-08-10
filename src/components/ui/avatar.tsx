import Image from "next/image"

import { cn } from "@/lib/utils/cn"

export function Avatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string | null
  className?: string
}) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "B"

  return (
    <span
      className={cn(
        "bg-light-blue text-primary relative inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold",
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" fill className="object-cover" unoptimized />
      ) : (
        initials
      )}
    </span>
  )
}
