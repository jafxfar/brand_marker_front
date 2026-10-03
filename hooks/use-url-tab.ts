"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export const useUrlTab = <T extends string>(
  param: string,
  allowed: readonly T[],
  fallback: T,
) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const raw = searchParams.get(param)
  const tab = raw !== null && (allowed as readonly string[]).includes(raw)
    ? (raw as T)
    : fallback

  const setTab = useCallback(
    (value: T) => {
      const nextParams = new URLSearchParams(searchParams.toString())
      if (value === fallback) {
        nextParams.delete(param)
      } else {
        nextParams.set(param, value)
      }
      const nextQuery = nextParams.toString()
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
    },
    [fallback, param, pathname, router, searchParams],
  )

  return [tab, setTab] as const
}
