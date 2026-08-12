"use client"

import { type ReactNode, useState } from "react"
import {
  Check,
  ExternalLink,
  FileText,
  Package,
  Star,
  UserRound,
  Wrench,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  AdminCompanyCatalogItem,
  AdminCompanyDetail,
} from "@/lib/api/admin"

const formatMoney = (value: number, currency = "TJS") =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(value))

const sectionClassName = "scroll-mt-24 rounded-xl border border-border bg-card p-5 sm:p-6"

const Section = ({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) => (
  <section id={id} className={sectionClassName}>
    <div className="mb-5">
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {children}
  </section>
)

const InfoField = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {label}
    </dt>
    <dd className="mt-1 text-sm font-medium text-foreground">{value || "Не указано"}</dd>
  </div>
)

const ExpandableCollection = ({
  children,
  total,
}: {
  children: (limit: number) => ReactNode
  total: number
}) => {
  const [expanded, setExpanded] = useState(false)
  const limit = expanded ? total : 5
  return (
    <>
      {children(limit)}
      {total > 5 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Свернуть" : `Показать все (${total})`}
        </Button>
      )}
    </>
  )
}

const EmptyState = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-dashed border-border bg-muted/25 px-5 py-8 text-center text-sm text-muted-foreground">
    {children}
  </div>
)

const CatalogList = ({ items }: { items: AdminCompanyCatalogItem[] }) => {
  if (!items.length) return <EmptyState>Позиций этого типа пока нет.</EmptyState>

  return (
    <ExpandableCollection total={items.length}>
      {(limit) => (
        <div className="divide-y divide-border">
          {items.slice(0, limit).map((item) => (
            <div key={item.id} className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[item.category, `ID ${item.id}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:text-right">
                <Badge variant="outline">{item.status}</Badge>
                <span className="text-sm font-bold">
                  {item.price ? formatMoney(item.price, item.currency || "TJS") : "Цена не указана"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </ExpandableCollection>
  )
}

export const AdminCompanyDetailSections = ({
  company,
}: {
  company: AdminCompanyDetail
}) => {
  const checklistLabels: Record<keyof AdminCompanyDetail["verification_checklist"], string> = {
    legal_name: "Юридическое наименование",
    tax_number: "ИНН / налоговый номер",
    address: "Юридический адрес",
    website: "Сайт компании",
    certificates: "Подтверждающие документы",
  }

  return (
    <div className="space-y-5">
      <Section id="overview" title="Обзор" description="Публичная информация и профиль компании">
        <p className="text-sm leading-6 text-muted-foreground">
          {company.description || "Описание компании не заполнено."}
        </p>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <InfoField label="Год основания" value={company.profile?.founded_year} />
          <InfoField label="Сотрудники" value={company.profile?.employees_count} />
          <InfoField label="Выручка" value={company.profile?.annual_revenue_range} />
          <InfoField
            label="Языки"
            value={company.profile?.languages?.join(", ")}
          />
          <InfoField
            label="Отрасли"
            value={company.profile?.industries?.join(", ")}
          />
          <InfoField label="Создана" value={formatDate(company.created_at)} />
          <InfoField label="Обновлена" value={formatDate(company.updated_at)} />
          <InfoField label="Владелец" value={company.owner.name || company.owner.email} />
        </dl>
      </Section>

      <Section id="legal" title="Юридическая информация">
        <dl className="grid gap-5 sm:grid-cols-2">
          <InfoField label="Юридическое наименование" value={company.legal_name} />
          <InfoField label="ИНН / налоговый номер" value={company.tax_number} />
          <InfoField label="Страна" value={company.country} />
          <InfoField label="Город" value={company.city} />
          <InfoField label="Адрес" value={company.address} />
          <InfoField
            label="Сайт"
            value={
              company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {company.website}
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              ) : null
            }
          />
        </dl>
      </Section>

      <Section
        id="documents"
        title="Документы для верификации"
        description="Отдельные verification-файлы пока не загружаются в текущей модели"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(company.verification_checklist).map(([key, complete]) => (
            <div
              key={key}
              className="flex items-center gap-3 rounded-xl border border-border p-3"
            >
              <span className={complete ? "text-primary" : "text-warning"}>
                {complete ? <Check size={18} aria-hidden="true" /> : <X size={18} aria-hidden="true" />}
              </span>
              <span className="text-sm font-medium">
                {checklistLabels[key as keyof typeof checklistLabels]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          Сертификаты ниже показаны отдельно и не считаются заменой юридических документов.
        </p>
      </Section>

      <Section id="certificates" title="Сертификаты">
        {company.certificates.length ? (
          <ExpandableCollection total={company.certificates.length}>
            {(limit) => (
              <div className="grid gap-3 sm:grid-cols-2">
                {company.certificates.slice(0, limit).map((certificate) => (
                  <a
                    key={certificate.id}
                    href={certificate.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary/30"
                  >
                    <FileText className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{certificate.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {certificate.issuer} · {certificate.issue_date}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            )}
          </ExpandableCollection>
        ) : (
          <EmptyState>Сертификаты не добавлены.</EmptyState>
        )}
      </Section>

      <Section id="members" title={`Участники (${company.members.length})`}>
        {company.members.length ? (
          <ExpandableCollection total={company.members.length}>
            {(limit) => (
              <div className="divide-y divide-border">
                {company.members.slice(0, limit).map((member) => (
                  <div key={member.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
                      <UserRound size={17} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{member.name || member.email}</p>
                      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <Badge variant="outline">{member.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </ExpandableCollection>
        ) : (
          <EmptyState>Участники не найдены.</EmptyState>
        )}
      </Section>

      <Section id="products" title={`Товары (${company.products.length})`}>
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Package size={16} aria-hidden="true" /> Товарные позиции компании
        </div>
        <CatalogList items={company.products} />
      </Section>

      <Section id="services" title={`Услуги (${company.services.length})`}>
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Wrench size={16} aria-hidden="true" /> Сервисные позиции компании
        </div>
        <CatalogList items={company.services} />
      </Section>

      <Section id="contracts" title={`Контракты (${company.contracts.length})`}>
        {company.contracts.length ? (
          <ExpandableCollection total={company.contracts.length}>
            {(limit) => (
              <div className="divide-y divide-border">
                {company.contracts.slice(0, limit).map((contract) => (
                  <div key={contract.id} className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-bold">{contract.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Контракт #{contract.id} · {formatDate(contract.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{contract.status}</Badge>
                      <span className="font-bold">
                        {formatMoney(contract.agreed_amount, contract.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ExpandableCollection>
        ) : (
          <EmptyState>Контрактов с участием компании нет.</EmptyState>
        )}
      </Section>

      <Section id="reviews" title={`Отзывы (${company.reviews.length})`}>
        {company.reviews.length ? (
          <ExpandableCollection total={company.reviews.length}>
            {(limit) => (
              <div className="space-y-3">
                {company.reviews.slice(0, limit).map((review) => (
                  <article key={review.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1 font-bold">
                        <Star size={16} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                        {review.rating}/5
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {review.comment || "Отзыв без комментария"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </ExpandableCollection>
        ) : (
          <EmptyState>Отзывы пока не оставляли.</EmptyState>
        )}
      </Section>
    </div>
  )
}
