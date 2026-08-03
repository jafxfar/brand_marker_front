export const adminReportStatusLabels: Record<string, string> = {
  open: "Открыта",
  resolved: "Решена",
  dismissed: "Отклонена",
}

export const adminRfqVisibilityLabels: Record<string, string> = {
  public: "Публичная",
  invited_only: "Только приглашённые",
}

export const adminActorKindLabels: Record<string, string> = {
  individual: "Физлицо",
  company: "Компания",
}

export const adminReportReasonLabels: Record<string, string> = {
  misleading: "Вводящая информация",
  prohibited: "Запрещённый контент",
  spam: "Спам",
  copyright: "Нарушение прав",
  other: "Другое",
}

export const adminHistoryActionLabels: Record<string, string> = {
  "admin.catalog.approve": "Одобрение позиции",
  "admin.catalog.hide": "Скрытие позиции",
  "admin.catalog.request_changes": "Запрос правок",
  "admin.catalog.delete": "Удаление позиции",
  "admin.rfq.hide": "Скрытие заявки",
  "admin.rfq.close": "Закрытие заявки",
  "admin.rfq.delete": "Удаление заявки",
  "admin.rfq.warn_buyer": "Предупреждение покупателя",
  "admin.proposal.delete": "Удаление предложения",
  "admin.proposal.investigate": "Расследование жалобы",
  "admin.proposal.block_supplier": "Блокировка поставщика",
  "admin.contract.freeze": "Заморозка escrow",
  "admin.contract.cancel": "Отмена контракта",
  "admin.contract.force_complete": "Принудительное завершение",
  "admin.contract.open_investigation": "Открытие расследования",
  "admin.dispute.release_funds": "Выплата поставщику",
  "admin.dispute.refund_buyer": "Возврат покупателю",
  "admin.dispute.partial_refund": "Частичный возврат",
  "admin.dispute.request_evidence": "Запрос доказательств",
  "admin.dispute.close_case": "Закрытие спора",
  "dispute.open": "Открытие спора",
  "admin.company.approve": "Одобрение компании",
  "admin.company.reject": "Отклонение компании",
  "admin.company.request_documents": "Запрос документов",
  "admin.company.block": "Блокировка компании",
  "admin.company.deactivate": "Деактивация компании",
  "admin.company.reactivate": "Реактивация компании",
}

export const adminDisputeStatusMeta: Record<
  string,
  { label: string; className: string }
> = {
  open: { label: "Открыт", className: "bg-amber-100 text-amber-700" },
  under_review: {
    label: "На рассмотрении",
    className: "bg-blue-100 text-blue-700",
  },
  resolved: {
    label: "Решён",
    className: "bg-emerald-100 text-emerald-700",
  },
  appealed: { label: "Апелляция", className: "bg-red-100 text-red-700" },
}

export const adminDisputeResolutionLabels: Record<string, string> = {
  release_funds: "Выплата поставщику",
  refund_buyer: "Возврат покупателю",
  partial_refund: "Частичный возврат",
  close_case: "Закрытие дела",
}

export const adminLabel = (
  map: Record<string, string>,
  value: string | null | undefined,
  fallback = "—",
) => {
  if (!value) return fallback
  return map[value] ?? value
}
