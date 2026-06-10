"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { ContractWithRelations } from "@/types"
import { contractStatusMeta } from "@/lib/contract-display"
import { formatCurrency, formatIsoDate } from "@/lib/format"

type BuyerContractsListTableProps = {
  contracts: ContractWithRelations[]
  getSupplierName: (supplierActorId: number) => string
}

export const BuyerContractsListTable = ({
  contracts,
  getSupplierName,
}: BuyerContractsListTableProps) => (
  <>
    <div className="hidden md:block bg-white border border-border rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Контракт</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Поставщик</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Сумма</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Срок</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">Статус</th>
            <th className="w-10" aria-hidden="true" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {contracts.map((contract) => {
            const meta = contractStatusMeta[contract.status]
            return (
              <tr key={contract.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/customer/contracts/${contract.id}`}
                    className="font-semibold text-foreground hover:text-primary line-clamp-2"
                  >
                    {contract.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {getSupplierName(contract.supplier_actor_id)}
                </td>
                <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">
                  {formatCurrency(contract.agreed_amount, contract.currency)}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatIsoDate(contract.due_date)}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
                    {meta.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/customer/contracts/${contract.id}`}
                    className="text-muted-foreground hover:text-primary"
                    aria-label={`Открыть контракт ${contract.title}`}
                  >
                    <ChevronRight size={16} />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    <div className="md:hidden space-y-3">
      {contracts.map((contract) => {
        const meta = contractStatusMeta[contract.status]
        return (
          <Link
            key={contract.id}
            href={`/customer/contracts/${contract.id}`}
            className="block bg-white border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{contract.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {getSupplierName(contract.supplier_actor_id)}
                </p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div>
                <p className="text-muted-foreground">Сумма</p>
                <p className="font-semibold text-primary mt-0.5">
                  {formatCurrency(contract.agreed_amount, contract.currency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Срок</p>
                <p className="font-semibold text-foreground mt-0.5">
                  {formatIsoDate(contract.due_date)}
                </p>
              </div>
            </div>
            <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full mt-3 ${meta.className}`}>
              {meta.label}
            </span>
          </Link>
        )
      })}
    </div>
  </>
)
