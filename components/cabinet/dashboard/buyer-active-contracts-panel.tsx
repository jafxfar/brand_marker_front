"use client"

import Link from "next/link"
import { FileCheck, ArrowRight } from "lucide-react"
import type { ContractWithRelations } from "@/types"
import { contractStatusMeta } from "@/lib/contract-display"
import { formatCurrency, formatIsoDate } from "@/lib/format"

type BuyerActiveContractsPanelProps = {
  contracts: ContractWithRelations[]
  hydrated: boolean
  getSupplierName: (supplierId: number) => string
}

export const BuyerActiveContractsPanel = ({
  contracts,
  hydrated,
  getSupplierName,
}: BuyerActiveContractsPanelProps) => (
  <div className="bg-white border border-border rounded-2xl">
    <div className="flex items-center justify-between p-5 border-b border-border">
      <h2 className="text-base font-bold text-foreground">Активные контракты</h2>
      <Link
        href="/customer/contracts"
        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
      >
        Все контракты <ArrowRight size={14} />
      </Link>
    </div>

    {!hydrated || contracts.length === 0 ? (
      <div className="p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
          <FileCheck size={22} className="text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">Активных контрактов нет</p>
        <p className="text-xs text-muted-foreground mt-1">
          Примите предложение по RFQ, чтобы начать сделку
        </p>
      </div>
    ) : (
      <div className="divide-y divide-border">
        {contracts.slice(0, 5).map((contract) => {
          const meta = contractStatusMeta[contract.status]
          return (
            <Link
              key={contract.id}
              href={`/customer/contracts/${contract.id}`}
              className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <FileCheck size={17} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{contract.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getSupplierName(contract.supplier_actor_id)} · до {formatIsoDate(contract.due_date)}
                </p>
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
