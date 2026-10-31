"use client"

import { useEffect } from "react"

/** Alias for HTML `go:tariffs` → seller marketing tariffs section. */
export default function TariffsRedirectPage() {
  useEffect(() => {
    window.location.replace("/for-suppliers#tariffs")
  }, [])

  return <div className="min-h-dvh bg-canvas" aria-busy="true" />
}
