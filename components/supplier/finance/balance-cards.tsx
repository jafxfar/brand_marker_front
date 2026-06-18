import { Lock, TrendingUp, Wallet } from "lucide-react"
import type { SupplierBalanceSummary } from "@/types"
import { formatCurrency } from "@/lib/format"
import { StatCard } from "@/components/supplier/dashboard/stat-card"

type BalanceCardsProps = {
  balances: SupplierBalanceSummary
  hydrated: boolean
}

export const BalanceCards = ({ balances, hydrated }: BalanceCardsProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <StatCard
      Icon={Wallet}
      label="Доступный баланс"
      value={hydrated ? formatCurrency(balances.available, balances.currency) : "—"}
      accent="bg-emerald-100 text-emerald-600"
      subValue="Готово к выводу"
    />
    <StatCard
      Icon={TrendingUp}
      label="В ожидании"
      value={hydrated ? formatCurrency(balances.pending, balances.currency) : "—"}
      accent="bg-amber-100 text-amber-600"
      subValue="Ожидают выплаты по этапам"
    />
    <StatCard
      Icon={Lock}
      label="Под защитой"
      value={hydrated ? formatCurrency(balances.escrowLocked, balances.currency) : "—"}
      accent="bg-blue-100 text-blue-600"
      subValue="Заморожено по договорам до приёмки"
    />
  </div>
)
