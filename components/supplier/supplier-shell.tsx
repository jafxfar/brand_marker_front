"use client"

import { Loader2 } from "lucide-react"
import SupplierSidebar from "@/components/supplier/sidebar"
import SupplierTopbar from "@/components/supplier/topbar"
import { CabinetShell } from "@/components/layout/cabinet-shell"
import { useCabinetGate } from "@/hooks/use-cabinet-gate"
import { useNotificationsSocket } from "@/hooks/use-notifications-socket"

export default function SupplierShell({ children }: { children: React.ReactNode }) {
  const gate = useCabinetGate("supplier")
  useNotificationsSocket("supplier", gate === "allowed")

  if (gate !== "allowed") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} aria-label="Проверка доступа" />
      </div>
    )
  }

  return (
    <CabinetShell sidebar={<SupplierSidebar />} topbar={<SupplierTopbar />}>
      {children}
    </CabinetShell>
  )
}
