#!/usr/bin/env node
/**
 * Fail the build if known malware droppers / obfuscation patterns appear.
 * Runs via package.json prebuild/predev and inside the Docker builder stage.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { basename, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..")
const selfRel = relative(root, fileURLToPath(import.meta.url))
const errors = []

// Built from parts so this file does not match its own IoC list.
const IOC = [
  new RegExp(["0xa322E5f3", "D311D3080e6f0121063e9aDC2490Ef1a"].join(""), "i"),
  new RegExp(["BLOCK_", "MULTIPLE"].join("")),
  new RegExp(["run_", "loader"].join("")),
  new RegExp(["_0x05a", "598"].join("")),
  new RegExp(["global\\.i", "\\s*="].join("")),
  new RegExp(["X-Payload-", "B64"].join(""), "i"),
  new RegExp(["eth\\.blockscout", "\\.com"].join("")),
  new RegExp(["1rpc\\.io", "\\/eth"].join("")),
  new RegExp(["spawn\\(['\"]node['\"],\\s*\\[['\"]", "-e['\"]"].join("")),
  new RegExp(["atob\\(_0x"].join("")),
]

const SCAN_EXT = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".json"])
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "coverage",
  ".vercel",
])

const CONFIG_LONG_LINE = new Set([
  "postcss.config.mjs",
  "postcss.config.js",
  "postcss.config.cjs",
  "next.config.mjs",
  "next.config.js",
  "next.config.ts",
])
const MAX_CONFIG_LINE = 3000

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const path = join(dir, name)
    let st
    try {
      st = statSync(path)
    } catch {
      continue
    }
    if (st.isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

if (existsSync(join(root, "api.js"))) {
  errors.push("Forbidden dropper file present: api.js")
}

const pkgPath = join(root, "package.json")
if (existsSync(pkgPath)) {
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
  const scripts = pkg.scripts || {}
  for (const [name, cmd] of Object.entries(scripts)) {
    if (typeof cmd !== "string") continue
    if (/node\s+[^\s]+\.js\s*&&/i.test(cmd)) {
      errors.push(
        `Suspicious package.json script "${name}": chains node *.js before other commands (${cmd})`,
      )
    }
  }
}

for (const file of walk(root)) {
  const rel = relative(root, file)
  if (rel === selfRel) continue

  const base = basename(file)
  const dot = base.lastIndexOf(".")
  const ext = dot >= 0 ? base.slice(dot) : ""
  if (!SCAN_EXT.has(ext) && !CONFIG_LONG_LINE.has(base)) continue

  let text
  try {
    text = readFileSync(file, "utf8")
  } catch {
    continue
  }

  for (const re of IOC) {
    if (re.test(text)) {
      errors.push(`IoC match ${re} in ${rel}`)
    }
  }

  const isConfig =
    CONFIG_LONG_LINE.has(base) ||
    (!rel.includes("/") && (ext === ".js" || ext === ".mjs"))
  if (isConfig) {
    const lines = text.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > MAX_CONFIG_LINE) {
        errors.push(
          `Suspicious long line (${lines[i].length} chars) in ${rel}:${i + 1}`,
        )
      }
    }
  }
}

if (errors.length) {
  console.error("security-check FAILED:")
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log("security-check OK")
