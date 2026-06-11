import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  formatCountdownLabel,
  getTimeRemaining,
  parseDueDateEndOfDay,
  shouldShowContractCountdown,
} from "./deadline"

describe("parseDueDateEndOfDay", () => {
  it("parses date-only strings as end of local day", () => {
    const parsed = parseDueDateEndOfDay("2026-06-15")
    assert.equal(parsed.getFullYear(), 2026)
    assert.equal(parsed.getMonth(), 5)
    assert.equal(parsed.getDate(), 15)
    assert.equal(parsed.getHours(), 23)
    assert.equal(parsed.getMinutes(), 59)
    assert.equal(parsed.getSeconds(), 59)
  })
})

describe("getTimeRemaining", () => {
  it("returns future countdown with days hours minutes", () => {
    const now = new Date(2026, 5, 1, 12, 0, 0).getTime()
    const remaining = getTimeRemaining("2026-06-15", now)
    assert.equal(remaining.expired, false)
    assert.equal(remaining.days, 14)
    assert.equal(remaining.hours, 11)
    assert.equal(remaining.minutes, 59)
  })

  it("returns expired when past end of due day", () => {
    const now = new Date(2026, 5, 16, 0, 0, 0).getTime()
    const remaining = getTimeRemaining("2026-06-15", now)
    assert.equal(remaining.expired, true)
    assert.equal(remaining.overdue, true)
    assert.ok(remaining.minutes >= 0)
  })

  it("formats overdue label", () => {
    const now = new Date(2026, 5, 18, 3, 0, 0).getTime()
    const remaining = getTimeRemaining("2026-06-15", now)
    const label = formatCountdownLabel(remaining)
    assert.match(label, /^Просрочен/)
  })
})

describe("shouldShowContractCountdown", () => {
  it("shows for active statuses only", () => {
    assert.equal(shouldShowContractCountdown("active"), true)
    assert.equal(shouldShowContractCountdown("completed"), false)
    assert.equal(shouldShowContractCountdown("cancelled"), false)
  })
})
