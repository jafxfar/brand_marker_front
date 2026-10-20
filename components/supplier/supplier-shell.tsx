"use client"

import { useState } from "react"
import {
  LayoutDashboard, Inbox, FileCheck, MessageSquare, Menu, Loader2,
} from "lucide-react"
import SupplierSidebar from "@/components/supplier/sidebar"
import SupplierTopbar from "@/components/supplier/topbar"
import { CabinetShell } from "@/components/layout/cabinet-shell"
import { CabinetMobileNav } from "@/components/layout/cabinet-mobile-nav"
import { useCabinetGate } from "@/hooks/use-cabinet-gate"
import { useNotificationsSocket } from "@/hooks/use-notifications-socket"
import { useDealActionCount } from "@/hooks/use-deal-action-count"
import { useUnreadNotificationsCount } from "@/hooks/use-notifications"
import { useHydrated } from "@/hooks/use-hydrated"

export default function SupplierShell({ children }: { children: React.ReactNode }) {
  const gate = useCabinetGate("supplier")
  useNotificationsSocket("supplier", gate === "allowed")
  const [moreOpen, setMoreOpen] = useState(false)
  const hydrated = useHydrated()
  const dealActions = useDealActionCount("supplier")
  const unread = useUnreadNotificationsCount("supplier")

  if (gate !== "allowed") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <Loader2 className="animate-spin text-brand-600" size={32} aria-label="Проверка доступа" />
      </div>
    )
  }

  return (
    <CabinetShell
      sidebar={<SupplierSidebar />}
      topbar={<SupplierTopbar moreOpen={moreOpen} onMoreOpenChange={setMoreOpen} />}
      mobileNav={
        <CabinetMobileNav
          moreOpen={moreOpen}
          tabs={[
            {
              href: "/supplier",
              label: "Главная",
              Icon: LayoutDashboard,
              match: (p) => p === "/supplier",
            },
            {
              href: "/supplier/rfqs",
              label: "Заявки",
              Icon: Inbox,
            },
            {
              href: "/supplier/contracts",
              label: "Сделки",
              Icon: FileCheck,
              badge: hydrated ? dealActions : 0,
            },
            {
              href: "/supplier/messages",
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
