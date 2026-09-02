import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { StatusBadge } from "./status-badge"

describe("StatusBadge", () => {
  it("humanizes raw backend lifecycle enums", () => {
    const { rerender } = render(
      <StatusBadge status="PENDING_REVIEW" label="PENDING REVIEW" />,
    )

    expect(screen.getByText("Pending review")).toBeInTheDocument()
    expect(screen.queryByText("PENDING REVIEW")).not.toBeInTheDocument()

    rerender(<StatusBadge status="EVALUATION" label="EVALUATION" />)

    expect(screen.getByText("Evaluation")).toBeInTheDocument()
    expect(screen.queryByText("EVALUATION")).not.toBeInTheDocument()
  })

  it("preserves a localized label supplied by the caller", () => {
    render(<StatusBadge status="OPEN" label="Aperto" />)

    expect(screen.getByText("Aperto")).toBeInTheDocument()
    expect(screen.queryByText("Open")).not.toBeInTheDocument()
  })
})
