import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { EntityDetailFields } from "./entity-detail-fields"

const labels = (key: string) => key

describe("EntityDetailFields", () => {
  it("renders only the fields the portal DTO returned", () => {
    render(
      <EntityDetailFields
        entity="project"
        data={{ title: "Riverside retrofit", status: "IN_PROGRESS" }}
        labels={labels}
      />,
    )
    expect(screen.getByText("Riverside retrofit")).toBeInTheDocument()
    expect(screen.getByText("fields.title")).toBeInTheDocument()
    expect(screen.getByText("fields.status")).toBeInTheDocument()
    expect(screen.queryByText("fields.description")).not.toBeInTheDocument()
    expect(screen.queryByText("fields.reference")).not.toBeInTheDocument()
  })

  it("still shows a placeholder when the DTO returned the field as empty", () => {
    render(
      <EntityDetailFields
        entity="project"
        data={{ title: "Depot rebuild", description: null }}
        labels={labels}
      />,
    )
    expect(screen.getByText("fields.description")).toBeInTheDocument()
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("does not render an unknown field even when the DTO includes it", () => {
    render(
      <EntityDetailFields
        entity="project"
        data={{ title: "Bridge works", moderationNotes: "internal only" }}
        labels={labels}
      />,
    )
    expect(screen.queryByText("internal only")).not.toBeInTheDocument()
  })
})
