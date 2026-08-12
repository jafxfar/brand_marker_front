"use client"

import { Loader2 } from "lucide-react"
import SupplierSidebar from "@/components/supplier/sidebar"
import SupplierTopbar from "@/components/supplier/topbar"
import { useCabinetGate } from "@/hooks/use-cabinet-gate"
import { useNotificationsSocket } from "@/hooks/use-notifications-socket"

export default function SupplierShell({ children }: { children: React.ReactNode }) {
  const gate = useCabinetGate("supplier")
  useNotificationsSocket("supplier", gate === "allowed")

  if (gate !== "allowed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:block w-[260px] flex-shrink-0 border-r border-border h-screen sticky top-0">
        <SupplierSidebar />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <SupplierTopbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
