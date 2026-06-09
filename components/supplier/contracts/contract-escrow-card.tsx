import type { ContractWithRelations } from "@/types"
import { Shield } from "lucide-react"
import {
  contractStatusMeta,
  escrowSummaryMeta,
  getEscrowSummary,
} from "@/lib/contract-display"
import { formatCurrency } from "@/lib/format"

type ContractEscrowCardProps = {
  contract: ContractWithRelations
}

export const ContractEscrowCard = ({ contract }: ContractEscrowCardProps) => {
  const summary = getEscrowSummary(contract)
  const statusMeta = contractStatusMeta[contract.status]

  const rows = [
    { key: "held" as const, amount: summary.held },
    { key: "released" as const, amount: summary.released },
    { key: "disputed" as const, amount: summary.disputed },
  ].filter((row) => row.amount > 0)

  return (
    <section className="bg-white border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <Shield size={16} className="text-primary" />
        </div>
        <h2 className="text-base font-bold text-foreground">Эскроу</h2>
      </div>

      <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full mb-4 ${statusMeta.className}`}>
        {contract.status === "disputed" ? "Средства заморожены" : statusMeta.label}
      </span>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Нет активных движений по эскроу</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const meta = escrowSummaryMeta[row.key]
            return (
              <div key={row.key} className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.className}`}>
                  {meta.label}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(row.amount, summary.currency)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
