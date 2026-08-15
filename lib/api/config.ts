const normalizeApiUrl = (raw: string): string =>
  raw
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/docs$/i, "/api/v1")

export const API_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
)

export const FILES_BASE_URL = (
  process.env.NEXT_PUBLIC_FILES_BASE_URL ?? API_URL.replace(/\/api\/v1$/i, "")
).replace(/\/+$/, "")

export const isApiEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_USE_API === "true" || Boolean(process.env.NEXT_PUBLIC_API_URL)

export const API_MODE = isApiEnabled()
