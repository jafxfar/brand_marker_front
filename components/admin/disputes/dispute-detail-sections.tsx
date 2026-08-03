"use client"

import Link from "next/link"
import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AdminDisputeDetail, AdminParty } from "@/lib/api/admin"
import {
  adminActorKindLabels,
  adminDisputeResolutionLabels,
  adminDisputeStatusMeta,
  adminHistoryActionLabels,
  adminLabel,
} from "@/lib/admin-display"
import { contractStatusMeta, escrowSummaryMeta } from "@/lib/contract-display"
import type { ContractStatus } from "@/types"

const sectionClassName = "scroll-mt-24 rounded-2xl border border-border bg-white p-5 sm:p-6"

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))

const formatMoney = (value: number | null | undefined, currency: string) => {
  if (value == null) return "—"
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency || "RUB",
    maximumFractionDigits: 0,
  }).format(value)
}

const EmptyState = ({ children }: { children: string }) => (
  <div className="rounded-xl border border-dashed border-border bg-muted/25 px-5 py-8 text-center text-sm text-muted-foreground">
    {children}
  </div>
)

const partyLabel = (party: AdminParty | null | undefined) =>
  party?.company_title || party?.name || party?.display_name || "—"

const PartySection = ({
  id,
  title,
  party,
}: {
  id: string
  title: string
  party: AdminParty | null
}) => (
  <section id={id} className={sectionClassName}>
    <h2 className="mb-5 text-lg font-black">{title}</h2>
    {party ? (
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Имя
          </dt>
          <dd className="mt-1 text-sm font-medium">{partyLabel(party)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Email
          </dt>
          <dd className="mt-1 text-sm font-medium">{party.email || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Профиль
          </dt>
          <dd className="mt-1 text-sm font-medium">
            #{party.actor_id} · {adminLabel(adminActorKindLabels, party.actor_kind)}
          </dd>
        </div>
        {party.company_id && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Компания
            </dt>
            <dd className="mt-1 text-sm font-medium">
              <Link
                href={`/admin/companies/${party.company_id}`}
                className="text-primary hover:underline"
              >
                {party.company_title || `ID ${party.company_id}`}
              </Link>
            </dd>
          </div>
        )}
      </dl>
    ) : (
      <EmptyState>{`${title} не найден.`}</EmptyState>
    )}
  </section>
)

export const AdminDisputeDetailSections = ({
  dispute,
}: {
  dispute: AdminDisputeDetail
}) => {
  const statusMeta = adminDisputeStatusMeta[dispute.status] || {
    label: dispute.status,
    className: "bg-muted text-muted-foreground",
  }
  const contractStatus =
    contractStatusMeta[dispute.contract.status as ContractStatus] || {
      label: dispute.contract.status,
      className: "bg-muted text-muted-foreground",
    }

  return (
    <div className="space-y-5">
      <section id="overview" className={sectionClassName}>
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-black">Обзор</h2>
          <Badge variant="outline" className={statusMeta.className}>
            {statusMeta.label}
          </Badge>
          <Badge variant="outline" className={contractStatus.className}>
            Контракт: {contractStatus.label}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          {dispute.contract.description || "Описание контракта не заполнено."}
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Контракт
            </dt>
            <dd className="mt-1 text-sm font-medium">
              <Link
                href={`/admin/contracts/${dispute.contract.id}`}
                className="text-primary hover:underline"
              >
                {dispute.contract.title}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Сумма
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {formatMoney(dispute.contract.agreed_amount, dispute.contract.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Решение
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {adminLabel(adminDisputeResolutionLabels, dispute.resolution)}
            </dd>
          </div>
          {dispute.partial_buyer_amount != null && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Частичный возврат
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {formatMoney(dispute.partial_buyer_amount, dispute.contract.currency)}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section id="buyer-statement" className={sectionClassName}>
        <h2 className="mb-5 text-lg font-black">Заявление покупателя</h2>
        {dispute.buyer_statement ? (
          <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
            {dispute.buyer_statement}
          </p>
        ) : (
          <EmptyState>Заявление покупателя отсутствует.</EmptyState>
        )}
      </section>

      <section id="supplier-statement" className={sectionClassName}>
        <h2 className="mb-5 text-lg font-black">Заявление поставщика</h2>
        {dispute.supplier_statement ? (
          <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
            {dispute.supplier_statement}
          </p>
        ) : (
          <EmptyState>Заявление поставщика отсутствует.</EmptyState>
        )}
      </section>

      <PartySection id="buyer" title="Покупатель" party={dispute.buyer} />
      <PartySection id="supplier" title="Поставщик" party={dispute.supplier} />

      <section id="evidence" className={sectionClassName}>
        <h2 className="mb-5 text-lg font-black">Доказательства</h2>
        {dispute.evidence.length ? (
          <div className="space-y-2">
            {dispute.evidence.map((item) => (
              <a
                key={item.id}
                href={item.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <FileText size={15} aria-hidden="true" />
                {item.file_name}
                {item.note ? (
                  <span className="text-xs font-normal text-muted-foreground">
                    · {item.note}
                  </span>
                ) : null}
              </a>
            ))}
          </div>
        ) : (
          <EmptyState>Доказательств пока нет.</EmptyState>
        )}
      </section>

      <section id="files" className={sectionClassName}>
        <h2 className="mb-5 text-lg font-black">Файлы</h2>
        {dispute.files.length ? (
          <div className="space-y-2">
            {dispute.files.map((file) => (
              <a
                key={file.id}
                href={file.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <FileText size={15} aria-hidden="true" />
                {file.file_name}
                <span className="text-xs font-normal text-muted-foreground">
                  · {formatDate(file.created_at)}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <EmptyState>Файлов контракта нет.</EmptyState>
        )}
      </section>

      <section id="chat" className={sectionClassName}>
        <h2 className="mb-5 text-lg font-black">Чат</h2>
        {dispute.messages.length ? (
          <div className="space-y-3">
            {dispute.messages.map((message) => (
              <div key={message.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold">Пользователь #{message.sender_id}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(message.created_at)}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {message.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>Сообщений нет.</EmptyState>
        )}
      </section>

      <section id="escrow" className={sectionClassName}>
        <h2 className="mb-5 text-lg font-black">Escrow</h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["held", dispute.escrow.held],
              ["released", dispute.escrow.released],
              ["disputed", dispute.escrow.disputed],
            ] as const
          ).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {escrowSummaryMeta[key].label}
              </dt>
              <dd className="mt-2 text-lg font-black">
                {formatMoney(value, dispute.escrow.currency)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="timeline" className={sectionClassName}>
        <h2 className="mb-5 text-lg font-black">Хронология</h2>
        {dispute.timeline.length ? (
          <div className="space-y-3">
            {dispute.timeline.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold">
                    {adminLabel(adminHistoryActionLabels, entry.action)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.actor?.name || entry.actor?.email || "Система"}
                </p>
                {typeof entry.details?.reason === "string" && entry.details.reason && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Причина: {entry.details.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>Хронология пуста.</EmptyState>
        )}
      </section>
    </div>
  )
}
