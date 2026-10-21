"use client"

import { useState } from "react"
import {
  LayoutDashboard, FileText, FileCheck, MessageSquare, Menu, Loader2,
} from "lucide-react"
import CustomerSidebar from "@/components/cabinet/sidebar"
import CustomerTopbar from "@/components/cabinet/topbar"
import { CabinetShell } from "@/components/layout/cabinet-shell"
import { CabinetMobileNav } from "@/components/layout/cabinet-mobile-nav"
import { useCabinetGate } from "@/hooks/use-cabinet-gate"
import { useNotificationsSocket } from "@/hooks/use-notifications-socket"
import { useDealActionCount } from "@/hooks/use-deal-action-count"
import { useUnreadNotificationsCount } from "@/hooks/use-notifications"
import { useHydrated } from "@/hooks/use-hydrated"

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  const gate = useCabinetGate("customer")
  useNotificationsSocket("buyer", gate === "allowed")
  const [moreOpen, setMoreOpen] = useState(false)
  const hydrated = useHydrated()
  const dealActions = useDealActionCount("buyer")
  const unread = useUnreadNotificationsCount("buyer")

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
              href: "/customer/rfqs",
              label: "Заявки",
              Icon: FileText,
            },
            {
              href: "/customer/contracts",
              label: "Сделки",
              Icon: FileCheck,
              badge: hydrated ? dealActions : 0,
            },
            {
              href: "/customer/messages",
              label: "Чаты",
              Icon: MessageSquare,
              badge: hydrated ? unread : 0,
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
    </CabinetShell>
  )
}
