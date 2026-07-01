import { readFileSync } from "fs"
import { join } from "path"
import { describe, expect, it } from "vitest"

describe("global theme styles", () => {
  it("defines soft board and column surface colors", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8")

    expect(css).toContain("--background: 248 45% 98%")
    expect(css).toContain("--card: 0 0% 100%")
    expect(css).toContain(".board-shell")
    expect(css).toContain(".column-shell")
  })
})
