import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(scriptDir, "..")
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".next-e2e",
  ".netlify",
  "build",
  "coverage",
  "node_modules",
  "out",
  "playwright-report",
  "test-results",
])
const sourceExtensions = new Set([
  ".cjs",
  ".css",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
])
const siblingProjectPattern = /^(?:website|admin-dashboard|backend)(?:\/|$)/
const importPatterns = [
  /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  /@import\s+(?:url\()?\s*["']([^"']+)["']/g,
]

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      walk(absolutePath, files)
      continue
    }
    if (sourceExtensions.has(path.extname(entry.name))) files.push(absolutePath)
  }
  return files
}

function isOutsideAppRoot(candidate) {
  const relative = path.relative(appRoot, candidate)
  return (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  )
}

const violations = []
for (const file of walk(appRoot)) {
  const source = fs.readFileSync(file, "utf8")
  const specifiers = new Set()

  for (const pattern of importPatterns) {
    pattern.lastIndex = 0
    let match
    while ((match = pattern.exec(source))) specifiers.add(match[1])
  }

  for (const rawSpecifier of specifiers) {
    const specifier = rawSpecifier.split(/[?#]/, 1)[0]
    if (!specifier) continue

    if (specifier.startsWith(".")) {
      const resolved = path.resolve(path.dirname(file), specifier)
      if (isOutsideAppRoot(resolved)) {
        violations.push({
          file,
          specifier,
          reason: "relative import escapes website/",
        })
      }
      continue
    }

    if (siblingProjectPattern.test(specifier)) {
      violations.push({
        file,
        specifier,
        reason: "import targets another repository project",
      })
    }
  }
}

if (violations.length) {
  console.error("Deployment boundary check failed:\n")
  for (const violation of violations) {
    console.error(
      `- ${path.relative(appRoot, violation.file)} -> ${violation.specifier} (${violation.reason})`,
    )
  }
  process.exit(1)
}

console.log(
  "Deployment boundary check passed: all website imports stay inside website/ or use installed packages.",
)
