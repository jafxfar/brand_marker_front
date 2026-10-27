/** Default ceiling for money / quantity numeric inputs across the app. */
export const MAX_NUMERIC_INPUT = 100_000_000

/** Digits needed to type MAX_NUMERIC_INPUT (100000000 → 9). */
export const MAX_NUMERIC_INPUT_LENGTH = String(MAX_NUMERIC_INPUT).length

type SanitizeOpts = {
  max?: number
  maxLength?: number
}

/**
 * Accept only non-negative digit strings up to `max`.
 * Returns the cleaned string, or `null` if the keystroke should be rejected.
 * Empty string is allowed so the user can clear the field.
 */
export const sanitizeDigitInput = (
  raw: string,
  opts: SanitizeOpts = {},
): string | null => {
  const max = opts.max ?? MAX_NUMERIC_INPUT
  const maxLength = opts.maxLength ?? String(max).length

  if (!new RegExp(`^\\d{0,${maxLength}}$`).test(raw)) return null
  if (raw !== "" && Number(raw) > max) return null
  return raw
}

type ParseIntOpts = {
  min?: number
  max?: number
}

/**
 * Parse a digit string into an integer within [min, max].
 * Returns `null` if the input should be rejected (invalid / out of range mid-edit for empty → null when empty allowed via emptyAsNull).
 * For controlled number state: empty → use emptyAs when provided.
 */
export const parseBoundedInt = (
  raw: string,
  opts: ParseIntOpts & { emptyAs?: number } = {},
): number | null => {
  const max = opts.max ?? MAX_NUMERIC_INPUT
  const min = opts.min ?? 0
  const sanitized = sanitizeDigitInput(raw, { max, maxLength: String(max).length })
  if (sanitized === null) return null
  if (sanitized === "") {
    return opts.emptyAs !== undefined ? opts.emptyAs : null
  }
  const n = Number(sanitized)
  if (!Number.isFinite(n) || n < min || n > max) return null
  return n
}
