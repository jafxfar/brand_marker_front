import { Suspense } from "react"
import Header from "@/components/header"
import HeroBanner from "@/components/hero-banner"
import Footer from "@/components/footer"
import {
  CategoryGrid,
  FeaturedServices,
  ProviderShowcase,
  TrustBanners,
  RecentRequests,
} from "@/components/service-sections"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-[140px] bg-white border-b border-border" />}>
        <Header />
      </Suspense>
      <HeroBanner />
      <CategoryGrid />
      <FeaturedServices />
      <TrustBanners />
      <ProviderShowcase />
      <RecentRequests />
      <Footer />
    </main>
  )
}
