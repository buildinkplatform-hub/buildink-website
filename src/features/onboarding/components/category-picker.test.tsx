import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import type { CategoryOption } from "@/shared/types/platform"
import { CategoryPicker } from "./category-picker"

const categories: CategoryOption[] = [
  {
    id: "building-services",
    slug: "building-services",
    label: "Building services",
    parentId: null,
    children: [
      {
        id: "electrical",
        slug: "electrical",
        label: "Electrical",
        parentId: "building-services",
        children: [],
      },
      {
        id: "plumbing",
        slug: "plumbing",
        label: "Plumbing",
        parentId: "building-services",
        children: [],
      },
    ],
  },
]

function CategoryPickerHarness({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue)
  return (
    <CategoryPicker
      id="category"
      value={value}
      categories={categories}
      onChange={setValue}
    />
  )
}

describe("CategoryPicker", () => {
  it("enables and selects a subcategory after its parent is selected", async () => {
    const user = userEvent.setup()
    render(<CategoryPickerHarness />)

    const [parent, child] = screen.getAllByRole("combobox")
    expect(child).toBeDisabled()

    await user.click(parent!)
    await user.click(screen.getByRole("option", { name: "Building services" }))
    expect(child).toBeEnabled()

    await user.click(child!)
    await user.click(screen.getByRole("option", { name: "Plumbing" }))
    expect(child).toHaveTextContent("Plumbing")
  })

  it("restores a previously saved subcategory", () => {
    render(<CategoryPickerHarness initialValue="electrical" />)

    const [parent, child] = screen.getAllByRole("combobox")
    expect(parent).toHaveTextContent("Building services")
    expect(child).toHaveTextContent("Electrical")
  })
})
