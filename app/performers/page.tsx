import { Suspense } from "react"
import { PerformersPageContent } from "./performers-content"

export default function PerformersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PerformersPageContent />
    </Suspense>
  )
}
