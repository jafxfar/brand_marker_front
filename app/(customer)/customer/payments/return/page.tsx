"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react"
import { PageEmptyState, PageFrame, PageHeader, PageSurface } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { useHydrated } from "@/hooks/use-hydrated"
import { useSyncAlifOrderMutation } from "@/hooks/api/use-payments-query"
import type { GatewayPaymentStatus } from "@/lib/api/payments"

const POLL_INTERVAL_MS = 3000
const MAX_ATTEMPTS = 10
const ORDER_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

type ViewState = GatewayPaymentStatus | "checking" | "timeout" | "error" | "invalid"

const viewCopy: Record<ViewState, { title: string; description: string; icon: React.ReactNode }> = {
  checking: {
    title: "Проверяем оплату",
    description: "Получаем статус платежа от Alif…",
    icon: <Loader2 className="animate-spin" />,
  },
  pending: {
    title: "Ожидаем подтверждение",
    description: "Платёж ещё обрабатывается. Страница обновится автоматически.",
    icon: <Clock />,
  },
  timeout: {
    title: "Ожидаем подтверждение",
    description:
      "Alif пока не подтвердил платёж. Статус этапа обновится, как только придёт уведомление.",
    icon: <Clock />,
  },
  ok: {
    title: "Оплата прошла",
    description: "Средства зарезервированы на безопасной сделке.",
    icon: <CheckCircle2 className="text-emerald-600" />,
  },
  failed: {
    title: "Оплата не прошла",
    description: "Списания не было. Попробуйте оплатить этап ещё раз.",
    icon: <XCircle className="text-destructive" />,
  },
  canceled: {
    title: "Платёж отменён",
    description: "Средства возвращены на карту.",
    icon: <XCircle className="text-destructive" />,
  },
  error: {
    title: "Не удалось проверить оплату",
    description: "Попробуйте обновить страницу позже или откройте сделку.",
    icon: <XCircle className="text-destructive" />,
  },
  invalid: {
    title: "Платёж не найден",
    description: "Ссылка возврата некорректна.",
    icon: <XCircle className="text-destructive" />,
  },
}

const PaymentReturnContent = () => {
  const hydrated = useHydrated()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id") ?? ""
  const contractIdParam = Number(searchParams.get("contract_id"))
  const isValidOrder = ORDER_ID_PATTERN.test(orderId)
  const { mutateAsync: syncOrder } = useSyncAlifOrderMutation()
  const [view, setView] = useState<ViewState>(isValidOrder ? "checking" : "invalid")
  const [contractId, setContractId] = useState<number | null>(
    Number.isInteger(contractIdParam) && contractIdParam > 0 ? contractIdParam : null,
  )

  useEffect(() => {
    if (!hydrated || !isValidOrder) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async (attempt: number) => {
      try {
        const result = await syncOrder(orderId)
        if (cancelled) return
        setContractId(result.contract_id)
        if (result.payment_status !== "pending") {
          setView(result.payment_status)
          return
        }
        if (attempt >= MAX_ATTEMPTS) {
          setView("timeout")
          return
        }
        setView("pending")
        timer = setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS)
      } catch {
        if (!cancelled) setView("error")
      }
    }

    poll(1)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [hydrated, isValidOrder, orderId, syncOrder])

  const copy = viewCopy[view]
  const backHref = contractId ? `/customer/contracts/${contractId}` : "/customer/payments"
  const backLabel = contractId ? "Вернуться к сделке" : "К платежам"

  return (
    <PageFrame>
      <PageHeader title="Результат оплаты" backHref={backHref} backLabel={backLabel} />
      <PageSurface aria-live="polite" aria-busy={view === "checking" || view === "pending"}>
        <PageEmptyState
          icon={copy.icon}
          title={copy.title}
          description={copy.description}
          action={
            <Button asChild variant={view === "ok" ? "default" : "outline"}>
              <Link href={backHref}>{backLabel}</Link>
            </Button>
          }
        />
      </PageSurface>
    </PageFrame>
  )
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={null}>
      <PaymentReturnContent />
    </Suspense>
  )
}
