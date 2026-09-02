import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { MultiSelect } from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PortalFormDialog } from "./portal-form-dialog"

function DialogSelectHarness() {
  const [status, setStatus] = useState("draft")

  return (
    <PortalFormDialog
      triggerLabel="Create project"
      title="Create project"
      description="Add the project details."
    >
      <label htmlFor="project-status">Status</label>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger id="project-status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectContent>
      </Select>
    </PortalFormDialog>
  )
}

function DialogMultiSelectHarness() {
  const [roles, setRoles] = useState<string[]>([])

  return (
    <PortalFormDialog
      triggerLabel="Invite member"
      title="Invite member"
      description="Choose one or more roles."
    >
      <label htmlFor="member-roles">Roles</label>
      <MultiSelect
        id="member-roles"
        values={roles}
        options={[
          { value: "admin", label: "Administrator" },
          { value: "editor", label: "Content editor" },
        ]}
        placeholder="Select roles"
        onChange={setRoles}
      />
    </PortalFormDialog>
  )
}

function DialogPopoverHarness() {
  const [value, setValue] = useState("No date selected")

  return (
    <PortalFormDialog
      triggerLabel="Schedule work"
      title="Schedule work"
      description="Choose a working date."
    >
      <p>{value}</p>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Open date picker</button>
        </PopoverTrigger>
        <PopoverContent>
          <button type="button" onClick={() => setValue("Today selected")}>
            Use today
          </button>
        </PopoverContent>
      </Popover>
    </PortalFormDialog>
  )
}

describe("PortalFormDialog", () => {
  it("keeps a portalled select operable inside the dialog and restores focus on close", async () => {
    const user = userEvent.setup()
    render(<DialogSelectHarness />)

    const trigger = screen.getByRole("button", { name: "Create project" })
    await user.click(trigger)

    expect(screen.getByRole("dialog")).toBeInTheDocument()

    const select = screen.getByRole("combobox", { name: "Status" })
    await user.click(select)
    await user.click(screen.getByRole("option", { name: "Published" }))

    expect(select).toHaveTextContent("Published")

    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it("selects and deselects multi-select values inside a dialog", async () => {
    const user = userEvent.setup()
    render(<DialogMultiSelectHarness />)

    await user.click(screen.getByRole("button", { name: "Invite member" }))
    const roles = screen.getByRole("button", { name: "Roles" })

    await user.click(roles)
    const administrator = screen.getByRole("menuitemcheckbox", {
      name: "Administrator",
    })
    expect(administrator.closest("[role=menu]")).toHaveClass("z-[120]")

    await user.click(administrator)
    expect(roles).toHaveTextContent("Administrator")

    const editor = screen.getByRole("menuitemcheckbox", {
      name: "Content editor",
    })
    await user.click(editor)
    expect(roles).toHaveTextContent("Administrator, Content editor")

    await user.click(administrator)
    expect(roles).not.toHaveTextContent("Administrator, Content editor")
    expect(roles).toHaveTextContent("Content editor")
  })

  it("keeps popover content interactive above a dialog", async () => {
    const user = userEvent.setup()
    render(<DialogPopoverHarness />)

    await user.click(screen.getByRole("button", { name: "Schedule work" }))
    await user.click(screen.getByRole("button", { name: "Open date picker" }))

    const useToday = screen.getByRole("button", { name: "Use today" })
    expect(useToday.parentElement).toHaveClass("z-[120]")
    await user.click(useToday)

    expect(screen.getByText("Today selected")).toBeVisible()
  })
})
