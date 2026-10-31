/** Time-of-day greeting (BrendMarket-v7.1 `greet()`). */
export function greet(now = new Date()): string {
  const h = now.getHours()
  if (h < 5) return "Доброй ночи"
  if (h < 12) return "Доброе утро"
  if (h < 18) return "Добрый день"
  return "Добрый вечер"
}

export function firstName(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return ""
  return fullName.trim().split(/\s+/)[0] ?? ""
}
