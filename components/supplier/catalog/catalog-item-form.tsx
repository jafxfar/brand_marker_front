"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Briefcase, Check, ChevronLeft, Eye, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageFrame } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { useCategoryOptions } from "@/hooks/use-category-options"
import type { CatalogItemInput, CatalogItemWithRelations, CatalogItemType } from "@/types"
import {
  AttributeFields,
  type AttributeFieldRow,
} from "@/components/supplier/catalog/attribute-fields"
import { MediaFields, type MediaFieldRow } from "@/components/supplier/catalog/media-fields"
import {
  PricingFields,
  type PricingFieldValues,
} from "@/components/supplier/catalog/pricing-fields"
import {
  ATTR_LEAD,
  ATTR_MOQ,
  ATTR_UNIT,
  FORM_SECTIONS,
  UNITS,
  computeCatalogFormScore,
} from "@/components/supplier/catalog/catalog-item-score"
import { CatalogItemScorePanel } from "@/components/supplier/catalog/catalog-item-score-panel"
import { CatalogItemPreviewCard } from "@/components/supplier/catalog/catalog-item-preview-card"

type CatalogItemFormProps = {
  initial?: CatalogItemWithRelations
  onSubmit: (input: CatalogItemInput, status: "draft" | "pending_review") => void
}

const defaultPricing: PricingFieldValues = {
  pricing_type: "tiered",
  currency: "TJS",
  fixed_price: "",
  hourly_rate: "",
  monthly_rate: "",
  tiers: [
    { min_qty: 1, price: 0 },
    { min_qty: 10, price: 0 },
  ],
}

const pricingFromItem = (item?: CatalogItemWithRelations): PricingFieldValues => {
  if (!item?.pricing) return defaultPricing
  const p = item.pricing
  return {
    pricing_type: p.pricing_type,
    currency: p.currency,
    fixed_price: p.fixed_price != null ? String(p.fixed_price) : "",
    hourly_rate: p.hourly_rate != null ? String(p.hourly_rate) : "",
    monthly_rate: p.monthly_rate != null ? String(p.monthly_rate) : "",
    tiers: p.tiers.length > 0 ? p.tiers : defaultPricing.tiers,
  }
}

const pickAttr = (
  attrs: Array<{ name: string; value: string }>,
  name: string,
): string => attrs.find((a) => a.name === name)?.value ?? ""

const stripMetaAttrs = (attrs: AttributeFieldRow[]): AttributeFieldRow[] =>
  attrs.filter(
    (a) => ![ATTR_UNIT, ATTR_MOQ, ATTR_LEAD].includes(a.name.trim()),
  )

const SectionCard = ({
  id,
  index,
  title,
  hint,
  done,
  children,
}: {
  id: string
  index: number
  title: string
  hint: string
  done?: boolean
  children: React.ReactNode
}) => (
  <section
    id={id}
    className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 md:p-6"
  >
    <div className="mb-5 flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold",
          done ? "bg-brand-600 text-white" : "border border-line bg-canvas text-mute",
        )}
      >
        {done ? <Check className="size-3.5" aria-hidden /> : index}
      </span>
      <div className="min-w-0">
        <h2 className="text-[16px] font-extrabold tracking-[-0.01em] text-ink">{title}</h2>
        <p className="mt-0.5 text-[13.5px] text-mute">{hint}</p>
      </div>
    </div>
    <div className="grid gap-4">{children}</div>
  </section>
)

const FieldLabel = ({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string
  children: React.ReactNode
  required?: boolean
}) => (
  <label
    htmlFor={htmlFor}
    className="mb-1.5 block text-[13.5px] font-semibold text-ink"
  >
    {children}
    {required ? <span className="text-red-600"> *</span> : null}
  </label>
)

