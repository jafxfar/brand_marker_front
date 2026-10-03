import type { ContractWithRelations, Rfq } from "@/types"
import { formatIsoDate } from "@/lib/format"
import { getDealPhase, isPostpaymentDeal } from "@/lib/process/deal-stages"

export type ProcessStepState = "done" | "now" | "todo"

export type ProcessStep = {
  title: string
  description?: string
  state: ProcessStepState
}

const SELECTING_STATUSES: Rfq["status"][] = ["published", "receiving_proposals", "expired"]

type TimelineRfq = Pick<Rfq, "status" | "created_at" | "deadline">

export const getRfqTimeline = (
  rfq: TimelineRfq,
  proposalsCount: number,
  contract?: ContractWithRelations | null,
): ProcessStep[] => {
  const isDraft = rfq.status === "draft"
  const isSelecting = SELECTING_STATUSES.includes(rfq.status)
  const phase = contract ? getDealPhase(contract) : null
  const postpay = contract ? isPostpaymentDeal(contract) : true

  const published: ProcessStep = isDraft
    ? {
        title: "Опубликуйте заявку",
        description: "Исполнители не увидят заявку, пока вы её не опубликуете.",
        state: "now",
      }
    : {
        title: "Заявка опубликована",
        description: `${formatIsoDate(rfq.created_at.split("T")[0] ?? rfq.created_at)}. Её видят исполнители из выбранной категории.`,
        state: "done",
      }

  const selectDescription = (() => {
    if (rfq.status === "expired") return "Срок приёма предложений истёк."
    if (!isSelecting) return isDraft ? undefined : "Исполнитель выбран."
    if (proposalsCount === 0) {
      return "Ждём первые предложения — мы сообщим, когда исполнители ответят."
    }
    return "Сравните цены и сроки, выберите подходящего исполнителя."
  })()

  const select: ProcessStep = {
    title: "Выберите исполнителя",
    description: selectDescription,
    state: isDraft ? "todo" : isSelecting ? "now" : "done",
  }

  const workDone = phase != null && ["acceptance", "postpay", "release", "done"].includes(phase)
  const work: ProcessStep = {
    title: "Исполнитель выполняет работу",
    description: postpay
      ? "Сделка создаётся сразу после выбора. Вы видите этап работы и можете писать исполнителю."
      : "После выбора оплатите сделку на гарантию площадки — исполнитель приступит к работе.",
    state: workDone ? "done" : phase === "work" || phase === "prepay" || phase === "disputed" ? "now" : "todo",
  }

  const acceptDone = phase === "done"
  const acceptNow = phase === "acceptance" || phase === "postpay" || phase === "release"
  const accept: ProcessStep = {
    title: postpay ? "Примите работу и оплатите" : "Примите работу",
    description: "Деньги уходят исполнителю только после вашей приёмки.",
    state: acceptDone ? "done" : acceptNow ? "now" : "todo",
  }

  return [published, select, work, accept]
}
