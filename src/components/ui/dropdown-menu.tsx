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
        collisionPadding={12}
        className={cn(
          "bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border-border/80 pointer-events-auto z-[120] max-h-[min(var(--radix-dropdown-menu-content-available-height),28rem)] min-w-52 overflow-y-auto rounded-xl border p-1.5 shadow-[var(--shadow-floating)] duration-150 outline-none motion-reduce:animate-none",
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
        "text-foreground focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/8 relative flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "ps-9",
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
        "text-muted-foreground px-3 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase",
        inset && "ps-9",
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
      className={cn("bg-border/80 -mx-0.5 my-1.5 h-px", className)}
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
        "focus:bg-accent focus:text-accent-foreground relative flex min-h-10 cursor-default items-center rounded-lg py-2 ps-9 pe-3 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute start-2.5 flex size-5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-full">
            <Check className="size-3" />
          </span>
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
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex min-h-10 cursor-default items-center rounded-lg px-3 py-2 text-sm outline-none select-none",
        inset && "ps-9",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="text-muted-foreground ms-auto size-4 rtl:scale-x-[-1]" />
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
          aria-haspopup="menu"
          className="border-input bg-card text-foreground hover:border-primary/25 focus-visible:border-primary/60 focus-visible:ring-primary/12 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3.5 text-start text-sm shadow-[0_1px_2px_rgb(7_26_51/0.03)] transition-[border-color,box-shadow,background-color] outline-none focus-visible:ring-3"
        >
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              !selectedLabels.length && "text-muted-foreground",
            )}
          >
            {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
          </span>
          {values.length ? (
            <span className="bg-primary/8 text-primary rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums">
              {values.length}
            </span>
          ) : null}
          <span className="bg-muted/55 text-muted-foreground grid size-7 shrink-0 place-items-center rounded-lg">
            <ChevronDown className="size-3.5" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {options.length ? (
          options.map((option) => (
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
          ))
        ) : (
          <div className="text-muted-foreground px-3 py-4 text-center text-sm">
            No options available
          </div>
        )}
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
