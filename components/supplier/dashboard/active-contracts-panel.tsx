"use client"

import Link from "next/link"
import { FileCheck, ArrowRight } from "lucide-react"
import type { ContractWithRelations } from "@/types"
import { contractStatusMeta } from "@/lib/contract-display"
import { formatCurrency } from "@/lib/format"
import { DeadlineCountdown } from "@/components/contracts/deadline-countdown"

type ActiveContractsPanelProps = {
  contracts: ContractWithRelations[]
  hydrated: boolean
  getBuyerName: (buyerId: number) => string
}

export const ActiveContractsPanel = ({
  contracts,
  hydrated,
  getBuyerName,
}: ActiveContractsPanelProps) => (
  <div className="bg-card border border-border rounded-xl">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h2 className="text-sm font-semibold text-foreground">Активные контракты</h2>
      <Link
        href="/supplier/contracts"
        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
      >
        Все контракты <ArrowRight size={14} />
      </Link>
    </div>

    {!hydrated || contracts.length === 0 ? (
      <div className="p-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
          <FileCheck size={22} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Активных контрактов нет</p>
        <p className="text-xs text-muted-foreground mt-1">
          Примите отклик по заявке, чтобы начать сделку
        </p>
      </div>
    ) : (
      <div className="divide-y divide-border">
        {contracts.slice(0, 5).map((contract) => {
          const meta = contractStatusMeta[contract.status]
          return (
            <Link
              key={contract.id}
              href={`/supplier/contracts/${contract.id}`}
              className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileCheck size={17} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{contract.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getBuyerName(contract.buyer_actor_id)}
                </p>
                <DeadlineCountdown
                  dueDate={contract.due_date}
                  status={contract.status}
                  variant="compact"
                  className="mt-1"
                />
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-primary">
                  {formatCurrency(contract.agreed_amount, contract.currency)}
                </div>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${meta.className}`}>
                  {meta.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    )}
  </div>
)
