import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { FileInput } from "./file-input"

describe("FileInput", () => {
  it("opens the native file picker directly from the user click", async () => {
    const user = userEvent.setup()
    const nativeClick = vi
      .spyOn(HTMLInputElement.prototype, "click")
      .mockImplementation(() => undefined)

    render(
      <FileInput
        accept=".pdf,.jpg,.jpeg,.png"
        label="Choose a document file"
        description="PDF, JPEG or PNG"
        onFilesSelected={() => undefined}
      />,
    )

    await user.click(
      screen.getByRole("button", { name: /choose a document file/i }),
    )
    expect(nativeClick).toHaveBeenCalledOnce()
    nativeClick.mockRestore()
  })

  it("returns the selected document", async () => {
    const user = userEvent.setup()
    const onFilesSelected = vi.fn()
    const { container } = render(
      <FileInput
        accept=".pdf,.jpg,.jpeg,.png"
        label="Choose a document file"
        description="PDF, JPEG or PNG"
        onFilesSelected={onFilesSelected}
      />,
    )
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]')
    const file = new File(["document"], "identity.pdf", {
      type: "application/pdf",
    })

    await user.upload(input!, file)
    expect(onFilesSelected).toHaveBeenCalledOnce()
    expect(onFilesSelected.mock.calls[0]?.[0]?.[0]).toBe(file)
  })
})
