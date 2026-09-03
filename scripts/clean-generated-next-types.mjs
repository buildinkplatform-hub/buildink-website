import { rmSync } from "node:fs"
import { join } from "node:path"
import process from "node:process"

const root = process.cwd()
const cleanProductionTypes = process.argv.includes("--production")

// Next.js keeps development and production generated route types in separate
// directories. Stale dev types can break `next build`, but deleting
// `.next/types` immediately before a production build can also race Next's
// generated type validation and produce TS6053 for cache-life.d.ts/validator.ts.
//
// The normal cleanup therefore removes only dev-generated types. The
// `--production` mode is reserved for standalone typecheck, where package.json
// immediately follows this cleanup with `next typegen` to regenerate them.
const generatedTypeDirectories = [
  join(root, ".next", "dev", "types"),
  join(root, ".next-e2e", "dev", "types"),
  ...(cleanProductionTypes
    ? [join(root, ".next", "types"), join(root, ".next-e2e", "types")]
    : []),
]

for (const directory of generatedTypeDirectories) {
  rmSync(directory, { recursive: true, force: true })
}

console.log(
  cleanProductionTypes
    ? "Removed stale Next.js dev and production generated type directories."
    : "Removed stale Next.js dev generated type directories.",
)
