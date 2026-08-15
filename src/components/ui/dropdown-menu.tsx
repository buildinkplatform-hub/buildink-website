"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronDown, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils/cn"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal

function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 min-w-48 overflow-hidden rounded-xl border border-line/80 p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] outline-none",
          className,
        )}
        {...props}
      />
    </DropdownMenuPortal>
  )
}

function DropdownMenuItem({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-brand-navy [&_svg]:size-4",
        inset && "ps-8",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        "text-muted-foreground px-2.5 py-2 text-xs font-semibold tracking-wide uppercase",
        inset && "ps-8",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("bg-border -mx-1.5 my-1.5 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className={cn(
        "relative flex cursor-default items-center rounded-lg py-2 ps-8 pe-2 text-sm outline-none select-none data-[highlighted]:bg-accent data-[highlighted]:text-brand-navy",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute start-2 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        "flex cursor-default items-center rounded-lg px-2 py-1.5 text-sm outline-none select-none data-[highlighted]:bg-accent data-[highlighted]:text-brand-navy data-[state=open]:bg-accent",
        inset && "ps-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ms-auto size-4 rtl:scale-x-[-1]" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function MultiSelect({
  id,
  values,
  options,
  placeholder,
  onChange,
}: {
  id?: string
  values: string[]
  options: Array<{ value: string; label: string }>
  placeholder: string
  onChange: (values: string[]) => void
}) {
  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id={id}
          type="button"
          className="border-line text-ink focus:border-primary focus:ring-primary/20 flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 text-start text-base transition-[border-color,box-shadow,background-color] outline-none hover:border-line/90 focus:ring-3"
        >
          <span
            className={cn("truncate", !selectedLabels.length && "text-muted")}
          >
            {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
          </span>
          <ChevronDown className="text-muted size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
      >
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={values.includes(option.value)}
            onCheckedChange={(checked) =>
              onChange(
                checked
                  ? [...values, option.value]
                  : values.filter((value) => value !== option.value),
              )
            }
            onSelect={(event) => event.preventDefault()}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MultiSelect,
}
