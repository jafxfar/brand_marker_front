export const ISO_DATE_MESSAGE = "Укажите корректную дату"

type IsoDateOptions = {
  minYear?: number
  maxYear?: number
}

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

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
