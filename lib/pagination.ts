export const DEFAULT_PAGE_SIZE = 20

export type Page<T> = {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type PageParams = {
  page?: number
  pageSize?: number
}

/** Build query string with page / page_size (default 20) and optional extra filters. */
export function buildPageQuery(
  params: PageParams & Record<string, string | number | boolean | undefined | null> = {},
): string {
  const search = new URLSearchParams()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE
  search.set("page", String(page))
  search.set("page_size", String(pageSize))

  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || key === "pageSize") continue
    if (value === undefined || value === null || value === "") continue
    search.set(key, String(value))
  }

  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

export function emptyPage<T>(page = 1, pageSize = DEFAULT_PAGE_SIZE): Page<T> {
  return { items: [], total: 0, page, page_size: pageSize, total_pages: 0 }
}