export const CatalogItemForm = ({ initial, onSubmit }: CatalogItemFormProps) => {
  const { catalogCategories } = useCategoryOptions()
  const initialAttrs = initial?.attributes ?? []
  const [type, setType] = useState<CatalogItemType>(initial?.type ?? "product")
  const [title, setTitle] = useState(initial?.title ?? "")
  const [categoryId, setCategoryId] = useState(
    initial?.category_id ? String(initial.category_id) : "",
  )
  const [unit, setUnit] = useState(pickAttr(initialAttrs, ATTR_UNIT) || "шт")
  const [moq, setMoq] = useState(pickAttr(initialAttrs, ATTR_MOQ) || "1")
  const [lead, setLead] = useState(pickAttr(initialAttrs, ATTR_LEAD) || "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [attributes, setAttributes] = useState<AttributeFieldRow[]>(
    stripMetaAttrs(
      initialAttrs.map((a) => ({
        name: a.name,
        value: a.value,
        value_type: a.value_type,
      })),
    ),
  )
  const [media, setMedia] = useState<MediaFieldRow[]>(
    initial?.media.map((m) => ({
      file_name: m.file_name,
      file_url: m.file_url,
      media_type: m.media_type,
    })) ?? [],
  )
  const [pricing, setPricing] = useState<PricingFieldValues>(pricingFromItem(initial))
  const [invoice, setInvoice] = useState(initial?.invoice !== false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewOpen, setPreviewOpen] = useState(false)

  const isService = type === "service"
  const pageTitle = initial
    ? isService
      ? "Редактирование услуги"
      : "Редактирование товара"
    : isService
      ? "Новая услуга"
      : "Новый товар"

  const score = useMemo(
    () =>
      computeCatalogFormScore({
        type,
        title,
        categoryId,
        description,
        unit,
        moq,
        lead,
        attributes,
        media,
        pricing,
        invoice,
      }),
    [
      type,
      title,
      categoryId,
      description,
      unit,
      moq,
      lead,
      attributes,
      media,
      pricing,
      invoice,
    ],
  )

  const sectionDone = useMemo(() => {
    const bySection = new Map<string, boolean>()
    for (const item of score.items) {
      const prev = bySection.get(item.sectionId)
      bySection.set(item.sectionId, prev === undefined ? item.ok : prev && item.ok)
    }
    // soft: section "done" if all scored items for it are ok, or if no scored items
    return Object.fromEntries(
      FORM_SECTIONS.map((s) => {
        const related = score.items.filter((i) => i.sectionId === s.id)
        if (!related.length) return [s.id, false]
        return [s.id, related.every((i) => i.ok)]
      }),
    ) as Record<string, boolean>
  }, [score.items])

  const jumpTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (title.trim().length < 5) e.title = "Название не короче 5 символов"
    if (!categoryId) e.categoryId = "Выберите категорию"
    if (description.trim().length < 10) e.description = "Описание от 10 символов"
    if (!moq.trim() || Number(moq) < 1) e.moq = "Укажите минимальный заказ"

    if (pricing.pricing_type === "fixed") {
      const price = Number(pricing.fixed_price)
      if (!pricing.fixed_price || Number.isNaN(price) || price <= 0) {
        e.fixed_price = "Укажите цену"
      }
    }
    if (pricing.pricing_type === "hourly") {
      const rate = Number(pricing.hourly_rate)
      if (!pricing.hourly_rate || Number.isNaN(rate) || rate <= 0) {
        e.hourly_rate = "Укажите ставку"
      }
    }
    if (pricing.pricing_type === "monthly") {
      const rate = Number(pricing.monthly_rate)
      if (!pricing.monthly_rate || Number.isNaN(rate) || rate <= 0) {
        e.monthly_rate = "Укажите ставку"
      }
    }
    if (pricing.pricing_type === "tiered") {
      if (
        pricing.tiers.length === 0 ||
        pricing.tiers.some((t) => t.min_qty < 1 || t.price <= 0)
      ) {
        e.tiers = "Добавьте хотя бы одну ступень с ценой"
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const buildInput = (status: "draft" | "pending_review"): CatalogItemInput => {
    const metaAttrs: AttributeFieldRow[] = [
      { name: ATTR_UNIT, value: unit, value_type: "text" },
      { name: ATTR_MOQ, value: String(Number(moq) || 1), value_type: "number" },
    ]
    if (lead.trim()) {
      metaAttrs.push({ name: ATTR_LEAD, value: lead.trim(), value_type: "text" })
    }
    const merged = [...metaAttrs, ...stripMetaAttrs(attributes)]

    return {
      type,
      category_id: Number(categoryId),
      title: title.trim(),
      description: description.trim(),
      status,
      invoice,
      attributes: merged
        .filter((a) => a.name.trim())
        .map((a, index) => ({
          name: a.name.trim(),
          value: a.value.trim(),
          value_type: a.value_type,
          sort_order: index,
        })),
      media: media
        .filter((m) => m.file_name.trim())
        .map((m, index) => ({
          file_name: m.file_name.trim(),
          file_url: m.file_url.trim() || "#",
          media_type: m.media_type,
          sort_order: index,
        })),
      pricing: {
        pricing_type: pricing.pricing_type,
        currency: pricing.currency,
        fixed_price:
          pricing.pricing_type === "fixed" ? Number(pricing.fixed_price) : null,
        hourly_rate:
          pricing.pricing_type === "hourly" ? Number(pricing.hourly_rate) : null,
        monthly_rate:
          pricing.pricing_type === "monthly" ? Number(pricing.monthly_rate) : null,
        tiers: pricing.pricing_type === "tiered" ? pricing.tiers : [],
      },
    }
  }

  const handleSubmit = (status: "draft" | "pending_review") => {
    if (!validate()) {
      jumpTo("s1")
      return
    }
    onSubmit(buildInput(status), status)
  }

  const inputClass = (field: string) =>
    cn(
      "h-11 w-full rounded-xl border bg-white px-4 text-[14.5px] outline-none transition-all focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15",
      errors[field] ? "border-red-400" : "border-line",
    )

  const errorList = Object.entries(errors)

  const actionButtons = (
    <>
      <Button type="button" variant="outline" onClick={() => handleSubmit("draft")}>
        Сохранить черновик
      </Button>
      <Button type="button" variant="secondary" onClick={() => setPreviewOpen((v) => !v)}>
        <Eye className="size-4" aria-hidden />
        Предпросмотр
      </Button>
      <Button type="button" onClick={() => handleSubmit("pending_review")}>
        Отправить на проверку
      </Button>
    </>
  )

  return (
    <PageFrame className="max-w-7xl">
      <div className="mb-2">
        <Link
          href="/supplier/catalog"
          className="mb-2 inline-flex h-9 -ml-2 items-center gap-1.5 rounded-lg pl-2 pr-3 text-[14px] font-medium text-mute hover:bg-white hover:text-ink"
        >
          <ChevronLeft size={16} aria-hidden />
          Товары и услуги
        </Link>
      </div>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
            {pageTitle}
          </h1>
          <p className="mt-1 text-[16px] text-mute">
            Чем подробнее карточка, тем больше заявок. Обязательные поля отмечены *.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">{actionButtons}</div>
      </header>

      {errorList.length > 0 ? (
        <div className="mb-5 grid gap-2 rounded-2xl border border-red-200 bg-red-50 p-4">
          <b className="text-[15px] text-red-700">
            Чтобы отправить на проверку, исправьте {errorList.length}{" "}
            {errorList.length === 1 ? "пункт" : "пункта"}:
          </b>
          <ul className="grid gap-1 text-[14px]">
            {errorList.map(([key, msg]) => (
              <li key={key}>
                <button
                  type="button"
                  className="text-left text-red-700 underline underline-offset-2"
                  onClick={() =>
                    jumpTo(
                      key === "tiers" ||
                        key === "fixed_price" ||
                        key === "hourly_rate" ||
                        key === "monthly_rate"
                        ? "s4"
                        : key === "description"
                          ? "s5"
                          : key === "moq"
                            ? "s1"
                            : "s1",
                    )
                  }
                >
                  {msg}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {initial?.status === "changes_requested" ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">Позиция отклонена модератором</p>
          {initial.rejection_reason ? (
            <p className="mt-1">Причина: {initial.rejection_reason}</p>
          ) : null}
          <p className="mt-1 text-red-700/80">
            Исправьте карточку и снова отправьте на проверку.
          </p>
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-line bg-white p-4 xl:hidden">
        <span className="text-[14.5px] font-semibold">Качество карточки</span>
        <b className={cn("text-[18px] tabular-nums", score.levelClass)}>
          {score.total}/100
        </b>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[180px_minmax(0,1fr)_300px]">
        <nav
          className="sticky top-[92px] hidden 2xl:block"
          aria-label="Разделы карточки"
        >
          <ul className="grid gap-0.5">
            {FORM_SECTIONS.map((section, index) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => jumpTo(section.id)}
                  className="flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[14px] font-semibold text-ink/75 hover:bg-white hover:text-ink"
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full text-[11px]",
                      sectionDone[section.id]
                        ? "bg-brand-600 text-white"
                        : "border border-line bg-white",
                    )}
                  >
                    {sectionDone[section.id] ? (
                      <Check className="size-3" aria-hidden />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid min-w-0 gap-5">
          <SectionCard
            id="s1"
            index={1}
            title="Основное"
            hint={
              isService
                ? "Как покупатели найдут вашу услугу"
                : "Как покупатели найдут ваш товар"
            }
            done={sectionDone.s1}
          >
            <div>
              <FieldLabel required>Тип</FieldLabel>
              <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line text-[14px] font-medium">
                {(
                  [
                    ["product", "Товар", ShoppingCart],
                    ["service", "Услуга", Briefcase],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 transition-colors",
                      type === value
                        ? "bg-brand-600 text-white"
                        : "bg-white text-ink hover:bg-canvas",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="item-title" required>
                Название
              </FieldLabel>
              <input
                maxLength={255}
                id="item-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isService
                    ? "Что входит в услугу, для кого"
                    : "Бренд, модель, ключевые характеристики"
                }
                className={inputClass("title")}
              />
              {errors.title ? (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <FieldLabel htmlFor="item-category" required>
                  Категория
                </FieldLabel>
                <select
                  id="item-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputClass("categoryId")}
                >
                  <option value="">Выберите</option>
                  {catalogCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId ? (
                  <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>
                ) : null}
              </div>
              <div>
                <FieldLabel htmlFor="item-unit">Единица</FieldLabel>
                <select
                  id="item-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={inputClass("unit")}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel htmlFor="item-moq" required>
                  Мин. заказ
                </FieldLabel>
                <input
                  id="item-moq"
                  type="number"
                  min={1}
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  className={cn(inputClass("moq"), "font-mono")}
                />
                {errors.moq ? (
                  <p className="mt-1 text-xs text-red-600">{errors.moq}</p>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            id="s2"
            index={2}
            title="Фото и документы"
            hint="Первое фото — главное, его видно в каталоге. Можно добавить сертификаты PDF."
            done={sectionDone.s2}
          >
            <MediaFields media={media} onChange={setMedia} />
          </SectionCard>

          <SectionCard
            id="s3"
            index={3}
            title="Характеристики"
            hint="Покупатели сравнивают позиции именно по ним"
            done={sectionDone.s3}
          >
            <AttributeFields
              attributes={attributes}
              onChange={setAttributes}
              errors={errors}
            />
          </SectionCard>

          <SectionCard
            id="s4"
            index={4}
            title="Цена и заказ"
            hint="Оптовые цены — главное, что смотрит покупатель"
            done={sectionDone.s4}
          >
            <PricingFields values={pricing} onChange={setPricing} errors={errors} />
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3 hover:border-brand-600/40">
              <input
                type="checkbox"
                checked={invoice}
                onChange={(e) => setInvoice(e.target.checked)}
                className="mt-0.5 size-4 accent-[#0E8A5E]"
              />
              <span>
                <span className="block text-sm font-semibold text-ink">
                  Принимаю оплату по счёту (безнал)
                </span>
                <span className="mt-0.5 block text-xs text-mute">
                  Покупатель сможет запросить счёт на компанию
                </span>
              </span>
            </label>
          </SectionCard>

          <SectionCard
            id="s5"
            index={5}
            title="Подробное описание"
            hint="Характеристики, комплектация, гарантия — свободным текстом"
            done={sectionDone.s5}
          >
            <div>
              <FieldLabel htmlFor="item-description" required>
                Описание
              </FieldLabel>
              <textarea
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder={
                  isService
                    ? "Этапы работ, что входит, результат"
                    : "Характеристики, комплектация, гарантия, сертификаты"
                }
                className={cn(
                  "w-full resize-y rounded-xl border bg-white px-4 py-3 text-[14.5px] outline-none transition-all focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15",
                  errors.description ? "border-red-400" : "border-line",
                )}
              />
              {errors.description ? (
                <p className="mt-1 text-xs text-red-600">{errors.description}</p>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            id="s6"
            index={6}
            title="Сроки и условия"
            hint={
              isService
                ? "Срок оказания помогает покупателю спланировать заказ"
                : "Сроки отгрузки помогают покупателю спланировать закупку"
            }
            done={sectionDone.s6}
          >
            <div className="max-w-md">
              <FieldLabel htmlFor="item-lead">
                {isService ? "Срок оказания" : "Срок отгрузки"}
              </FieldLabel>
              <input
                id="item-lead"
                type="text"
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                placeholder={isService ? "от 3 недель" : "1–2 дня"}
                className={inputClass("lead")}
              />
            </div>
          </SectionCard>

          <div className="flex flex-wrap justify-end gap-2 pb-10">{actionButtons}</div>
        </div>

        <aside className="sticky top-[92px] hidden gap-4 xl:grid">
          <CatalogItemScorePanel score={score} onJump={jumpTo} />
          <div className="grid gap-2">
            <span className="text-[13px] font-semibold text-mute">
              Так карточка выглядит в каталоге
            </span>
            <CatalogItemPreviewCard
              type={type}
              title={title}
              unit={unit}
              moq={moq}
              media={media}
              pricing={pricing}
            />
          </div>
        </aside>
      </div>

      {previewOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Предпросмотр карточки"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <b className="text-[15px]">Предпросмотр</b>
              <button
                type="button"
                className="text-[14px] font-semibold text-brand-700"
                onClick={() => setPreviewOpen(false)}
              >
                Закрыть
              </button>
            </div>
            <CatalogItemPreviewCard
              type={type}
              title={title}
              unit={unit}
              moq={moq}
              media={media}
              pricing={pricing}
            />
            <div className="mt-4 xl:hidden">
              <CatalogItemScorePanel
                score={score}
                onJump={(id) => {
                  setPreviewOpen(false)
                  jumpTo(id)
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </PageFrame>
  )
}
