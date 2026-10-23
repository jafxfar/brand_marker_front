"use client"

import Link from "next/link"
import type { ContractWithRelations } from "@/types"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import {
  DEAL_NEXT_STEP,
  dealNeedsAction,
  getDealPhase,
  getDealStepIndex,
  getDealSteps,
  type DealRole,
} from "@/lib/process/deal-stages"
import { DealStageBar } from "@/components/process"

type DealListProps = {
  contracts: ContractWithRelations[]
  role: DealRole
  getCounterpartName: (contract: ContractWithRelations) => string
}

const DEAL_HREF_BASE: Record<DealRole, string> = {
  buyer: "/customer/contracts",
  supplier: "/supplier/contracts",
}

const counterpartColumn: Record<DealRole, string> = {
  buyer: "Поставщик",
  supplier: "Покупатель",
}

const formatDealNo = (id: number) => `БМ‑${id}`

const stageLabel = (contract: ContractWithRelations): string => {
  const phase = getDealPhase(contract)
  if (phase === "cancelled") return "Отменена"
  if (phase === "done") return "Завершено"
  if (phase === "disputed") return "Спор"
  const steps = getDealSteps(contract)
  const index = getDealStepIndex(contract)
  return steps[index]?.label ?? "—"
}

export const DealList = ({ contracts, role, getCounterpartName }: DealListProps) => {
  const columns = [
    "№",
    "Сделка",
    counterpartColumn[role],
    "Сумма",
    "Этап",
    "Что дальше",
  ] as const

  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map((label) => (
                <th
                  key={label}
                  className="px-5 py-3.5 text-left text-[13px] font-semibold text-mute"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {contracts.map((contract) => {
              const href = `${DEAL_HREF_BASE[role]}/${contract.id}`
              const hot = dealNeedsAction(role, contract) && getDealPhase(contract) !== "disputed"
              const nextStep = DEAL_NEXT_STEP[role][getDealPhase(contract)]

              return (
                <tr key={contract.id} className="hover:bg-canvas">
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <Link href={href} className="mono text-mute">
                      {formatDealNo(contract.id)}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={href} className="font-semibold text-ink line-clamp-2">
                      {contract.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-ink">
                    <Link href={href} className="block">
                      {getCounterpartName(contract)}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <Link href={href} className="mono text-ink">
                      {formatCurrency(contract.agreed_amount, contract.currency)}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={href} className="grid w-32 gap-1.5">
                      <DealStageBar contract={contract} />
                      <span className="text-[12px] text-mute">{stageLabel(contract)}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={href}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[13px]",
                        hot ? "font-semibold text-brand-700" : "text-mute",
                      )}
                    >
                      {hot ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      ) : null}
                      {nextStep}
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-2 md:hidden">
        {contracts.map((contract) => {
          const href = `${DEAL_HREF_BASE[role]}/${contract.id}`
          const hot = dealNeedsAction(role, contract) && getDealPhase(contract) !== "disputed"
          const nextStep = DEAL_NEXT_STEP[role][getDealPhase(contract)]

          return (
            <li key={contract.id}>
              <Link
                href={href}
                className="grid gap-2.5 rounded-2xl border border-line bg-white p-3.5 hover:bg-canvas"
              >
                <span className="flex justify-between gap-3">
                  <span className="min-w-0">
                    <b className="block truncate text-[14px] text-ink">{contract.title}</b>
                    <span className="mono text-[12px] text-mute">
                      {formatDealNo(contract.id)} · {getCounterpartName(contract)}
                    </span>
                  </span>
                  <b className="mono shrink-0 text-[14px] text-ink">
                    {formatCurrency(contract.agreed_amount, contract.currency)}
                  </b>
                </span>
                <DealStageBar contract={contract} />
                <span
                  className={cn(
                    "text-[12.5px]",
                    hot ? "font-semibold text-brand-700" : "text-mute",
                  )}
                >
                  {nextStep}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
