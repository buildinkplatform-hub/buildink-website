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
import type { Locale } from "@/shared/types/platform"

function LogoutSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      {pending ? label : label}
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
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="border-line hover:border-primary/40 hover:bg-light-blue focus-visible:ring-primary/20 inline-flex min-h-12 items-center gap-3 rounded-[22px] border bg-white px-2.5 py-2 text-start shadow-[0_10px_30px_rgba(10,31,68,0.08)] transition-all outline-none focus-visible:ring-4"
            aria-label={name}
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
            <span className="hidden min-w-0 md:block">
              <span className="text-brand-navy block truncate text-sm font-semibold">
                {name}
              </span>
              <span className="text-muted block max-w-40 truncate text-xs">
                {email}
              </span>
            </span>
            <ChevronDown aria-hidden="true" className="text-muted size-4 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-64 rounded-[24px] p-2">
          <DropdownMenuLabel className="px-3 py-2 normal-case">
            <span className="text-brand-navy block text-sm font-semibold">
              {name}
            </span>
            <span className="text-muted mt-0.5 block text-xs">{email}</span>
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
