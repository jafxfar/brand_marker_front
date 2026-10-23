"use client"

import Link from "next/link"
import type { Proposal, ProposalStatus } from "@/types"
import { StatusBadge } from "@/components/bm"
import { proposalStatusMeta } from "@/lib/proposal-display"
import { formatDeliveryTime, formatMoneyDisplay } from "@/lib/format"

type MyProposalsTableProps = {
  proposals: Proposal[]
  getRfqTitle: (rfqId: string) => string
  getBuyerName: (rfqId: string) => string
  getValidUntil: (rfqId: string) => string
}

const proposalBadgeStatus = (status: ProposalStatus): string => {
  switch (status) {
    case "submitted":
    case "viewed":
      return "sent"
    case "accepted":
      return "won"
    case "shortlisted":
    case "pending_supplier":
      return "wait"
    case "rejected":
      return "rejected"
    case "withdrawn":
      return "withdrawn"
    case "archived":
      return "archived"
    default:
      return "sent"
  }
}

const formatRfqNo = (rfqId: string): string => {
  const digits = rfqId.replace(/\D/g, "")
  const short = (digits || rfqId).slice(-4)
  return `З‑${short}`
}

export const MyProposalsTable = ({
  proposals,
  getRfqTitle,
  getBuyerName,
  getValidUntil,
}: MyProposalsTableProps) => (
  <>
    <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white md:block">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line">
            {(
              [
                "Заявка",
                "Покупатель",
                "Сумма",
                "Срок",
                "Действует до",
                "Статус",
              ] as const
            ).map((label) => (
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
          {proposals.map((proposal) => {
            const meta = proposalStatusMeta[proposal.status]
            const title = getRfqTitle(proposal.rfq_id)
            const href = `/supplier/rfqs/${proposal.rfq_id}`
            return (
              <tr key={proposal.id} className="hover:bg-canvas">
                <td className="px-5 py-3.5">
                  <Link href={href} className="block min-w-0">
                    <span className="mono text-[12.5px] text-mute">
                      {formatRfqNo(proposal.rfq_id)}
                    </span>
                    <div className="font-semibold text-ink line-clamp-2">{title}</div>
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-ink">
                  <Link href={href} className="block">
                    {getBuyerName(proposal.rfq_id)}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <Link href={href} className="mono font-semibold text-ink">
                    {formatMoneyDisplay(proposal.price, proposal.currency)}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-ink">
                  <Link href={href} className="block">
                    {formatDeliveryTime(proposal.delivery_time)}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-ink">
                  <Link href={href} className="block">
                    {getValidUntil(proposal.rfq_id)}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <Link href={href} className="inline-flex">
                    <StatusBadge
                      status={proposalBadgeStatus(proposal.status)}
                      label={meta.label}
                    />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    <ul className="grid gap-2 md:hidden">
      {proposals.map((proposal) => {
        const meta = proposalStatusMeta[proposal.status]
        const title = getRfqTitle(proposal.rfq_id)
        return (
          <li key={proposal.id}>
            <Link
              href={`/supplier/rfqs/${proposal.rfq_id}`}
              className="grid gap-2 rounded-2xl border border-line bg-white p-4 hover:bg-canvas"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="mono text-[12.5px] text-mute">
                    {formatRfqNo(proposal.rfq_id)}
                  </span>
                  <p className="font-semibold text-ink line-clamp-2">{title}</p>
                </div>
                <StatusBadge
                  status={proposalBadgeStatus(proposal.status)}
                  label={meta.label}
                />
              </div>
              <p className="text-[13px] text-mute">{getBuyerName(proposal.rfq_id)}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                <span className="mono font-semibold text-ink">
                  {formatMoneyDisplay(proposal.price, proposal.currency)}
                </span>
                <span className="text-ink">
                  {formatDeliveryTime(proposal.delivery_time)}
                </span>
                <span className="text-mute">
                  до {getValidUntil(proposal.rfq_id)}
                </span>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  </>
)
