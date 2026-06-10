"use client"

import { getCatalogCategory } from "@/lib/mock/catalog-categories"
import type { CompanyWizardInput } from "@/types"

const ROLE_LABELS: Record<string, string> = {
  director: "Директор",
  admin: "Администратор",
  moderator: "Модератор",
  accountant: "Бухгалтер",
}

type ReviewStepProps = {
  data: CompanyWizardInput
  actorTypeLabel: string
}

const ReviewRow = ({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) => {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted-foreground sm:w-40 shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export const ReviewStep = ({ data, actorTypeLabel }: ReviewStepProps) => {
  const categoryNames = data.category_ids
    .map((id) => getCatalogCategory(id)?.name)
    .filter(Boolean)
    .join(", ")

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Проверьте данные перед {actorTypeLabel === "редактированием" ? "сохранением" : "созданием"} компании.
      </p>

      <section className="rounded-xl border border-border p-4">
        <h3 className="text-sm font-bold mb-2">Основное</h3>
        <ReviewRow label="Название" value={data.title} />
        <ReviewRow label="Юр. название" value={data.legal_name} />
        <ReviewRow label="ИНН" value={data.tax_number} />
        <ReviewRow label="Описание" value={data.description} />
        <ReviewRow label="Тип" value={actorTypeLabel} />
      </section>

      <section className="rounded-xl border border-border p-4">
        <h3 className="text-sm font-bold mb-2">Адрес</h3>
        <ReviewRow
          label="Локация"
          value={[data.country, data.city, data.address].filter(Boolean).join(", ")}
        />
        <ReviewRow label="Сайт" value={data.website} />
      </section>

      <section className="rounded-xl border border-border p-4">
        <h3 className="text-sm font-bold mb-2">Профиль</h3>
        <ReviewRow label="Год основания" value={data.founded_year} />
        <ReviewRow label="Сотрудники" value={data.employees_count} />
        <ReviewRow label="Оборот" value={data.annual_revenue_range} />
        <ReviewRow
          label="Языки"
          value={data.languages.length > 0 ? data.languages.join(", ") : undefined}
        />
        <ReviewRow
          label="Отрасли"
          value={data.industries.length > 0 ? data.industries.join(", ") : undefined}
        />
        <ReviewRow label="Категории" value={categoryNames || undefined} />
      </section>

      {data.certificates.length > 0 && (
        <section className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-bold mb-2">
            Сертификаты ({data.certificates.length})
          </h3>
          {data.certificates.map((c, i) => (
            <div key={i} className="text-sm py-1">
              {c.title} — {c.issuer}
            </div>
          ))}
        </section>
      )}

      {data.team.length > 0 && (
        <section className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-bold mb-2">
            Команда ({data.team.length})
          </h3>
          {data.team.map((m, i) => (
            <div key={i} className="text-sm py-1">
              {m.email} — {ROLE_LABELS[m.role] ?? m.role}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
