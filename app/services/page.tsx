import { Suspense } from "react"
import { ServicesPageContent } from "./services-content"

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ServicesPageContent />
    </Suspense>
  )
}
