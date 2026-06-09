"use client"

import { useEffect, useState } from "react"

/**
 * Returns true once the component has mounted on the client.
 * Use to gate rendering of data that comes from persisted Zustand stores
 * so server and first client render stay in sync.
 */
export const useHydrated = (): boolean => {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}
