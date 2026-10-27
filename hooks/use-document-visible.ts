"use client"

import { useEffect, useState } from "react"

/** True while the browser tab or PWA is in the foreground. Starts false to avoid a hydration miss and a hidden-tab mark-read. */
export const useDocumentVisible = (): boolean => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === "visible")
    onChange()
    document.addEventListener("visibilitychange", onChange)
    return () => document.removeEventListener("visibilitychange", onChange)
  }, [])

  return visible
}
