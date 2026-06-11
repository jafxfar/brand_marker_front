import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"

type PageShellProps = {
  children: React.ReactNode
}

export const PageShell = ({ children }: PageShellProps) => {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-[140px] bg-white border-b border-border" />}>
        <Header />
      </Suspense>
      {children}
      <Footer />
    </main>
  )
}
