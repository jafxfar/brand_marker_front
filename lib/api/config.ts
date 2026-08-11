export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

export const isApiEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_USE_API === "true" || Boolean(process.env.NEXT_PUBLIC_API_URL)

export const API_MODE = isApiEnabled()
