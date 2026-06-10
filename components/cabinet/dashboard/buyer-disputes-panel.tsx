"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import type { ContractWithRelations } from "@/types"
import { formatCurrency } from "@/lib/format"

type BuyerDisputesPanelProps = {
  contracts: ContractWithRelations[]
  hydrated: boolean
}

export const BuyerDisputesPanel = ({ contracts, hydrated }: BuyerDisputesPanelProps) => (
  <div className="bg-white border border-border rounded-2xl">
    <div className="p-5 border-b border-border">
      <h2 className="text-base font-bold text-foreground">Споры</h2>
    </div>

    {!hydrated || contracts.length === 0 ? (
      <div className="p-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={18} className="text-destructive" />
        </div>
        <p className="text-sm font-semibold text-foreground">Споров нет</p>
      </div>
    ) : (
      <div className="divide-y divide-border">
        {contracts.slice(0, 4).map((contract) => (
          <Link
            key={contract.id}
            href={`/customer/contracts/${contract.id}`}
            className="block p-4 hover:bg-secondary/50 transition-colors"
          >
            <p className="text-sm font-semibold text-foreground truncate">{contract.title}</p>
            <p className="text-xs text-destructive mt-1">
              {formatCurrency(contract.agreed_amount, contract.currency)} · требует внимания
            </p>
          </Link>
        ))}
      </div>
    )}
  </div>
)
