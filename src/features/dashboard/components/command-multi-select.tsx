"use client"

import { useMemo, useState } from "react"
import { Check } from "lucide-react"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function CommandMultiSelect({
  name,
  label,
  options,
  empty = "No eligible options.",
}: {
  name: string
  label: string
  options: Array<{ id: string; label: string; detail?: string }>
  empty?: string
}) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const visible = useMemo(
    () =>
      options.filter((option) =>
        `${option.label} ${option.detail ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [options, query],
  )
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{label}</legend>
      <Command>
        <CommandInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${label.toLowerCase()}…`}
          aria-label={`Search ${label}`}
        />
        <CommandList>
          {visible.length ? (
            visible.map((option) => {
              const active = selected.includes(option.id)
              return (
                <CommandItem
                  key={option.id}
                  aria-selected={active}
                  onClick={() =>
                    setSelected((current) =>
                      active
                        ? current.filter((id) => id !== option.id)
                        : [...current, option.id],
                    )
                  }
                >
                  <span
                    className={`grid size-5 place-items-center rounded border ${active ? "border-primary bg-primary text-white" : "border-line"}`}
                  >
                    {active ? <Check className="size-3.5" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {option.label}
                    </span>
                    {option.detail ? (
                      <span className="text-muted block text-xs">
                        {option.detail}
                      </span>
                    ) : null}
                  </span>
                </CommandItem>
              )
            })
          ) : (
            <p className="text-muted p-4 text-center text-sm">{empty}</p>
          )}
        </CommandList>
      </Command>
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <p className="text-muted text-xs" aria-live="polite">
        {selected.length} selected
      </p>
    </fieldset>
  )
}
