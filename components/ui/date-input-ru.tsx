"use client"

import { useEffect, useState, type ChangeEvent, type FocusEvent } from "react"
import { cn } from "@/lib/utils"
import {
  RU_DATE_PLACEHOLDER,
  isoToRuDate,
  maskRuDateInput,
  ruDateToIso,
} from "@/lib/iso-date"

type DateInputRuProps = {
  id?: string
  value: string
  onChange: (isoDate: string) => void
  min?: string
  max?: string
  className?: string
  disabled?: boolean
  "aria-invalid"?: boolean
  "aria-label"?: string
  name?: string
}

const yearBoundsFromIso = (min?: string, max?: string) => {
  const minYear = min ? Number(min.slice(0, 4)) : undefined
  const maxYear = max ? Number(max.slice(0, 4)) : undefined
  return {
    minYear: Number.isFinite(minYear) ? minYear : undefined,
    maxYear: Number.isFinite(maxYear) ? maxYear : undefined,
  }
}

const withinBounds = (iso: string, min?: string, max?: string): boolean => {
  if (!iso) return true
  if (min && iso < min) return false
  if (max && iso > max) return false
  return true
}

/**
 * Text date field in `дд.мм.гггг`. Emits/accepts ISO `yyyy-mm-dd`.
 * Avoids native `type="date"` (locale mm/dd and year-edit resets).
 */
export const DateInputRu = ({
  id,
  value,
  onChange,
  min,
  max,
  className,
  disabled,
  name,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: DateInputRuProps) => {
  const [text, setText] = useState(() => (value ? isoToRuDate(value) : ""))

  useEffect(() => {
    const next = value ? isoToRuDate(value) : ""
    setText((prev) => {
      const bounds = yearBoundsFromIso(min, max)
      const prevIso = ruDateToIso(prev, bounds)
      if (prevIso === value) return prev
      if (!value && prev.length > 0 && prev.length < 10) return prev
      return next
    })
  }, [value, min, max])

  const commit = (raw: string) => {
    const masked = maskRuDateInput(raw)
    setText(masked)
    // Incomplete edit: keep previous ISO so day/month don't reset while changing year.
    if (masked.length === 0) {
      if (value) onChange("")
      return
    }
    if (masked.length < 10) return
    const bounds = yearBoundsFromIso(min, max)
    const iso = ruDateToIso(masked, bounds)
    if (!iso || !withinBounds(iso, min, max)) return
    if (iso !== value) onChange(iso)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    commit(event.target.value)
  }

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const masked = maskRuDateInput(event.target.value)
    if (masked.length === 0) {
      setText("")
      if (value) onChange("")
      return
    }
    const bounds = yearBoundsFromIso(min, max)
    const iso = ruDateToIso(masked, bounds)
    if (!iso || !withinBounds(iso, min, max)) {
      setText(value ? isoToRuDate(value) : "")
      return
    }
    setText(isoToRuDate(iso))
    if (iso !== value) onChange(iso)
  }

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={RU_DATE_PLACEHOLDER}
      maxLength={10}
      disabled={disabled}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      aria-invalid={ariaInvalid}
      aria-label={ariaLabel}
      className={cn(className)}
    />
  )
}
