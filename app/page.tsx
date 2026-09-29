import { Suspense } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import {
  LandingHero,
  LandingHowItWorks,
  LandingAbout,
  LandingFaq,
  LandingPricing,
  LandingCta,
} from "@/components/landing"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-[140px] bg-white border-b border-border" />}>
        <Header />
      </Suspense>
      <LandingHero />
      <LandingHowItWorks />
      <LandingAbout />
      <LandingFaq />
      <LandingPricing />
      <LandingCta />
      <Footer />
    </main>
  )
}
