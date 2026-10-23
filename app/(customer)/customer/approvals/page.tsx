"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BadgeCheck, Info, Settings } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/bm"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  SegmentedControl,
} from "@/components/layout"
import {
  MOCK_BUYER_APPROVALS,
  type BuyerApproval,
  type BuyerApprovalStatus,
} from "@/lib/mock/buyer-approvals"
import { formatCurrency, formatIsoDate } from "@/lib/format"

type Tab = "wait" | "hist"

const STATUS_LABEL: Record<BuyerApprovalStatus, string> = {
  wait: "Ждёт решения",
  auto: "В лимите",
  approved: "Согласовано",
  rejected: "Отклонено",
}

export default function CustomerApprovalsPage() {
  const [tab, setTab] = useState<Tab>("wait")
  const [items, setItems] = useState<BuyerApproval[]>(MOCK_BUYER_APPROVALS)

  const waitCount = items.filter((a) => a.status === "wait").length
  const list = useMemo(
    () =>
      items.filter((a) =>
        tab === "wait" ? a.status === "wait" : a.status !== "wait",
      ),
    [items, tab],
  )

  const decide = (id: string, status: "approved" | "rejected") => {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    )
    toast.success(
      status === "approved" ? "Покупка согласована" : "Покупка отклонена",
    )
  }

  return (
    <PageFrame>
      <PageHeader
        title="Согласования"
        description="Покупки сотрудников дороже их лимита ждут вашего решения"
        actions={
          <Button asChild variant="outline" size="lg">
            <Link href="/customer/company">
              <Settings size={16} />
              Лимиты сотрудников
            </Link>
          </Button>
        }
      />

      <SegmentedControl
        value={tab}
        onChange={setTab}
        ariaLabel="Фильтр согласований"
        options={[
          { value: "wait", label: "Ждут решения", count: waitCount },
          { value: "hist", label: "История" },
        ]}
        className="mb-5"
      />

      {list.length === 0 ? (
        <PageEmptyState
          variant="card"
          icon={<BadgeCheck />}
          title="Нет покупок на согласовании"
          description="Когда сотрудник захочет купить дороже своего лимита, заявка появится здесь."
        />
      ) : (
        <div className="grid gap-3">
          {list.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,.04)] md:p-6"
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="grid min-w-[240px] flex-1 gap-1">
                  <b className="text-[16px]">{a.what}</b>
                  <span className="text-[13.5px] text-mute">
                    {a.whoName} · {a.whoRole} · лимит {a.limitLabel} ·{" "}
                    {formatIsoDate(a.created)}
                  </span>
                  <span className="text-[13.5px]">
                    Поставщик: {a.supplierName}
                  </span>
                  {a.status === "wait" && a.reason ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-amber-800">
                      <Info className="size-4 shrink-0" aria-hidden />
                      {a.reason}
                    </span>
                  ) : null}
                </div>
                <div className="grid justify-items-end gap-2 text-right">
                  <b className="mono text-[20px]">
                    {formatCurrency(a.amount, a.currency)}
                  </b>
                  {a.status === "wait" ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9"
                        onClick={() => decide(a.id, "rejected")}
                      >
                        Отклонить
                      </Button>
                      <Button
                        type="button"
                        className="h-9"
                        onClick={() => decide(a.id, "approved")}
                      >
                        Согласовать
                      </Button>
                    </div>
                  ) : (
                    <StatusBadge
                      status={a.status}
                      label={STATUS_LABEL[a.status]}
                    />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageFrame>
  )
}
