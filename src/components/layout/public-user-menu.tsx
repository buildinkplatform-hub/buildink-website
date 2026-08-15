"use client"

import { ChevronDown, LoaderCircle, LogOut } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutAction } from "@/features/auth/actions/auth.actions"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils/cn"
import type { Locale } from "@/shared/types/platform"

function LogoutSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      {label}
    </Button>
  )
}

export function PublicUserMenu({
  locale,
  name,
  email,
  dashboardHref,
  profileImageUrl,
  initials,
  dashboardLabel,
  logoutLabel,
  confirmTitle,
  confirmBody,
  confirmActionLabel,
  cancelLabel,
  mobileIconOnly = false,
  subtitle,
  chrome = "default",
}: {
  locale: Locale
  name: string
  email: string
  dashboardHref: string
  profileImageUrl?: string | null
  initials: string
  dashboardLabel: string
  logoutLabel: string
  confirmTitle: string
  confirmBody: string
  confirmActionLabel: string
  cancelLabel: string
  mobileIconOnly?: boolean
  subtitle?: string
  chrome?: "default" | "dashboard"
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <DropdownMenu dir={locale === "ar" ? "rtl" : "ltr"}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              chrome === "dashboard"
                ? "hover:bg-accent focus:ring-primary/20 inline-flex items-center gap-2.5 rounded-xl p-1.5 text-start transition outline-none focus:ring-2"
                : "border-line hover:border-line hover:bg-accent focus-visible:ring-primary/20 inline-flex min-h-12 items-center gap-3 rounded-[22px] border bg-white px-2.5 py-2 text-start shadow-[0_10px_30px_rgba(10,31,68,0.08)] transition-all outline-none focus-visible:ring-4",
              mobileIconOnly &&
                (chrome === "dashboard"
                  ? "size-10 justify-center p-0 sm:size-auto sm:justify-start sm:p-1.5"
                  : "size-11 min-h-11 justify-center px-0 py-0 sm:size-auto sm:min-h-12 sm:justify-start sm:px-2.5 sm:py-2"),
            )}
            aria-label={`${name} - ${email}`}
          >
            <span className="bg-light-blue text-primary relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                initials
              )}
            </span>
            <span
              className={cn(
                "hidden min-w-0",
                chrome === "dashboard" ? "xl:block" : "md:block",
              )}
            >
              <span
                className={cn(
                  "block truncate font-semibold text-brand-navy",
                  chrome === "dashboard" ? "max-w-28 text-xs" : "text-sm",
                )}
              >
                {name}
              </span>
              <span
                className={cn(
                  "block truncate text-muted",
                  chrome === "dashboard" ? "text-[10px]" : "max-w-40 text-xs",
                )}
              >
                {subtitle ?? email}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "text-muted size-4 shrink-0",
                mobileIconOnly && "hidden sm:block",
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(
            "w-[min(320px,calc(100vw-1rem))] min-w-0 p-2",
            chrome === "dashboard" ? "rounded-xl" : "rounded-[24px]",
          )}
        >
          <DropdownMenuLabel className="px-3 py-2 normal-case">
            <span className="text-brand-navy block text-start text-sm font-semibold">
              {name}
            </span>
            <span className="text-muted ltr-content mt-0.5 block truncate text-start text-xs">
              {email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-line my-1 h-px" />
          <DropdownMenuItem asChild className="rounded-xl px-3 py-3">
            <Link href={dashboardHref}>{dashboardLabel}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-xl px-3 py-3"
            onSelect={(event) => {
              event.preventDefault()
              setConfirmOpen(true)
            }}
          >
            {logoutLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
            <DialogDescription>{confirmBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
            >
              {cancelLabel}
            </Button>
            <form action={logoutAction.bind(null, locale)}>
              <LogoutSubmitButton label={confirmActionLabel} />
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
