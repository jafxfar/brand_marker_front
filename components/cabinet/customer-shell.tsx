"use client"

import { Suspense, useState } from "react"
import {
  LayoutDashboard, FileText, FileCheck, MessageSquare, Menu, Loader2,
} from "lucide-react"
import CustomerSidebar from "@/components/cabinet/sidebar"
import CustomerTopbar from "@/components/cabinet/topbar"
import { CabinetShell } from "@/components/layout/cabinet-shell"
import { CabinetMobileNav } from "@/components/layout/cabinet-mobile-nav"
import { SupportChatWidget } from "@/components/support/support-chat-widget"
import { useCabinetGate } from "@/hooks/use-cabinet-gate"
import { useNotificationsSocket } from "@/hooks/use-notifications-socket"
import {
  emptyBuyerNavCounts,
  useBuyerNavCounts,
} from "@/hooks/api/use-nav-counts-query"
import { useHydrated } from "@/hooks/use-hydrated"

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  const gate = useCabinetGate("customer")
  useNotificationsSocket("buyer", gate === "allowed")
  const [moreOpen, setMoreOpen] = useState(false)
  const hydrated = useHydrated()
  const countsQuery = useBuyerNavCounts(gate === "allowed")
  const counts = countsQuery.data ?? emptyBuyerNavCounts()

  if (gate !== "allowed") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <Loader2 className="animate-spin text-brand-600" size={32} aria-label="Проверка доступа" />
      </div>
    )
  }

  return (
    <CabinetShell
      sidebar={<CustomerSidebar />}
      topbar={<CustomerTopbar moreOpen={moreOpen} onMoreOpenChange={setMoreOpen} />}
      mobileNav={
        <CabinetMobileNav
          moreOpen={moreOpen}
          tabs={[
            {
              href: "/customer",
              label: "Главная",
              Icon: LayoutDashboard,
              match: (p) => p === "/customer",
            },
            {
              href: "/customer/rfqs?status=quotes",
              label: "Заявки",
              Icon: FileText,
              badge: hydrated ? counts.rfqs : 0,
              match: (p) => p.startsWith("/customer/rfqs"),
            },
            {
              href: "/customer/contracts?tab=active",
              label: "Сделки",
              Icon: FileCheck,
              badge: hydrated ? counts.deals : 0,
              match: (p) => p.startsWith("/customer/contracts"),
            },
            {
              href: "/customer/messages",
              label: "Чаты",
              Icon: MessageSquare,
              badge: hydrated ? counts.messages : 0,
              match: (p) => p.startsWith("/customer/messages"),
            },
            {
              label: "Ещё",
              Icon: Menu,
              isMore: true,
              onClick: () => setMoreOpen(true),
            },
          ]}
        />
      }
    >
      {children}
      <Suspense fallback={null}>
        <SupportChatWidget role="buyer" />
      </Suspense>
    </CabinetShell>
  )
}
