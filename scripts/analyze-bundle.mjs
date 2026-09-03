import { spawnSync } from "node:child_process"

const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "experimental-analyze", "--output"],
  {
    stdio: "inherit",
    env: process.env,
  },
)

if (result.error) throw result.error
process.exit(result.status ?? 1)
