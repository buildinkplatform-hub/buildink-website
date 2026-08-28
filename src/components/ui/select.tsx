"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils/cn"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "border-input bg-card text-foreground data-[placeholder]:text-muted-foreground hover:border-primary/25 focus-visible:border-primary/60 focus-visible:ring-primary/12 aria-invalid:border-destructive aria-invalid:ring-destructive/10 disabled:bg-muted/25 relative flex h-12 min-h-12 w-full min-w-0 items-center rounded-2xl border px-4 pe-12 text-sm shadow-[0_1px_2px_rgb(7_26_51/0.03)] transition-[border-color,box-shadow,background-color] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-55 [&>span]:truncate",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <span className="bg-muted/55 text-muted-foreground pointer-events-none absolute end-3.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg">
          <ChevronDown className="size-3.5" />
        </span>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border-border/80 relative z-[80] max-h-80 min-w-[10rem] overflow-hidden rounded-2xl border p-1 shadow-[var(--shadow-floating)] duration-150 outline-none motion-reduce:animate-none",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1.5 data-[side=top]:-translate-y-1.5",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="text-muted-foreground flex h-8 items-center justify-center rounded-xl">
          <ChevronUp className="size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="text-muted-foreground flex h-8 items-center justify-center rounded-xl">
          <ChevronDown className="size-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn(
        "text-muted-foreground px-3 py-2 text-[11px] font-semibold tracking-[0.08em] uppercase",
        className,
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "text-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=checked]:bg-primary/7 data-[state=checked]:text-primary relative flex w-full cursor-pointer items-center rounded-xl py-2.5 ps-3 pe-10 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className,
      )}
      {...props}
    >
      <span className="absolute end-2.5 flex size-5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-full">
            <Check className="size-3" />
          </span>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("bg-border/80 -mx-1 my-1.5 h-px", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
