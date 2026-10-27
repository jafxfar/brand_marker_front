export const ISO_DATE_MESSAGE = "Укажите дату в формате дд.мм.гггг"
export const RU_DATE_PLACEHOLDER = "дд.мм.гггг"

type IsoDateOptions = {
  minYear?: number
  maxYear?: number
}

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const RU_DATE_RE = /^(\d{2})\.(\d{2})\.(\d{4})$/

export const isValidIsoDate = (
  value: string,
  options: IsoDateOptions = {},
): boolean => {
  const match = ISO_DATE_RE.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (options.minYear != null && year < options.minYear) return false
  if (options.maxYear != null && year > options.maxYear) return false

  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export const isoDateBounds = (minYear: number, maxYear: number) => ({
  min: `${minYear}-01-01`,
  max: `${maxYear}-12-31`,
})

/**
 * Keep at most YYYY-MM-DD; reject completed dates outside year bounds.
 * Empty string and incomplete values while typing are allowed.
 */
export const sanitizeIsoDateInput = (
  value: string,
  options: IsoDateOptions = {},
): string | null => {
  const clipped = value.length > 10 ? value.slice(0, 10) : value
  if (!clipped) return ""
  if (!ISO_DATE_RE.test(clipped)) {
    // Allow incomplete draft while the browser date picker is filling the value
    if (clipped.length < 10) return clipped
    return null
  }
  if (!isValidIsoDate(clipped, options)) return null
  return clipped
}

/** Format ISO `yyyy-mm-dd` → display `дд.мм.гггг`. */
export const isoToRuDate = (iso: string): string => {
  const match = ISO_DATE_RE.exec(iso.trim())
  if (!match) return ""
  return `${match[3]}.${match[2]}.${match[1]}`
}

/** Parse display `дд.мм.гггг` → ISO `yyyy-mm-dd`, or "" if incomplete/invalid. */
export const ruDateToIso = (
  ru: string,
  options: IsoDateOptions = {},
): string => {
  const match = RU_DATE_RE.exec(ru.trim())
  if (!match) return ""
  const day = match[1]
  const month = match[2]
  const year = match[3]
  const iso = `${year}-${month}-${day}`
  return isValidIsoDate(iso, options) ? iso : ""
}

/** Keep only digits and format as `дд.мм.гггг` while typing (max 8 digits). */
export const maskRuDateInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}
