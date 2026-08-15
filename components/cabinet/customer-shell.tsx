"use client"

import { Loader2 } from "lucide-react"
import CustomerSidebar from "@/components/cabinet/sidebar"
import CustomerTopbar from "@/components/cabinet/topbar"
import { CabinetShell } from "@/components/layout/cabinet-shell"
import { useCabinetGate } from "@/hooks/use-cabinet-gate"
import { useNotificationsSocket } from "@/hooks/use-notifications-socket"

export default function CustomerShell({ children }: { children: React.ReactNode }) {
  const gate = useCabinetGate("customer")
  useNotificationsSocket("buyer", gate === "allowed")

  if (gate !== "allowed") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} aria-label="Проверка доступа" />
      </div>
    )
  }

  return (
    <CabinetShell sidebar={<CustomerSidebar />} topbar={<CustomerTopbar />}>
      {children}
    </CabinetShell>
  )
}
